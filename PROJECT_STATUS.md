# TASAN MEDIA Trips — Project Status

**Last Updated:** 2026-11-22  
**Current Phase:** Route Check and Trip Score B-rolls built and rendered; project reorganized under canonical slugs; TASAN brand intro built; local repo now connected to GitHub. CapCut Phase 1/2 and remaining B-rolls (Cost Check, Trip Check, Planning Check) next.

## Project Overview
YouTube trip videos combining DJI Pocket 3 footage, German voice-over, and CapCut editing, with Remotion used only to produce specific B-roll clips, maps, titles, or motion graphics that CapCut can't do natively.

## Workflow (Corrected)
1. DJI Pocket 3 footage
2. → Manual rough/final editing in **CapCut**
3. → Plan and record German voice-over
4. → Identify places in the CapCut edit where additional B-roll / visual explanation is needed
5. → Create *only those specific* B-roll clips, maps, titles, or motion graphics in **Remotion**
6. → Render them
7. → Import back into CapCut
8. → Final edit and YouTube export in CapCut

**Remotion is not used to assemble the complete trip video, organize DJI footage, or sync the full voice-over.** It produces isolated graphic elements on demand, driven by gaps identified during the CapCut edit.

## Production Workflow (Standard Template — applies to every video)

### Phase 1 — CapCut Visual Cleanup
- Review existing cuts; hard cuts are the default.
- Use transitions only where they improve flow (short, subtle, motion-matched).
- Avoid flashy transitions between every scene.

### Phase 2 — Information & B-roll Planning
This is a key differentiator of TASAN MEDIA Trips: practical info most travel videos skip.
For every destination, consider (only show categories that are actually useful for that place):
suitability for children (and age ranges), suitability for adults/enthusiasts, prices (adult/child/family), parking cost, recommended visit duration (min/ideal), weather/season suitability (rain, heat/cold), accessibility/stroller practicality, stress factors, "know before you go" tips, value for money, overall recommendation.

### Phase 3 — Minimal Remotion B-roll Set
Standard reusable sequence types, built only as each is actually needed:
1. **Route Check** — real geographic basemap, real routes, driving time + practical arrival info (✅ built — see `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx`)
2. **Cost Check** — adult/child/family price, parking
3. **TASAN Trip Check** — suitability for children/adults/enthusiasts, simple visual rating
4. **Planning Check** — visit duration, weather suitability, seasonal notes, know-before-you-go
5. **TASAN Trip Score** — overall score, value for money, family suitability, experience, final recommendation + who it suits (✅ built — v2 pacing overhaul approved — see `src/mulhouse-automobile-museum/MulhouseTripScore.tsx`)

Keep graphics minimal, readable, reusable across videos.

**Before building any of #2–#4 (or another Route Check), consult `docs/BROLL_GUIDELINES.md`** — the reusable design/timing/hierarchy standards extracted from the Route Check build, plus the mandatory pre-build spec checklist. `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx` is the reference implementation for geographic Route Check graphics specifically.

### Visual Asset Policy
- Prefer the user's own photos/footage; check for suitable local assets before building any B-roll.
- If a needed visual asset is missing, ask the user exactly what's needed before implementing — never auto-download copyrighted images from the web.
- Style-reference screenshots (from other Remotion videos) inform pacing/layout ideas only — never copy directly.

### Design Direction (recognizable TASAN style over time)
Clean, modern, premium but simple, highly readable, useful over decorative, consistent scoring system, 16:9 YouTube, not text-heavy, animation supports information rather than distracting from it.

For geographic Route Check graphics specifically, this is now formalized in `docs/BROLL_GUIDELINES.md` (visual hierarchy, border/route treatment, mobile readability, animation pacing).

### Phase 4 — Music
Add background music in CapCut after B-roll/visual structure is set; preserve useful museum ambience; leave room for narration.

### Phase 5 — Voice-over
Final German voice-over added near the end, but narration topics/approximate timing are planned before finalizing B-roll so visuals support narration. Voice-over adds information/opinion — it must not just describe what's visible (bad: "here we see an old car"; better: why it matters + practical visitor info). After narration: duck music under speech, balance ambience, final audio cleanup, subtitles if useful, final YouTube export.

## Current Video: Mulhouse Automobile Museum

### Status
- [x] Main Pocket 3 footage manually cut in CapCut
- [x] Unwanted spoken voices removed from original footage (useful ambient sound kept where possible)
- [x] 9-second Lamborghini intro/hook added
- [x] Route Check B-roll built, iterated, and rendered (`out/mulhouse-automobile-museum/MulhouseRouteCheck.mp4`, 480 frames / 16s @ 30fps)
- [x] Project reorganized under canonical `mulhouse-automobile-museum` slug (`src/`, `public/images/`, `out/`), per `CLAUDE.md` project-organization convention
- [x] Trip Score B-roll (v2, pacing overhaul) built and approved — scene order, pacing, score logic (63/100), Bugatti-inspired background locked; rendered (`out/mulhouse-automobile-museum/MulhouseTripScore.mp4`)
- [x] 13 raw museum photographs added (`public/images/mulhouse-automobile-museum/`) — integrated into MulhouseTripScore; not yet reorganized further
- [ ] Phase 1: CapCut visual cleanup (review cuts/transitions)
- [ ] Phase 2: Information/B-roll planning specific to Mulhouse (fill in relevant categories)
- [ ] Import MulhouseRouteCheck.mp4 and MulhouseTripScore.mp4 into the CapCut timeline
- [ ] Phase 3 (remaining): Cost Check, Trip Check, Planning Check B-rolls
- [ ] Re-render TasanBrandIntro.mp4 (current render predates today's lighten-blend background fix) and import as opening brand intro
- [ ] Phase 4: Background music in CapCut
- [ ] Phase 5: German voice-over recorded, synced, ducked; subtitles if useful
- [ ] Final CapCut assembly and YouTube export

Goal for this first video: not a complex cinematic production — a minimal, clean, informationally strong first upload.

### Shared Brand Assets
- **TasanBrandIntro** (`src/brand/TasanBrandIntro.tsx`, 4K/3840×2160) — cross-video brand intro; pure compositing of the original Kling-generated video (letters forming, light point, center glint), cropped/masked to hide Kling's later oversized ring and faded to the exact `#030509` canvas color. Not Mulhouse-specific; intended to open every TASAN MEDIA Trips video. Current render in `out/brand/TasanBrandIntro.mp4` (Sep 13) predates the 2026-11-22 lighten-blend background fix — re-render before using it in any CapCut timeline.

### Completed Milestones
- Project structure initialized
- Claude commands set up
- Remotion workspace prepared (minimal)
- Main footage cut, cleaned of unwanted voices, and intro hook added in CapCut
- **MulhouseRouteCheck B-roll complete** — real MapLibre GL + OpenFreeMap basemap, real OSRM-routed driving routes, real Natural Earth country-border overlay, TASAN dark/gold overlay; rendered to `out/mulhouse-automobile-museum/MulhouseRouteCheck.mp4`
- `docs/BROLL_GUIDELINES.md` created — reusable design/timing/hierarchy standards extracted from the Route Check iteration process
- `CLAUDE.md` updated to require consulting `docs/BROLL_GUIDELINES.md` before starting any new B-roll
- **MulhouseTripScore B-roll (v2) approved and rendered** — final editorial TASAN category scores (sum to 63/100, computed not hard-coded), community ratings shown as context only, three-phase (enter/hold/exit) pacing model; rendered to `out/mulhouse-automobile-museum/MulhouseTripScore.mp4`
- **Project-slug reorganization** — Mulhouse assets moved from flat `src/`/`public/images/` into `src/mulhouse-automobile-museum/` and `public/images/mulhouse-automobile-museum/` per the canonical-slug convention now documented in `CLAUDE.md`
- **TasanBrandIntro built** — 4K brand-intro composition compositing the original Kling video with a constant crop/mask and fade to the exact TASAN background color; iterated twice more (exact background color + feathered edge, then a lighten-blend pass replacing the contrast filter) to close the remaining gap between the video's native dark background and the canvas color
- **Local repo connected to GitHub** — `https://github.com/muhammet-tasan/tasan-media-trips` (previously only a local repo with no reachable remote history); `.gitignore` hardened for machine-local Claude Code settings and scratch scripts

### Blocked/In Progress
Awaiting Phase 1 (CapCut visual cleanup pass) before remaining B-roll needs (Cost Check, Trip Check, Planning Check) can be finalized against the actual edit. `TasanBrandIntro.mp4` needs a re-render before import, since its current render predates the latest lighten-blend fix.

### Decisions Made
- Keep Remotion minimal initially (no complex state management)
- Use React + TypeScript for type safety
- Stage video assets in `public/` during development
- **CapCut is the main editor; Remotion only builds specific, isolated B-roll/graphics elements identified during the CapCut edit — not the full composition**
- First video prioritizes a minimal, informative result over cinematic polish
- Standard 5-sequence B-roll set (Route Check, Cost Check, Trip Check, Planning Check, Trip Score) adopted as the reusable template for all future videos
- **Route Check graphics use a real basemap (MapLibre GL + OpenFreeMap), not a hand-drawn or stylized map** — the viewer must recognize an actual map; real OSRM road geometry for routes; real Natural Earth data for country borders (rendered as a dedicated overlay above the basemap, not baked into the map style, for independent styling control)
- B-roll duration must be derived from information density and narration, not assumed fixed — MulhouseRouteCheck grew from an initial 8s to a locked 16s across iterations because 8s under-served the content
- `docs/BROLL_GUIDELINES.md` is now the authoritative reference for future geographic Route Check B-rolls; `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx` is the reference implementation
- **Canonical project-slug convention adopted project-wide** (e.g. `mulhouse-automobile-museum`): consistent folder naming under `public/images/<slug>/`, `src/<slug>/`, `out/<slug>/`; shared infrastructure (`public/geo/`, `public/maplibre/`, `public/brand/`) stays outside any project folder; `src/Root.tsx`/`src/index.ts` stay at `src/` root
- MulhouseTripScore's final score is a single editorial judgment computed from 8 category sub-scores in code (never hard-coded), with community ratings (Google/Tripadvisor) shown only as unmixed context — avoids the final number silently drifting from its components
- TasanBrandIntro composites the original Kling-generated video unmodified rather than recreating any of its animation; the crop/mask stays constant for the whole composition (never changes mid-play) and backgrounds are matched via blend mode (`mix-blend-mode: lighten`, per-channel `max(video, bg)`), not a simple contrast filter, to exactly hide the seam against the canvas color
- GitHub remote (`https://github.com/muhammet-tasan/tasan-media-trips`) was already configured locally but had no reachable history; the repo is a straightforward first push, not a merge — no history rewrite was needed or performed

### Next Steps (Priority Order)
1. Phase 1: Review the Mulhouse CapCut cut and clean up transitions (hard cuts default)
2. Phase 2: Fill in the information-planning categories specific to Mulhouse Automobile Museum
3. Import `out/mulhouse-automobile-museum/MulhouseRouteCheck.mp4` and `out/mulhouse-automobile-museum/MulhouseTripScore.mp4` into the CapCut timeline at the appropriate points; re-render and import `TasanBrandIntro.mp4` as the opening brand intro
4. Build remaining Remotion B-rolls (Cost Check, Trip Check, Planning Check) — **run the `docs/BROLL_GUIDELINES.md` §12 pre-build checklist and get spec approval before implementing each one**
5. Phase 4 (music) and Phase 5 (voice-over), then final CapCut assembly and export

### Architectural Notes
- Remotion handles isolated, on-demand elements only (specific B-roll, graphics, titles) — not full-video compositing
- German voice-over is recorded and synced within CapCut, not Remotion
- Final assembly and export happen entirely in CapCut
- Keep composition code simple; avoid over-abstraction until patterns emerge
- Do not create new Remotion components until a concrete B-roll need is identified from the CapCut edit
- B-roll sequence components should be built reusable/generic (e.g. a generic "Cost Check" template) rather than one-off per video, since the same 5 sequence types repeat across future videos
- **MapLibre GL in Remotion gotcha:** MapLibre's tile-parsing worker ships as an ES module with a sibling chunk; Remotion's dev/render server won't resolve a library's internal worker-chunk imports on its own. Both files must be vendored into `public/maplibre/` and pointed at explicitly via `maplibreConfig.WORKER_URL` — otherwise vector tiles silently never load, with no clear error.
- **Deterministic map rendering in Remotion:** drive the camera with `map.jumpTo()` (never `flyTo`/`easeTo`, which animate on wall-clock time), and wrap any camera change in `delayRender()`/`continueRender()` gated on MapLibre's `'idle'` event, so Remotion never captures a frame with tiles still loading.
- **Live vs. cached data:** MulhouseRouteCheck fetches basemap vector tiles live from `tiles.openfreemap.org` at render time (genuine internet dependency). Route geometry (OSRM) and country borders (Natural Earth) are pre-fetched once and cached locally as GeoJSON under `public/geo/`, so those parts render identically every time.
- New key file: `docs/BROLL_GUIDELINES.md` — consult before starting any new B-roll (also referenced from `CLAUDE.md`)
- **Pacing-as-phases model (MulhouseTripScore):** every on-screen message is built from explicit `{enter, hold, exit}` phases rather than a fixed total duration; the composition's length is purely the sum of these phases, with each exit overlapping the next enter in a single crossfade (0.5–0.9s band). This generalizes the Route Check's "duration follows narration" lesson to multi-scene B-rolls.
- `Root.tsx` still declares a `MulhouseTest` composition (plain placeholder text, no asset or render dependency) left over from initial Remotion setup — it is dead code, unreferenced by any render or doc, and was deliberately left untouched during this cleanup since it is harmless; remove it the next time `Root.tsx` is touched for an actual composition change.
- GitHub remote: `https://github.com/muhammet-tasan/tasan-media-trips`, branch `main`, upstream tracking configured. No automatic push — pushes remain an explicit, reviewed step per session (see `CLAUDE.md` principles).

### Session Log

**2026-11-22**
- Connected the local repository to GitHub: `origin` was already configured but pointed at a remote with no reachable commit history (empty repo), so this was a first push, not a merge — no history rewrite, no force-push.
- Audited the working tree before pushing: confirmed no `.env`/credential/secret files tracked or staged, confirmed `out/` (110MB of renders) and `node_modules/` stay excluded via `.gitignore`, reviewed the 50 tracked files (74.6MB, mostly museum photos and brand audio/video) with the user before the first push.
- Hardened `.gitignore`: added `.claude/settings.local.json` and `.claude/scheduled_tasks.lock` (previously excluded only via the user's global git ignore, not the project's own) and the one-off `_png_measure.mjs` scratch script, so the project repo is self-contained for this exclusion regardless of machine.
- Committed a pre-existing uncommitted change to `TasanBrandIntro.tsx`: replaced the `contrast(160%)` filter with a `mix-blend-mode: lighten` pass over a same-color backdrop (per-channel `max(video, bg)`), closing a visible seam the contrast approach left against the `#030509` canvas.
- Pushed 8 commits to `origin/main`; verified local and remote `HEAD` match exactly and the remote file count (50) matches local.
- Found and corrected documentation drift accumulated across the three undocumented sessions below (2026-09-08, 2026-09-11, 2026-09-13): `PROJECT_STATUS.md` was stale at 2026-09-04 and didn't reflect `MulhouseTripScore` v2, the project-slug reorganization, or `TasanBrandIntro`; `CLAUDE.md`, `PROJECT_STATUS.md`, and `docs/BROLL_GUIDELINES.md` still referenced the pre-reorg path `src/MulhouseRouteCheck.tsx` instead of `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx`.
- Checked `Root.tsx` for stale placeholders: found the unused `MulhouseTest` composition (leftover from initial setup, no render or doc depends on it) — flagged in Architectural Notes rather than removed, since this session's scope was documentation, not code/architecture changes.

**2026-09-13**
- Reorganized the Mulhouse assets from a flat `src/`/`public/images/` layout into the canonical-slug structure (`src/mulhouse-automobile-museum/`, `public/images/mulhouse-automobile-museum/`), formalizing the project-organization convention now documented in `CLAUDE.md`.
- Built `TasanBrandIntro`: a 4K (3840×2160) composition that plays the original Kling-generated brand video unmodified, with a constant centered crop/mask (sized from measured ring-radius-over-time stills to always stay inside the ring that appears later in the source) and a fade to the exact TASAN background color once the source's own center glint begins fading.
- Iterated the background-matching approach twice: first switched the canvas/fade color to the exact `#030509` and replaced the crop's hard edge with a true CSS alpha-mask feather (previously a restrained `contrast(160%)` lift was used to help the video's native dark background blend in); later (today, 2026-11-22) replaced that contrast filter entirely with a `mix-blend-mode: lighten` pass, since contrast alone still left a visible gap against the canvas.
- Rendered the locked version to `out/brand/TasanBrandIntro.mp4` — note this render predates the 2026-11-22 lighten-blend fix and should be re-rendered before use in CapCut.

**2026-09-08**
- Approved `MulhouseTripScore` v2 (pacing overhaul) as a checkpoint: scene order, reading/hold times, score logic (8 editorial category scores summing to 63/100, computed not hard-coded), Bugatti-inspired background, and narrative structure all locked.
- Added the 13 user-owned raw museum photographs to `public/images/` (not yet reorganized under the slug structure at this point — that followed five days later in the 2026-09-13 session).
- Rendered the approved composition to `out/mulhouse-automobile-museum/MulhouseTripScore.mp4`.

**2026-09-04**
- Built `MulhouseRouteCheck`, the first real Remotion B-roll, across many iterations: started as a hand-styled custom map, moved through a Natural-Earth-derived polygon map, and landed on a real MapLibre GL + OpenFreeMap basemap with real OSRM-routed driving routes and a real Natural Earth country-border overlay.
- Solved a nontrivial Remotion + MapLibre integration: MapLibre's tile-parsing worker (an ES module with a sibling chunk) isn't resolved by Remotion's server by default — both files had to be vendored into `public/maplibre/` and pointed at via `maplibreConfig.WORKER_URL`. Also implemented deterministic per-frame camera control (`jumpTo()` + `delayRender`/`continueRender` gated on MapLibre's `'idle'` event) so live vector tiles are never captured mid-load.
- Iterated visual hierarchy, timing, and readability across roughly eight correction passes (section heading, country borders/labels, route-line visibility, car/transit labeling, transit-info sizing and contrast, overall pacing) based on user feedback.
- Locked the final version at 480 frames / 16s @ 30fps and rendered it to `out/MulhouseRouteCheck.mp4` (5MB).
- Extracted the lessons from this iteration process into `docs/BROLL_GUIDELINES.md` (12 sections covering workflow, duration-from-narration, the geographic Route Check template, route-line treatment, transport-mode selection, mobile readability, information hierarchy, animation philosophy, final-frame-first design, map attribution/licensing, reuse-vs-adaptation, and a mandatory pre-build spec checklist) so future B-rolls need at most one correction pass instead of many.
- Updated `CLAUDE.md` to make consulting `docs/BROLL_GUIDELINES.md` (and the relevant reference implementation) mandatory before starting any new B-roll.
- Lesson learned, now codified in the guidelines: define the full spec and final static frame *before* implementing, rather than iterating visually — this session's many passes are exactly the pattern the new guidelines exist to prevent going forward.

**2026-09-03**
- Defined the full production workflow (5 phases) as a reusable template for all future TASAN MEDIA Trips videos, not just Mulhouse.
- Captured current real-world state of the Mulhouse edit: main footage cut, unwanted voices removed, 9s Lamborghini intro added.
- Established the 5 standard Remotion B-roll sequence types (Route, Cost Check, Trip Check, Planning Check, Trip Score) as the minimal reusable graphics set.
- Established visual asset policy: prefer own photos/footage, ask before sourcing anything external, never auto-download copyrighted images.
- No Remotion components built yet — planning/documentation only, per explicit instruction not to implement this session.

**2026-09-02**
- Corrected the project workflow: CapCut is the primary editor for the full trip video; Remotion is scoped down to producing only specific B-roll/graphics elements identified during editing, not the whole composition or voice-over sync.
- Architectural choice: Remotion elements are demand-driven — built only after a concrete gap surfaces in the CapCut edit — rather than planned upfront, avoiding speculative component work.
- Standard established: no new Remotion components until a specific B-roll/graphic need is identified from actual CapCut editing.
- Updated CLAUDE.md to reflect Remotion's narrow, on-demand role alongside CapCut as primary editor.
- No code or Remotion components changed this session; documentation/workflow correction only.

### Last Session Summary
Connected the local repository to GitHub (first push to a previously-empty remote, no history conflicts), hardened `.gitignore`, and committed a pending `TasanBrandIntro` fix (lighten-blend background matching). Found and corrected documentation drift that had accumulated across three undocumented sessions (TripScore v2 approval, the project-slug reorganization, and the TasanBrandIntro build) — `PROJECT_STATUS.md` now reflects the real current state, and stale `src/MulhouseRouteCheck.tsx`-style paths in `CLAUDE.md`/`docs/BROLL_GUIDELINES.md` were corrected to the post-reorg location.
