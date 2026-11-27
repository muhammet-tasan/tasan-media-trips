# TASAN MEDIA Trips — Project Guide

This project creates YouTube trip videos combining DJI Pocket 3 footage, German voice-over, and Remotion-powered motion graphics.

**Editing workflow (since 2026-11-24):** CapCut is the primary video editor — **the user selects the scenes and creates the rough cut themselves**, and voice-over sync and final assembly/export also happen there. Claude does not build rough cuts or CapCut projects; its job is to **review the user's rough cut** and give concrete, time-based suggestions (dramaturgy, image quality, viewer retention, scene length, information, B-roll placement) via `/my-review-roughcut`. The footage-analysis tool stays as a supporting tool, mainly to find interesting scenes in the raw footage that the cut overlooked. Remotion is used narrowly: it builds only specific B-roll clips, maps, titles, or motion graphics for gaps identified while editing in CapCut, then those renders are imported back into CapCut. Remotion does not organize raw footage or assemble the full video.

**Before any new Remotion work (B-roll, intro, caption, effect, scene):** check the library first — `/my-remotion-library` / `docs/REMOTION_LIBRARY.md` (reuse, combine or extend existing components; new ones are separate, configurable, project-agnostic components, see `docs/PRODUCTION_STANDARDS.md` §9). After the user approves a component, register it in the catalog (automatic, §9 checklist).

**Before starting any new B-roll:** read `docs/BROLL_GUIDELINES.md` and check for an existing relevant reference implementation (e.g. `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx` for geographic Route Check graphics) before writing any code. This is mandatory, not optional — it exists to avoid repeating the many visual/timing iterations the first Route Check needed.

**Before reviewing a rough cut or giving any editorial advice (not just B-rolls):** read `docs/PRODUCTION_STANDARDS.md` (§7 defines the review workflow). It is the binding editorial standard for channel positioning, family-footage/privacy rules, the hook, storytelling/editing structure, and the reusable-infographics catalog — applies by default to every future video; project-specific exceptions must be documented, not silently taken.

## How to Work with This Project

### Session Management
Each session should follow a clear start → work → checkpoint cycle:

1. **Start a session:** `/my-continue-project` reviews PROJECT_STATUS.md and offers direction
2. **Work:** Make edits, run tests, implement features
3. **End a session:** `/my-daily-project-closeout` creates a checkpoint to preserve continuity

### Project Organization
Each trip project gets a canonical slug (e.g. `mulhouse-automobile-museum`) used consistently across:
`public/images/<project-slug>/`, `src/<project-slug>/`, `out/<project-slug>/`.
Keep it shallow — no extra nested folders unless a project genuinely grows large enough to need them.
Shared infrastructure (`public/geo/`, `public/maplibre/`) stays where it is, not inside a project folder.
`src/Root.tsx` and `src/index.ts` stay at the `src/` root as application-level entry files.

### Key Files
- **PROJECT_STATUS.md** – Persistent project memory (Active Video block, Video Registry, per-video sections, session log, lessons learned); updated at session end by `/my-daily-project-closeout`
- **docs/REMOTION_LIBRARY.md** – Catalog of all own Remotion components (status, path, config, limits, refactoring list); entry point `/my-remotion-library`; extended after every approved component
- **docs/BROLL_GUIDELINES.md** – Mandatory reusable B-roll design/timing/hierarchy standards; consult before any new B-roll
- **docs/PRODUCTION_PROCESS.md** – The fixed production process (stages S0–S12, who does what, how each stage is recognized as done); `/my-next-task` navigates by it; applies to every video
- **docs/LEARNINGS.md** – Cross-video learnings, tips and tricks; extended at every closeout and retro (S12), read before each stage
- **docs/PRODUCTION_STANDARDS.md** – Mandatory channel/editorial standards (positioning, family/privacy, branding concept, hook, storytelling structure, infographics catalog); consult before planning or cutting any video
- **docs/FOOTAGE_ANALYSIS.md** – Supporting footage-sighting tool (metadata/thumbnails/gallery for raw DJI clips; §10: finding overlooked scenes); consult before extending `scripts/footage-analysis/`
- **PROJECT_STATUS.md → `## Video Assets (portable)`** – per-video mapping slug → CapCut folder name/raw/export/draft (names only, no absolute paths); `scripts/video_assets.py` resolves the machine-specific paths (env `TASAN_CAPCUT_ROOT`, optional gitignored `.claude/local.json`). Add a row for every new video. Tests: `python3 scripts/test-video-assets.py`
- **docs/CAPCUT_DRAFT_RESEARCH.md** – PARKED research on generating CapCut projects; preserved knowledge only, do not build on it. Reading a CapCut draft read-only for review is fine
- **docs/NOTIFICATIONS.md** – Optional mobile push notifications (ntfy.sh) for this project; per-task option `/my-notification-on`, off by default (run `python3 scripts/test-notifications.py` after touching the hooks)
- **.claude/skills/** – Workflow skills (slash commands) for project management (includes `/my-notification-on`)
- **.claude/hooks/** – Notification hooks for this project only (see `docs/NOTIFICATIONS.md`); not global to other Claude Code projects
- **src/** – Remotion compositions (React + TypeScript) for targeted B-roll/graphics only, not full video assembly
- **scripts/footage-analysis/** – Standalone Python tool for sighting raw footage before a CapCut rough cut; not Remotion, not part of the composition code
- **public/** – Static assets and video files

### Parallel Claude sessions (binding, central rule)
Several Claude Code sessions often work in this same working directory at once. Every session and skill follows these rules (skills reference this section instead of repeating it):
- At the start of a task run `git status --short`; treat all pre-existing changes as **potentially another session's**.
- Re-read a shared document (PROJECT_STATUS.md, docs/*, skills, CLAUDE.md) immediately before editing it; prefer targeted, additive edits over rewriting whole files.
- Never overwrite, revert or discard another session's changes; never use destructive git commands (`checkout --`, `restore`, `reset --hard`, `clean`, `stash`) to remove foreign changes.
- No `git add .`, `git add -A` or `git commit -a`. Stage explicit paths; check `git diff --cached` before every commit; commit only changes clearly your own. A file containing several sessions' changes: stage only your own hunks (e.g. build the blob from HEAD + your lines with `git hash-object`/`git update-index`) or leave it to the joint closeout.
- A session may finish and commit its own subject-matter work at any time, but must **not consolidate the whole project** (Active Video block, registry, session log, structure cleanup) while other sessions are still working — see `/my-daily-project-closeout`.

### Principles
- **No automatic git push** – Stage changes intentionally
- **Meaningful checkpoints** – Preserve architectural reasoning
- **Resumability** – Future sessions inherit full context
- **Simplicity** – Only add what serves the workflow

## Videos
Which video is active, which are paused/done/planned, and where to resume are tracked **only** in `PROJECT_STATUS.md` (`## ▶ Active Video` + `## Video Registry`). Do not list videos or their status here — it goes stale. The `/my-*` skills read that structure generically and verify it against git history; trust evidence over a stale status file and fix the file.

## Technical Setup
- **Remotion:** React-based video composition
- **TypeScript:** Full type safety for compositions
- **Node.js:** Build and runtime environment

For implementation details, see the specific task when starting work.
