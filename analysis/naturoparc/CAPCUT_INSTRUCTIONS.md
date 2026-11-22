# NaturOparC — Vorgeschlagene Reihenfolge + CapCut-Anweisungen

Basiert auf `editorial_editlist.csv` (redaktionelle Auswahl) und `content_review.md` (vollständige Analyse aller 54 Clips). Zielt auf ein ~4-minütiges Video; Hoch+Mittel-Priorität allein ergibt **212s (3:32) Rohmaterial** — das lässt realistisch Raum für TASAN-Brand-Intro, Übergänge und VO-Atmung innerhalb eines "ungefähr vier Minuten"-Ziels. Niedrig-Priorität-Clips (30s) sind optionaler Puffer, falls mehr Laufzeit gebraucht wird oder Voice-over mehr Breite verlangt.

## Vorgeschlagene Reihenfolge

### 1. Hook (0–~20s, ohne Sprechertext)
1. `0039` 00:20–00:30 — Aufstieg zur Aussichtsplattform (Bewegung, Spannung)
2. `0039` 00:44–00:50 — Panorama-Reveal oben
3. Schneller Flash-Cut (je 1–2s): `0017` (Koi), `0041` (Schwarzschwäne), `0014` (Schildkröte) — Vorgeschmack auf das, was kommt

*(Danach: TASAN Brand Intro, Remotion-Render, separat — nicht Teil dieser Rohmaterial-Liste)*

### 2. Ankunft & Atmosphäre
4. `0002` 00:00–00:08 — Eingangsschild + Parkplatz
5. `0005` 00:10–00:20 — Überdachter Weg, Paar lächelt
6. `0006` 00:00–00:06 — Fachwerk-Märchenhäuschen
7. `0007` 00:00–00:10 — Weidenbaum-Teichweg

### 3. Erste Begegnung: Schildkröten
8. `0013` 00:12–00:20 — Weitwinkel
9. `0014` 00:20–00:36 — Nahaufnahme (Payoff)

### 4. Naturschutz-Geschichte
10. `0011` 00:00–00:03 — Insektenhotel
11. `0027` 00:00–00:02 + 00:06–00:09 — Präparate + "GRAND HAMSTER"-Trittsiegel
12. `0028` 00:00–00:10 + 00:18–00:28 — weitere Trittsiegel + Präparate-Röhrchen
13. `0038` 00:00–00:06 — Storchenruf-Schild + Wiederansiedlung-Infotafel
14. `0039` 01:14–01:18 — Storchennest (Payoff zur Geschichte; **nicht** identisch mit dem Hook-Ausschnitt desselben Clips)

### 5. Direkte Tierbegegnungen
15. `0017` 00:00–00:10 — Koi-Fütterung (volle Länge, nicht nur der Hook-Flash)
16. `0054` 00:00–00:10 — Ziege füttern
17. `0043` 00:10–00:16 — Geruchs-Station
18. `0046` 00:24–00:34 — Klangpfosten spielen

### 6. Wasserwelt
19. `0020` 00:16–00:28 — Aquarium-Tunnel
20. `0035` 00:16–00:20 — Otter-Tunnel-Architektur
21. `0037` 00:02–00:06 — **bestätigter Otter**
22. `0042` 00:04–00:12 — Enten schwimmen
23. `0041` 00:16–00:24 — Schwarzschwäne laufen (volle Länge)
24. `0051` 00:04–00:10 — Schwarzschwäne trinken
25. `0016` 00:00–00:06 — Wasservögel am Ufer

### 7. (Optional, bei Zeit/Bedarf — Niedrig-Priorität)
26. `0031` 00:00–00:08 — Nagetier-Fütterung
27. `0053` 00:30–00:36 — Schwein
28. weitere Niedrig-Clips nach Bedarf

### 8. Schluss
29. `0055` 00:00–00:04 — SORTIE-Schild
30. `0056` 00:16–00:24 — Rückweg, Bergblick

---

## Konkrete CapCut-Schritte

1. **Neues Projekt / bestehende Timeline öffnen.** Rohdateien liegen unverändert in `capcut/2026 - Naturoparc Colmar/Raw/` — in CapCut importieren, nicht verschieben/umbenennen.
2. **Grob in der obigen Reihenfolge auf die Timeline ziehen.** Nutze dabei direkt die Start-/Endzeiten aus `editorial_editlist.csv` als Trimm-Richtwerte (Spalten `Startzeit`/`Endzeit`) — das spart das erneute Durchsuchen jedes Clips.
3. **Erst grob schneiden, dann fein nachziehen** nach Sichtung in voller Auflösung/Bewegung — die hier genannten Zeiten sind aus 2-Sekunden-Standbildern abgeleitet, keine frame-genauen Schnittpunkte (siehe `docs/FOOTAGE_ANALYSIS.md` §6 zur Genauigkeits-Grenze).
4. **Otter-Clip (`0037`, 00:02–00:06) zuerst in voller Bewegtbild-Geschwindigkeit ansehen**, bevor er final geschnitten wird — die Otter-Sichtung basiert auf Einzelbildern bei 0,5s-Abstand; im echten Video lässt sich der exakte beste Ausschnitt (ruhiger/klarer Moment) noch genauer eingrenzen.
5. **Lücken für später lassen:**
   - Direkt nach dem Hook: Platz für den TASAN-Brand-Intro-Render (`out/brand/TasanBrandIntro.mp4`, nach dem bekannten Re-Render mit dem Lighten-Blend-Fix).
   - An den mit "Naturschutz-Geschichte" markierten Stellen: Platz für eine künftige Remotion-Grafik (z. B. Storch-Infografik), falls gewünscht.
   - Für das Gesamtkonzept (Cost Check, Trip Check, Planning Check, Trip Score) gilt weiterhin der Standard-Workflow aus `PROJECT_STATUS.md`/`docs/BROLL_GUIDELINES.md` — diese Grafiken kommen separat hinzu, nicht aus dem Rohmaterial.
6. **Musik/Natur-Geräusche/Voice-over** erst nach dem groben Rohschnitt ergänzen, wie im Standard-Workflow vorgesehen (Phase 4/5 in `PROJECT_STATUS.md`).
7. **Unsichere Artbestimmungen klar markieren, nicht im Video behaupten:** Für die Szenen mit Clip 0022/0024 (vermutete Störche) und 0030–0033 (vermutetes Capybara) im Voice-over entweder vorsichtig formulieren ("vermutlich...") oder beim Ansehen des Originalvideos in CapCut die Art eindeutig bestimmen, bevor eine feste Aussage im Sprechertext landet.

## Wo die Dateien liegen

- Vollständige Analyse (alle 54 Clips, nichts gekürzt): `analysis/naturoparc/content_review.md`
- Redaktionelle Schnittliste (diese Auswahl, als CSV): `analysis/naturoparc/editorial_editlist.csv`
- Technische Schnittliste (ffprobe/Heuristik, zum Vergleich): `analysis/naturoparc/editlist.csv`
- Galerie zum Nachschauen: `analysis/naturoparc/gallery.html`
- Kontaktabzüge (Beleg für diese Analyse): `analysis/naturoparc/contact_sheets/`
