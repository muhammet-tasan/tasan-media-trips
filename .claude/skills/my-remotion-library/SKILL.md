---
name: my-remotion-library
description: Central entry point to the project's own Remotion components - show the categorized overview, or find and reuse existing components for a task before building anything new
disable-model-invocation: true
---
# /my-remotion-library

Single entry point to everything we have built in Remotion (scenes, intro, maps/routes, text and info-card animations, effects, transitions, helpers). The **catalog** is `docs/REMOTION_LIBRARY.md` (single source of truth, grows with the library); this skill only reads it and routes. Do not copy catalog details into this file or into chat.

## Process
1. Read `docs/REMOTION_LIBRARY.md`. Open an implementation or `docs/BROLL_GUIDELINES.md` section only when a task needs that detail (catalog entries name the paths).
2. Decide the mode from the arguments:
   - **No arguments, or "show/zeige …"** → print the compact overview (format below). For "alle Animationseffekte" / a single category: list that category's building blocks (catalog §4, §5, §7, §8) with status and path.
   - **A task** ("erstelle ein Intro / eine Anfahrtsanimation / eine Emoji-Animation …") → run **Reuse check** below, then build.
   - **"schlage Animationen vor …"** → run the reuse check for the described scene and answer with suggestions only (existing ✅ components first, 🧪 as template, 📋 gaps); build nothing.
3. **Reuse check (before any code):** for every needed part, find the match in the catalog and report in 3–6 lines: **Wiederverwenden** (component + which config fields change), **Kombinieren/Erweitern** (what is combined, what small config/field is added), **Neu** (what really does not exist, and the planned file path). Prefer ✅ over 🧪 over new. For new B-roll also follow `docs/BROLL_GUIDELINES.md` §1/§12 (pre-build spec) and wait for approval on open creative decisions.
4. **Build by the binding architecture rules** (`docs/PRODUCTION_STANDARDS.md` §9): generic component separated from project content, texts/colours/positions/sizes/timing in a config (`src/<slug>/<name>.json`) or props, combine/extend instead of copy, existing videos unaffected (their reference files stay untouched; verify frame-identical if a shared component changes), no over-engineering.
5. **After the user approves the result** run the maintenance checklist from `PRODUCTION_STANDARDS` §9 (reusability check → catalog entry → usage/config → learnings → keep skill/catalog current) before committing. This is automatic — the user does not have to ask.

## Overview format (no arguments)
German, compact, no entry details. One line per item: `Status Name — ein Satz · Pfad`. Order = catalog sections 1–10:
```
## Remotion-Bibliothek (✅ verfügbar · 🧪 intern/videospezifisch · 📋 geplant)
**Vollständige Sequenzen** …   **Intro/Outro** …   **Karten & Routen** …
**Titel/Text** …   **Infokarten/Overlays** …   **Emojis/Illustrationen** …
**Effekte** …   **Übergänge** …   **Soundeffekte** …   **Helfer/Skripte** …
Offenes Refactoring: <1 Zeile, Verweis auf Katalog §11>
Nutzung: `/my-remotion-library <Aufgabe>` · Details: `docs/REMOTION_LIBRARY.md`
```

## Rules
- Library first: never write a new component before the reuse check; never silently duplicate an existing one.
- Never change an approved animation visually unless the user asks; shared-component changes must keep older videos identical.
- Never analyze audio; sound effects/mixing are the user's job (`LEARNINGS.md` → Ton).
- Keep the catalog current: new/changed component → catalog entry in the same commit. Fix stale entries when found (trust the code).
- Refactoring needs are documented in catalog §11, not done pre-emptively (extract on the second consumer).
