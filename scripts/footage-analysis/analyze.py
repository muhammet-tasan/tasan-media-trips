#!/usr/bin/env python3
"""
TASAN MEDIA Trips — footage analysis MVP.

Scans a folder of raw DJI clips, extracts technical metadata (ffprobe) and
timestamped thumbnails (ffmpeg), and generates a static HTML gallery for
quick sighting before building a CapCut rough cut.

Read-only on the source footage: every ffmpeg/ffprobe call only decodes
frames for preview purposes (`-ss` + `-frames:v 1`), never writes to the
source path, and never re-encodes the originals. All outputs go under
analysis/<slug>/, which is gitignored — nothing here ever reaches git.

Uses the ffmpeg/ffprobe binaries already bundled with Remotion
(node_modules/@remotion/compositor-win32-x64-msvc/) — no extra system
install. See docs/FOOTAGE_ANALYSIS.md for the full workflow and the
decisions behind this design (plus its known limitations).

Usage:
    python scripts/footage-analysis/analyze.py \
        --source "D:/path/to/raw/clips" \
        --slug naturoparc \
        --limit 5
"""

from __future__ import annotations

import argparse
import html
import json
import math
import subprocess
import sys
from dataclasses import dataclass, field
from fractions import Fraction
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
COMPOSITOR_DIR = REPO_ROOT / "node_modules" / "@remotion" / "compositor-win32-x64-msvc"
FFPROBE = COMPOSITOR_DIR / "ffprobe.exe"
FFMPEG = COMPOSITOR_DIR / "ffmpeg.exe"

VIDEO_EXTENSIONS = {".mp4", ".mov"}
# DJI low-res proxy sidecar files — not source footage, skip them.
SKIP_SUFFIXES = {".lrf"}

THUMB_INTERVAL_SECONDS = 2.0
THUMB_MIN_COUNT = 3
THUMB_WIDTH = 480
THUMB_EDGE_PADDING = 0.3  # stay this far from the very first/last frame


@dataclass
class ClipMetadata:
    filename: str
    path: str
    size_bytes: int
    duration_s: float
    creation_time: str | None
    camera: str | None
    video_codec: str | None
    width: int | None
    height: int | None
    fps: float | None
    fps_raw: str | None
    bit_rate: int | None
    audio_codec: str | None
    audio_sample_rate: int | None
    audio_channels: int | None
    thumbnails: list[dict] = field(default_factory=list)


def require_binaries() -> None:
    missing = [p for p in (FFPROBE, FFMPEG) if not p.exists()]
    if missing:
        names = ", ".join(str(p) for p in missing)
        raise SystemExit(
            f"Bundled ffmpeg/ffprobe not found: {names}\n"
            "Expected them under node_modules/@remotion/compositor-win32-x64-msvc/ "
            "— run `npm install` in the project root first."
        )


def discover_clips(source: Path, limit: int | None) -> list[Path]:
    if not source.is_dir():
        raise SystemExit(f"Source folder not found: {source}")
    files = [
        p
        for p in sorted(source.iterdir())
        if p.is_file()
        and p.suffix.lower() in VIDEO_EXTENSIONS
        and p.suffix.lower() not in SKIP_SUFFIXES
    ]
    # DJI filenames embed a recording timestamp + sequence number
    # (DJI_<yyyymmddhhmmss>_<seq>_D.MP4), so a plain filename sort is already
    # chronological — no need to touch creation_time for ordering.
    if limit is not None:
        files = files[:limit]
    return files


def parse_fps(rate: str | None) -> float | None:
    if not rate or rate == "0/0":
        return None
    try:
        return float(Fraction(rate))
    except (ValueError, ZeroDivisionError):
        return None


def probe_clip(path: Path) -> ClipMetadata:
    result = subprocess.run(
        [
            str(FFPROBE),
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    data = json.loads(result.stdout)
    fmt = data.get("format", {})
    streams = data.get("streams", [])

    # Skip the embedded MJPEG cover-art stream (disposition.attached_pic=1) —
    # DJI files carry one alongside the real HEVC video stream.
    video = next(
        (s for s in streams if s.get("codec_type") == "video" and not s.get("disposition", {}).get("attached_pic")),
        None,
    )
    audio = next((s for s in streams if s.get("codec_type") == "audio"), None)

    duration_s = float(fmt.get("duration") or (video or {}).get("duration") or 0.0)
    tags = fmt.get("tags", {})

    return ClipMetadata(
        filename=path.name,
        path=str(path),
        size_bytes=int(fmt.get("size") or 0),
        duration_s=duration_s,
        creation_time=tags.get("creation_time"),
        camera=tags.get("encoder"),
        video_codec=(video or {}).get("codec_name"),
        width=(video or {}).get("width"),
        height=(video or {}).get("height"),
        fps=parse_fps((video or {}).get("r_frame_rate")),
        fps_raw=(video or {}).get("r_frame_rate"),
        bit_rate=int(fmt.get("bit_rate")) if fmt.get("bit_rate") else None,
        audio_codec=(audio or {}).get("codec_name"),
        audio_sample_rate=int(audio["sample_rate"]) if audio and audio.get("sample_rate") else None,
        audio_channels=(audio or {}).get("channels"),
    )


def thumbnail_timestamps(duration_s: float) -> list[float]:
    if duration_s <= 0:
        return []
    pad = min(THUMB_EDGE_PADDING, duration_s / 4)
    usable = max(duration_s - 2 * pad, 0.0)
    if usable <= THUMB_INTERVAL_SECONDS * (THUMB_MIN_COUNT - 1):
        count = THUMB_MIN_COUNT
        if count == 1:
            return [duration_s / 2]
        return [pad + usable * i / (count - 1) for i in range(count)]
    count = math.floor(usable / THUMB_INTERVAL_SECONDS) + 1
    return [pad + i * THUMB_INTERVAL_SECONDS for i in range(count)]


def extract_thumbnail(src: Path, timestamp_s: float, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            str(FFMPEG),
            "-y",
            "-ss", f"{timestamp_s:.3f}",
            "-i", str(src),
            "-frames:v", "1",
            "-update", "1",
            "-map", "0:v:0",
            "-vf", f"scale={THUMB_WIDTH}:-1",
            "-q:v", "3",
            str(out_path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )


def format_duration(seconds: float) -> str:
    m, s = divmod(int(round(seconds)), 60)
    h, m = divmod(m, 60)
    return f"{h:02d}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def format_size(num_bytes: int) -> str:
    size = float(num_bytes)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024 or unit == "GB":
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} GB"


FLAG_BADGES = {
    "dark": ("dark", "#3a3020"),
    "bright": ("bright", "#3a3620"),
    "blurry": ("unscharf", "#3a2030"),
    "static": ("ruhig", "#20303a"),
    "high_motion": ("bewegt", "#2a3a20"),
}


def load_events_by_filename(out_dir: Path) -> dict[str, dict]:
    events_dir = out_dir / "events"
    if not events_dir.is_dir():
        return {}
    result = {}
    for path in events_dir.glob("*.json"):
        data = json.loads(path.read_text(encoding="utf-8"))
        result[data["filename"]] = data
    return result


def flags_at_timestamp(events: dict | None, timestamp: float) -> list[str]:
    if not events:
        return []
    flags = []
    for e in events.get("events", []):
        if e["start"] - 1.0 <= timestamp <= e["end"] + 1.0:
            flags.append(e["type"])
    return flags


def build_gallery_html(clips: list[ClipMetadata], out_dir: Path, slug: str) -> str:
    total_duration = sum(c.duration_s for c in clips)
    total_size = sum(c.size_bytes for c in clips)
    resolutions = sorted({f"{c.width}x{c.height}" for c in clips if c.width})
    framerates = sorted({round(c.fps, 2) for c in clips if c.fps})
    events_by_filename = load_events_by_filename(out_dir)
    has_events = bool(events_by_filename)

    rows = []
    for clip in clips:
        clip_events = events_by_filename.get(clip.filename)
        thumbs_html = "".join(
            f'<figure><img loading="lazy" src="{html.escape(t["rel_path"])}" '
            f'alt="{html.escape(clip.filename)} @ {t["timestamp"]:.1f}s">'
            f'<figcaption>{format_duration(t["timestamp"])}'
            + "".join(
                f'<span class="badge" style="background:{FLAG_BADGES.get(flag, ("?","#333"))[1]}">{FLAG_BADGES.get(flag, (flag, "#333"))[0]}</span>'
                for flag in flags_at_timestamp(clip_events, t["timestamp"])
            )
            + "</figcaption></figure>"
            for t in clip.thumbnails
        )
        rows.append(f"""
        <section class="clip">
          <h2>{html.escape(clip.filename)}</h2>
          <div class="meta">
            <span>{format_duration(clip.duration_s)}</span>
            <span>{clip.width}×{clip.height}</span>
            <span>{clip.fps:.2f} fps</span>
            <span>{html.escape(clip.video_codec or "?")}</span>
            <span>{html.escape(clip.audio_codec or "–")} {clip.audio_channels or ""}ch {clip.audio_sample_rate or ""}Hz</span>
            <span>{format_size(clip.size_bytes)}</span>
            <span class="label">rein technisch — keine Bildinhalts-Analyse</span>
          </div>
          <div class="thumbs">{thumbs_html}</div>
        </section>""")

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Footage-Galerie — {html.escape(slug)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root {{ color-scheme: dark; }}
  body {{ background: #0e0f12; color: #e4e4e7; font-family: -apple-system, Segoe UI, Arial, sans-serif; margin: 0; padding: 24px; }}
  h1 {{ font-size: 20px; margin: 0 0 4px; }}
  .summary {{ color: #a8a8b0; font-size: 14px; margin-bottom: 28px; }}
  .summary b {{ color: #e4e4e7; }}
  .clip {{ border-top: 1px solid #2a2a30; padding: 16px 0; }}
  .clip h2 {{ font-size: 14px; font-weight: 600; margin: 0 0 6px; font-family: Consolas, monospace; color: #d4a24e; }}
  .meta {{ display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: #a8a8b0; margin-bottom: 10px; }}
  .meta span {{ background: #1a1b20; padding: 2px 8px; border-radius: 4px; }}
  .meta .label {{ background: #2a2210; color: #d4a24e; }}
  .thumbs {{ display: flex; flex-wrap: wrap; gap: 6px; }}
  .thumbs figure {{ margin: 0; width: 160px; }}
  .thumbs img {{ width: 160px; height: 90px; object-fit: cover; border-radius: 4px; display: block; }}
  .thumbs figcaption {{ font-size: 11px; color: #a8a8b0; text-align: center; margin-top: 2px; }}
  .badge {{ display: inline-block; font-size: 9px; color: #e4e4e7; padding: 1px 5px; border-radius: 3px; margin-left: 3px; }}
</style>
</head>
<body>
  <h1>NaturOparC — Footage-Galerie</h1>
  <div class="summary">
    <b>{len(clips)}</b> Clips · <b>{format_duration(total_duration)}</b> Gesamtdauer ·
    <b>{format_size(total_size)}</b> ·
    Auflösung(en): <b>{", ".join(resolutions)}</b> ·
    Bildrate(n): <b>{", ".join(f"{f:g}" for f in framerates)} fps</b><br>
    Alle Angaben oben inkl. der farbigen Badges sind technische Messwerte (ffprobe/ffmpeg + Pixel-Heuristik) —
    keine Bildinhalts-Analyse. "ruhig"/"bewegt" sind relativ zum jeweiligen Clip, nicht absolut.
    {"" if has_events else " (Technische Flags noch nicht berechnet — detect.py noch nicht gelaufen.)"}
  </div>
  {"".join(rows)}
</body>
</html>"""


def clips_from_metadata_json(metadata_path: Path) -> list[ClipMetadata]:
    raw = json.loads(metadata_path.read_text(encoding="utf-8"))
    return [ClipMetadata(**entry) for entry in raw]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=False, help="Folder containing raw DJI clips")
    parser.add_argument("--slug", required=True, help="Project slug, e.g. naturoparc")
    parser.add_argument("--limit", type=int, default=None, help="Only process the first N clips (for testing)")
    parser.add_argument(
        "--out",
        default=None,
        help="Output folder (default: analysis/<slug>/ under the repo root)",
    )
    parser.add_argument(
        "--rebuild-gallery-only",
        action="store_true",
        help="Skip probing/thumbnailing; just rebuild gallery.html from the existing "
        "metadata.json (and events/, if detect.py has run) — fast, no --source needed.",
    )
    args = parser.parse_args()

    out_dir = Path(args.out) if args.out else REPO_ROOT / "analysis" / args.slug

    if args.rebuild_gallery_only:
        metadata_path = out_dir / "metadata.json"
        if not metadata_path.exists():
            raise SystemExit(f"{metadata_path} not found — run a full analyze.py pass first")
        clips = clips_from_metadata_json(metadata_path)
        gallery_path = out_dir / "gallery.html"
        gallery_path.write_text(build_gallery_html(clips, out_dir, args.slug), encoding="utf-8")
        print(f"Rebuilt gallery from {len(clips)} clips in existing metadata: {gallery_path}")
        return

    if not args.source:
        raise SystemExit("--source is required unless --rebuild-gallery-only is set")

    require_binaries()

    source = Path(args.source)
    thumbs_dir = out_dir / "thumbs"

    clip_paths = discover_clips(source, args.limit)
    if not clip_paths:
        raise SystemExit(f"No .mp4/.mov files found in {source}")

    print(f"Found {len(clip_paths)} clip(s) to process" + (f" (limited to first {args.limit})" if args.limit else ""))

    clips: list[ClipMetadata] = []
    for i, path in enumerate(clip_paths, 1):
        print(f"[{i}/{len(clip_paths)}] {path.name} — probing...", end=" ", flush=True)
        clip = probe_clip(path)
        timestamps = thumbnail_timestamps(clip.duration_s)
        clip_thumb_dir = thumbs_dir / path.stem
        for t in timestamps:
            rel = Path("thumbs") / path.stem / f"t_{t:07.2f}.jpg"
            extract_thumbnail(path, t, out_dir / rel)
            clip.thumbnails.append({"timestamp": t, "rel_path": str(rel).replace("\\", "/")})
        print(f"{clip.duration_s:.1f}s, {clip.width}x{clip.height}, {clip.fps:.2f}fps, {len(timestamps)} thumbs")
        clips.append(clip)

    out_dir.mkdir(parents=True, exist_ok=True)
    metadata_path = out_dir / "metadata.json"
    metadata_path.write_text(
        json.dumps([c.__dict__ for c in clips], indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    gallery_path = out_dir / "gallery.html"
    gallery_path.write_text(build_gallery_html(clips, out_dir, args.slug), encoding="utf-8")

    total_duration = sum(c.duration_s for c in clips)
    total_size = sum(c.size_bytes for c in clips)
    resolutions = sorted({f"{c.width}x{c.height}" for c in clips if c.width})
    framerates = sorted({round(c.fps, 2) for c in clips if c.fps})

    print("\n=== Summary ===")
    print(f"Clips:       {len(clips)}")
    print(f"Duration:    {format_duration(total_duration)} ({total_duration:.1f}s)")
    print(f"Total size:  {format_size(total_size)}")
    print(f"Resolutions: {', '.join(resolutions)}")
    print(f"Framerates:  {', '.join(f'{f:g}' for f in framerates)} fps")
    print(f"\nMetadata: {metadata_path}")
    print(f"Gallery:  {gallery_path}")


if __name__ == "__main__":
    sys.exit(main())
