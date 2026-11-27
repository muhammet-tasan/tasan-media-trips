#!/usr/bin/env python3
"""Resolve a video's assets (raw footage, CapCut project, rough-cut export, analysis folder).

Portable part (committed): the table `## Video Assets (portable)` in PROJECT_STATUS.md maps
slug -> folder NAMES (never absolute paths).
Machine-specific part (never committed) is resolved here, in this order:
  1. env  TASAN_CAPCUT_ROOT / TASAN_CAPCUT_DRAFTS
  2. optional, gitignored  .claude/local.json  {"capcut_root": "...", "capcut_drafts_dir": "...", "capcut_exports_dir": "..."}
  3. defaults: capcut root = <repo>/../capcut (sibling of the repo), drafts dir = CapCut's
     standard location on Windows/macOS.
So on a second PC nothing needs configuring if the folder layout matches; otherwise set the env
var or create .claude/local.json once.

Usage:  python3 scripts/video_assets.py [slug] [--json]
        (no slug = the active video from PROJECT_STATUS.md)
Exit code 0 = everything needed was found unambiguously; 2 = something is missing/ambiguous
(see "problems" - only then ask the user). Read-only: never writes anything.
"""
import json, os, re, sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VIDEO_EXT = (".mp4", ".mov", ".mkv")
RAW_EXT = (".mp4", ".mov", ".mkv", ".mxf")


def read_status(status_file):
    return open(status_file, encoding="utf-8").read()


def active_slug(text):
    m = re.search(r"\*\*Slug:\*\*\s*`([^`]+)`", text)
    return m.group(1) if m else None


def asset_rows(text):
    """Parse the portable table: | slug | capcut folder | raw | export | draft |"""
    m = re.search(r"^## Video Assets \(portable\)\s*\n(.*?)(?=^## )", text, re.S | re.M)
    rows = {}
    if not m:
        return rows
    for line in m.group(1).splitlines():
        cells = [c.strip().strip("`").strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 5 and cells[0] and not set(cells[0]) <= set("-: ") and cells[0].lower() != "slug":
            rows[cells[0]] = {"capcut_folder": cells[1], "raw": cells[2] or "Raw",
                              "export": cells[3] or "Export", "draft": cells[4]}
    return rows


def machine_paths(repo=REPO, env=None):
    env = os.environ if env is None else env
    local = {}
    lp = os.path.join(repo, ".claude", "local.json")
    if os.path.isfile(lp):
        try:
            local = json.load(open(lp, encoding="utf-8"))
        except Exception:
            local = {}
    root = env.get("TASAN_CAPCUT_ROOT") or local.get("capcut_root") or os.path.join(os.path.dirname(repo), "capcut")
    drafts = env.get("TASAN_CAPCUT_DRAFTS") or local.get("capcut_drafts_dir")
    if not drafts:
        if sys.platform == "darwin":
            drafts = os.path.expanduser("~/Movies/CapCut/User Data/Projects/com.lveditor.draft")
        else:
            drafts = os.path.join(env.get("LOCALAPPDATA", ""), "CapCut", "User Data", "Projects", "com.lveditor.draft")
    exports = env.get("TASAN_CAPCUT_EXPORTS") or local.get("capcut_exports_dir")
    if not exports:  # CapCut default export folder: <CapCut>/Videos, sibling of "User Data"
        exports = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(drafts))), "Videos")
    return os.path.normpath(root), os.path.normpath(drafts), os.path.normpath(exports)


def find_drafts(drafts_dir, capcut_folder_name):
    """Drafts whose media pool references files inside the video's CapCut folder (read-only)."""
    hits = []
    if not os.path.isdir(drafts_dir):
        return hits
    needle = "/" + capcut_folder_name.lower() + "/"
    for name in sorted(os.listdir(drafts_dir)):
        meta = os.path.join(drafts_dir, name, "draft_meta_info.json")
        if not os.path.isfile(meta):
            continue
        try:
            txt = open(meta, encoding="utf-8").read().replace("\\\\", "/").replace("\\", "/").lower()
        except Exception:
            continue
        if needle in txt:
            hits.append(name)
    return hits


def to_timecode(seconds, fps):
    """Seconds -> CapCut's native HH:MM:SS:FF at the given project fps (frame-exact, no decimals)."""
    nominal = round(fps)  # 29.97 / 30 -> 30 frames per displayed second
    total = int(round(seconds * fps))
    ff = total % nominal
    secs = total // nominal
    return f"{secs // 3600:02d}:{secs % 3600 // 60:02d}:{secs % 60:02d}:{ff:02d}"


def draft_fps(draft_dir):
    """fps of the CapCut project (read-only), e.g. 30.0."""
    try:
        return float(json.load(open(os.path.join(draft_dir, "draft_content.json"), encoding="utf-8")).get("fps"))
    except Exception:
        return None


def resolve(slug=None, status_file=None, repo=REPO, env=None):
    status_file = status_file or os.path.join(repo, "PROJECT_STATUS.md")
    text = read_status(status_file)
    slug = slug or active_slug(text)
    out = {"slug": slug, "problems": [], "notes": []}
    problems = out["problems"]
    if not slug:
        problems.append("no active video found in PROJECT_STATUS.md")
        return out
    row = asset_rows(text).get(slug)
    if not row:
        problems.append(f"slug '{slug}' has no row in '## Video Assets (portable)' in PROJECT_STATUS.md")
        return out

    root, drafts_dir, exports_dir = machine_paths(repo, env)
    out["capcut_root"], out["capcut_drafts_dir"] = root, drafts_dir

    # analysis folder (inside the repo, portable by convention)
    ad = os.path.join(repo, "analysis", slug)
    out["analysis_dir"] = ad if os.path.isdir(ad) else None
    if out["analysis_dir"] is None:
        out["notes"].append(f"analysis/{slug}/ does not exist yet")

    # CapCut folder for this video
    cap = os.path.join(root, row["capcut_folder"])
    if not os.path.isdir(cap):
        problems.append(f"CapCut folder not found: {cap} (set TASAN_CAPCUT_ROOT or .claude/local.json -> capcut_root)")
        out["capcut_folder"] = None
    else:
        out["capcut_folder"] = cap

    # raw footage
    out["raw_dir"], out["raw_count"] = None, 0
    if out["capcut_folder"]:
        rd = os.path.join(cap, row["raw"])
        if os.path.isdir(rd):
            out["raw_dir"] = rd
            out["raw_count"] = len([f for f in os.listdir(rd) if f.lower().endswith(RAW_EXT)])
        else:
            problems.append(f"raw footage folder missing: {rd}")

    # rough-cut export (newest video file; the others are listed, not asked about)
    out["export"], out["export_others"] = None, []
    if out["capcut_folder"]:
        ed = os.path.join(cap, row["export"])
        if os.path.isdir(ed):
            files = sorted((os.path.join(ed, f) for f in os.listdir(ed) if f.lower().endswith(VIDEO_EXT)),
                           key=os.path.getmtime, reverse=True)
            if files:
                out["export"], out["export_others"] = files[0], files[1:]
                if files[1:]:
                    out["notes"].append(f"{len(files)} exports found; using the newest ({os.path.basename(files[0])})")
        else:
            out["notes"].append(f"export folder not found: {ed}")

    # CapCut draft: explicit name from the table, else auto-match by media paths
    out["draft"], out["draft_how"] = None, None
    if row["draft"]:
        dp = os.path.join(drafts_dir, row["draft"])
        if os.path.isfile(os.path.join(dp, "draft_content.json")):
            out["draft"], out["draft_how"] = dp, "table"
        else:
            out["notes"].append(f"draft '{row['draft']}' (from table) not found in {drafts_dir}")
    elif out["capcut_folder"]:
        hits = find_drafts(drafts_dir, row["capcut_folder"])
        if len(hits) == 1:
            out["draft"], out["draft_how"] = os.path.join(drafts_dir, hits[0]), "auto"
        elif len(hits) > 1:
            problems.append(f"{len(hits)} CapCut drafts reference this video's footage ({', '.join(hits)}); "
                            f"enter the right one in the 'Draft' column of the table")
    # CapCut's default export folder: files named after the draft ("<draft>.mp4", "<draft>(1).mp4")
    if not out["export"] and out["draft"] and os.path.isdir(exports_dir):
        stem = os.path.basename(out["draft"]).lower()
        cand = sorted((os.path.join(exports_dir, f) for f in os.listdir(exports_dir)
                       if f.lower().endswith(VIDEO_EXT) and re.fullmatch(re.escape(stem) + r"(\(\d+\))?\.[a-z0-9]+", f.lower())),
                      key=os.path.getmtime, reverse=True)
        if cand:
            out["export"], out["export_others"] = cand[0], cand[1:]
            out["notes"].append(f"export taken from CapCut's default export folder ({len(cand)} file(s) named after the draft); using the newest")
    out["project_fps"] = draft_fps(out["draft"]) if out["draft"] else None
    if not out["draft"] and not out["export"]:
        problems.append("neither a rough-cut export nor a CapCut draft was found - the review has no input yet")
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    res = resolve(args[0] if args else None)
    print(json.dumps(res, indent=2, ensure_ascii=False))
    sys.exit(2 if res["problems"] else 0)


if __name__ == "__main__":
    main()
