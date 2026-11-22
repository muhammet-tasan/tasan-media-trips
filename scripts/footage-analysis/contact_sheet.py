#!/usr/bin/env python3
"""
TASAN MEDIA Trips — build a contact sheet (grid of all thumbnails, each
labeled with its timestamp) for one or all clips, so a full clip's extracted
frames can be reviewed in a single image instead of dozens of separate
files. Used for the editorial content-review pass (see
docs/FOOTAGE_ANALYSIS.md §4) — purely a viewing aid, no analysis logic here.

Usage:
    python scripts/footage-analysis/contact_sheet.py --slug naturoparc [--filename DJI_..._D.MP4]
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parents[2]

CELL_W, CELL_H = 200, 113
LABEL_H = 16
COLS_MAX = 9


def build_sheet(clip: dict, out_dir: Path, sheet_path: Path) -> None:
    thumbs = clip["thumbnails"]
    n = len(thumbs)
    cols = min(COLS_MAX, max(1, n))
    rows = math.ceil(n / cols)

    sheet = Image.new("RGB", (cols * CELL_W, rows * (CELL_H + LABEL_H)), (20, 20, 24))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 13)
    except Exception:
        font = ImageFont.load_default()

    for i, t in enumerate(thumbs):
        col, row = i % cols, i // cols
        x, y = col * CELL_W, row * (CELL_H + LABEL_H)
        img_path = out_dir / t["rel_path"]
        try:
            im = Image.open(img_path).convert("RGB").resize((CELL_W, CELL_H))
            sheet.paste(im, (x, y))
        except Exception:
            draw.rectangle([x, y, x + CELL_W, y + CELL_H], fill=(60, 20, 20))
        m, s = divmod(t["timestamp"], 60)
        label = f"{int(m):02d}:{s:04.1f}"
        draw.text((x + 4, y + CELL_H + 1), label, fill=(255, 255, 255), font=font)

    sheet.save(sheet_path, quality=85)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--slug", required=True)
    parser.add_argument("--filename", default=None, help="Only build for this one clip filename")
    parser.add_argument("--out", default=None)
    args = parser.parse_args()

    out_dir = Path(args.out) if args.out else REPO_ROOT / "analysis" / args.slug
    metadata_path = out_dir / "metadata.json"
    clips = json.loads(metadata_path.read_text(encoding="utf-8"))
    sheets_dir = out_dir / "contact_sheets"
    sheets_dir.mkdir(parents=True, exist_ok=True)

    targets = [c for c in clips if args.filename is None or c["filename"] == args.filename]
    for i, clip in enumerate(targets, 1):
        stem = Path(clip["filename"]).stem
        sheet_path = sheets_dir / f"{stem}.jpg"
        build_sheet(clip, out_dir, sheet_path)
        print(f"[{i}/{len(targets)}] {clip['filename']} -> {sheet_path.name} ({len(clip['thumbnails'])} thumbs)")


if __name__ == "__main__":
    sys.exit(main())
