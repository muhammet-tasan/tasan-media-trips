# CapCut draft generation — feasibility research (2026-11-24)

> **PARKED (decision 2026-11-24): do not invest further time in CapCut project generation.** The workflow changed: the user creates the rough cut in CapCut; Claude reviews it (`docs/PRODUCTION_STANDARDS.md` §7). This document and `scripts/capcut-draft/` are kept only as preserved technical knowledge. The 3-clip test project (`TASAN_Test_3Clips`) was generated but its opening in CapCut was never confirmed. What remains useful: reading a CapCut draft **read-only** to get the user's cut list (segments, source ranges, timeline positions) for a review.

Goal: generate an **editable CapCut project** from a cut plan (e.g. `analysis/<slug>/FINAL_TIMELINE_PLAN.csv`) with the original clips already on the timeline, so every cut can be lengthened, shortened, moved or deleted in CapCut. Reusable for all future videos.

Status: **prototype written, structural checks pass, opening in CapCut not yet confirmed** (needs the user to start CapCut — see "Open test" below).

## Environment found
- CapCut (international) for Windows, several versions installed under `%LOCALAPPDATA%\CapCut\Apps\` (8.5 … **9.8.0.4213** newest). Drafts last written by 9.6.0.
- Drafts live in `%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft\<name>\`, indexed by `root_meta_info.json` (`all_draft_store`).
- Draft files are **plain JSON** (not encrypted) in this version, even for the newest draft.

## Draft structure (read-only inspection of existing drafts)
```
<draft>/
  draft_content.json      timeline (copy of Timelines/<tid>/draft_content.json; template-2.tmp + .bak are copies too)
  draft_meta_info.json    draft_id, draft_name, draft_fold_path, draft_materials = media pool (file_Path, size, duration, id)
  Timelines/project.json  project id, main_timeline_id, timelines[]
  Timelines/<tid>/...     per-timeline content + attachment files
  timeline_layout.json, draft_cover.jpg, draft_settings, key_value.json, ...
```
- `draft_content.json`: `materials.videos[]` (one per source file: `path` = absolute path of the ORIGINAL file, `duration`/`width`/`height`), `tracks[]` (`type: video`) with `segments[]`.
- Segment = `source_timerange {start,duration}` (in/out inside the source file) + `target_timerange {start,duration}` (position on the timeline), both in **microseconds**, `material_id` → video material, `extra_material_refs` → 8 companion entries (speeds, canvases, placeholder_infos, material_animations, sound_channel_mappings, material_colors, loudnesses, vocal_separations).
- Because segments only reference the original file with a source range, CapCut can extend a cut up to the full clip — no handles/buffers needed (unlike pre-cut files).

## Prototype
- `scripts/capcut-draft/build_draft.py` + `scripts/capcut-draft/segment_template.json` (segment skeleton extracted from a real draft).
- Reads plan CSV rows, probes clips with the bundled ffprobe, copies an existing **empty** draft as structural base (read-only; default `1122`), gives it fresh IDs, writes the segments + media pool.
- Safety: writes only a brand-new folder, refuses to overwrite, never touches existing drafts, the draft index or originals. `--dry-run` shows the plan first.
- Test run: `--rows 1-3 --name TASAN_Test_3Clips` → 3 hook clips (NaturOparC 0017, 0037, 0041; 2 s each, 6 s timeline). Verified: all material/segment references resolve, timeline copies identical, existing index untouched.

## Open test (needs the user)
1. Start CapCut (it was not running). 2. Look for the project **TASAN_Test_3Clips** in the project list. 3. Open it: three clips in order on one track? Trim the end of a clip longer — does it extend into the rest of the source clip? Does playback work (4K HEVC 10-bit)?
- If the project is not listed: CapCut may only list drafts present in `root_meta_info.json`. Next test = add an index entry (back up the index first).
- If CapCut reports errors or repairs the draft: compare against a draft CapCut saved itself and adjust the generator.

## Alternatives
- **Stream-copied, numbered clips (FFmpeg):** works without any undocumented format; clips still need to be placed by hand.
- **EDL/FCPXML/XML import:** professional NLEs (Resolve, Premiere) import these; CapCut desktop has no documented timeline-import (not verified in this version) — not pursued.
- **Community libraries** (pyCapCut / VectCutAPI style) automate the same draft JSON; not adopted — no extra dependency while the format is this simple, but worth consulting if CapCut changes the format.

## Risks
Undocumented, version-dependent format; a CapCut update can break generation. Keep generated drafts as **new** projects, keep originals untouched, re-run the 3-clip test after CapCut updates.
