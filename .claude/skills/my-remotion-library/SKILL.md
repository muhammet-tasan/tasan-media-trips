---
name: my-remotion-library
description: Creative toolbox of our own Remotion building blocks - show the simple overview, or pick, combine and reuse existing components for a task before building anything new
disable-model-invocation: true
---
# /my-remotion-library

Creative toolbox for video production, not a code inventory. The **technical reference** is `docs/REMOTION_LIBRARY.md` (paths, config, limits, plans, refactoring); this skill reads it but by default shows only the simple overview. Do not copy technical detail into this file or into the default answer.

## Process
1. Read `docs/REMOTION_LIBRARY.md` (the "Toolbox" table at the top drives the overview; the sections below it are the technical details).
2. Decide the mode from the arguments:
   - **No arguments, or "show/zeige …"** → print the **simple overview** (format below) and nothing else.
   - **Details requested** ("Details zu GlassPanel", "wie konfiguriere ich …", "Pfad von …") → show that component's technical entry from the catalog (path, options, example, limits). Only then technical info is allowed.
   - **A task** ("kombiniere TextReveal mit GlassPanel", "erstelle ein Intro / eine humorvolle Animation …", "welche Komponenten passen hier?") → **Reuse check**, then (unless only asked for suggestions) build.
3. **Reuse check (before any code):** in 3–6 plain-language lines: **Wiederverwenden** (which toolbox components, what changes via options), **Kombinieren** (how they work together), **Neu** (what does not exist yet, and whether it should become its own reusable component). Prefer existing components; planned items count as "Neu". For a new B-roll scene also follow `docs/BROLL_GUIDELINES.md` §1/§12 (pre-build spec) and wait for approval on open creative decisions. "Welche Komponenten passen hier am besten?" / "schlage Animationen vor" → suggestions only, build nothing.
4. **Build by the binding architecture rules** (`docs/PRODUCTION_STANDARDS.md` §9): small independent components in `src/components/`, scene = combination + config (`src/<slug>/<name>.json`), no project content in generic code, existing videos stay identical (verify by comparing renders if a shared component is touched), no trivial wrappers.
5. **After the user approves the result** run the maintenance checklist from `PRODUCTION_STANDARDS` §9: check which parts are independently reusable (split them out), register in the catalog (Toolbox table + technical entry), document usage, note learnings, commit. Automatic — the user does not have to ask.

## Simple overview (no arguments) — exact rules
- German. Only categories that contain something, in this order: **Szenen · Titel und Textanimationen · Designelemente · Animationseffekte · Emojis und Illustrationen · Übergänge · Soundeffekte**.
- One line per component: `**Name** — kurze, verständliche Beschreibung`. Taken from the catalog's Toolbox table (it contains exactly the standalone, usable components).
- **Not shown:** file paths, parameters, status emojis, render commands, planned features, project-specific implementations, internal helpers, scripts, refactoring notes.
- End with one line: `Nutzung: /my-remotion-library <Aufgabe> (z. B. „kombiniere TextReveal mit GlassPanel“) · „Details zu <Name>“ für die Technik.`

## Rules
- Library first: never write a new component before the reuse check; never silently duplicate an existing one.
- Never change an approved animation visually unless the user asks; refactorings must render identically (compare against the previous render).
- Never analyze audio; sound effects/mixing are the user's job (`LEARNINGS.md` → Ton).
- Keep the catalog current: new/changed component → Toolbox table + technical entry in the same commit; fix stale entries when found (trust the code).
