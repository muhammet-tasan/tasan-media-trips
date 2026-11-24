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
3. Make the cut visible: for an export, extract timestamped frames (every 2 s, plus denser around cuts or doubtful spots) using the bundled FFmpeg and the contact-sheet approach from `docs/FOOTAGE_ANALYSIS.md`; read the frames. Do not claim to have seen or heard anything you did not actually examine; mark unverified points "nicht bestätigt".
4. Review along these dimensions, each finding with a **timecode** (mm:ss or range): Dramaturgie · Bildqualität · Zuschauerbindung · Szenenlänge · Informationsvermittlung · B-Roll-Platzierung · Privatsphäre (recognizable family faces, §2 — mandatory check).
5. Find overlooked scenes: compare the cut's used source ranges with `analysis/<slug>/content_review.md`, `editorial_editlist.csv` and thumbnails (`docs/FOOTAGE_ANALYSIS.md` §10). Suggest candidates as `clip | range | what is visible | why`.
6. Write `analysis/<slug>/ROUGHCUT_REVIEW.md` (`_v2`, `_v3` … for later rounds): short overall assessment (length vs. target, structure, the 3 biggest levers), then a table `Timecode | Dimension | Beobachtung | Vorschlag | Priorität (Hoch/Mittel/Niedrig)`, then the overlooked-scene candidates. Suggestions only — the user decides; do not re-cut, do not generate projects.
7. Show the top findings in chat, link the file, and update the Active Video block's resume point in `PROJECT_STATUS.md` (review done, what the user does next).

## Rules
- German output for the review (the channel and the user work in German).
- Specific beats general: every suggestion names a timecode and what to change.
- No rigid per-shot second rules; judge length by content (§5).
- B-roll suggestions name the graphic type (§6 catalog) and where it would sit; building it in Remotion starts only after approval.
