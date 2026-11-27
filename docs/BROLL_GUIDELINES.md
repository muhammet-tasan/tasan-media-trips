# TASAN MEDIA Trips — B-roll Guidelines

**Reference implementation:** `src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx` is the current reference implementation for geographic Route Check B-rolls. Consult it alongside this document before building a new one of the same type.

**For every new destination use the config-driven `src/route-check/RouteCheck.tsx`** (same design as the reference, destination/origins/texts in `src/<slug>/route-check.json`, routes via `python3 scripts/fetch-routes.py <slug>` → `public/geo/<slug>-routes.geojson`, thin wrapper `src/<slug>/<Name>RouteCheck.tsx`, composition with `holdSeconds` prop in `src/Root.tsx`). First use: `src/naturoparc/`. `MulhouseRouteCheck.tsx` stays untouched so video 1 renders unchanged; see §13.

## 1. General workflow

Before coding a new B-roll, define:

- purpose / viewer question
- exact information to communicate
- planned voice-over content
- approximate narration duration
- start state
- final static frame
- animation sequence
- mobile readability requirements
- required data and sources
- assets
- visual hierarchy

Do NOT start implementation from a vague visual idea.

Target:
first usable implementation + maximum one normal correction pass.

## 2. Duration follows narration

Never assume a fixed B-roll duration such as 8 seconds.

Estimate duration from:
- planned voice-over
- amount of information
- reading time
- animation complexity

Information-heavy graphics should have a generous final static hold.

For reference:
MulhouseRouteCheck uses approximately 16 seconds because it contains
geographic orientation, four origins, driving times, parking and public
transport information.

This is a reference, NOT a universal duration.

## 3. Geographic Route Check template

For geographic route graphics:

- use a real geographic basemap when geographic orientation matters
- never invent or manually approximate country borders
- use real geographic boundary data
- show relevant country context
- international borders must be clearly distinguishable from roads,
  rivers and regional boundaries
- borders must NOT dominate the composition

Visual hierarchy should generally be:

destination / primary message
>
routes + important labels
>
title / practical information
>
international borders + country labels
>
basemap details

Country borders:
- clearly visible
- continuous
- subtle light/cool-gray treatment
- enough contrast to understand countries immediately
- lower prominence than primary routes and text
- never bright enough to interfere with label readability

Large country labels:
- secondary orientation only
- low opacity
- must not compete with cities or routes

## 4. Route lines

Routes must remain clearly visible over the basemap.

Use:
- sufficient line thickness
- strong separation from map roads/rivers
- subtle casing/shadow where useful
- primary origin may be slightly more prominent

Do not use thin route lines that disappear into the basemap.

Do not make routes neon.

If a real basemap is used, route geometry should either:
- roughly follow the real travel corridor, or
- be clearly designed as an abstract connection

Never accidentally imply an inaccurate turn-by-turn route.

## 5. Transport modes

Do not assume every visitor arrives by car.

For destination B-rolls consider:
- car
- train
- tram/public transport
- walking where relevant

Only show transport modes that provide useful decision-making value.

Avoid showing every transport mode for every city if this overloads the map.

Prefer a clear primary comparison plus concise secondary access information.

## 6. Mobile-first readability

All important information must remain readable on a phone.

Avoid:
- tiny metadata-style labels
- excessive abbreviations
- text directly over busy borders/routes
- low-contrast practical information

Move labels into clean map space where necessary.

Secondary information can be smaller, but still readable at normal
YouTube mobile size.

## 7. Information hierarchy

Do not display everything with equal visual weight.

Primary:
destination / core decision information

Secondary:
travel times / price / practical access

Tertiary:
country labels / contextual geography / supporting details

The viewer should understand the main message within approximately
1–2 seconds even without reading every label.

## 8. Animation

Avoid PowerPoint-like:
point → line → text → point → line → text

Prefer calm cinematic sequencing.

Typical structure:
- establish context
- establish destination
- progressively reveal important information
- reveal practical details
- finish with a completely static reading hold

Animations should support narration rather than race against it.

Do not animate simply because something can be animated.

## 9. Final-frame-first design

Before implementation, define what the final fully populated frame
should look like.

Verify:
- no label collisions
- hierarchy works
- borders remain secondary
- routes remain visible
- practical information is readable
- attribution is visible when required

Only then design the reveal animation.

## 10. Map attribution / licensing

When using OpenFreeMap / OpenMapTiles / OpenStreetMap data,
preserve the required attribution.

Never remove required attribution for aesthetic reasons.

Do not use map providers or tiles in ways that violate their terms.

## 11. Reuse vs adaptation

MulhouseRouteCheck is a REFERENCE IMPLEMENTATION, not a component that
must be copied blindly.

Reuse its proven:
- hierarchy
- map styling principles
- border treatment
- route visibility logic
- typography logic
- animation philosophy
- attribution handling
- mobile readability principles

But adapt:
- duration
- number of origins
- transport modes
- zoom level
- information density
- final layout

to the actual destination and narration.

## 12. Pre-build checklist

Before writing code for a new B-roll, report back with a short spec:

PURPOSE
VOICE-OVER / MESSAGE
DATA
DURATION
FINAL FRAME
ANIMATION PHASES
MOBILE READABILITY
ASSETS / SOURCES
REFERENCE TEMPLATE

Wait for approval if major creative decisions are still unresolved.

## 13. Config-driven Route Check (since NaturOparC)

New destination = `python3 scripts/new-route-check.py <slug> --name … --place … --heading … --subtitle … --origins "Basel|CH,…"` (geocodes, fetches real OSRM routes, fills rounded times, writes `route-check.json` + wrapper, prints the `<Composition>` to paste into `src/Root.tsx`), then render the final frame and fix collisions by hand. No changes to `RouteCheck.tsx` needed. Manual equivalent: `route-check.json` + `fetch-routes.py <slug>` + 5-line wrapper + one `<Composition>`.

- **Timing is config, duration is a prop:** everything is in **seconds** in `route-check.json` → `timing` (no code change to sync with the voice-over): `establishSeconds` (camera push-in; keep ≤ first text reveal so the plate does not drift), `destinationAt`, per origin `at` (or `firstOriginAt` + `originStep`), `fadeSeconds` (default 0.6 s, fade + 10 px rise), per block `title` / `tagline` / `location` / `plate` `{at, fade}`, per `infoLines[i]` `at` / `fade`, `endImageAt` (start of the static end image). Total = `endImageAt` + prop `holdSeconds` (Studio/CLI: `--props='{"holdSeconds":3}'`); without `endImageAt` the end image starts after the last reveal. Origins appear in config order or at their own `at` (story order decides: info first or routes first). The plate keeps its final size from frame 0 (text slots reserved, only opacity changes), so nothing shifts. NaturOparC (22.4 s, info first): map 0-1.5 s → plate + title 1.5 s → tagline 3.5 s → location 5 s → parking 6.5 s → bus 9 s (+ line 10.5 s) → Colmar 13 s → Strasbourg 15.1 s → Freiburg 17.2 s → Basel 19.3 s (each origin is fully shown after ~1.1 s, then 1 s of calm for the narrator) → end image from 20.4 s + 2 s hold. Defaults without `timing`: everything with the destination at 2 s, origins from 4 s (62-frame step).
- **Times:** `time` labels are free text. `fetch-routes.py` prints OSRM car durations (no traffic) — round them, or overwrite with researched values (Mulhouse used the user's own figures).
- **Label collisions are per-destination:** use `labelOffset` per origin and `countryLabels` positions; check the final frame for labels on borders/other labels/routes (NaturOparC needed 2 fixes: Colmar label moved left of the route, country labels moved off place names/Basel label).
- **Theme per video:** `"theme": "dark"` (default, = video 1) or `"light"` (cream/green, orange routes; uses `public/geo/tasan-map-style-light.json`). New palettes = add an entry to `THEMES` in `RouteCheck.tsx`. Light theme plate is frosted glass: a separate glass layer (own opacity, **never** `opacity` on the text wrapper) with `config.plate` `{background, blur, saturate, border, shadow}`; `config.mapBackground` sets the map colour. `backdrop-filter` works in the Remotion MP4 render (verified: without blur the map labels cut through the text). NaturOparC: `rgba(250,247,235,0.24)` + blur 5 px — a cream fill above ~0.4 looks like a solid box on a cream map, blur 0 hurts readability. Overlay text positions are rounded to whole pixels — fractional `left/top` made text flicker ±1 px between render tabs. `destination.location` adds a "📍 where is it" line (e.g. `in Hunawihr · bei Colmar`) — always fill it so viewers know where the place is. `plateOffsetX`/`plateOffsetY`/`plateWidth` position the info plate (NaturOparC: top-left, so the nearest origin's label can sit right next to its marker). `plateOffsetY` shifts the info plate (default -55); with 3+ info lines use about -170 and move the neighbouring label via `labelOffset`.
- **Practical info (`infoLines`, parking/transit) only with verified facts** — leave empty rather than guess; the plate then shows name + tagline only.
- Possible later cleanup: migrate `MulhouseRouteCheck` onto `RouteCheck` and verify frame-identical output before replacing it.

## 14. Approved patterns and user preferences (from approved implementations)

Distilled from the approved Route Check (NaturOparC), the Mulhouse reference scenes and the TASAN intro — final states only, not discarded iterations. Catalog of components: `docs/REMOTION_LIBRARY.md`; Route Check specifics: §13.

**Design decisions that worked**
- Real basemap + real routes, borders as a subtle separate layer, strong route casing; destination in the accent colour, everything else calmer (§3, §7).
- Theme per video: dark/gold for the car museum, light cream/green + orange routes for the family park. Map background, plate fill and blur are config, not code.
- Info plate: large phone-readable text on a plate so no route crosses it; place it where the map beneath is richest and away from the nearest origin label (NaturOparC: top-left, Colmar label directly beside its marker).
- Always tell viewers *where* the place is (location line "in Hunawihr · bei Colmar") in addition to the heading.
- Only verified practical facts (parking, bus line); leave out instead of guessing.

**User preferences (from corrections)**
- Text appears calmly: fade + minimal rise only, never sideways movement or jitter; once shown, text stays and never shifts (reserve the final layout from frame 0).
- Glass plate: "lightly tinted glass pane, not a milky-white surface" — map structures must stay recognisable behind it, text fully opaque. Approved light values: `rgba(250,247,235,0.24)` + 5 px blur + soft white border + faint shadow. 0.45 alpha / 8 px looked like a solid box; no blur let map labels cut through the text.
- Order is story-driven and configurable: practical info first, then origins in the user's order, each with ~1 s of calm so the narrator can speak. The user syncs to the voice-over afterwards, so *every* reveal time is a config value in seconds.
- Duration is decided late (from narration): total length is config + `holdSeconds`, never hard-wired.
- Iteration style: small, precise changes; keep everything else (design, glass, durations, other animations) untouched when one thing is changed.

**Timing and easing (approved values)**
- Text/camera ease: `easeOutCubic`; text fade 0.6 s + 10 px rise; heading fade 0.2–0.9 s; camera push-in ≈ 4 % zoom over ≤ 1.5–2 s, no pan, must be finished before the first text appears.
- Markers: spring `{damping 16, stiffness 120, mass 0.6, overshootClamping}` + ring pulse; route draw 24 frames; origin label in 32 frames; ≈ 1 s calm after each origin.
- Phases not total duration: enter/hold/exit, transitions 0.5–0.9 s, readable holds ≥ 3.5 s, completely static end image (§8; TripScore).
- Brand intro: composite the original Kling video, never recreate; constant crop from frame 0; background matched with `mix-blend-mode: lighten`; fade 0.5 s + 1 s hold; 4K.

**Rendering and checking**
- `npx remotion render src/index.ts <Id> out/<slug>/<Id>.mp4` (export standard `PRODUCTION_STANDARDS` §10: 4K, 30 fps, H.264 CRF 16, Rec. 709, AAC 48 kHz; add `--scale=2` for scenes designed at 1080p); duration from `calculateMetadata`; MapLibre scenes need internet for tiles (≈ 80 s for 22 s).
- Check real MP4 frames after every reveal (`npx remotion ffmpeg -ss <t> -i <mp4> -frames:v 1 <png>`, contact sheet with PIL), not only stills: render tabs start mid-video, text can flicker ±1 px (round positions), glass must be judged on the render.
- Windows: no `/tmp` for helper files; write scratch files to the scratchpad.

**Reuse**
- New destination → Route Check config + `new-route-check.py`; new scenes are combinations of the standalone components in `src/components/` (TextReveal, AnimatedTitle, GlassPanel/DarkPanel, RouteDraw, MarkerPulse) plus config — architecture rules in `PRODUCTION_STANDARDS` §9. Remaining refactoring candidates: `REMOTION_LIBRARY.md` §11.
