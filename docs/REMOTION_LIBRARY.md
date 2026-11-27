# TASAN MEDIA Trips — Remotion-Bibliothek (Katalog)

Zentraler Katalog aller selbst entwickelten Remotion-Bausteine. Einstieg: `/my-remotion-library` (Übersicht bzw. Wiederverwendung für eine Aufgabe). **Vor jeder neuen Remotion-Arbeit zuerst hier nachsehen**; nach jeder freigegebenen Komponente hier eintragen (Regeln: `docs/PRODUCTION_STANDARDS.md` §9). Der Katalog verweist auf Code und Doku, er wiederholt keine Details.

Status: ✅ verfügbar (konfigurierbar, wiederverwendbar) · 🧪 vorhanden, aber videospezifisch/intern (nur nach Refactoring oder als Vorlage nutzbar) · 📋 geplant (existiert nicht).
Alle Kompositionen: 30 fps, MP4 (H.264, Remotion-Standard) über `npx remotion render src/index.ts <CompositionId> out/<slug>/<CompositionId>.mp4`; Einzelbild `npx remotion still …`. Standardformat 1920×1080 (Intro 4K). Registrierung in `src/Root.tsx`. Design-/Timing-Standards und Nutzerpräferenzen: `docs/BROLL_GUIDELINES.md` (§13 Route Check, §14 bewährte Muster).

## 1. Vollständige Videosequenzen

### 🧪 MulhouseTripScore — Urteil-Sequenz („TASAN Trip Score“)
- **Was:** 8 Szenen (Frage/Kontext, was gefiel, was nicht, Community-Bewertungen, Zielgruppe, persönliches Zitat, Sterne-Übersicht, Endscore mit Count-up), dunkler Premium-Hintergrund, Fotos mit Ken Burns, Crossfades.
- **Einsatz:** Bewertungs-/Fazit-Abschnitt (S8). Als Vorlage für ein späteres konfigurierbares `TripScore`.
- **Pfad:** `src/mulhouse-automobile-museum/MulhouseTripScore.tsx` · Composition `MulhouseTripScore` (Dauer berechnet: Summe der Szenen − 7 × 0,6 s).
- **Konfiguration:** keine; Inhalte sind Konstanten am Dateianfang (`COMMUNITY_RATINGS`, `FINAL_CATEGORIES`, `QUOTE_LINES`, `IMAGES`, Texte). Score wird berechnet, nie hartkodiert.
- **Einschränkungen:** komplett Mulhouse-spezifisch (Texte, Fotos, Noten), 1092 Zeilen in einer Datei; Dark/Gold fest.
- **Beispiel:** `npx remotion render src/index.ts MulhouseTripScore out/<slug>/MulhouseTripScore.mp4`
- **Wiederverwendbare Teile (intern):** Beat-System, Sterne, Count-up, Hintergrund → siehe §4, §6, §7, §8 und Refactoring-Liste.

### 📋 Weitere Sequenzen (Katalog `PRODUCTION_STANDARDS` §6)
Google-Review-Abschnitt (Top-5-Kommentare + Fazit des Autors, S8), Cost Check, Planning Check, Trip Check. Noch nicht gebaut — beim Bau als konfigurierbare Komponente mit `src/<slug>/<name>.json` anlegen.

## 2. Intro- und Outro-Szenen

### ✅ TasanBrandIntro — TASAN-Markenintro (freigegeben)
- **Was:** Original-Kling-Video (Buchstaben formen sich, Lichtpunkt, Glint) als reines Compositing: feste Crop-Maske ab Frame 0, Hintergrund per `mix-blend-mode: lighten` exakt an `#030509` angeglichen, weiche Alpha-Kante, Fade-out 0,5 s + 1 s ruhiger Hintergrund.
- **Einsatz:** Marken-Intro für jedes Video (Kanalstandard bis das Wasserzeichen-Reveal gebaut ist, s. u.).
- **Pfad:** `src/brand/TasanBrandIntro.tsx` · Quelle `public/brand/videos/kling_20260911_VIDEO_Edit__Vide_5980_0.mp4` · Composition `TasanBrandIntro`.
- **Format:** 3840×2160, 30 fps, 161 Frames (5,4 s), MP4 inkl. Ton des Kling-Videos (Ton fadet mit).
- **Konfiguration:** keine Props; nur Konstanten (`FADE_START`, `FADE_DURATION`, `HOLD_DURATION`, `BACKGROUND_COLOR`, `VERTICAL_NUDGE`, Crop-Grenzen).
- **Einschränkungen:** Crop und Fade sind auf die Kling-Quelle abgemessen (der große Ring darf nie sichtbar werden); Feather ≈ 20 px nativ (geometrische Obergrenze); der Render `out/brand/TasanBrandIntro.mp4` (2026-09-13) ist älter als der Lighten-Fix (2026-11-22) → vor dem Import neu rendern.
- **Beispiel:** `npx remotion render src/index.ts TasanBrandIntro out/brand/TasanBrandIntro.mp4`
- **Doku:** Kommentarkopf der Datei (Messungen des Rings), `LEARNINGS.md` → Branding.

### 📋 Wasserzeichen-Reveal (Standard §3)
TASAN-Schriftzug erscheint über laufender Aufnahme, verkleinert sich, gleitet in eine Ecke und bleibt dezent stehen. Als Overlay mit Transparenz (Alpha-Export) zu planen. Noch nicht gebaut; `TasanBrandIntro` bleibt bis dahin unverändert.

### 📋 Outro
Nicht entworfen.

## 3. Karten- und Routenanimationen

### ✅ RouteCheck — Anfahrts-Szene (konfigurierbar)
- **Was:** Echte Karte (MapLibre + OpenFreeMap), echte OSRM-Routen, Natural-Earth-Ländergrenzen, Ziel-Marker, Herkunftsorte mit Route/Fahrzeit, Infotafel (Glas) mit Titel, Untertitel, Ort, Parkplatz/ÖPNV; Kamera-Push-in; Themes `dark` (= Video 1) und `light` (creme/grün, familiär).
- **Einsatz:** „Standort & Anreise“ in jedem Video (S6/S7).
- **Pfade:** Komponente `src/route-check/RouteCheck.tsx` · Config `src/<slug>/route-check.json` · Wrapper `src/<slug>/<Name>RouteCheck.tsx` · Routen `public/geo/<slug>-routes.geojson` · Stile `public/geo/tasan-map-style(-light).json` · Grenzen `public/geo/country-borders.geojson` · Erstbau `scripts/new-route-check.py`, Routen neu `scripts/fetch-routes.py <slug>`.
- **Konfiguration** (Typ `RouteCheckConfig`, im Code dokumentiert): `heading`, `subtitle`, `destination{name,tagline,location,country,coords}`, `origins[{key,label,country,time,emphasis,coords,labelOffset,at}]`, `infoLines[{text,size,at,fade}]`, `countryLabels`, `cameraPadding`, `theme`, `mapBackground`, `plate{background,blur,saturate,border,shadow}`, `plateOffsetX/Y`, `plateWidth`, `timing{establishSeconds,destinationAt,firstOriginAt,originStep,fadeSeconds,endImageAt,plate,title,tagline,location}` (alles in Sekunden). Prop `holdSeconds` = Endbild-Dauer; Gesamtdauer = `endImageAt` + `holdSeconds` (`routeCheckTimeline()`).
- **Beispiel:** `python3 scripts/new-route-check.py <slug> --name … --place … --heading … --subtitle … --origins "Basel|CH,…"`, dann das ausgegebene `<Composition>` (mit `calculateMetadata` über `routeCheckTimeline`) in `src/Root.tsx` einfügen; Referenz `NaturoparcRouteCheck`. Render: `npx remotion render src/index.ts NaturoparcRouteCheck out/naturoparc/NaturoparcRouteCheck.mp4` (≈ 80 s für 22 s).
- **Format:** 1920×1080, 30 fps, MP4; deckend (kein Alpha), also als eigene B-Roll-Szene, nicht als Overlay.
- **Einschränkungen:** Kacheln werden beim Rendern live von OpenFreeMap geladen (Internet nötig); Labeltexte fest deutsch/Auto (`· Auto ≈ …`, `📍`); nur Verkehrsmittel Auto; Label-Kollisionen im Endbild von Hand lösen (`labelOffset`, `countryLabels`); neue Farbpalette = Eintrag in `THEMES`; Infotafel/Text-Reveal sind intern (nicht einzeln exportiert).
- **Details/Standards:** `docs/BROLL_GUIDELINES.md` §13.

### 🧪 MulhouseRouteCheck — Referenzimplementierung Video 1
`src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx` (Composition `MulhouseRouteCheck`, 480 Frames). Städte, Texte, Routen (`public/geo/routes.geojson`) hartkodiert; bleibt unverändert, damit Video 1 gleich rendert. Neue Ziele nutzen `RouteCheck`.

### ✅ Karten-Assets
Dunkler und heller Kartenstil, Ländergrenzen, vendorter MapLibre-Worker (`public/maplibre/`, nötig, sonst laden Kacheln still nicht), deterministisches Rendern (`jumpTo` + `delayRender` auf `idle`). Muster siehe `RouteCheck.tsx` und `LEARNINGS.md`.

## 4. Titel- und Textanimationen

| Baustein | Status | Pfad | Kurz |
|---|---|---|---|
| Überschrift + Untertitel (Route Check) | ✅ | `RouteCheck.tsx` (`heading`/`subtitle`) | Fade 0,2–0,9 s, bleibt stehen |
| Text-Reveal `reveal()` | ✅ intern | `RouteCheck.tsx` | Fade + 10 px Aufwärtsbewegung, `easeOutCubic`, 0,6 s, pro Block `at`/`fade` in s; Platz ist von Frame 0 reserviert (nichts verschiebt sich) |
| Beat-System `layoutBeats` / `beatStyle` / `HeaderBeat` / `TextBeat` | 🧪 intern | `MulhouseTripScore.tsx` | `{enter, hold, exit}` je Botschaft, Crossfade-Überlappung, Länge = Summe der Phasen, 22 px Rise |
| Count-up Endscore + Puls | 🧪 intern | `MulhouseTripScore.tsx` (`FinalScene`) | 1 s Hochzählen, danach statischer Hold ≥ 4 s |
| Szenen-Captions mit Emojis | 📋 | — | Pilot NaturOparC (Standard §6) |

## 5. Informationskarten und transparente Overlays

| Baustein | Status | Pfad | Kurz |
|---|---|---|---|
| Glas-Infotafel | ✅ intern | `RouteCheck.tsx` (`config.plate`) | eigene Glas-Ebene (`backdrop-filter`) + deckende Textblöcke; Farbe/Alpha/Blur/Rahmen/Schatten konfigurierbar; Light-Standard `rgba(250,247,235,0.24)` + 5 px Blur |
| Dunkle Infotafel | ✅ intern | `RouteCheck.tsx` (Theme `dark`) | exakt wie Video 1: `rgba(8,10,15,0.65)`, kein Blur |
| Foto-Beats (Vollbild/Seitenlayout mit Textschutz-Verlauf, Ken Burns) | 🧪 intern | `MulhouseTripScore.tsx` (`SammlungBeat` …) | Foto + Text, Ken-Burns-Zoom 4 % |
| Echte Alpha-Overlays für CapCut (ProRes/WebM) | 📋 | — | für Wasserzeichen/Captions nötig; Export-Preset noch nicht angelegt |

## 6. Emojis und Illustrationen
- ✅ Emoji als Text im Layout (`📍` vor dem Ort in `RouteCheck`; Systemfont-Emoji, rendert in Remotion).
- 🧪 SVG-Bausteine in `MulhouseTripScore.tsx`: `StarIcon`, `RatingStar` (Teil-Füllung), `StarRow`, `CarSilhouette`.
- 📋 Humorvolle Emoji-Animation / Szenen-Captions / Illustrationen — nichts vorhanden; neu als eigene konfigurierbare Komponente (`src/lib` bzw. `src/<komponente>/`) bauen.

## 7. Visuelle Effekte
- ✅ **Frosted Glass** (siehe §5). ✅ **Route zeichnen** (SVG `pathLength=1` + `strokeDashoffset`, 24 Frames), Marker mit Spring (`damping 16, stiffness 120, mass 0.6, overshootClamping`) + Ring-Puls, ✅ **Kamera-Push-in** (≈ 4 % Zoom, kein Pan, `easeOutCubic`) — alle in `RouteCheck.tsx`.
- ✅ **Lighten-Blend-Hintergrundangleich** + feine Alpha-Maske (`TasanBrandIntro.tsx`).
- 🧪 **Premium-Hintergrund** (driftende Verläufe, Auto-Silhouette; `Background` in `MulhouseTripScore.tsx`), Ken Burns (`kenBurnsScale`).

## 8. Übergänge
- 🧪 `@remotion/transitions` `TransitionSeries` + `fade()` mit `linearTiming` 0,6 s (`MulhouseTripScore.tsx`; Band 0,5–0,9 s).
- ✅ Fade-out auf Hintergrundfarbe (`TasanBrandIntro.tsx`).
- 📋 Weitere Übergänge (Wisch, Zoom, Wasserzeichen-Reveal) bei Bedarf.

## 9. Soundeffekte
- Keine Komposition nutzt Soundeffekte. Nur das Intro trägt den Ton des Kling-Videos.
- 🧪 `public/brand/audio/*.wav` (8 Dateien `tasan-*.wav`) liegen aus früher Intro-Entwicklung im Repo, sind in keiner Komposition eingebunden und nicht freigegeben.
- 📋 SFX-Bibliothek (Whoosh, Pop, Klick) — Ton bleibt Aufgabe des Nutzers; Claude analysiert kein Audio (`LEARNINGS.md` → Ton).

## 10. Hilfsfunktionen und Werkzeuge
| Name | Pfad | Zweck |
|---|---|---|
| `routeCheckTimeline(cfg, holdSeconds, fps)` | `src/route-check/RouteCheck.tsx` | Zeitplan (Frames) und Gesamtdauer aus Config; in `calculateMetadata` nutzen |
| `cameraAt(frame, start, end, establish)` | dito | Kamera aus dem *aktuellen* Frame (Render-Tabs starten mitten im Video) |
| `layoutBeats`, `sceneDuration`, `beatStyle` | `MulhouseTripScore.tsx` | Phasen → absolute Frame-Fenster |
| `S(sec)`, `CLAMP`, `easeOutCubic`, `SPRING_CONFIG` | in 3 Dateien einzeln definiert | Zeit-/Easing-Primitive (Duplikat → Refactoring) |
| `scripts/new-route-check.py`, `scripts/fetch-routes.py` | `scripts/` | Route-Check-Gerüst bzw. OSRM-Routen cachen |
| Frame-Prüfung | `npx remotion ffmpeg -ss <t> -i <mp4> -frames:v 1 <png>` | echte MP4-Frames prüfen statt nur Stills |

## 11. Bekanntes Refactoring (nur dokumentiert, nicht vorsorglich umgesetzt)
Regel: erst extrahieren, wenn ein **zweiter** Verbraucher existiert.
1. `src/lib/` für Zeit-/Easing-Primitive (`S`, `CLAMP`, `easeOutCubic`, `SPRING_CONFIG`) — heute in `RouteCheck`, `TripScore`, `Intro` doppelt; beim nächsten neuen Baustein anlegen.
2. `GlassPlate` und `useReveal`/`RevealText` aus `RouteCheck.tsx` lösen, sobald Captions oder Review-Abschnitt sie brauchen.
3. `RouteCheck`: Beschriftungstexte (`· Auto ≈`, `📍`) und Verkehrsmittel in die Config (`labels`), falls ein Video Bahn/Fuß braucht.
4. `MulhouseRouteCheck` auf `RouteCheck` migrieren — nur mit bildgleicher Verifikation (Video 1 darf sich nicht ändern).
5. `MulhouseTripScore` → konfigurierbares `TripScore` (Inhalt in `src/<slug>/trip-score.json`) mit extrahiertem Beat-System, Sternen, Count-up; Voraussetzung: Video 2 braucht den Abschnitt (S8).
6. Unbenutzte `public/brand/audio/*.wav` klären (löschen oder einbinden) und Test-Composition `MulhouseTest` in `Root.tsx` entfernen, wenn Video 1 nicht mehr angefasst wird.
