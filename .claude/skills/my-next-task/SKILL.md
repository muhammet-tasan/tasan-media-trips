---
name: my-next-task
description: Tell the next step of the fixed production process for the active video (from docs/PRODUCTION_PROCESS.md, evidence in the project and docs/LEARNINGS.md), who does it, and start it on request
disable-model-invocation: true
---
# /my-next-task

Process navigator: the user should never have to work out which step is due. Works for any video — the video comes from `PROJECT_STATUS.md` (`## ▶ Active Video`), the steps from `docs/PRODUCTION_PROCESS.md`.

## Process
1. Read `PROJECT_STATUS.md` (Active Video block incl. **Process step**, registry), `docs/PRODUCTION_PROCESS.md`, `docs/PRODUCTION_STANDARDS.md` §7, and `docs/LEARNINGS.md`.
2. Collect evidence, read-only: `python3 scripts/video_assets.py` (raw footage, CapCut draft, newest export), `analysis/<slug>/` (which of `TRIP_INFO.md`, `content_review.md`, `ROUGHCUT_REVIEW*.md`, `NARRATION.md`, `GRAFIKPLAN.md`, `PUBLISH.md` exist), `out/<slug>/`, the draft's segment count/duration (read-only `draft_content.json`), `git log -5`.
3. Determine the current stage with the "Erledigt, wenn" column of the process table. If the evidence disagrees with the **Process step** in the status file, say so and trust the evidence (then correct the field when the user confirms). If you cannot tell (e.g. the user's "Schnitt steht" is missing), ask exactly that one question.
4. Answer, short:
   - **Stage** (S-number + name) and the evidence it is based on,
   - **Next step**, **who does it** (user / Claude), and what Claude can start right now,
   - the **stage's questions** from the process doc — ask them only for the stage that is due (e.g. S4: narration style, perspective, length, key messages) and give 2–3 concrete options,
   - 2–3 relevant entries from `docs/LEARNINGS.md` for this stage,
   - what comes after (one line).
5. End with: "Soll ich loslegen?" and, when confirmed, run the step (e.g. `/my-review-roughcut` logic for S3). Update `Process step`/resume point in `PROJECT_STATUS.md` only after the step is actually done.

## Rules
- Never analyze audio (levels, loudness, noise, music, speech); audio is the user's job. Keep answers compact — no technical analysis reports.
- Never propose building the rough cut or CapCut projects (user cuts, Claude reviews).
- Do not skip ahead: S6/S7 graphics only after the cut stands and the narration exists, unless the user explicitly overrides.
- Stay within the active video unless asked.
- New insights gained while doing a step go into `docs/LEARNINGS.md`, not only into the chat.
