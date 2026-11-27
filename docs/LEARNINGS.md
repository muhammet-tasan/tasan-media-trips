# TASAN MEDIA Trips — Learnings (alle Videos)

Sammlung von Erkenntnissen, Tipps und Tricks, die in jedem Video dazukommen. Wird am Ende jeder Session (Closeout) und im Rückblick (Prozessstufe S12) ergänzt und vor jeder Prozessstufe gelesen (`/my-next-task`, `/my-review-roughcut`). Kurz halten: ein Eintrag = eine Erkenntnis, mit Quelle und der Stufe, auf die sie wirkt.

Format: `- **Learning** — Warum/Wie. *(Quelle, Datum · Stufe)*`

## Schnitt & Dramaturgie (S2/S3)
- **Starke, schnelle Tiermomente als Hook, nicht der lange Aufstieg** — der stärkste Bewegungsmoment soll nicht vor der Geschichte „verbraucht“ werden. *(NaturOparC, 2026-11-23 · S3)*
- **Keine starren Sekundenregeln pro Einstellung** — Länge nach Inhalt/Handlung; ruhige Aufnahmen nur so lange, wie sie interessant bleiben. *(PRODUCTION_STANDARDS §5 · S3)*
- **Rohschnitt kommt vom Nutzer, Review von Claude** — kreative Auswahl bleibt beim Nutzer; Claude findet übersehene Szenen und zeitbasierte Schwächen. *(2026-11-24 · S2/S3)*
- **Schätzungen aus 2-s-Standbildern sind nicht bildgenau** — Zeitangaben als ±1–2 s behandeln; für schnelle Momente dichtere Frames (0,5 s) ziehen (so wurde ein Otter gefunden, der in 2-s-Bildern unsichtbar war). *(NaturOparC · S1/S3)*

## Erzählung & Voice-over (S4/S5)
- **Voice-over beschreibt nicht, was man sieht** — „hier sehen wir ein altes Auto“ ist schlecht; besser: warum es wichtig ist + praktische Besucher-Info. *(Mulhouse · S4)*
- **Erst Schnitt, dann Erzählung, dann Grafiken** — Grafikdauer folgt dem Sprechtext, nicht umgekehrt. *(Mulhouse RouteCheck: von 8 s auf 16 s gewachsen, weil 8 s die Inhalte nicht trugen · S6)*

## Grafiken & Remotion (S6/S7)
- **Route Check: echte Karte, echte Routen** — MapLibre + OpenFreeMap, OSRM-Routen lokal gecacht, Ländergrenzen als eigene Ebene; keine gezeichneten Phantasie-Karten. *(Mulhouse · S7)*
- **Remotion/MapLibre: deterministisch rendern** — Kamera nur mit `jumpTo()` (nie `flyTo`/`easeTo`), jede Kameraänderung hinter `delayRender()`/`continueRender()` auf das `idle`-Ereignis warten lassen; Worker-Dateien nach `public/maplibre/` vendoren, sonst laden Tiles still nicht. *(Mulhouse · S7)*
- **Phasen statt Gesamtdauer** — jede Einblendung als `{enter, hold, exit}`, Länge = Summe der Phasen, Exit überlappt das nächste Enter (Crossfade). *(MulhouseTripScore · S7)*
- **Final-Frame-first** — erst das Endbild entwerfen, dann die Animation dahin; handytauglich lesbar (große Schrift auf Platten). *(BROLL_GUIDELINES §6, §9 · S6)*
- **Score wird berechnet, nie hartkodiert; Community-Bewertungen nur als Kontext** — verhindert, dass die Endzahl von den Teilnoten abdriftet. *(MulhouseTripScore · S8)*
- **Route Check ist Referenz, kein Baukasten** — `MulhouseRouteCheck.tsx` hat Städte/Herkunftsorte/Texte fest eingebaut, `public/geo/routes.geojson` enthält nur Mulhouse-Routen; für jedes neue Ziel: Pre-Build-Spezifikation (BROLL §12), Routen neu holen, anpassen. Wenn ein zweites Ziel gebaut ist, Gemeinsames in eine parametrisierte Komponente heben. *(2026-11-26 · S6/S7)*

- **Route Check ist jetzt konfigurierbar** — `src/route-check/RouteCheck.tsx` + `route-check.json` + `scripts/new-route-check.py` (Gerüst) / `fetch-routes.py`; neues Ziel = Skript laufen lassen + Label-Kollisionen im Endbild prüfen; Dauer per `holdSeconds`. Fakten wie Parkpreis/ÖPNV nur eintragen, wenn verifiziert. *(NaturOparC, 2026-11-27 · S7)*
- **Remotion-Render startet Tabs mitten im Video:** Kamera-Zustand beim Karten-Setup aus dem *aktuellen* Frame berechnen, nicht immer den Start-Frame (sonst ein herausgezoomtes Einzelbild); Stills und MP4-Frame gegeneinander prüfen. Hintergrund pro Video über `theme` (hell/cremig für familiäre Videos). *(NaturOparC, 2026-11-27 · S7)*
- **Overlay-Text flackert ±1 px im Render:** Positionen (`left/top`) auf ganze Pixel runden; Prüfung: Textrahmen über ~300 MP4-Frames messen (PIL) statt nur Standbilder ansehen. Glas-Effekt (`backdrop-filter`) wirkt auf heller Karte nur mit leicht getönter, sehr transparenter Fläche. *(NaturOparC, 2026-11-27 · S7)*
- **Windows:** Skript-Zwischendateien nicht nach `/tmp` schreiben (Python findet es nicht) — Scratchpad bzw. Projektpfad nutzen. *(2026-11-27)*

- **Erstes Review (NaturOparC):** ohne Hook liegen die ersten ~24 s ohne klares Tier; gleichförmiger ~3-s-Rhythmus über 51 Schnitte wirkt monoton; mehrere Schnitte aus demselben Standpunkt wirken wie Wiederholung; Besuchergesichter in Nahaufnahmen früh prüfen (Koi-Szene). *(2026-11-26 · S3)*
- **Schnittanleitung framegenau und in Abarbeitungsreihenfolge:** CapCut-Zeitformat `HH:MM:SS:FF`, Timeline- und Originalclip-Zeiten getrennt, Tabelle vom Ende zum Anfang, Hook zuletzt in Abspielreihenfolge; der Entwurf ändert sich zwischen Export und Anleitung — vor dem Erstellen den aktuellen Stand prüfen (hier: zwei neue Clips am Anfang verschoben alle Zeiten). *(2026-11-27 · S3)*
- **Review-Tiefe offenlegen:** ein 2-s-Raster über den Export ist keine Schnitt-für-Schnitt-Sichtung (kurze Schnitte fallen durchs Raster). Besser: ≥3 Frames pro Schnitt aus der Schnittliste, auf Kontaktbögen. *(2026-11-27 · S3)*
- **Familiäres Ausflugsvideo, kein Tiervideo:** ruhige Umgebungsszenen kürzen statt löschen; ein Hook darf Erlebnis/Aktivität (z. B. Brücken/Trittsteine) neben Tieren zeigen; Hook-Suche über das gesamte Material, nicht nur über Clips, die schon im Schnitt sind. *(2026-11-27 · S3/S6)*
- **CapCut-Kombinationsclips verstecken die Quellclips** — für ein Review besser vorher auflösen. *(2026-11-26 · S2/S3)*

## Branding (S6/S7)
- **TasanBrandIntro aus dem Original-Kling-Video komponieren, nicht nachbauen** — konstante Crop/Maske, Hintergrund per Blend-Modus angleichen (Lighten) statt hartem Farbabgleich. *(Mulhouse · S7)*
- **Wasserzeichen-Reveal statt eigener Intro-Block** — Logo erscheint über laufender Aufnahme und wandert in eine Ecke; unterbricht die Geschichte nicht (Standard §3, noch nicht gebaut). *(2026-11-23 · S6)*

## Ton (S9)
- **Ton ist Sache des Nutzers:** Claude analysiert niemals Audio (Pegel, Lautheit, Geräusche, Musik, Sprache) und baut dafür keine Messungen in Skripte oder Reviews ein. *(Nutzerentscheidung, 2026-11-27 · alle Stufen)*
- **Natürliches Umgebungsgeräusch gezielt nutzen**, Musik unter Sprache ducken, Platz für Sprecher lassen. *(Mulhouse · S9)*

## Recherche & Daten (S0/S8)
- **Bewertungen immer mit Quelle und Datum** — Google/Tripadvisor getrennt ausweisen, nie vermischen. *(Mulhouse · S8)*

## Privatsphäre (alle Stufen)
- **Keine erkennbaren Gesichter von Familienmitgliedern** — Fokus auf Tätigkeit, Hände, Tier; im Zweifel Szene weglassen statt bedingt aufnehmen. *(PRODUCTION_STANDARDS §2 · S3/S11)*

## Footage-Analyse (S1)
- **Technische Flags ≠ Inhalt** — ein „unscharfes“ Unterwasserbild kann inhaltlich eine starke Szene sein; getrennt bewerten. *(NaturOparC · S1)*
- **Kontaktbögen** (ein Bild pro Clip mit allen Zeitstempeln) machen eine Vollsichtung von 671 Thumbnails praktikabel. *(NaturOparC · S1)*
- **Ehrlich „nicht bestätigt“ sagen** (z. B. Tierart bei großer Entfernung) statt raten. *(NaturOparC · S1)*

## Werkzeuge & Prozess
- **Arbeitsstil:** Analyse gründlich, aber intern; im Chat nur die eine Schnittanleitung als Tabelle (Timecode | Szene | Änderung | Dauer | Priorität), ohne Kürzel und Zeilenverweise, mit vollständigem Dateinamen + Start/Ende bei neuem Material. *(2026-11-27)*
- **Projektgedächtnis:** Active-Video-Block + Registry + je Video ein Abschnitt; Skills lesen generisch und prüfen gegen Git; keine Videonamen in Skills/CLAUDE.md. *(2026-11-24)*
- **Git-Historie kann „pausiert“ nicht von „fertig“ unterscheiden** — Status beim Nutzer erfragen. *(2026-11-24)*
- **Benachrichtigungen sind eine Auftrags-Option** (`/my-notification-on` im Prompt), standardmäßig aus, per Hook erzwungen — nicht über Prompt-Anweisungen. *(2026-11-24)*
- **CapCut-Entwürfe sind lesbares JSON** (Schnittliste auslesbar, Generieren geparkt, `docs/CAPCUT_DRAFT_RESEARCH.md`); CapCut exportiert standardmäßig nach `%LOCALAPPDATA%\CapCut\Videos\<Entwurfsname>.mp4`. *(2026-11-26 · S2/S3)*
- **Pfade pro Video: Namen im Repo, Pfade pro Rechner lokal** — Tabelle `Video Assets (portable)` + `scripts/video_assets.py`. *(2026-11-24)*
