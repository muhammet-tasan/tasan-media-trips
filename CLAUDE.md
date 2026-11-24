# TASAN MEDIA Trips — Project Guide

This project creates YouTube trip videos combining DJI Pocket 3 footage, German voice-over, and Remotion-powered motion graphics.

**Editing workflow:** CapCut is the primary video editor — footage editing, voice-over sync, and final assembly/export all happen there. Remotion is used narrowly: it builds only specific B-roll clips, maps, titles, or motion graphics for gaps identified while editing in CapCut, then those renders are imported back into CapCut. Remotion does not organize raw footage or assemble the full video.

**Before starting any new B-roll:** read `docs/BROLL_GUIDELINES.md` and check for an existing relevant reference implementation (e.g. `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx` for geographic Route Check graphics) before writing any code. This is mandatory, not optional — it exists to avoid repeating the many visual/timing iterations the first Route Check needed.

**Before planning or cutting any video (editorial work, not just B-rolls):** read `docs/PRODUCTION_STANDARDS.md`. It is the binding editorial standard for channel positioning, family-footage/privacy rules, the hook, storytelling/editing structure, and the reusable-infographics catalog — applies by default to every future video; project-specific exceptions must be documented, not silently taken.

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
- **PROJECT_STATUS.md** – Persistent project memory; updated at session end
- **docs/BROLL_GUIDELINES.md** – Mandatory reusable B-roll design/timing/hierarchy standards; consult before any new B-roll
- **docs/PRODUCTION_STANDARDS.md** – Mandatory channel/editorial standards (positioning, family/privacy, branding concept, hook, storytelling structure, infographics catalog); consult before planning or cutting any video
- **docs/FOOTAGE_ANALYSIS.md** – Local footage-sighting workflow (metadata/thumbnails/gallery for raw DJI clips); consult before extending `scripts/footage-analysis/`
- **docs/NOTIFICATIONS.md** – Optional mobile push notifications (ntfy.sh) for this project; how to use `/my-notification-on`, `notify:on`/`notify:off`
- **.claude/skills/** – Workflow skills (slash commands) for project management (includes `/my-notification-on`)
- **.claude/hooks/** – Notification hooks for this project only (see `docs/NOTIFICATIONS.md`); not global to other Claude Code projects
- **src/** – Remotion compositions (React + TypeScript) for targeted B-roll/graphics only, not full video assembly
- **scripts/footage-analysis/** – Standalone Python tool for sighting raw footage before a CapCut rough cut; not Remotion, not part of the composition code
- **public/** – Static assets and video files

### Principles
- **No automatic git push** – Stage changes intentionally
- **Meaningful checkpoints** – Preserve architectural reasoning
- **Resumability** – Future sessions inherit full context
- **Simplicity** – Only add what serves the workflow

## Videos in Progress

### Mulhouse Automobile Museum
First production video; status tracked in PROJECT_STATUS.md.

## Technical Setup
- **Remotion:** React-based video composition
- **TypeScript:** Full type safety for compositions
- **Node.js:** Build and runtime environment

For implementation details, see the specific task when starting work.
