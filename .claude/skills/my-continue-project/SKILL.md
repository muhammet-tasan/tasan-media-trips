---
name: my-continue-project
description: Resume a new session at the active video and its exact work step (from PROJECT_STATUS.md), verified against git history
disable-model-invocation: true
---
# /my-continue-project

Resume at the right video and the right step. Works for any number of videos — no video name is hard-coded here.

## Process
1. Read `CLAUDE.md` and `PROJECT_STATUS.md` (`## ▶ Active Video`, `## Video Registry`, the active video's section, newest Session Log entries).
2. **Verify before trusting:** `git log -8 --format='%ad %s' --date=short` and `git status --short`. Check that the newest commits/uncommitted files belong to the active video's slug (`src/<slug>/`, `analysis/<slug>/`, `out/<slug>/`). If not, or if the Active block and registry disagree, report the mismatch and ask which video is meant — then fix `PROJECT_STATUS.md` (Active block + registry) before continuing.
3. Read the documents the active video's phase requires: `docs/PRODUCTION_STANDARDS.md` for editorial/cutting work, `docs/BROLL_GUIDELINES.md` for B-roll, `docs/FOOTAGE_ANALYSIS.md` for footage tooling, plus the files named under the active video's **Details**.
4. Present the resume point and the first concrete next step. Offer the next steps from the Active block; respect a different direction if the user gives one. If the user names another video, switch: set it active in the registry, set the previous one to paused (or done), and update the Active block in the same step.
5. Do not start implementing until the user confirms.

## Output Format
```
## Session Resume

**Active video:** <Title> (<slug>)   **Phase:** <phase>
**Resume point:** <exactly where we stopped>
**Last decisions:** <1–3 bullets>

**Next steps:**
1. ...
2. ...

**Other videos:** <slug> (paused), <slug> (planned) — not touched this session

⚠ <mismatch between status file and git history — only if found>

Soll ich mit Schritt 1 loslegen, oder willst du etwas anderes?
```
