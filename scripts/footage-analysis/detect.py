#!/usr/bin/env python3
"""
TASAN MEDIA Trips — footage analysis: technical event detection.

Runs after analyze.py. Reads the thumbnails analyze.py already extracted
(2s-spaced JPEGs) and computes purely signal-based flags from them:
static/held sections, abrupt framing changes, and exposure/sharpness
issues. Nothing here looks at what's actually in frame — see
docs/FOOTAGE_ANALYSIS.md §4 for why that distinction matters and §5 for
the design trade-offs (2s-interval thumbnails, not a dense per-frame
pass — deliberately reuses analyze.py's output instead of a second,
much slower full-decode pass).

CALIBRATION NOTE (first real pass, against actual NaturOparC footage):
the initial version of this script used fixed global thresholds for
motion-diff and sharpness. Checking the real numbers showed why that's
wrong for this kind of footage — continuous handheld/gimbal walking
shots sit at a normalized frame-diff baseline of ~0.1-0.2 just from
ordinary motion (nothing like static security-cam footage), and the
Laplacian sharpness proxy runs in the ~1000-1700 range for genuinely
sharp 160x90 frames here, not the single digits/tens a blind guess
assumed. A fixed absolute constant for either would have mislabeled
almost everything. Motion and sharpness are therefore classified
**relative to each clip's own distribution** (percentiles), which is
robust to this kind of scale surprise; only brightness (0-255 luma) is
a genuinely absolute, physically meaningful scale, so it alone keeps a
fixed global threshold. Re-check these percentiles again once this has
run against more varied footage (different light, more actual static
tripod shots) — see docs/FOOTAGE_ANALYSIS.md §5.

Usage:
    python scripts/footage-analysis/detect.py --slug naturoparc
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]

# Thumbnails are already small (480px wide); downscale further for the
# diff/brightness/sharpness math, since none of it needs full resolution.
ANALYSIS_SIZE = (160, 90)

# Brightness is a genuinely absolute, physically meaningful scale (0-255
# luma) — a fixed global threshold is appropriate here.
DARK_THRESHOLD = 40.0       # mean luma below this: likely underexposed
BRIGHT_THRESHOLD = 225.0    # mean luma above this: likely blown out

# Motion-diff and sharpness are NOT physically absolute in the same way —
# their scale depends on footage/content (see CALIBRATION NOTE above), so
# both are classified relative to each clip's own distribution instead of
# a fixed constant.
STATIC_PERCENTILE = 20      # diffs at/below this percentile of the clip: relatively "held"
HIGH_MOTION_PERCENTILE = 85 # diffs at/above this percentile of the clip: relatively abrupt
BLUR_RELATIVE_FACTOR = 0.4  # frames below this fraction of the clip's own median sharpness
STATIC_MIN_STEPS = 2        # consecutive low-diff gaps needed to call it a static range


def load_gray(path: Path) -> np.ndarray:
    img = Image.open(path).convert("L").resize(ANALYSIS_SIZE)
    return np.asarray(img, dtype=np.float32)


def sharpness_score(arr: np.ndarray) -> float:
    # Manual discrete Laplacian (no scipy/opencv needed): variance of the
    # second-derivative response is a standard cheap blur proxy — a sharp
    # image has strong, varied edge responses; a blurry one is flat.
    lap = (
        arr[:-2, 1:-1] + arr[2:, 1:-1] + arr[1:-1, :-2] + arr[1:-1, 2:] - 4 * arr[1:-1, 1:-1]
    )
    return float(np.var(lap))


def normalized_diff(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.mean(np.abs(a - b)) / 255.0)


def analyze_clip(clip: dict, out_dir: Path) -> dict:
    thumbs = clip["thumbnails"]
    frames = []
    arrays = []
    for t in thumbs:
        path = out_dir / t["rel_path"]
        arr = load_gray(path)
        arrays.append(arr)
        frames.append(
            {
                "timestamp": t["timestamp"],
                "brightness": round(float(np.mean(arr)), 1),
                "sharpness": round(sharpness_score(arr), 1),
            }
        )

    diffs = []
    for i in range(len(arrays) - 1):
        diffs.append(
            {
                "from": thumbs[i]["timestamp"],
                "to": thumbs[i + 1]["timestamp"],
                "diff": round(normalized_diff(arrays[i], arrays[i + 1]), 4),
            }
        )

    events = []

    # Exposure flags, per sampled frame — absolute scale, see constants above.
    for f in frames:
        if f["brightness"] < DARK_THRESHOLD:
            events.append({"type": "dark", "start": f["timestamp"], "end": f["timestamp"], "detail": f"brightness={f['brightness']}"})
        elif f["brightness"] > BRIGHT_THRESHOLD:
            events.append({"type": "bright", "start": f["timestamp"], "end": f["timestamp"], "detail": f"brightness={f['brightness']}"})

    # Sharpness flag — relative to this clip's own median (see CALIBRATION NOTE).
    sharpness_values = [f["sharpness"] for f in frames]
    if sharpness_values:
        median_sharpness = float(np.median(sharpness_values))
        blur_cutoff = median_sharpness * BLUR_RELATIVE_FACTOR
        for f in frames:
            if f["sharpness"] < blur_cutoff:
                events.append({"type": "blurry", "start": f["timestamp"], "end": f["timestamp"], "detail": f"sharpness={f['sharpness']} (clip median={median_sharpness:.0f})"})

    # Motion classification — relative to this clip's own diff distribution
    # (see CALIBRATION NOTE: absolute thresholds don't transfer across
    # footage/content, percentiles within the clip do).
    diff_values = [d["diff"] for d in diffs]
    if diff_values:
        static_cutoff = float(np.percentile(diff_values, STATIC_PERCENTILE))
        high_cutoff = float(np.percentile(diff_values, HIGH_MOTION_PERCENTILE))
    else:
        static_cutoff = high_cutoff = 0.0

    # Static/held ranges: runs of consecutive low-diff gaps (relatively the
    # calmest portions of this specific clip, not necessarily a locked-off shot).
    run_start_idx = None
    for i, d in enumerate(diffs):
        if d["diff"] <= static_cutoff:
            if run_start_idx is None:
                run_start_idx = i
        else:
            if run_start_idx is not None and i - run_start_idx >= STATIC_MIN_STEPS:
                events.append(
                    {
                        "type": "static",
                        "start": diffs[run_start_idx]["from"],
                        "end": diffs[i - 1]["to"],
                        "detail": f"{i - run_start_idx} relatively calm samples (clip static-cutoff={static_cutoff:.4f})",
                    }
                )
            run_start_idx = None
    if run_start_idx is not None and len(diffs) - run_start_idx >= STATIC_MIN_STEPS:
        events.append(
            {
                "type": "static",
                "start": diffs[run_start_idx]["from"],
                "end": diffs[-1]["to"],
                "detail": f"{len(diffs) - run_start_idx} relatively calm samples (clip static-cutoff={static_cutoff:.4f})",
            }
        )

    # Abrupt framing changes (not "cuts" — these are single continuous DJI
    # takes; a high diff here means a fast pan/whip, not an in-camera edit)
    for d in diffs:
        if d["diff"] >= high_cutoff:
            events.append({"type": "high_motion", "start": d["from"], "end": d["to"], "detail": f"diff={d['diff']} (clip high-cutoff={high_cutoff:.4f})"})

    events.sort(key=lambda e: e["start"])

    return {
        "filename": clip["filename"],
        "duration_s": clip["duration_s"],
        "frames": frames,
        "diffs": diffs,
        "events": events,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", required=True)
    parser.add_argument("--out", default=None, help="Output folder (default: analysis/<slug>/)")
    args = parser.parse_args()

    out_dir = Path(args.out) if args.out else REPO_ROOT / "analysis" / args.slug
    metadata_path = out_dir / "metadata.json"
    if not metadata_path.exists():
        raise SystemExit(f"{metadata_path} not found — run analyze.py first")

    clips = json.loads(metadata_path.read_text(encoding="utf-8"))
    events_dir = out_dir / "events"
    events_dir.mkdir(parents=True, exist_ok=True)

    all_results = []
    counts = {"static": 0, "dark": 0, "bright": 0, "blurry": 0, "high_motion": 0}
    for i, clip in enumerate(clips, 1):
        print(f"[{i}/{len(clips)}] {clip['filename']}...", end=" ", flush=True)
        result = analyze_clip(clip, out_dir)
        stem = Path(clip["filename"]).stem
        (events_dir / f"{stem}.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
        for e in result["events"]:
            counts[e["type"]] = counts.get(e["type"], 0) + 1
        all_results.append(result)
        print(f"{len(result['events'])} events")

    summary_path = out_dir / "events_summary.json"
    summary_path.write_text(
        json.dumps({"counts": counts, "clips": [{"filename": r["filename"], "num_events": len(r["events"])} for r in all_results]}, indent=2),
        encoding="utf-8",
    )

    print("\n=== Event counts ===")
    for k, v in counts.items():
        print(f"{k}: {v}")
    print(f"\nPer-clip events: {events_dir}/")
    print(f"Summary: {summary_path}")


if __name__ == "__main__":
    sys.exit(main())
