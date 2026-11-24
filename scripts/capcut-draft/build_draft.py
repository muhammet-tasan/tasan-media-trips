#!/usr/bin/env python3
"""PARKED (2026-11-24): kept as preserved knowledge only - no further development planned.
The workflow is now: user cuts in CapCut, Claude reviews (docs/PRODUCTION_STANDARDS.md section 7).

Feasibility prototype: build an editable CapCut draft from a TASAN cut plan CSV.

Every plan row becomes a segment on one video track that points at the ORIGINAL
clip (no copy, no re-encode); source_timerange = planned in/out, so in CapCut each
cut can be trimmed longer/shorter, moved or deleted, because the whole source file
stays available.

Writes ONLY a brand-new draft folder. It never modifies existing drafts, the draft
index (root_meta_info.json) or the original videos. It refuses to overwrite.

Usage (dry run first):
  python3 scripts/capcut-draft/build_draft.py --rows 1-3 --name "TASAN_Test_3Clips" --dry-run
  python3 scripts/capcut-draft/build_draft.py --rows 1-3 --name "TASAN_Test_3Clips"

Format knowledge (CapCut 9.x, plain-JSON drafts) comes from reading existing drafts
read-only; see docs/CAPCUT_DRAFT_RESEARCH.md. Undocumented and version dependent.
"""
import argparse, copy, csv, hashlib, json, os, re, shutil, subprocess, sys, time, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
DRAFTS = os.path.join(os.environ.get("LOCALAPPDATA", ""), "CapCut", "User Data",
                      "Projects", "com.lveditor.draft")
FFPROBE = os.path.join(REPO, "node_modules", "@remotion", "compositor-win32-x64-msvc", "ffprobe.exe")


def guid():
    return str(uuid.uuid4()).upper()


def mmss(s):
    parts = [float(p) for p in s.strip().split(":")]
    sec = 0.0
    for p in parts:
        sec = sec * 60 + p
    return sec


def probe(path):
    out = subprocess.run([FFPROBE, "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height:format=duration", "-of", "json", path],
                         capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    return j["streams"][0]["width"], j["streams"][0]["height"], float(j["format"]["duration"])


def parse_rows(spec, total):
    a, _, b = spec.partition("-")
    return range(int(a), int(b or a) + 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", default=os.path.join(REPO, "analysis", "naturoparc", "FINAL_TIMELINE_PLAN.csv"))
    ap.add_argument("--raw-dir", default=os.path.abspath(os.path.join(
        REPO, "..", "capcut", "2026 - Naturoparc Colmar", "Raw")))
    ap.add_argument("--rows", default="1-3", help="plan row numbers (Reihenfolge), e.g. 1-3")
    ap.add_argument("--name", required=True, help="name of the NEW draft folder/project")
    ap.add_argument("--base-draft", default="1122", help="existing EMPTY draft used as structural base (read-only)")
    ap.add_argument("--drafts-dir", default=DRAFTS)
    ap.add_argument("--mute", action="store_true", help="set original audio volume to 0")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    tpl = json.load(open(os.path.join(HERE, "segment_template.json"), encoding="utf-8"))
    rows = [r for r in csv.DictReader(open(a.plan, encoding="utf-8"))]
    wanted = set(parse_rows(a.rows, len(rows)))
    picks = [r for r in rows if r["Reihenfolge"].isdigit() and int(r["Reihenfolge"]) in wanted
             and r["Originaldateiname"].upper().endswith(".MP4")]
    if not picks:
        sys.exit("no matching clip rows")

    clips, t_us = [], 0
    for r in picks:
        src = os.path.join(a.raw_dir, r["Originaldateiname"])
        if not os.path.isfile(src):
            sys.exit(f"missing source clip: {src}")
        w, h, dur = probe(src)
        s, e = mmss(r["Startzeit"]), mmss(r["Endzeit"])
        if not (0 <= s < e <= dur):
            sys.exit(f"{r['Originaldateiname']}: planned {s}-{e}s outside clip length {dur:.2f}s")
        seg_us = int(round((e - s) * 1e6))
        clips.append(dict(row=r["Reihenfolge"], file=r["Originaldateiname"], path=src.replace("\\", "/"),
                          w=w, h=h, dur_us=int(round(dur * 1e6)), src_start=int(round(s * 1e6)),
                          seg_us=seg_us, tgt_start=t_us, desc=r["Szenenbeschreibung"]))
        t_us += seg_us

    print(f"{len(clips)} clips, timeline {t_us/1e6:.2f}s")
    for c in clips:
        print(f"  #{c['row']} {c['file']}  source {c['src_start']/1e6:.1f}s +{c['seg_us']/1e6:.1f}s  -> timeline {c['tgt_start']/1e6:.1f}s  ({c['w']}x{c['h']}, clip {c['dur_us']/1e6:.1f}s)")
    if a.dry_run:
        return

    base = os.path.join(a.drafts_dir, a.base_draft)
    target = os.path.join(a.drafts_dir, a.name)
    if not os.path.isdir(base):
        sys.exit(f"base draft not found: {base}")
    if os.path.exists(target):
        sys.exit(f"refusing to overwrite existing draft: {target}")

    shutil.copytree(base, target)

    # --- ids to replace across the copied folder
    old_meta = json.load(open(os.path.join(base, "draft_meta_info.json"), encoding="utf-8"))
    old_proj = json.load(open(os.path.join(base, "Timelines", "project.json"), encoding="utf-8"))
    old_tid = old_proj["main_timeline_id"]
    old_pid, old_did = old_proj["id"], old_meta["draft_id"]
    new_tid, new_pid, new_did = guid(), guid(), guid()
    old_path = old_meta["draft_fold_path"]
    new_path = old_path.rsplit("/", 1)[0] + "/" + a.name

    os.rename(os.path.join(target, "Timelines", old_tid), os.path.join(target, "Timelines", new_tid))
    for root, _, files in os.walk(target):
        for f in files:
            if not f.lower().endswith((".json", ".tmp", ".bak")):
                continue
            p = os.path.join(root, f)
            txt = open(p, encoding="utf-8").read()
            for o, n in ((old_tid, new_tid), (old_pid, new_pid), (old_did, new_did), (old_path, new_path)):
                txt = txt.replace(o, n)
            open(p, "w", encoding="utf-8").write(txt)

    # --- build timeline content from the base's (empty) content
    content = json.load(open(os.path.join(target, "draft_content.json"), encoding="utf-8"))
    content["duration"] = t_us
    content["canvas_config"].update({"ratio": "original", "width": clips[0]["w"], "height": clips[0]["h"]})
    track = copy.deepcopy(tpl["track"])
    track["id"] = guid()
    segments = []
    for c in clips:
        vm = copy.deepcopy(tpl["video_material"])
        vm.update(id=guid(), unique_id=hashlib.md5(c["path"].encode()).hexdigest(), path=c["path"],
                  material_name=c["file"], duration=c["dur_us"], width=c["w"], height=c["h"], has_audio=True)
        content["materials"]["videos"].append(vm)
        seg = copy.deepcopy(tpl["segment"])
        seg["id"] = guid()
        seg["material_id"] = vm["id"]
        seg["source_timerange"] = {"start": c["src_start"], "duration": c["seg_us"]}
        seg["target_timerange"] = {"start": c["tgt_start"], "duration": c["seg_us"]}
        seg["volume"] = 0.0 if a.mute else 1.0
        seg["last_nonzero_volume"] = 1.0
        seg["extra_material_refs"] = []
        for ex in tpl["extra_materials"]:
            item = copy.deepcopy(ex["item"])
            item["id"] = guid()
            content["materials"].setdefault(ex["materials_key"], []).append(item)
            seg["extra_material_refs"].append(item["id"])
        segments.append(seg)
    track["segments"] = segments
    content["tracks"] = [track]
    blob = json.dumps(content, ensure_ascii=False, separators=(",", ":"))
    tdir = os.path.join(target, "Timelines", new_tid)
    for p in (os.path.join(target, "draft_content.json"), os.path.join(target, "draft_content.json.bak"),
              os.path.join(target, "template-2.tmp"), os.path.join(tdir, "draft_content.json"),
              os.path.join(tdir, "draft_content.json.bak"), os.path.join(tdir, "template-2.tmp")):
        if os.path.exists(p) or p.endswith("draft_content.json"):
            open(p, "w", encoding="utf-8").write(blob)

    # --- meta info: name, media pool entries, timestamps
    meta_path = os.path.join(target, "draft_meta_info.json")
    meta = json.load(open(meta_path, encoding="utf-8"))
    now_us = int(time.time() * 1e6)
    skeleton = copy.deepcopy(old_meta["draft_materials"][0]["value"][0]) if old_meta["draft_materials"][0]["value"] else {}
    pool = []
    for c in clips:
        e = copy.deepcopy(skeleton)
        e.update(duration=c["dur_us"], extra_info=c["file"], file_Path=c["path"], height=c["h"], width=c["w"],
                 id=str(uuid.uuid4()), roughcut_time_range={"duration": c["dur_us"], "start": 0},
                 type=0, metetype="video")
        pool.append(e)
    meta["draft_materials"] = [{"type": 0, "value": pool}] + [m for m in meta["draft_materials"][1:]]
    meta.update(draft_name=a.name, tm_draft_create=now_us, tm_draft_modified=now_us, tm_duration=t_us)
    json.dump(meta, open(meta_path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

    print(f"\nCreated NEW draft: {target}")
    print("Not registered in root_meta_info.json (left untouched). Restart CapCut and look for the project.")


if __name__ == "__main__":
    main()
