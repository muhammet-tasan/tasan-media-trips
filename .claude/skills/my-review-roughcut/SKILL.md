---
name: my-review-roughcut
description: Review the user's CapCut rough cut of the active video and give concrete, time-based suggestions (dramaturgy, image quality, retention, scene length, information, B-roll placement)
disable-model-invocation: true
---
# /my-review-roughcut

Reviews the **user's own rough cut** (the user selects scenes and cuts in CapCut — Claude never builds the cut). Works for any video; the video comes from `PROJECT_STATUS.md` (`## ▶ Active Video`), never from this file. Binding rules: `docs/PRODUCTION_STANDARDS.md` §7 (workflow), §1–6 (standards).

## Process
1. Read `PROJECT_STATUS.md` (active video + slug), `docs/PRODUCTION_STANDARDS.md`, and — for B-roll suggestions — `docs/BROLL_GUIDELINES.md`. Verify against `git log` / `analysis/<slug>/` that the active video is the one meant; ask if unclear.
2. **Find the input automatically — do not ask for paths.** Run `python3 scripts/video_assets.py` (active video; or pass a slug). It resolves, for this PC, the raw-footage folder, the newest rough-cut export, the CapCut draft and `analysis/<slug>/` from the portable table `## Video Assets (portable)` in `PROJECT_STATUS.md`. Use what it found. Only if its `problems` list is non-empty (exit code 2) ask the user — one concise question naming exactly what is missing or ambiguous (e.g. which of several drafts; set the `Draft` column afterwards). A path given in the arguments overrides the lookup. If the draft exists but its timeline has no segments, say that the cut has not been started yet and stop. Accepted inputs, in order of reliability:
   - the exported rough-cut MP4 (`export`; low resolution is fine; if several exist the newest is used — say which one);
   - the CapCut draft (`draft` → `draft_content.json`) **read-only** for the exact cut list (segments: material path, `source_timerange`, `target_timerange`, microseconds) — never write to drafts, never touch originals;
   - optional voice-over script / target length.
3. Make the cut visible. **Look at every cut, not a time grid:** from the draft's cut list take **at least 3 frames per cut** (just after the start, middle, just before the end) from the export with the bundled FFmpeg, tile them per cut into contact sheets (a row per cut with `#`, timecode, duration, source clip) and read ALL sheets; add denser frames where something may fall between samples (fast moments, hook candidates). Without a cut list fall back to one frame every 2 s and say so. Never imply that every cut was watched if it was not (decide honestly internally; if sampling was partial, say so in one short line). Do not claim to have seen anything you did not actually examine; mark unverified points "nicht bestätigt".
4. Review internally along these dimensions: Dramaturgie · Bildqualität · Zuschauerbindung · Szenenlänge · Informationsvermittlung · B-Roll-Platzierung · Privatsphäre (recognizable family faces, §2 — mandatory check). **Images only: never analyze audio** (no levels, LUFS, noise, music, speech — also not via scripts); the user does all audio work and its quality control.
5. For hook or replacement suggestions search the **whole** original footage (all clips, via `analysis/<slug>/content_review.md` and thumbnails), then verify the best candidates with dense frames from the 4K originals. Find overlooked scenes by comparing the cut's used source ranges with `content_review.md`, `editorial_editlist.csv` and thumbnails (`docs/FOOTAGE_ANALYSIS.md` §10).
6. **Output = one single table, nothing else of substance** — written to `analysis/<slug>/ROUGHCUT_REVIEW.md` (`_v2`, `_v3` … per round) and shown in chat. Columns exactly: **Timecode (current CapCut timeline) | Szene | Änderung | Dauer | Priorität** (notwendig / optional). When new original footage is inserted, the *Änderung* cell holds the **full file name plus start and end time in the original clip**. No codes like "H1", no "Zeile 12", no references to other rows: every row must be understandable and doable on its own (inserts at the start are simply rows at 0:00). Put the rows in timeline order and add one line telling the user to work bottom-up. Only changes with clearly visible benefit.
7. In chat: the table plus at most two short lines (e.g. resulting length, bottom-up hint). **No technical analysis reports** — no sampling statistics, frame counts, measurements or method descriptions; the analysis stays internal. Then update the Active Video block's resume point in `PROJECT_STATUS.md`. Suggestions only — the user decides; do not re-cut, do not generate projects.

## Rules
- **TASAN Trips is a family outing video, not an animal film:** atmosphere, surroundings and the visit experience are part of the story. Shorten calm environment shots instead of deleting them; recommend deleting only duplicates, shots that show almost nothing, and shots with recognizable faces.
- German output for the review (the channel and the user work in German).
- Specific beats general: every row names a timecode and what exactly to change.
- Chat stays compact; depth belongs in the internal analysis, not in the answer.
- No rigid per-shot second rules; judge length by content (§5).
- B-roll suggestions name the graphic type (§6 catalog) and where it would sit; building it in Remotion starts only after approval.
