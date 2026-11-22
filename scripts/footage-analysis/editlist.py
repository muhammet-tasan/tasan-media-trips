#!/usr/bin/env python3
"""
TASAN MEDIA Trips — footage analysis: draft edit list.

Runs after analyze.py and detect.py. Combines per-clip technical metadata
and detected events into a single CSV: filename, start, end, duration,
suggested use (Hook/Hauptteil/Uebergang/Schluss/Pruefen), note.

One row per clip, not per sub-event — thumbnails are only 2s apart, which
is a sighting resolution, not a frame-accurate in/out point, so start/end
here is deliberately the whole clip rather than a precision trim. The note
column surfaces the most relevant detected timestamps so you still know
where to actually look within the clip. See docs/FOOTAGE_ANALYSIS.md §6.

This is a draft starting point for the CapCut rough cut, not an editorial
decision — read it, adjust it (or ask Claude to, after you've skimmed the
gallery), then build the timeline.

Usage:
    python scripts/footage-analysis/editlist.py --slug naturoparc
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

HOOK_WINDOW = 3          # first N clips chronologically considered for "Hook"
ENDING_WINDOW = 3        # last N clips chronologically considered for "Schluss"
MIN_FEATURE_DURATION = 5.0   # below this, too short to be a Hook/Schluss candidate
ISSUE_RATIO_FOR_REVIEW = 0.3  # share of sampled frames flagged dark/bright/blurry
STATIC_COVERAGE_FOR_TRANSITION = 0.3  # share of clip duration spent in a static range


def format_duration(seconds: float) -> str:
    m, s = divmod(int(round(seconds)), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def load_events(events_dir: Path, filename: str) -> dict | None:
    stem = Path(filename).stem
    path = events_dir / f"{stem}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def summarize_events(events: dict | None, duration: float) -> dict:
    if not events:
        return {"issues": 0, "num_frames": 0, "has_high_motion": False, "static_coverage": 0.0, "highlights": []}

    frames = events.get("frames", [])
    ev_list = events.get("events", [])
    issues = sum(1 for e in ev_list if e["type"] in ("dark", "bright", "blurry"))
    has_high_motion = any(e["type"] == "high_motion" for e in ev_list)
    static_seconds = sum(e["end"] - e["start"] for e in ev_list if e["type"] == "static")
    static_coverage = static_seconds / duration if duration > 0 else 0.0

    highlights = []
    for e in ev_list:
        if e["type"] == "static":
            highlights.append(f"ruhig {format_duration(e['start'])}–{format_duration(e['end'])}")
        elif e["type"] == "high_motion":
            highlights.append(f"starker Bildwechsel bei {format_duration(e['start'])}")
        elif e["type"] in ("dark", "bright", "blurry"):
            highlights.append(f"{e['type']} bei {format_duration(e['start'])}")

    return {
        "issues": issues,
        "num_frames": len(frames),
        "has_high_motion": has_high_motion,
        "static_coverage": static_coverage,
        "highlights": highlights,
    }


def classify(clip: dict, summary: dict, index: int, total: int) -> tuple[str, str]:
    duration = clip["duration_s"]
    issue_ratio = summary["issues"] / summary["num_frames"] if summary["num_frames"] else 0.0

    if issue_ratio > ISSUE_RATIO_FOR_REVIEW:
        return "Pruefen", f"{summary['issues']}/{summary['num_frames']} Samples mit Belichtungs-/Schärfeflag — vor Verwendung ansehen"

    if index < HOOK_WINDOW and summary["has_high_motion"] and duration >= MIN_FEATURE_DURATION:
        return "Hook", "früh im Material, bewegungsreich, Hook-Kandidat"

    if index >= total - ENDING_WINDOW and duration >= MIN_FEATURE_DURATION:
        return "Schluss", "letzter Abschnitt des Drehtags, Schluss-Kandidat"

    if summary["static_coverage"] >= STATIC_COVERAGE_FOR_TRANSITION:
        return "Uebergang", f"{summary['static_coverage']*100:.0f}% des Clips relativ ruhig — gut für VO/B-Roll"

    return "Hauptteil", "Standard-Material ohne besondere Auffälligkeit"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", required=True)
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    out_dir = Path(args.out) if args.out else REPO_ROOT / "analysis" / args.slug
    metadata_path = out_dir / "metadata.json"
    if not metadata_path.exists():
        raise SystemExit(f"{metadata_path} not found — run analyze.py first")

    clips = json.loads(metadata_path.read_text(encoding="utf-8"))
    events_dir = out_dir / "events"

    rows = []
    for i, clip in enumerate(clips):
        events = load_events(events_dir, clip["filename"])
        summary = summarize_events(events, clip["duration_s"])
        use, note = classify(clip, summary, i, len(clips))
        if summary["highlights"]:
            note = f"{note} | {', '.join(summary['highlights'][:4])}"
        rows.append(
            {
                "filename": clip["filename"],
                "start": "00:00",
                "end": format_duration(clip["duration_s"]),
                "duration": format_duration(clip["duration_s"]),
                "suggested_use": use,
                "note": note,
            }
        )

    csv_path = out_dir / "editlist.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["filename", "start", "end", "duration", "suggested_use", "note"])
        writer.writeheader()
        writer.writerows(rows)

    counts: dict[str, int] = {}
    for r in rows:
        counts[r["suggested_use"]] = counts.get(r["suggested_use"], 0) + 1

    print(f"Wrote {len(rows)} rows to {csv_path}")
    print("Suggested-use breakdown:")
    for k, v in sorted(counts.items(), key=lambda kv: -kv[1]):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    sys.exit(main())
