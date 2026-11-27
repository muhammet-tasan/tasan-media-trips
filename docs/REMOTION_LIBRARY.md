# TASAN MEDIA Trips — Remotion-Bibliothek (Katalog)

Zentraler Katalog aller selbst entwickelten Remotion-Bausteine. Einstieg: `/my-remotion-library` (zeigt standardmäßig nur die **Toolbox** unten; Technik nur auf Nachfrage bzw. aus den Abschnitten 1–11). **Vor jeder neuen Remotion-Arbeit zuerst hier nachsehen**; nach jeder freigegebenen Komponente hier eintragen (Regeln: `docs/PRODUCTION_STANDARDS.md` §9). Der Katalog verweist auf Code und Doku, er wiederholt keine Details.

## Toolbox (Quelle der einfachen Standardausgabe von `/my-remotion-library`)
Nur **verfügbare, eigenständig nutzbare** Komponenten, ohne Technik. Neue freigegebene Komponente = eine Zeile hier (Kategorie · Name · ein Satz Klartext) **plus** technischer Eintrag unten. Leere Kategorien (Emojis und Illustrationen, Übergänge, Soundeffekte) werden nicht angezeigt, bis es etwas Eigenständiges gibt.

| Kategorie | Name | Was sie macht |
|---|---|---|
| Szenen | RouteCheck | Anfahrts-Szene mit echter Karte, Routen, Fahrzeiten und Infotafel (Parkplatz, Bus); Standard-Design «Editorial Travel Map» (grün/terrakotta, ohne Tafel, mit Linien-Icons), hell/dunkel als Altbestand, alle Zeiten einstellbar |
| Szenen | TasanBrandIntro | Das animierte TASAN-Logo-Intro in 4K, sanft ausgeblendet |
| Titel und Textanimationen | AnimatedTitle | Große Überschrift mit Untertitel, die einmal sanft einblendet und stehen bleibt |
| Titel und Textanimationen | TextReveal | Beliebiger Text blendet ruhig ein und steigt dabei minimal nach oben |
| Designelemente | GlassPanel | Durchscheinende Milchglas-Tafel, hinter der die Karte oder das Bild erkennbar bleibt |
| Designelemente | DarkPanel | Dunkle, halbtransparente Tafel im TASAN-Look von Video 1 |
| Animationseffekte | RouteDraw | Eine Fahrtroute zeichnet sich Stück für Stück auf die Karte |
| Animationseffekte | MarkerPulse | Ein Ortspunkt springt ein und sendet einen Puls-Ring aus (oder ruhig ohne Puls) |

Status: ✅ verfügbar (konfigurierbar, wiederverwendbar) · 🧪 vorhanden, aber videospezifisch/intern (nur nach Refactoring oder als Vorlage nutzbar) · 📋 geplant (existiert nicht).
Alle Kompositionen: Export-Standard `PRODUCTION_STANDARDS` §10 (4K UHD, 30 fps, H.264 CRF 16, Rec. 709, AAC 48 kHz; in `remotion.config.ts`; 1080p-Szenen mit `--scale=2`), MP4 über `npx remotion render src/index.ts <CompositionId> out/<slug>/<CompositionId>.mp4`; Einzelbild `npx remotion still …`. Registrierung in `src/Root.tsx`. Design-/Timing-Standards und Nutzerpräferenzen: `docs/BROLL_GUIDELINES.md` (§13 Route Check, §14 bewährte Muster).

## 1. Vollständige Videosequenzen

### 🧪 MulhouseTripScore — Urteil-Sequenz („TASAN Trip Score“)
- **Was:** 8 Szenen (Frage/Kontext, was gefiel, was nicht, Community-Bewertungen, Zielgruppe, persönliches Zitat, Sterne-Übersicht, Endscore mit Count-up), dunkler Premium-Hintergrund, Fotos mit Ken Burns, Crossfades.
- **Einsatz:** Bewertungs-/Fazit-Abschnitt (S8). Als Vorlage für ein späteres konfigurierbares `TripScore`.
- **Pfad:** `src/mulhouse-automobile-museum/MulhouseTripScore.tsx` · Composition `MulhouseTripScore` (Dauer berechnet: Summe der Szenen − 7 × 0,6 s).
- **Konfiguration:** keine; Inhalte sind Konstanten am Dateianfang (`COMMUNITY_RATINGS`, `FINAL_CATEGORIES`, `QUOTE_LINES`, `IMAGES`, Texte). Score wird berechnet, nie hartkodiert.
- **Einschränkungen:** komplett Mulhouse-spezifisch (Texte, Fotos, Noten), 1092 Zeilen in einer Datei; Dark/Gold fest.
- **Beispiel:** `npx remotion render src/index.ts MulhouseTripScore out/<slug>/MulhouseTripScore.mp4`
- **Standard-Design (final, 2026-11-27):** Theme `editorial` ist der Default: Inter, Waldgrün/Graugrün/Terrakotta, linksbündiger Infoblock bei 8 % Breite ohne Container, `Icon`-SVGs, abgeschwächte Karte ohne Orts-Beschriftungen. Details und Maße: `BROLL_GUIDELINES` §14; Referenz-Config `NATUROPARC_ROUTE_CHECK_EDITORIAL_CONFIG` (`src/naturoparc/NaturoparcRouteCheck.tsx`, Composition `NaturoparcRouteCheckEditorial`).
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
- **Konfiguration** (Typ `RouteCheckConfig`, im Code dokumentiert): `heading`, `subtitle`, `destination{name,tagline,location,country,coords}`, `origins[{key,label,country,time,emphasis,coords,labelOffset,at}]`, `infoLines[{text,size,at,fade}]`, `countryLabels`, `cameraPadding`, `theme` (Standard `editorial`; `light`/`dark` = Altbestand), `infoLines[].icon` (`parking`/`bus`), `mapBackground`, `plate{background,blur,saturate,border,shadow}`, `plateOffsetX/Y`, `plateWidth`, `timing{establishSeconds,destinationAt,firstOriginAt,originStep,fadeSeconds,endImageAt,plate,title,tagline,location}` (alles in Sekunden). Prop `holdSeconds` = Endbild-Dauer; Gesamtdauer = `endImageAt` + `holdSeconds` (`routeCheckTimeline()`).
- **Beispiel:** `python3 scripts/new-route-check.py <slug> --name … --place … --heading … --subtitle … --origins "Basel|CH,…"`, dann das ausgegebene `<Composition>` (mit `calculateMetadata` über `routeCheckTimeline`) in `src/Root.tsx` einfügen; Referenz `NaturoparcRouteCheck`. Render: `npx remotion render src/index.ts NaturoparcRouteCheck out/naturoparc/NaturoparcRouteCheck.mp4 --scale=2` (4K).
- **Format:** entworfen in 1920×1080, Ausgabe 3840×2160 mit `--scale=2` (Standard §10), 30 fps, MP4; deckend (kein Alpha), also als eigene B-Roll-Szene, nicht als Overlay.
- **Einschränkungen:** Kacheln werden beim Rendern live von OpenFreeMap geladen (Internet nötig); Labeltexte fest deutsch/Auto (Emoji-Pin nur noch in light/dark) (`· Auto ≈ …`, `📍`); nur Verkehrsmittel Auto; Label-Kollisionen im Endbild von Hand lösen (`labelOffset`, `countryLabels`); neue Farbpalette = Eintrag in `THEMES`; Kamera-Push-in (`cameraAt` + MapLibre `jumpTo`) ist an die Karte gebunden und bewusst Teil von `RouteCheck`. Gebaut aus `AnimatedTitle`, `TextReveal`, `GlassPanel`/`DarkPanel`, `RouteDraw`, `MarkerPulse` (§4–§7).
- **Details/Standards:** `docs/BROLL_GUIDELINES.md` §13.

### 🧪 MulhouseRouteCheck — Referenzimplementierung Video 1
`src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx` (Composition `MulhouseRouteCheck`, 480 Frames). Städte, Texte, Routen (`public/geo/routes.geojson`) hartkodiert; bleibt unverändert, damit Video 1 gleich rendert. Neue Ziele nutzen `RouteCheck`.

### ✅ Karten-Assets
Dunkler und heller Kartenstil, Ländergrenzen, vendorter MapLibre-Worker (`public/maplibre/`, nötig, sonst laden Kacheln still nicht), deterministisches Rendern (`jumpTo` + `delayRender` auf `idle`). Muster siehe `RouteCheck.tsx` und `LEARNINGS.md`.

## 4. Titel- und Textanimationen

| Baustein | Status | Pfad | Kurz |
|---|---|---|---|
| `AnimatedTitle` — Überschrift + Untertitel | ✅ | `src/components/AnimatedTitle.tsx` | Props `title`, `subtitle`, `color`, `subtitleColor`, `shadow`, `fadeFrom/fadeTo` (Frames, Standard 6–28), `top`, `titleSize`, `subtitleSize`; zentriert oben, bleibt nach dem Einblenden stehen. Beispiel: `<AnimatedTitle title="…" subtitle="…" color="#1f3d2b" subtitleColor="rgba(31,61,43,0.7)" />` |
| `TextReveal` — Text-Reveal | ✅ | `src/components/TextReveal.tsx` | Props `at`, `duration` (Frames), `rise` (px, Standard 10), `style`; rendert ein `<div>` mit Opacity/Transform, `easeOutCubic`; Platz von Frame 0 reserviert (nichts verschiebt sich). Beispiel: `<TextReveal at={90} duration={18} style={{fontSize: 38}}>Tier- und Naturpark</TextReveal>` (Route Check rechnet Sekunden aus der Config in Frames um) |
| Beat-System `layoutBeats` / `beatStyle` / `HeaderBeat` / `TextBeat` | 🧪 intern | `MulhouseTripScore.tsx` | `{enter, hold, exit}` je Botschaft, Crossfade-Überlappung, Länge = Summe der Phasen, 22 px Rise |
| Count-up Endscore + Puls | 🧪 intern | `MulhouseTripScore.tsx` (`FinalScene`) | 1 s Hochzählen, danach statischer Hold ≥ 4 s |
| Szenen-Captions mit Emojis | 📋 | — | Pilot NaturOparC (Standard §6) |

## 5. Informationskarten und transparente Overlays

| Baustein | Status | Pfad | Kurz |
|---|---|---|---|
| `GlassPanel` — Glas-Tafel | ✅ | `src/components/GlassPanel.tsx` | Props `style` (Position/Größe), `background` (inkl. Alpha), `blur`, `saturate`, `border`, `shadow`, `radius`, `padding`, `fadeIn{at,duration}`; eigene Glas-Ebene (`backdrop-filter`, funktioniert im Render) + deckender Inhalt; Standard `rgba(250,247,235,0.24)` + 5 px Blur; Platzbedarf des Inhalts von Frame 0 → feste Größe |
| `DarkPanel` — dunkle Tafel | ✅ | `src/components/GlassPanel.tsx` | gleiche Props wie `GlassPanel`, Standard dunkle Füllung `rgba(8,10,15,0.65)`, kein Blur (Look von Video 1, Route-Check-Theme `dark`) |
| `PlainText` — Text ohne Tafel | ✅ | `src/components/GlassPanel.tsx` | gleiche Box/Padding wie `GlassPanel` (Text liegt an derselben Stelle), aber ohne Fläche, Blur, Rahmen und Schatten; nur `textShadow`. Im Route Check per `config.plate.enabled: false` (+ optional `plate.textShadow`) |
| `Icon` — Linien-Icons | ✅ | `src/components/Icons.tsx` | `name` `parking` \| `bus` \| `pin`, `size`, `color`; 24er-viewBox, Strich = Farbe, keine Emojis (Route-Check-Theme `editorial`) |
| Foto-Beats (Vollbild/Seitenlayout mit Textschutz-Verlauf, Ken Burns) | 🧪 intern | `MulhouseTripScore.tsx` (`SammlungBeat` …) | Foto + Text, Ken-Burns-Zoom 4 % |
| Echte Alpha-Overlays für CapCut (ProRes/WebM) | 📋 | — | für Wasserzeichen/Captions nötig; Export-Preset noch nicht angelegt |

## 6. Emojis und Illustrationen
- ✅ Emoji als Text im Layout (`📍` vor dem Ort in `RouteCheck`; Systemfont-Emoji, rendert in Remotion).
- 🧪 SVG-Bausteine in `MulhouseTripScore.tsx`: `StarIcon`, `RatingStar` (Teil-Füllung), `StarRow`, `CarSilhouette`.
- 📋 Humorvolle Emoji-Animation / Szenen-Captions / Illustrationen — nichts vorhanden; neu als eigene konfigurierbare Komponente (`src/lib` bzw. `src/<komponente>/`) bauen.

## 7. Visuelle Effekte
- ✅ `RouteDraw` — `src/components/RouteDraw.tsx`: Route zeichnet sich auf (SVG `pathLength=1` + `strokeDashoffset`) mit Casing; Props `points` (Pixelkoordinaten), `start`/`end` (Frames), `color`, `casingColor`, `width` (3), `casingExtra` (2,2); eigener Vollbild-`<svg>`; funktioniert mit beliebigen Pixelpunkten, nicht nur Karten.
- ✅ `MarkerPulse` — `src/components/MarkerPulse.tsx`: Punkt mit Spring-Einblendung, Halo-Ring und optionalem Puls-Ring (34 Frames); Props `x`, `y`, `at`, `color`, `radius` (18), `haloGap`, `haloOpacity`, `haloWidth`, `pulse`, `fadeInFrames`, `springDelay`. Ruhiger Herkunftsmarker: `pulse={false} fadeInFrames={10} springDelay={4} haloGap={8} haloOpacity={0.4} haloWidth={1.5}`.
- ✅ Kamera-Push-in (≈ 4 % Zoom, kein Pan, `easeOutCubic`, `timing.establishSeconds`) — an die MapLibre-Karte gebunden, Teil von `RouteCheck.tsx` (`cameraAt`); bewusst nicht als eigene Komponente (nicht ohne Karte nutzbar).
- ✅ Lighten-Blend-Hintergrundangleich + feine Alpha-Maske (`TasanBrandIntro.tsx`); Fade-out des Intros (Opacity + Ton, an die Kling-Quelle gebunden) bewusst nicht ausgelagert.
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
| `FONT`, `CLAMP`, `easeOutCubic`, `SPRING_CONFIG` | `src/components/shared.ts` | gemeinsame Primitive der Komponenten (freigegebene Werte); `MulhouseTripScore`/`TasanBrandIntro` haben noch eigene Kopien (unangetastet, freigegeben) |
| `scripts/new-route-check.py`, `scripts/fetch-routes.py` | `scripts/` | Route-Check-Gerüst bzw. OSRM-Routen cachen |
| Frame-Prüfung | `npx remotion ffmpeg -ss <t> -i <mp4> -frames:v 1 <png>` | echte MP4-Frames prüfen statt nur Stills |

## 11. Bekanntes Refactoring
Erledigt (2026-11-27): `TextReveal`, `AnimatedTitle`, `GlassPanel`/`DarkPanel`, `RouteDraw`, `MarkerPulse` und `shared.ts` aus `RouteCheck.tsx` in `src/components/` gelöst; `RouteCheck` rendert bildgleich zum vorherigen Stand (MP4-Vergleich). Bewusst nicht gelöst: Kamera-Push-in (kartengebunden) und Intro-Fade-out (trivial, an die Kling-Quelle gebunden).

Offen (nur dokumentiert, erst bei Bedarf):
1. `RouteCheck`: Beschriftungstexte (`· Auto ≈`, `📍`) und Verkehrsmittel in die Config (`labels`), falls ein Video Bahn/Fuß braucht.
2. `MulhouseRouteCheck` auf `RouteCheck` migrieren — nur mit bildgleicher Verifikation (Video 1 darf sich nicht ändern).
3. `MulhouseTripScore` → konfigurierbares `TripScore` (Inhalt in `src/<slug>/trip-score.json`) mit herausgelöstem Beat-System, Sternen (`RatingStar`), Count-up und Foto-Beats; dabei `shared.ts` statt eigener Kopien nutzen; Voraussetzung: Video 2 braucht den Abschnitt (S8).
4. Unbenutzte `public/brand/audio/*.wav` klären (löschen oder einbinden) und Test-Composition `MulhouseTest` in `Root.tsx` entfernen, wenn Video 1 nicht mehr angefasst wird.
5. Neue Komponenten aus geplanten Funktionen (Szenen-Captions mit Emojis, Wasserzeichen-Reveal, Alpha-Export für CapCut) als eigenständige Komponenten in `src/components/` bauen und in die Toolbox eintragen.
