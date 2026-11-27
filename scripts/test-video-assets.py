#!/usr/bin/env python3
"""Tests scripts/video_assets.py with throw-away fixture folders (no real CapCut data touched).
Run: python3 scripts/test-video-assets.py
"""
import importlib.util, json, os, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("video_assets", os.path.join(HERE, "video_assets.py"))
va = importlib.util.module_from_spec(spec)
spec.loader.exec_module(va)

fails = 0


def check(name, cond):
    global fails
    print(("PASS  " if cond else "FAIL  ") + name)
    fails += 0 if cond else 1


def touch(p, age=0, text=""):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(text)
    t = time.time() - age
    os.utime(p, (t, t))


def make_status(path, slug="vid-a", draft=""):
    open(path, "w", encoding="utf-8").write(f"""# Status
## ▶ Active Video
- **Slug:** `{slug}`

## Video Assets (portable)
| Slug | CapCut folder | Raw | Export | Draft |
|---|---|---|---|---|
| `vid-a` | `2026 - A` | `Raw` | `Export` | {('`'+draft+'`') if draft else ''} |
| `vid-b` | `2026 - B` | `video input` | `video out` | |

## Project Overview
""")


def meta(drafts, name, folder):
    touch(os.path.join(drafts, name, "draft_content.json"), text="{}")
    touch(os.path.join(drafts, name, "draft_meta_info.json"),
          text=json.dumps({"draft_materials": [{"type": 0, "value": [
              {"file_Path": f"C:/x/capcut/{folder}/Raw/c1.MP4"}]}]}))


tmp = tempfile.mkdtemp()
repo = os.path.join(tmp, "repo")
root = os.path.join(tmp, "capcut")
drafts = os.path.join(tmp, "drafts")
os.makedirs(os.path.join(repo, "analysis", "vid-a"))
status = os.path.join(repo, "PROJECT_STATUS.md")
env = {"TASAN_CAPCUT_ROOT": root, "TASAN_CAPCUT_DRAFTS": drafts, "LOCALAPPDATA": tmp}


def run(slug=None):
    return va.resolve(slug, status_file=status, repo=repo, env=env)


print("== everything present, unambiguous")
make_status(status)
touch(os.path.join(root, "2026 - A", "Raw", "c1.MP4"))
touch(os.path.join(root, "2026 - A", "Raw", "c2.MP4"))
touch(os.path.join(root, "2026 - A", "Export", "cut_v1.mp4"))
meta(drafts, "proj1", "2026 - A")
r = run()
check("active slug taken from status file", r["slug"] == "vid-a")
check("no problems", r["problems"] == [])
check("raw dir + count", r["raw_dir"].endswith("Raw") and r["raw_count"] == 2)
check("export found", r["export"].endswith("cut_v1.mp4"))
check("draft auto-matched by media paths", r["draft"].endswith("proj1") and r["draft_how"] == "auto")
check("analysis dir found", r["analysis_dir"] and r["analysis_dir"].endswith("vid-a"))

print("== several exports -> newest, no question")
touch(os.path.join(root, "2026 - A", "Export", "cut_v2.mp4"), age=-60)
r = run()
check("newest export chosen", r["export"].endswith("cut_v2.mp4") and len(r["export_others"]) == 1)
check("noted but no problem", r["problems"] == [] and any("newest" in n for n in r["notes"]))

print("== ambiguous draft -> problem; table entry resolves it")
meta(drafts, "proj2", "2026 - A")
r = run()
check("two matching drafts = problem", any("2 CapCut drafts" in p for p in r["problems"]) and r["draft"] is None)
make_status(status, draft="proj2")
r = run()
check("draft column resolves ambiguity", r["problems"] == [] and r["draft"].endswith("proj2") and r["draft_how"] == "table")
make_status(status)

print("== missing things -> problems (only then ask)")
r = run("vid-b")
check("missing CapCut folder reported", any("CapCut folder not found" in p for p in r["problems"]))
os.makedirs(os.path.join(root, "2026 - B"))
r = run("vid-b")
check("missing raw folder reported", any("raw footage folder missing" in p for p in r["problems"]))
check("no input at all reported", any("no rough-cut export nor a CapCut draft" in p.replace("neither a ", "no ") or "neither" in p for p in r["problems"]))
r = run("unknown-slug")
check("slug without table row reported", any("no row" in p for p in r["problems"]))

print("== other PC: different root, same portable table")
root2 = os.path.join(tmp, "elsewhere", "capcut")
touch(os.path.join(root2, "2026 - A", "Raw", "c1.MP4"))
touch(os.path.join(root2, "2026 - A", "Export", "other_pc.mp4"))
env["TASAN_CAPCUT_ROOT"] = root2
r = run()
check("env override changes machine path only", r["export"].endswith("other_pc.mp4") and r["slug"] == "vid-a")
env.pop("TASAN_CAPCUT_ROOT")
os.makedirs(os.path.join(repo, ".claude"))
open(os.path.join(repo, ".claude", "local.json"), "w").write(json.dumps({"capcut_root": root2}))
r = run()
check("optional local.json override works", r["export"].endswith("other_pc.mp4"))
os.remove(os.path.join(repo, ".claude", "local.json"))
r = va.machine_paths(repo, {"LOCALAPPDATA": tmp})
check("default root is <repo>/../capcut", r[0] == os.path.normpath(os.path.join(tmp, "capcut")))

print("== CapCut default export folder (files named after the draft)")
exp_dir = os.path.join(tmp, "CapCut", "Videos")
drafts2 = os.path.join(tmp, "CapCut", "User Data", "Projects", "com.lveditor.draft")
env2 = {"TASAN_CAPCUT_ROOT": root, "TASAN_CAPCUT_DRAFTS": drafts2, "LOCALAPPDATA": tmp}
meta(drafts2, "projX", "2026 - A")
touch(os.path.join(root, "2026 - A", "Export", "ignored.txt"))
for f in os.listdir(os.path.join(root, "2026 - A", "Export")):
    os.remove(os.path.join(root, "2026 - A", "Export", f))
touch(os.path.join(exp_dir, "projX.mp4"), age=100)
touch(os.path.join(exp_dir, "projX(1).mp4"), age=0)
touch(os.path.join(exp_dir, "projXtra.mp4"))
r = va.resolve(None, status_file=status, repo=repo, env=env2)
check("export found via draft name in CapCut default folder", r["export"] and r["export"].endswith("projX(1).mp4") and len(r["export_others"]) == 1)
check("similar names are not matched", not any("projXtra" in x for x in [r["export"]] + r["export_others"]))
r = va.machine_paths(repo, {"LOCALAPPDATA": tmp, "TASAN_CAPCUT_DRAFTS": drafts2})
check("default exports dir derived from drafts dir", r[2] == os.path.normpath(exp_dir))

print("== portability: status file holds no absolute paths")
real = open(os.path.join(HERE, "..", "PROJECT_STATUS.md"), encoding="utf-8").read()
rows = va.asset_rows(real)
check("real table has entries", "naturoparc" in rows and "mulhouse-automobile-museum" in rows)
check("real table has no absolute paths", not any(":" in v or "\\" in v or v.startswith("/")
                                                 for row in rows.values() for v in row.values()))

print("\nALL PASSED" if not fails else f"\n{fails} FAILED")
sys.exit(1 if fails else 0)
