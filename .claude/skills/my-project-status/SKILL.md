---
name: my-project-status
description: Restore project context and show the current video production status.
disable-model-invocation: true
---
# /my-project-status

Restores the working context of a fresh session and shows where the active video stands. **Read-only** — it changes no files and starts no work. After it runs, the user can give a task directly.

Boundary: this skill answers **"where are we?"**. `/my-next-task` answers **"what is the next production step?"** (process navigation, stage questions, learnings for that stage). Do not derive or recommend the next step here beyond naming the open items from the status file and pointing to `/my-next-task`.

No video name is hard-coded; everything comes from the project files. Shell: commands assume Git Bash (the Bash tool); use PowerShell equivalents only if Bash is unavailable. A missing deliverable (e.g. `TRIP_INFO`, `NARRATION`) is only worth mentioning if the process table says it is already due at the current stage. Keep token use low: read each source once, only the parts named.

## Process
1. **Read (once):** `CLAUDE.md` is already loaded — rely on it. From `PROJECT_STATUS.md` read only `## ▶ Active Video`, `## Video Registry` and the active video's `## Video: …` section (the file is large: `grep -n '^## '` for line numbers, then read just those ranges with offset/limit — Active block + registry are ~40 lines; skip the session log unless something is unclear). From `docs/PRODUCTION_PROCESS.md` read only the stage rows of the current **Process step** and the next one (`grep -n '^| S<n> '`). Skim `docs/LEARNINGS.md` headings only; read an entry just if it is relevant to the current stage. Read `docs/PRODUCTION_STANDARDS.md` only if the user's next task is editorial.
2. **Evidence (read-only, cheap):**
   - `git status --short` and `git log -5 --format='%ad %s' --date=short`
   - `python3 scripts/video_assets.py` (raw footage count, CapCut draft, newest export; use its `notes`/`problems`)
   - `ls analysis/<slug>/` plus `src/<slug>/`, `out/<slug>/` if they exist — note which deliverables exist (`TRIP_INFO`, `content_review`, `ROUGHCUT_REVIEW*`, `NARRATION`, `GRAFIKPLAN`, `PUBLISH`) and read the newest `ROUGHCUT_REVIEW*`/analysis file's header (basis, date, verdict) rather than all of it.
   - Timestamps (`ls -l --time-style=long-iso` on the export, draft folder and the newest `ROUGHCUT_REVIEW*`; the resolver's paths show where):  is the newest export/draft **newer than** the latest review or the status file's "Last Updated"? If yes, the user has probably worked since — say so ("neuer Export seit Review v1, noch nicht geprüft").
3. **Uncommitted changes & parallel sessions:** group `git status` entries by area (status/docs, skills, scripts, analysis/<slug>, src/<slug>). Flag as ⚠ when (a) uncommitted files touch a different video/area than the active step suggests, (b) files modified within the last ~30 minutes although this session has not written them (possible parallel session; a fresh session has written nothing, so such files are real signals — but ignore this skill's own file and `PROJECT_STATUS.md` if the user is currently editing them; don't edit them without asking). A CapCut draft with a `.locked` file means CapCut is open, (c) the working tree holds work the status file doesn't mention yet. Say plainly what is uncommitted; never commit, stash or revert on your own.
4. **Verify, don't copy:** if the status file contradicts the evidence (registry vs Active block, stale phase text, newer export than the review, wrong process step), report it in one line and propose the fix. Trust the evidence. Fix the status file only after the user confirms (or if the user's request is to fix it).
5. **Summarize** in the format below, then stop and let the user give the task. Mention shared tooling only if it changed recently or blocks something.

## Output Format
Short and scannable, German, no file-by-file lists, **no history of finished videos** (a finished video appears only as a bare count: "1 Video abgeschlossen").
```
## Aktiv: <Titel> (<slug>)
**Stufe:** S<n> <Name> — <Phase in einem Satz> · **Am Zug:** Nutzer | Claude
**Stand:** erledigt: ... · offen: ...
**Wichtige Entscheidungen:** 2–4 Stichpunkte (kreative Richtung, Regeln, Datenschutz)
**Material:** Rohmaterial <n> Clips · Schnitt: <Entwurf, Export + Datum> · Analyse: <vorhandene Dateien>

**Uncommittet:** <Bereiche in einer Zeile> — oder "sauber"
⚠ <Konflikte/Abweichungen: Parallelsitzung, veraltete Statusangabe, neuer Export ungeprüft> — nur wenn vorhanden

Nächster Schritt → `/my-next-task`. Oder gib mir direkt einen Auftrag.
```
Other videos: only one line if any are paused/planned; skip if there are none.
