# TASAN MEDIA Trips — Project Status

**Last Updated:** 2026-11-27
**How to read this file:** (1) `## ▶ Active Video` is the single resume point. (2) `## Video Registry` lists every video and its status. (3) Details per video live in their own `## Video: …` section. Shared tooling and the cross-video log come after. The skills `/my-project-status`, `/my-continue-project`, `/my-next-task` and `/my-daily-project-closeout` read this structure — keep the headings and field names below intact.

## ▶ Active Video

Exactly one video is Active at any time. This block is the **only** place that holds the resume point; the registry status must agree with it. Update it at every closeout (and whenever the user switches videos).

- **Slug:** `naturoparc`
- **Title:** NaturOparC (Hunawihr, Elsass — Tier-/Naturpark)
- **Phase:** Editing — user's rough cut exists (CapCut draft `1124`; reviewed export `1124(1).mp4`, 2:55, 51 cuts; newer unreviewed export `1124(2).mp4` from 2026-11-27); Claude's review v1 delivered
- **Process step:** S3 — Rohschnitt-Review v1 geliefert (`analysis/naturoparc/ROUGHCUT_REVIEW.md`); Nutzer überarbeitet den Schnitt → Review v2 → bei "Schnitt steht" weiter mit S4 (Erzählung). Stufen: `docs/PRODUCTION_PROCESS.md`
- **Resume point:** (2026-11-27) User works through `analysis/naturoparc/ROUGHCUT_REVIEW_v2.md` (5 deletions/replacements, source = saved CapCut draft) and inserts the 9 s hook from `analysis/naturoparc/HOOK.md` last (Stör, Brücke, Otter, Barsch, Schwäne, Schildkröte; 2 effect transitions). Funny moments in `analysis/naturoparc/CREATIVE_MOMENTS.md` (pig-scratching moment not found; raw clips 0007, 0046–0050, 0055 missing — ask user). Then re-export → short visual review → S4 narration.
- **Last decisions:** Hook = quick animal highlights (not a staircase climb); no recognizable family faces (§2) — review found faces in the koi scene (0:38–0:46); watermark/branding standard documented, not built; plan reference `FINAL_TIMELINE_PLAN.md` is optional. Creative direction for this video (user, 2026-11-26): fun, family-style scene captions (emojis, short texts, illustrations/symbols, built in Remotion); TASAN intro shown between scenes; logo floats into a corner and stays as watermark; Route Check like the first video; ending = Google-review comments section over the last long scene + the user's verdict (Fazit). See `## Video: NaturOparC` → Creative direction.
- **Next steps (concrete):**
  1. User: refine the cut per `ROUGHCUT_REVIEW.md`; export again.
  2. Claude: review v2; then S4 narration (questions + 2–3 proposals).
  3. After the cut and narration stand: S6 graphics plan (captions, intro/watermark, Route Check for NaturOparC, review section) → S7 build. Route Check for NaturOparC is **built and rendered** (2026-11-27): `out/naturoparc/NaturoparcRouteCheck.mp4` (22.4 s, light theme, staggered text reveals, all timings in `route-check.json` → `timing`, end image `holdSeconds`), generic `src/route-check/RouteCheck.tsx` + `src/naturoparc/route-check.json`; still open: final duration from narration, final time labels (currently OSRM-rounded). See `docs/BROLL_GUIDELINES.md` §13.
- **Details:** `## Video: NaturOparC` below; plan in `analysis/naturoparc/FINAL_TIMELINE_PLAN.md`.

## Video Registry

Status values: **active** (exactly one) · **paused** · **done** (published) · **planned**. Add a row when a new video starts; never delete rows.

| Slug | Title | Status | Phase / state | Details |
|---|---|---|---|---|
| `naturoparc` | NaturOparC | **active** | S3 — rough-cut review v1 delivered, user refining (newer export `1124(2)` exists, 2026-11-27, not yet reviewed) | `## Video: NaturOparC`, `analysis/naturoparc/` |
| `mulhouse-automobile-museum` | Mulhouse Automobile Museum | done | Completed (confirmed by user 2026-11-24); history and B-roll assets kept in its section | `## Video: Mulhouse Automobile Museum`, `src/mulhouse-automobile-museum/` |

*Status evidence (2026-11-24): the newest commits (2026-11-22…24) are all NaturOparC analysis/plan work; the last Mulhouse-specific commit was 2026-09-13. The user confirmed on 2026-11-24 that Mulhouse is fully completed (`done`), not paused. Earlier today this was wrongly inferred as "paused" from git history alone — see Lessons Learned.*

## Video Assets (portable)

Maps each video slug to **folder names only** — no absolute paths, so this file is identical on every PC. `scripts/video_assets.py` (used by `/my-review-roughcut`) resolves the machine-specific paths: CapCut root = env `TASAN_CAPCUT_ROOT`, else optional gitignored `.claude/local.json` (`capcut_root`, `capcut_drafts_dir`), else the default `<repo>/../capcut`; drafts dir = CapCut's standard location (env `TASAN_CAPCUT_DRAFTS` to override); exports are looked up in the video's `Export/` folder first, then in CapCut's default export folder (`<CapCut>/Videos`, env `TASAN_CAPCUT_EXPORTS`) by draft name (`<draft>.mp4`, `<draft>(1).mp4`). Analysis folder is always `analysis/<slug>/`. Standard CapCut folder layout (from `2026 - Template`): `Raw/`, `Export/`, `Audio/`, `CapCut/`, `Thumbnail/`. Leave `Draft` empty to auto-match the CapCut draft by the footage paths in its media pool; fill it in when several drafts reference the same footage. **Add a row for every new video** (closeout step 0).

| Slug | CapCut folder | Raw | Export | Draft |
|---|---|---|---|---|
| `naturoparc` | `2026 - Naturoparc Colmar` | `Raw` | `Export` | `1124` |
| `mulhouse-automobile-museum` | `2026 - Musee Automobile Mulhouse` | `video input` | `video ouput` | `Musee Automobile Mulhouse` |

## Project Overview
YouTube trip videos combining DJI Pocket 3 footage, German voice-over, and CapCut editing, with Remotion used only to produce specific B-roll clips, maps, titles, or motion graphics that CapCut can't do natively.

## Workflow (Corrected, updated 2026-11-24)
1. DJI Pocket 3 footage
2. → **User** selects scenes and creates the rough cut in **CapCut** (Claude does not build the cut)
2b. → **Claude reviews the rough cut** with time-based suggestions (`/my-review-roughcut`, `docs/PRODUCTION_STANDARDS.md` §7); footage analysis helps find overlooked scenes
2c. → User refines the cut in CapCut
3. → Plan and record German voice-over
4. → Identify places in the CapCut edit where additional B-roll / visual explanation is needed
5. → Create *only those specific* B-roll clips, maps, titles, or motion graphics in **Remotion**
6. → Render them
7. → Import back into CapCut
8. → Final edit and YouTube export in CapCut

**Remotion is not used to assemble the complete trip video, organize DJI footage, or sync the full voice-over.** It produces isolated graphic elements on demand, driven by gaps identified during the CapCut edit.

## Production Workflow (Standard Template — applies to every video)

### Phase 1 — Rough cut (user) + review (Claude)
- The user creates the rough cut in CapCut; Claude reviews it via `/my-review-roughcut` (dramaturgy, image quality, retention, scene length, information, B-roll placement).
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

## Video: Mulhouse Automobile Museum (slug `mulhouse-automobile-museum`)

> **Registry status: done** — completed, confirmed by the user on 2026-11-24. The unchecked items, "Blocked/In Progress" and "Next Steps" below are the **historical** planning state from before completion; they are no longer open work. Kept for reference (the B-roll components and decisions remain the reference implementation for future videos).

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

## Video: NaturOparC (slug `naturoparc`)

> **Registry status: active.** Raw footage: 54 DJI Pocket 3 clips (~22 min, 3840×2160) + 2 stills; not committed. No `src/naturoparc/` or `out/naturoparc/` yet — create only when a Remotion B-roll is actually needed (per the slug convention in `CLAUDE.md`).

### Status
- [x] Footage sighted with `scripts/footage-analysis/` (metadata, 671 thumbnails, gallery, technical flags) — see `## Shared Tooling: Footage Analysis`
- [x] Full editorial content review of all 54 clips → `analysis/naturoparc/content_review.md`, `editorial_editlist.csv`
- [x] Editorial standards written (`docs/PRODUCTION_STANDARDS.md`) and applied → `analysis/naturoparc/FINAL_TIMELINE_PLAN.md` / `.csv` (supersedes `CAPCUT_INSTRUCTIONS.md`)
- [ ] CapCut rough cut — **by the user** (active step); then Claude's review (`/my-review-roughcut`)
- [ ] Info/B-roll planning for NaturOparC (prices, parking, visit duration, kids suitability, …)
- [ ] Voice-over, music, watermark branding (standard documented, not yet built), final assembly and export

### Rough-cut automation research (2026-11-24) — PARKED, kept as knowledge
Decision 2026-11-24: no automatic rough cut and no CapCut project generation; the user cuts, Claude reviews. The findings below stay for reference; see also `docs/CAPCUT_DRAFT_RESEARCH.md` (generated test project `TASAN_Test_3Clips` exists in CapCut's drafts folder; opening it was never confirmed; harmless to delete).
Findings, verified on the real raw files in `../capcut/2026 - Naturoparc Colmar/Raw/` (outside the repo, next to it):
- Raw clips are HEVC Main10 (`yuv420p10le`, BT.709), 4K, ~83 Mbps, AAC audio, plus DJI data streams and an MJPEG cover image. **Keyframe every 1.001 s (GOP 30)** — so stream-copy cuts (`-c copy`, no re-encode, instant, zero quality loss) are possible with at most ~1 s granularity.
- Bundled Remotion FFmpeg (n7.1) has `-c copy`, MP4/MOV muxers, `libx264`/`libx265`/`prores_ks`/`hevc_nvenc` encoders, but no `trim`/`select` filters (not needed for input-seek + stream copy).
- Idea: numbered single clips, each cut as **[planned start − buffer, planned end + buffer] snapped outward to keyframes**, stream-copied (map only video 0 + audio 0), so CapCut gets the original codec/quality and the exact planned in/out can still be set by hand inside the buffer. Optional low-res H.264 preview MP4 of the exact plan (re-encode, preview only). Sidecar list with each clip's planned in/out offset inside its cut file.
- The plan's times were estimated from 2 s stills (≈ ±1–2 s), which is why a buffer is needed.
- CapCut drafts (`%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft\<name>\draft_content.json`) are currently plain JSON, but undocumented and version-dependent — a generated draft is possible in principle, not recommended as the baseline.
- **Raw folder drift:** `Raw/` currently holds 41 of the 54 analysed clips; **two clips used in the plan are missing: `…_0007_D.MP4` and `…_0055_D.MP4`** (the others not in `Raw/` are not in the plan). Clarify before cutting.

### Creative direction (user, 2026-11-26) — NaturOparC pilot of the channel's own flair
- **Scene captions:** fun, family-style short descriptions per scene with emojis, text, illustrations/symbols (Remotion); ideas from the review: "Wo ist der Otter?" search-picture caption, "Mitmach-Station" tags.
- **TASAN intro between scenes**, then the **logo floats into a corner and stays as a permanent watermark** (matches the documented watermark standard `docs/PRODUCTION_STANDARDS.md` §3; not built yet).
- **Ending:** Google-review comments section over the last long scene (26.9 s parking-lot scene) + the user's verdict (Fazit). Top-5 comments by process stage S8.
- **Route Check:** same look as the first video; needs adaptation for NaturOparC (origins, routes, texts), see Next steps.
- Short, never boring; tips and honest review for viewers. If it works, promote the pieces to channel standards (`docs/PRODUCTION_STANDARDS.md` §6).

### Route Check (2026-11-27)
- Built early at the user's request (normally S7). Origins Basel/Freiburg/Colmar/Strasbourg as in video 1; routes real OSRM (`public/geo/naturoparc-routes.geojson`); times Basel 1 Std., Freiburg 1 Std., Colmar 20 Min., Strasbourg 50 Min. (OSRM, no traffic); destination 48.17999 N / 7.32264 E (OSM). Light theme (cream/green, `theme: light`), 21 s (2026-11-27, info first: plate+title 1.5 s, tagline 3.5 s, location 5 s, parking 6.5 s, bus 9 s, then Colmar 13 s, Strasbourg 15.1 s, Freiburg 17.2 s, Basel 19.3 s (≈1 s calm after each), end image 20.4 s + 2 s; glass plate 24% cream + blur 5 px). Plate info verified 2026-11-27: parking free (tourisme-mulhouse.com listing "Free parking for cars", TripAdvisor review concurs), bus line 106 Colmar–Hunawihr (naturoparc.fr/infos-pratiques/acces; no stop name published, timetable via FLUO Grand Est). No parking price/space count shown (not confirmed).

### Decisions Made
- See `## ▶ Active Video` → Last decisions, and the 2026-11-23/24/26 entries in the Session Log.

## Session Log (all videos, newest first)

**2026-11-27 [workflow / timecodes]**
- Rules added: edit tables use CapCut-native `HH:MM:SS:FF` (project fps read from the draft, `scripts/video_assets.py` → `project_fps` / `to_timecode`, tested), timeline vs. original-clip times kept apart, rows sorted end → start (working order) with hook clips last in final playing order, standard close of the rough cut (changes → hook → export → short visual review without audio → approval → narration). In `docs/PRODUCTION_STANDARDS.md` §7, `PRODUCTION_PROCESS.md` (S3), `LEARNINGS.md`, `/my-review-roughcut`, `/my-next-task`.
- NaturOparC edit list regenerated in this format from the current draft `1124` (it changed after the export: two new 0054 clips at the start shift all times by 00:00:23:07 — handled in the table).

**2026-11-27 [workflow / review style]**
- Permanent working rules from the user: **no audio analysis ever** (removed audio probing from `scripts/footage-analysis/analyze.py`, audio wording from process/standards/learnings/review docs; loader tolerates old `metadata.json`); **analysis stays internal, chat gets one compact action table** (Timecode | Szene | Änderung | Dauer | Priorität; full file name + start/end for new footage; no H1/row references); **only changes with clear benefit**; **family outing video — keep atmosphere** (shorten, don't delete calm scenes). Anchored in `docs/PRODUCTION_STANDARDS.md` §7, `docs/PRODUCTION_PROCESS.md`, `docs/LEARNINGS.md`, `/my-review-roughcut`, `/my-next-task`.
- NaturOparC: final simplified edit list in `analysis/naturoparc/ROUGHCUT_REVIEW_v2.md` (hook = 4 clips with exact file names/times).

**2026-11-26 [naturoparc / process]**
- Defined the fixed production process (`docs/PRODUCTION_PROCESS.md`, stages S0–S12) and started the cross-video learnings file (`docs/LEARNINGS.md`, seeded from Mulhouse and NaturOparC). `/my-next-task` is now the process navigator (reads the process, evidence in the project and the learnings); closeout adds the **Process step** and a learnings step.
- Resolver: finds the CapCut export also in CapCut's default export folder (`%LOCALAPPDATA%\CapCut\Videos\<draft>.mp4`); NaturOparC draft is `1124`.
- First review of the user's rough cut written: `analysis/naturoparc/ROUGHCUT_REVIEW.md` (main findings: no hook in the first 24 s, uniform ~3 s rhythm, koi scene shows recognizable faces, weak/duplicate shots).

**2026-11-24 [tooling / video assets]**
- `/my-review-roughcut` no longer asks for paths: new portable table `## Video Assets (portable)` (slug → CapCut folder name, raw/export subfolders, optional draft name; names only) + `scripts/video_assets.py` resolves machine-specific paths (env `TASAN_CAPCUT_ROOT`/`TASAN_CAPCUT_DRAFTS`, optional gitignored `.claude/local.json`, default `<repo>/../capcut`), finds the newest export, auto-matches the CapCut draft by its media paths, and reports `problems` (exit 2) only when something is missing/ambiguous. No new committed config file. Tested with `python3 scripts/test-video-assets.py` (fixtures, incl. a second-PC root).
- Found while testing: the notification hooks failed when Claude had `cd`-ed into another folder (relative hook path + relative state folder). Fixed: hook commands use `${CLAUDE_PROJECT_DIR}` and `notify.py` anchors its state folder to its own location; verified from a subdirectory. Lesson: hooks run in the *current* directory, never assume the repo root.
- Headless `claude -p` runs get no permission prompts, so reads outside the repo (CapCut folders) and running the resolver are denied there; interactively you are asked once. An allow rule such as `Bash(python3 scripts/video_assets.py*)` in `.claude/settings.local.json` avoids the prompt (not added automatically).
- Gotchas: two drafts can reference the same footage (e.g. `1122` and the generated `TASAN_Test_3Clips`) → set the `Draft` column; Mulhouse uses a legacy folder layout (`video input`/`video ouput`), expressed per row.

**2026-11-24 [naturoparc / workflow]**
- **Workflow change (binding for all videos):** the user selects scenes and cuts the rough cut in CapCut; Claude reviews it with concrete time-based suggestions (dramaturgy, image quality, retention, scene length, information, B-roll placement). Footage analysis is a supporting tool for finding overlooked scenes. CapCut project generation and FFmpeg rough-cut automation are parked (knowledge preserved in `docs/CAPCUT_DRAFT_RESEARCH.md`, `scripts/capcut-draft/`).
- Updated `docs/PRODUCTION_STANDARDS.md` (new §7), `docs/FOOTAGE_ANALYSIS.md` (§10), `CLAUDE.md`, this file, the `/my-*` skills, and added the skill `/my-review-roughcut`.

**2026-11-24 [tooling / notifications]**
- Fixed unwanted ntfy pings and redesigned notifications as a per-task option (`/my-notification-on` anywhere in a prompt, bound to `prompt_id`, auto-reset after the task and at the next prompt; `/goal` alone arms nothing). One script `.claude/hooks/notify.py` replaces four shell scripts; `/my-notification-off` dropped. Root causes, empirical hook findings and rules in `## Lessons Learned (notifications)`.
- Tested: `python3 scripts/test-notifications.py` (47 checks, mock server) and real headless end-to-end runs. Also tested the previously untested skills in fresh headless sessions: `/my-next-task` (NaturOparC rough-cut automation proposed) and `/my-daily-project-closeout` (run in a throw-away worktree: correctly found nothing to update, made no changes).

**2026-11-24 [mulhouse-automobile-museum / naturoparc]**
- User confirmed Mulhouse is fully completed → registry status `done` (was wrongly inferred as `paused`); banner in the Mulhouse section marks its open items as historical; auto-memory updated; new lesson: git history can't tell paused from done, ask instead of inferring.
- Tested the rewritten skills in fresh headless sessions (`claude -p`, with `MSYS_NO_PATHCONV=1` under Git Bash so `/my-…` isn't turned into a path): `/my-project-status` and `/my-continue-project` both identified NaturOparC as active, Mulhouse as done, and cross-checked git. FFmpeg rough-cut script deliberately NOT built yet — automation approach to be discussed first.

**2026-11-24 [naturoparc / project memory]**
- Fixed project memory: `/my-project-status` showed Mulhouse although NaturOparC is the active video. Restructured this file into Active Video block + Video Registry + per-video sections + cross-video log + Lessons Learned (causes and prevention rules in `## Lessons Learned`).
- Rewrote `/my-project-status`, `/my-continue-project`, `/my-next-task` to read the Active block generically and cross-check `git log`; `/my-daily-project-closeout` gained Step 0 (identify the video worked on) and must refresh Active block + registry. `CLAUDE.md` no longer lists videos.
- Removed redundant `### Last Session Summary`; corrected stale `/goal` references in the Notifications section; updated the NaturOparC auto-memory note.
- Verified structurally (exactly one active row, matches Active slug, each row has a section). Not yet verified in a fresh session: that the rewritten skills show NaturOparC first.

**2026-11-24**
- Renamed all six custom commands to a `my-` prefix (`/my-project-status`, `/my-continue-project`, `/my-next-task`, `/my-daily-project-closeout`, `/my-list-commands`, `/my-notification-on`) via `git mv` in `.claude/commands/`, and updated live references in `CLAUDE.md`, `README.md`, `docs/NOTIFICATIONS.md` and the command files themselves.
- Later the same day: moved all six from `.claude/commands/*.md` to `.claude/skills/<name>/SKILL.md` (with `disable-model-invocation: true`, so they stay user-triggered only).
- (Superseded later the same day: `toggle.sh` and friends were replaced by `.claude/hooks/notify.py`; notifications are now a per-task option — see `
- Not re-verified end-to-end: the `/my-notification-on` → notifications-on link in a fresh session (new command names are likely only listed after a restart).
- Committed the previously uncommitted `docs/PRODUCTION_STANDARDS.md` and the NaturOparC `FINAL_TIMELINE_PLAN` files together with the rename.

**2026-11-23**
- **Established binding, channel-wide editorial production standards** in new `docs/PRODUCTION_STANDARDS.md`, covering: channel positioning (TASAN Trips is explicitly NOT a family vlog), family-footage/privacy rules (no recognizable faces of family members; focus on activity/hands/animal, not person; checked before every final cut, not pre-planned into the edit just because footage exists), a new branding concept (TASAN wordmark → shrinks → glides into a subtle watermark position, documented as a future standard only — **not implemented this session**, existing `TasanBrandIntro` left untouched), a hook standard (~6–10s, no narration, strongest footage first), a storytelling/editing structure (hook → orientation → sights → info → practical visitor info → honest verdict → close; mostly hard cuts, quality over quantity, no rigid per-shot second rules), and a cross-reference (not a duplicate) to the existing reusable-infographics catalog already defined in this file's Phase 3 and in `docs/BROLL_GUIDELINES.md`.
- Linked `docs/PRODUCTION_STANDARDS.md` from `CLAUDE.md` (new Key Files entry + a mandatory-read line alongside the existing B-roll-guidelines one) so it's automatically consulted before any future editorial planning, not just B-roll work.
- **Rewrote the NaturOparC cut plan** to follow these new standards, without any new footage analysis (reused the existing `content_review.md` findings as instructed): `analysis/naturoparc/FINAL_TIMELINE_PLAN.md` + `FINAL_TIMELINE_PLAN.csv` (26 rows: order, filename, start/end, planned length, scene description, voice-over, graphic/text overlay, justification), superseding `CAPCUT_INSTRUCTIONS.md`/`editorial_editlist.csv` as the current plan (kept, not deleted, as prior-version reference). Concrete changes from the old plan: hook is now ~8s of fast animal-highlight flashcuts (koi, otter, black swans, goat) instead of opening with the long staircase-climb-to-viewpoint clip (0039); the viewpoint panorama survives as a short mid-video highlight instead of the hook's centerpiece; a clip showing a family member smiling directly at the camera (0005) was dropped, and a clip of a child playing a xylophone-like sound post (0046) was dropped rather than conditionally kept, since face-visibility can't be judged reliably from stills; the unresolved-species rodent-feeding clips (0030–0033) were dropped both for the unconfirmed species call and because people, not animals, are the visual focus in those frames; the brand intro is no longer a dedicated timeline block but a placeholder row noting the future watermark overlay runs simultaneously with footage once built.
- Verified before treating this as done: raw clip total in the new CSV is ~162s (2:42) against the ~4-minute target — documented explicitly in `FINAL_TIMELINE_PLAN.md` as an intentional gap left for VO pacing/holds and 1–2 optional info-graphic slots (Cost/Planning/Trip-Score placeholders already marked in the CSV), not an oversight; exact runtime still gets finalized in CapCut against real narration length, consistent with the existing "duration follows narration" principle in `docs/BROLL_GUIDELINES.md`.
- Confirmed before any git staging that raw videos, thumbnails, and generated gallery files are still excluded via the existing `.gitignore` patterns (`analysis/*/thumbs/`, `contact_sheets/`, `extra_frames/`, `metadata.json`, `gallery.html`, `editlist.csv`, `events*`) — no raw footage touched or added this session, only new/edited Markdown and one new CSV.
- No new Remotion code and no new footage/video analysis this session — documentation and editorial-planning only, per explicit instruction.

**2026-11-22**
- Connected the local repository to GitHub: `origin` was already configured but pointed at a remote with no reachable commit history (empty repo), so this was a first push, not a merge — no history rewrite, no force-push.
- Audited the working tree before pushing: confirmed no `.env`/credential/secret files tracked or staged, confirmed `out/` (110MB of renders) and `node_modules/` stay excluded via `.gitignore`, reviewed the 50 tracked files (74.6MB, mostly museum photos and brand audio/video) with the user before the first push.
- Hardened `.gitignore`: added `.claude/settings.local.json` and `.claude/scheduled_tasks.lock` (previously excluded only via the user's global git ignore, not the project's own) and the one-off `_png_measure.mjs` scratch script, so the project repo is self-contained for this exclusion regardless of machine.
- Committed a pre-existing uncommitted change to `TasanBrandIntro.tsx`: replaced the `contrast(160%)` filter with a `mix-blend-mode: lighten` pass over a same-color backdrop (per-channel `max(video, bg)`), closing a visible seam the contrast approach left against the `#030509` canvas.
- Pushed 8 commits to `origin/main`; verified local and remote `HEAD` match exactly and the remote file count (50) matches local.
- Found and corrected documentation drift accumulated across the three undocumented sessions below (2026-09-08, 2026-09-11, 2026-09-13): `PROJECT_STATUS.md` was stale at 2026-09-04 and didn't reflect `MulhouseTripScore` v2, the project-slug reorganization, or `TasanBrandIntro`; `CLAUDE.md`, `PROJECT_STATUS.md`, and `docs/BROLL_GUIDELINES.md` still referenced the pre-reorg path `src/MulhouseRouteCheck.tsx` instead of `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx`.
- Checked `Root.tsx` for stale placeholders: found the unused `MulhouseTest` composition (leftover from initial setup, no render or doc depends on it) — flagged in Architectural Notes rather than removed, since this session's scope was documentation, not code/architecture changes.
- **Built the footage-analysis MVP** (`scripts/footage-analysis/`: `analyze.py`, `detect.py`, `editlist.py`) for sighting raw DJI footage before a CapCut rough cut — see the new "Shared Tooling: Footage Analysis" section above and `docs/FOOTAGE_ANALYSIS.md` for full design/decisions. Reused Remotion's bundled FFmpeg/ffprobe (no system install); added Pillow + numpy as the only new dependency, per the user's approved plan.
- Ran the full pipeline against the real NaturOparC raw footage (`capcut/2026 - Naturoparc Colmar/Raw/`): 54 clips, 00:22:04, 12.5GB, 3840×2160 HEVC. Tested against 5 clips first as instructed, reviewed real output, then ran the full set.
- Hit and fixed a real calibration problem: the first version of `detect.py` used guessed fixed thresholds for motion-diff and sharpness, which were wrong by roughly an order of magnitude for this footage (everything got flagged `high_motion`, nothing `static`). Switched both to per-clip relative percentiles instead of global constants; kept brightness as a fixed threshold since luma is a genuinely absolute scale. Spot-checked multiple flagged frames against the actual thumbnails afterward to confirm the fix — all correct (a held shot of a parked car flagged `static`; a whip-pan to a close-up face flagged `high_motion`; a genuinely unusable close-up of a blank tiled wall flagged for review; an underwater viewing-window shot flagged `blurry` by the technical heuristic despite being a visually strong, usable establishing shot — a concrete example of why technical flags and actual content judgment are kept as two separate, separately-labeled things, never blended).
- Generated `editlist.csv` for all 54 clips: 3 Hook candidates (incl. the park's entrance sign, a natural establishing shot), 2 Schluss candidates, 2 flagged for manual review (Pruefen), 47 Hauptteil. No clip crossed the 30% static-coverage bar for an automatic "Uebergang" tag — expected, since this is mostly walking/panning footage, not held tripod shots.
- **Built optional mobile push notifications** (ntfy.sh, topic `tasan-trips`) scoped to this project only — see the new "Shared Tooling: Notifications" section above and `docs/NOTIFICATIONS.md`. Checked first that `/goal` didn't already exist (it didn't) before creating `.claude/commands/goal.md`. Implemented via the official `Notification`/`Stop`/`UserPromptSubmit` hook events in a new `.claude/settings.json`, with per-session on/off state keyed by the hook's own `session_id` field (so parallel sessions in this project never share state) and `python3` for JSON parsing instead of `jq` (not installed on this machine, and `python3` was already a project dependency). Pipe-tested both hook scripts, confirmed hooks stay non-blocking against a real unreachable host (DNS failure resolved in under a second, hook still exited 0), and sent real test notifications to the live ntfy.sh topic (verified delivery via a direct curl echo-back), not just synthetic pipe tests.
- **Ran the full editorial content-review pass on all 54 NaturOparC clips**, invoked via `/goal` (notifications on for the session). Built `contact_sheet.py` first — tiling every thumbnail of a clip into one labeled grid turned a 671-thumbnail review into 54 image reads, making a full (not spot-check) pass actually tractable. Confirmed by eye: turtles, koi-feeding, black swans (walking and drinking), a hand-fed goat, a stork nest, and varied fish in the indoor aquarium tunnel. Extracted extra 0.5s-spaced frames (vs. the standard 2s) for the otter tunnel, stork enclosure, and tower viewpoint specifically because a fast or subtle moment could fall between the normal samples — this is exactly how a real otter was found actually swimming, completely invisible in the standard thumbnails. Deliberately left two things unconfirmed rather than guessed: distant birds in an open enclosure (plausibly storks, given the park's confirmed stork-reintroduction signage, but not resolvable at thumbnail resolution) and a rodent species during a feeding scene (plausibly capybara, same caveat). Flagged and explained real duplicate/near-duplicate footage (a 4-clip, ~73s rodent-feeding block covering one continuous moment; several near-identical parking-lot and path clips) separately from intentional hook-preview reuse, which is not the same thing. Produced three outputs: `content_review.md` (full analysis, nothing dropped), `editorial_editlist.csv` (prioritized cut list, Hoch/Mittel/Niedrig — 212s of Hoch+Mittel footage, a realistic base for an "ungefähr vier Minuten" video), and `CAPCUT_INSTRUCTIONS.md` (proposed sequence + practical steps). Corrected `.gitignore` to commit these three editorial files specifically — unlike thumbnails/galleries, they're genuine non-regenerable judgment calls, not derived cache.

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

## Shared Tooling: Footage Analysis

Local-only tool for sighting raw DJI Osmo Pocket 3 footage before building a CapCut rough cut — separate from the Remotion/B-roll workflow, touches no `src/` composition code. Full design, decisions, and limitations are in `docs/FOOTAGE_ANALYSIS.md`; this section only tracks status.

### Status
- [x] MVP built: `scripts/footage-analysis/analyze.py` (ffprobe metadata, timestamped thumbnails, HTML gallery), `detect.py` (technical flags), `editlist.py` (draft CSV edit list)
- [x] Verified against 5 real NaturOparC clips (metadata correct, thumbnails sharp and correctly timestamped) and spot-checked against the actual images (held-shot and whip-pan flags both confirmed correct — see `docs/FOOTAGE_ANALYSIS.md` §5)
- [x] Full NaturOparC raw-footage inventory probed: 54 clips (+2 JPG stills, not part of the video pipeline), 00:22:04 total, 12.52GB, uniformly 3840×2160 HEVC (52 clips @ 29.97fps, 2 @ 23.98fps)
- [x] Calibration pass completed on `detect.py`'s thresholds — switched motion/sharpness from guessed fixed constants (which misfired badly on real footage) to per-clip relative percentiles; brightness kept as a fixed threshold since luma is a genuinely absolute scale
- [x] Pillow + numpy installed (the one new dependency this tool adds) — `scripts/footage-analysis/requirements.txt`
- [x] Full 54-clip run complete: `metadata.json` (54 clips), 671 timestamped thumbnails, `gallery.html` with technical flag badges, `events/` (per-clip), `editlist.csv` (54 rows: 3 Hook, 2 Schluss, 2 Pruefen, 47 Hauptteil)
- [x] Claude content-review spot-checks across the full set during calibration — confirmed the detection logic against real frames, including one notable case worth remembering: an underwater viewing-window shot got a technical `blurry` flag (low edge detail in murky green water) while being, by actual content, a strong and usable establishing/atmosphere shot — the clearest real example yet of why `docs/FOOTAGE_ANALYSIS.md` §4 keeps technical flags and content judgment strictly separate
- [x] **Full editorial content-review pass completed, all 54 clips** — built `contact_sheet.py` (tiles every thumbnail of a clip into one labeled grid image, so one image read covers a whole clip instead of dozens) and read one contact sheet per clip; extracted additional 0.5s-spaced frames for the otter tunnel, stork enclosure, and tower-top view where a fast/subtle moment could fall between the standard 2s samples. Confirmed sightings: turtles, koi being fed, black swans (walking + drinking), a goat being hand-fed, a stork nest, varied fish in the indoor aquarium tunnel, and — only via the extra dense frames — an otter actually swimming, invisible in the standard 2s thumbnails. Several contents stayed honestly unconfirmed (distant birds in the open enclosure plausibly storks, a rodent species plausibly capybara) rather than asserted without reliable visual evidence.
- [x] Three editorial outputs written: `analysis/naturoparc/content_review.md` (full per-clip analysis, nothing dropped), `analysis/naturoparc/editorial_editlist.csv` (prioritized cut list — Hoch/Mittel/Niedrig — with filename/start/end/duration/description/priority/justification), `analysis/naturoparc/CAPCUT_INSTRUCTIONS.md` (proposed running order + practical CapCut steps). Hoch+Mittel priority alone totals 212s (3:32) of raw footage, a realistic base for an "ungefähr vier Minuten" video once intro/transitions are added.
- [ ] Apply the cut plan to an actual CapCut rough cut — tracked as the active step in `## Video: NaturOparC`

### Key Decisions (confirmed by user)
- Detection approach: Pillow + numpy on bundled-FFmpeg frame samples, not a system-wide FFmpeg install (keeps the tool fully self-contained, no new system dependency)
- AI image-content review: manual, on-request (Claude reviews generated thumbnails when asked) — no vision model/API wired into the pipeline; first full real use was this session's 54-clip NaturOparC pass
- Folder layout: `scripts/footage-analysis/` (tool) + `analysis/<slug>/` (outputs). **Not all of `analysis/` is gitignored** — large/regenerable artifacts (`thumbs/`, `contact_sheets/`, `extra_frames/`, `metadata.json`, `gallery.html`, `editlist.csv`) are, same reasoning as `out/`; but the three editorial write-ups above are genuine, non-regenerable judgment calls, so those **are** committed
- Bundled Remotion FFmpeg (`node_modules/@remotion/compositor-win32-x64-msvc/`) reused for metadata/thumbnails — confirmed via `-filters` that it lacks `select`/`scdet`/`freezedetect`/`blackdetect`, which is why detection needs the Python layer instead of native FFmpeg filters

### Architectural Notes
- Read-only on source footage: every ffmpeg/ffprobe call only decodes a preview frame (`-ss` + `-frames:v 1`); never writes to the source path
- DJI files carry an embedded MJPEG cover-art stream (`disposition.attached_pic`) alongside the real HEVC video stream — metadata extraction explicitly skips it so fields always reflect the real video, not the cover thumbnail
- DJI `DJI_<timestamp>_<seq>_D.MP4` filenames already sort chronologically — no separate ordering logic needed
- Contact-sheet tiling (`contact_sheet.py`) turned a 671-thumbnail review into 54 image reads (one per clip) instead of hundreds — the mechanism that made a full, not just spot-check, editorial pass of this size actually tractable
- Dense-frame extraction (every 0.5s instead of 2s) for a specific clip/range is the pattern for "might be between the samples" moments — it found a real otter sighting completely invisible at the standard 2s interval

## Shared Tooling: Remotion Library
- `docs/REMOTION_LIBRARY.md` = catalog of all own Remotion components (status ✅/🧪/📋, paths, config, limits, refactoring list); entry skill `/my-remotion-library`. Binding rule (`PRODUCTION_STANDARDS` §9): check the library first, build new things as separate configurable components, register every user-approved component in the catalog before committing. Standalone components in `src/components/` (TextReveal, AnimatedTitle, GlassPanel/DarkPanel, RouteDraw, MarkerPulse, split out of `RouteCheck` 2026-11-27, render-identical); `/my-remotion-library` shows only the simple "Toolbox" overview by default. Established 2026-11-27.

## Shared Tooling: Notifications

Optional mobile push notifications (ntfy.sh, topic `tasan-trips`) scoped to this project only, not global to other Claude Code projects. Full mechanism, usage, and limits documented in `docs/NOTIFICATIONS.md` — this section only tracks status.

### Status
- [x] **Current design (2026-11-24, per-task):** single script `.claude/hooks/notify.py` (hooks `UserPromptSubmit`/`Stop`/`Notification`/`SessionStart`/`SessionEnd` in `.claude/settings.json`). Off by default; the standalone token `/my-notification-on` anywhere in a prompt (e.g. `/goal /my-notification-on …`) arms notifications for **that task only**, bound to the hook payload's `prompt_id`; cleared when the task ends and again at the next prompt. `/goal` alone arms nothing. Replaced the older `toggle.sh`/`ntfy-ping.sh`/`session-*.sh` scripts and the never-released `/my-notification-off`. Details: `docs/NOTIFICATIONS.md`
- [x] Skill `.claude/skills/my-notification-on/` is only the documented marker; goals use Claude Code's built-in `/goal`
- [x] Per-session state file keyed by `session_id` (gitignored, folder under `.claude/`; `permissions.deny` keeps Claude's own tools out) — parallel sessions never share state
- [x] Pipe-tested both hook scripts against synthesized stdin payloads (on/off toggle, silent-when-off, normal prompts untouched) and against a real unreachable host (DNS failure resolved in <1s, hook still exited 0 — confirms hooks never block Claude if ntfy is unreachable)
- [x] Sent real test notifications to `ntfy.sh/tasan-trips` (both the "needs input" and "task complete" message variants) and independently confirmed delivery via a direct curl call (ntfy.sh echoed the message back) — real push, not just a pipe-test
- [x] **2026-11-24 bug fix — unwanted pings** (see Lessons Learned). Tested with `python3 scripts/test-notifications.py` (47 checks, local mock server, no real pushes: consecutive tasks in one session with/without marker, `/goal` runs, parallel sessions, lifecycle) plus real end-to-end runs in fresh headless sessions: plain prompt → silent; `/my-notification-on …` → 1 push; `/goal /my-notification-on …` → 1 push at goal end; `/goal …` alone → silent
- [x] `docs/NOTIFICATIONS.md` written; linked from `CLAUDE.md`; `/my-list-commands` lists `/my-notification-on`

### Decisions / Design Notes
- No `jq` installed on this machine — both hook scripts parse the hook JSON via `python3` instead (already a project dependency from the footage-analysis tool), so no new dependency was added for this feature either
- Hooks configured in `.claude/settings.json` (new file, committed/project-scoped), not `~/.claude/settings.json` — per the user's explicit requirement that this applies only to TASAN Trips, not globally
- Message bodies are always short, fixed strings ("Claude braucht deine Eingabe/Freigabe" / "Auftrag beendet") — never prompt text, file contents, or tool output, so nothing sensitive leaves the machine via these hooks
- `Notification` + `Stop` only (per explicit instruction), not also `PermissionRequest` — avoids a second hook double-pinging the same permission-needed moment
- Known, accepted limitation: `Stop` also fires on `/clear`/`/resume`/`/compact`, not only genuine task completion — documented in `docs/NOTIFICATIONS.md` rather than worked around, since distinguishing them would add real complexity for a cosmetic extra ping
- ntfy.sh topics are unauthenticated by default — `tasan-trips` is now in the committed repo, so it's a semi-public channel name, not a secret; documented as a known limitation rather than hidden in `settings.local.json`, since the user had already disclosed and tested this topic before asking for this feature
- New settings.json may need a one-time `/hooks` reload or session restart to take effect, since it didn't exist in this project before this session

## Lessons Learned (notifications)

- **2026-11-24 — Unwanted ntfy pings.** What the evidence showed: the ntfy topic log held only our own fixed messages, all from sessions that had a state file; a fresh headless session stayed silent, so the per-session logic itself worked. Real weaknesses found: (1) state files were never cleaned up and are keyed by `session_id`, so a resumed old session (ids from 11-22/11-23 still existed) came back ON without the user switching it on; (2) the hook also switched on for the text `notify:on` anywhere in a prompt and for `/goal`/`/my-goal`, i.e. far more than the one intended trigger — quoting or discussing the feature could activate it; (3) once ON, every turn end, idle notice and each turn of a multi-turn `/goal` run pinged, which feels like "constantly"; (4) nothing stopped Claude's own tools from creating the state file.
- **First fix (same day) was still wrong in scope:** it made notifications a *session* switch (reset only at session start). The user's actual requirement is a **per-task option** that combines with other commands (`/goal /my-notification-on …`) and resets after every task, even within one session.
- **What makes per-task reliable (verified empirically on 2.1.331, not assumed):** the hook payloads carry a `prompt_id` shared by `UserPromptSubmit` and all `Stop` events of one task, including `/goal` continuation turns (`stop_hook_active: true`); a `/goal` verdict is written to the transcript as a `goal_status` attachment a few seconds *after* its Stop event, so the Stop hook must wait for it before deciding the task is over; there is no hook for user interrupts, so the next `UserPromptSubmit` is the guaranteed reset point.
- **Prevention / rules of thumb:** an "on" flag must be bound to the unit it was requested for (prompt/task id), cleared at the *start* of every new unit (not only the end of the last), and triggered by one narrow token. Verify hook-payload assumptions with a debug hook before designing around them. Never test hooks with real pushes when a mock server works. Own deny rules also block my own Bash commands containing the guarded path — write such files with the Write/Edit tools.

## Lessons Learned (project memory itself)

- **2026-11-24 — Status showed Mulhouse although NaturOparC was being worked on.** Causes: (1) the status file had one hard-coded `## Current Video: Mulhouse` section, so a second video had no home — NaturOparC was filed under "Shared Tooling" and only mentioned in a one-line "Current Phase" blob; (2) `CLAUDE.md` listed only Mulhouse under "Videos in Progress"; (3) the skills' output templates literally contained "Mulhouse Automobile Museum" and told Claude to avoid anything outside the status file; (4) closeout only appended to the log and never re-stated *which* video is active or where to resume; (5) the auto-memory note still said "nothing exists for NaturOparC". Fix: one Active Video block + a Video Registry as the single source of truth; skills read them generically (no video names), cross-check against `git log`, and closeout must refresh both.
- **Rules that prevent a repeat:** never hard-code a video name in a skill or in `CLAUDE.md`; per-video state lives only in its own section; the resume point lives only in `## ▶ Active Video`; when evidence (git history, files in `analysis/<slug>/`, `src/<slug>/`) disagrees with the status file, trust the evidence, fix the file, and tell the user; starting a new video means adding a registry row and flipping statuses in the same closeout.
- **Git history can't distinguish "paused" from "done".** Mulhouse was first inferred as `paused` from the lack of recent commits, but it was finished. When a video's status is not documented, ask the user instead of inferring it; record the user's answer in the registry.
- **Don't track a video as "tooling".** If work produces per-video artifacts (`analysis/<slug>/`, `src/<slug>/`, `out/<slug>/`), the video needs a registry row and a section — shared tooling sections describe tools only.
