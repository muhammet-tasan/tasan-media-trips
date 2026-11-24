# NaturOparC — Finaler Schnittplan (nach `docs/PRODUCTION_STANDARDS.md`)

Überarbeitung von `CAPCUT_INSTRUCTIONS.md` (alte Fassung) nach den neuen, verbindlichen Produktionsstandards. Basis: die bereits abgeschlossene vollständige Analyse aller 54 Clips (`content_review.md`) — **keine erneute Videoanalyse nötig**, nur eine redaktionelle Neustrukturierung der Reihenfolge und Auswahl.

Begleitdatei mit allen Einzelschnitten: `FINAL_TIMELINE_PLAN.csv`.

## Was sich gegenüber der alten Fassung ändert

| Alt (`CAPCUT_INSTRUCTIONS.md`) | Neu (dieser Plan) | Warum |
|---|---|---|
| Hook = Treppenaufstieg (0039) + Panorama + Flash-Cuts | Hook = nur schnelle Tier-Flashcuts (Koi, Otter, Schwarzschwäne, Ziege), ~8s | `PRODUCTION_STANDARDS.md` §4 + explizite Vorgabe: Hook mit starken Tiermomenten beginnen, kein langer Aufstieg |
| Panorama/Treppenaufstieg prominent im Hook | Panorama bleibt als kurzer Highlight-Moment *im Hauptteil*, Treppenaufstieg entfällt komplett | Vermeidet, dass der stärkste Bewegungsmoment "verbraucht" wird, bevor die Geschichte beginnt |
| Paar lächelt direkt in die Kamera (0005) als Ankunftsszene | entfernt | Erkennbares Gesicht eines Familienmitglieds — verstößt gegen §2 |
| Baby-Moment (0003) nicht verwendet | weiterhin nicht verwendet | War schon vorher ausgeschlossen (zu lang/redundant); zusätzlich jetzt auch durch §2 bestätigt ausgeschlossen |
| Junge spielt Klangpfosten (0046), Gesicht ggf. erkennbar | entfernt | Für ein ~4-Minuten-Video nicht benötigt; Gesichtserkennbarkeit aus Standbildern nicht sicher beurteilbar — einfacher, die Szene ganz wegzulassen statt sie bedingt aufzunehmen |
| TASAN Brand Intro als eigener Zeitblock direkt nach dem Hook | Kein eigener Zeitblock — Wasserzeichen-Animation (neuer Branding-Standard) als **Platzhalter-Overlay** simultan zur laufenden Aufnahme vermerkt | §3: neue Branding-Idee ist Wasserzeichen-Reveal, der die Geschichte nicht unterbricht; aktuelle `TasanBrandIntro`-Komponente bewusst nicht verändert/verwendet |
| Nagetier-Fütterung (0030–0033) als optionaler Niedrig-Clip | entfernt | Art weiterhin nicht sicher bestimmt (siehe `content_review.md`), Personen (Vater+Sohn) im Vordergrund — passt weder zu "Tiere im Fokus" noch sauber zu §2 |

## Zielwerte

- **Gesamtlänge:** Richtwert ca. 4 Minuten (240s)
- **Hook:** ca. 8 Sekunden, kein Sprechertext
- **Rohmaterial-Summe laut CSV:** ca. 162s (2:42) reine Clip-Länge
- **Differenz zu 4 Minuten:** bewusst offen gelassen für VO-Atmosphäre/Haltezeiten auf einzelnen Einstellungen, 1–2 Informationsgrafik-Plätze (Route Check / Planning Check / Trip Score — jeweils ca. 10–16s laut `docs/BROLL_GUIDELINES.md`) und das Wasserzeichen-Overlay (kein eigener Zeitblock). Das ist bewusst ein Richtwert, keine Sekunden-exakte Vorgabe — Feinabstimmung erfolgt in CapCut anhand der tatsächlichen Voice-over-Länge.

## Struktur

### 1. Hook (~8s, ohne Sprechertext)
Schnelle Flashcuts bestätigter Tiermomente, kein Treppenaufstieg, keine Erklärung — nur Neugier wecken:
1. `0017` Koi-Fütterung (Close-up)
2. `0037` Otter schwimmend
3. `0041` Schwarzschwäne
4. `0054` Ziege gefüttert

### 2. Branding-Platzhalter (kein Zeitblock)
Wasserzeichen-Reveal (§3) überlagert den Übergang in die Ankunftsszene — **nicht implementieren**, nur als Platzhalter-Zeile in der CSV vermerkt. Aktuelle `TasanBrandIntro` bleibt unverändert.

### 3. Ankunft & Orientierung (~18s)
Kurze Einordnung: wo sind wir (Elsass, NaturOparC), Einstieg in den Park. VO beginnt hier.
5. `0002` Eingangsschild + Parkplatz
6. `0007` Weidenbaum-Teichweg

### 4. Erste Begegnung: Schildkröten (~16s)
7. `0013` Weitwinkel
8. `0014` Nahaufnahme (Payoff)

### 5. Naturschutz-Geschichte (~20s)
Storch- und Hamster-Artenschutz — das inhaltliche Alleinstellungsmerkmal gegenüber reinen Highlight-Reels.
9. `0038` Storchenruf-Schild + Infotafel Wiederansiedlung
10. `0039` Storchennest (Payoff — bewusst die einzige Verwendung von Clip 0039 in diesem Plan)
11. `0027` "GRAND HAMSTER"-Trittsiegel
12. `0028` Präparate-Röhrchen

### 6. Direkte Tierbegegnungen (~26s)
Fokus auf Interaktion (Hände/Tier), nicht auf Gesichter.
13. `0017` Koi-Fütterung, volle Länge
14. `0054` Ziege füttern, volle Länge
15. `0043` Geruchs-Drehscheiben-Station

### 7. Wasserwelt (~34s)
16. `0020` Aquarium-Tunnel
17. `0037` Otter (Haupt-Moment, anderer Ausschnitt als im Hook)
18. `0042` Enten schwimmen
19. `0041` Schwarzschwäne laufen, volle Länge
20. `0051` Schwarzschwäne trinken

### 8. Highlight: Aussicht (~6s)
Kurzer Panorama-Payoff — ohne den langen Aufstieg davor zu zeigen.
21. `0039` Panorama-Reveal von der Plattform

### 9. Praktische Besucherinfos (~8s + optionale Grafik)
22. `0019` Imbiss-/Picknickbereich — VO liefert die eigentliche Praxisinfo (Dauer, Verpflegung, Preise); optional Platz für Cost-Check- oder Planning-Check-Grafik.

### 10. Ehrliches Fazit (~14s + optionale Grafik)
23. `0034` Seerosen-Teich als ruhiger Stimmungsshot für das persönliche Fazit; optional Platz für Trip-Score-Grafik.

### 11. Abschluss (~12s)
24. `0055` SORTIE-Schild
25. `0056` Rückweg zum Auto, Bergblick

## Vor dem finalen Schnitt in CapCut prüfen (§2-Check)

Dieser Plan verwendet bewusst keine Einstellung, in der ein Familienmitglied direkt in die Kamera blickt oder im Vordergrund im Fokus steht (siehe Tabelle oben: `0005`/`0046` entfernt bzw. nicht aufgenommen). Trotzdem gilt vor dem finalen Schnitt:
- Bei `0017` (Koi-Fütterung) und `0054` (Ziege füttern) in voller Bewegtbildqualität prüfen, dass der Ausschnitt tatsächlich auf Hände/Tier fokussiert bleibt und kein Gesicht zufällig ins Bild gerät.
- Jede Einstellung mit Personen im Hintergrund von Tier-/Landschaftsshots — falls ein Gesicht zufällig erkennbar ins Bild gerät, Ausschnitt anpassen oder Einstellung verkürzen.

## Unsichere Artbestimmungen (unverändert aus `content_review.md`)

Dieser Plan verwendet keine Clips mit unsicherer Artbestimmung (Störche in der Freilandvoliere 0022/0024, vermutetes Capybara 0030–0033) als eigenständige Szenen — entweder weil die Personen im Vordergrund stehen (0030–0033) oder weil sie für dieses kürzere ~4-Minuten-Video nicht benötigt werden. Falls sie in einer späteren, längeren Fassung doch verwendet werden, gilt weiterhin: im Voice-over vorsichtig formulieren ("vermutlich...") statt sie als bestätigt darzustellen.

## Timing-Hinweis

Alle Zeiten in `FINAL_TIMELINE_PLAN.csv` sind aus 2-Sekunden-Standbildern geschätzt (bzw. 0,5s für den Otter-Clip 0037, siehe `content_review.md`), keine frame-genauen Schnittpunkte. Vor dem finalen Schnitt in CapCut in voller Bewegtbildgeschwindigkeit ansehen und präzisieren (siehe `docs/FOOTAGE_ANALYSIS.md` §6 zur Genauigkeitsgrenze).

## Wo die Dateien liegen

- Diese Übersicht: `analysis/naturoparc/FINAL_TIMELINE_PLAN.md`
- Einzelschnitte als CSV: `analysis/naturoparc/FINAL_TIMELINE_PLAN.csv`
- Vollständige Clip-Analyse (Grundlage, unverändert): `analysis/naturoparc/content_review.md`
- Vorherige Fassung (Referenz, nicht mehr aktueller Plan): `analysis/naturoparc/CAPCUT_INSTRUCTIONS.md` + `analysis/naturoparc/editorial_editlist.csv`
- Verbindliche Editorial-Standards hinter diesem Plan: `docs/PRODUCTION_STANDARDS.md`
