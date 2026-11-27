# TASAN MEDIA Trips — Produktionsprozess (gilt für jedes Video)

Fester Ablauf mit klaren Stufen, damit jedes Video gleich aufgebaut ist, schneller entsteht und sich Schritt für Schritt verfeinern lässt. Die Skills lesen diese Datei: **`/my-next-task` sagt anhand dieses Prozesses und der Belege im Projekt, welche Stufe jetzt dran ist** — niemand muss das jedes Mal neu überlegen.

Zusammenspiel der Dokumente:
- **Dieses Dokument** = *in welcher Reihenfolge* (Stufen, Wer, Erkennung, Ergebnis).
- `docs/PRODUCTION_STANDARDS.md` = *wie gut* (Kanal-Positionierung, Privatsphäre, Hook, Storytelling, Grafikkatalog, Review-Regeln).
- `docs/BROLL_GUIDELINES.md` = *wie* Remotion-Grafiken gebaut werden.
- `docs/LEARNINGS.md` = Erkenntnisse, Tipps, Tricks aus allen Videos — wird nach jeder Stufe/Session ergänzt und beim Planen der nächsten Stufe gelesen.
- `PROJECT_STATUS.md` → `## ▶ Active Video` hält fest, **bei welcher Stufe** das aktive Video steht (Feld *Process step*).

Rollen: **Nutzer** = kreative Entscheidungen, Schnitt in CapCut, Sprechen des Voice-overs. **Claude** = Analyse, Vorschläge, Fragen, Recherche, Remotion-Grafiken, Dokumentation. Claude baut keinen Rohschnitt und erzeugt keine CapCut-Projekte.

## Die Stufen

| # | Stufe | Wer | Erledigt, wenn (Belege) | Ergebnis |
|---|---|---|---|---|
| S0 | **Reise-Infos sammeln** (Preise, Parken, Dauer, Wetter, Route, Kinder-/Erwachsenen-Eignung, Google-Bewertungen) | Nutzer + Claude (Recherche) | `analysis/<slug>/TRIP_INFO.md` hat die Kategorien aus Status-Phase 2 | Faktenbasis für Grafiken, Voice-over, Fazit |
| S1 | **Rohmaterial sichten** (optional, unterstützend) | Claude (`scripts/footage-analysis/`) | `analysis/<slug>/content_review.md` vorhanden | übersehene Szenen später auffindbar |
| S2 | **Rohschnitt** — Szenenauswahl, kurze sinnvolle Schnitte | **Nutzer** in CapCut | CapCut-Entwurf hat Schnitte; Export in niedriger Qualität liegt vor (Resolver findet ihn) | Rohschnitt-Export |
| S3 | **Rohschnitt-Review & Standardabschluss** (Schleife) | Claude `/my-review-roughcut` → Nutzer: Änderungen von hinten nach vorn, Hook zuletzt, neuer Export → Claude: kurzes visuelles Abschlussreview (ohne Audio) | `ROUGHCUT_REVIEW*.md` vorhanden und Nutzer meldet „Schnitt steht“ (Freigabe) | Bildmaterial, Reihenfolge, Längen, Hook stehen → direkt weiter mit S4 |
| S4 | **Erzählung / Story** | Claude schlägt vor, **Nutzer entscheidet** | `analysis/<slug>/NARRATION.md` mit gewähltem Erzählstil + Gerüst pro Szene/Timecode | Sprechtext-Gerüst zum Nachsprechen |
| S5 | **Voice-over aufnehmen & anlegen** | Nutzer (Aufnahme, Sync, Audio komplett) | Voice-over liegt im Schnitt (Claude hört nicht hin); Claude passt nur Sprechtext und Schnittlängen anhand des Textes an, falls gewünscht | Schnitt trägt die Erzählung |
| S6 | **Grafik-Plan** (B-Roll, Overlays, Captions, Intro, Wasserzeichen, Review-Abschnitt) | Claude schlägt Liste mit Timecodes vor, Nutzer gibt frei | Liste in `analysis/<slug>/GRAFIKPLAN.md`, je Grafik: Typ, Timecode, Dauer, Inhalt, freigegeben ja/nein | freigegebene Spezifikationen (Pre-Build-Checkliste, BROLL §12) |
| S7 | **Grafiken bauen** (Remotion) und in CapCut importieren | Claude baut, Nutzer importiert | gerenderte Dateien in `out/<slug>/`, im Schnitt platziert | fertige Overlays/B-Rolls |
| S8 | **Bewertungsteil** (Top-5-Google-Kommentare, Trip-Kommentar des Nutzers, Fazit/Trip Score) | Claude wertet aus, Nutzer wählt/formuliert | Auswahl + Fazit-Text in `TRIP_INFO.md`; Grafik aus S7 enthält sie | Abschlussabschnitt |
| S9 | **Ton** — Musik, Ducking, Lautheit (komplett Aufgabe des Nutzers; Claude analysiert **kein** Audio) | Nutzer in CapCut | Nutzer meldet „Ton fertig“ | gemischter Ton |
| S10 | **Thumbnail, Titel, Beschreibung, Kapitel, Tags** | Claude schlägt 3 Varianten vor, Nutzer entscheidet | Dateien/Texte in `analysis/<slug>/PUBLISH.md` | Veröffentlichungspaket |
| S11 | **Finale Prüfung & Export** (Privatsphäre §2, Tempo, Untertitel — Ton prüft der Nutzer) | Claude `/my-review-roughcut` (finale Runde), Nutzer exportiert/uploaded | Prüfliste abgehakt | veröffentlicht |
| S12 | **Rückblick** | Claude + Nutzer | neue Einträge in `docs/LEARNINGS.md`, Prozess ggf. angepasst, Registry-Status `done` | Prozess wird besser |

Hinweise zur Reihenfolge:
- S8 (Bewertungsdaten) kann parallel zu S5–S7 vorbereitet werden, die Grafik kommt erst nach dem finalen Schnitt.
- Grafiken (S6/S7) erst planen, wenn der Schnitt steht und die Erzählung festliegt — Dauer richtet sich nach Sprechtext (BROLL §2).
- Der Rohschnitt wird so früh wie möglich geprüft (S3), weil spätere Stufen (Erzählung, Grafiken) auf dem Schnitt aufbauen.

## Was Claude in jeder Stufe tut (und fragt)

- **S3:** Review nach PRODUCTION_STANDARDS §7 (Zeitformat `HH:MM:SS:FF`, Abarbeitung vom Ende zum Anfang, Hook zuletzt, Standardabschluss); Ergebnis zeitbasiert; offen markieren, was nicht gesehen wurde. Ausgabe im Chat: nur die Schnittanleitung als Tabelle (PRODUCTION_STANDARDS §7), Analyse bleibt intern. Nach jeder Überarbeitung neue Runde (`_v2`, …).
- **S4:** zuerst Schnitt analysieren (Szenenfolge, Stimmung, Höhepunkte), dann **Nutzer fragen**: Welcher Erzählstil? (z. B. lustig-familiär, ruhig-informativ, Entdecker-Tagebuch, Tipps-und-Fazit), welche Perspektive (Ich/Wir/Kind), Zielgruppe, Länge des Sprechtextes, 1–2 Kernbotschaften. Danach **2–3 Vorschläge** mit Thema + Kurzfassung (je 3–4 Sätze) und einem Beispielsatz für Hook und Abschluss. Gewählte Variante → Gerüst pro Szene (Timecode, Kernaussage, ca. Wortzahl bei ~2,5 Wörtern/s), das der Nutzer nachspricht. Voice-over beschreibt nicht, was zu sehen ist (STATUS Phase 5).
- **S6:** Katalog prüfen (PRODUCTION_STANDARDS §6): Route Check, Cost Check, Trip Check, Planning Check, Trip Score, Szenen-Captions, Review-Abschnitt, Fazit, Logo/Wasserzeichen. Nur Grafiken mit echtem Informationswert; je Grafik Pre-Build-Spezifikation.
- **Route Check (Teil von S6/S7, Standard in jedem Video):** Beim Grafik-Plan immer einplanen (Katalog §6). Benötigte Eingaben, gesammelt in S0 (`TRIP_INFO.md`): Zielname + Untertitel/Ort, Herkunftsorte mit Ländercode (Standard: wichtigste Städte in 1 h Umkreis, erster = Hauptherkunft; Nutzer bestätigt), optional **verifizierte** Fahrzeiten, Parkplatz-/ÖPNV-Infos (nicht verifizierte weglassen). Bau: `python3 scripts/new-route-check.py <slug> …` (Geocoding, echte OSRM-Routen, Zeiten, Wrapper), `Composition` in `src/Root.tsx` eintragen, Endbild rendern und Beschriftungs-Kollisionen beheben, Zeiten nach Sprechtext setzen: `timing` in `route-check.json` (Sekunden je Textblock: Titel, Untertitel/Ort, Parkplatz, Bus …, `endImageAt`) + `holdSeconds` für das Endbild (NaturOparC vorläufig 21 s). Details: `docs/BROLL_GUIDELINES.md` §13. Da er nur von Ort/Herkunftsorten abhängt, kann er früh gebaut werden; die Dauer wird später angepasst.
- **S8:** Google-Bewertungen auswerten (Durchschnitt, Anzahl, Themencluster), Top-5-Kommentare nach Aussagekraft/Vielfalt wählen, wörtlich und nachvollziehbar zitieren, Quelle/Datum notieren, keine Namen von Privatpersonen ohne Notwendigkeit.
- **Immer:** Privatsphäre (§2) prüfen; unsichere Beobachtungen als „nicht bestätigt“ kennzeichnen.

## Fortschritt festhalten

- `PROJECT_STATUS.md` → `## ▶ Active Video`: Feld **Process step** (z. B. `S3 — Review v1 offen`), **Resume point**, **Next steps**. Das Closeout aktualisiert es; `/my-next-task` prüft es gegen die Belege (Tabelle oben) und meldet Abweichungen.
- Neues Video: Registry-Zeile + Asset-Zeile + Videoabschnitt anlegen (Closeout Schritt 0); `analysis/<slug>/` anlegen; mit S0/S1 beginnen oder, wenn schon geschnitten wurde, bei S2/S3 einsteigen.
- Neue Erkenntnisse → `docs/LEARNINGS.md` (Closeout Schritt „Learnings“), nicht nur in den Chat.

## Verfeinerung

Der Prozess ist bewusst ein Gerüst, das mit jedem Video besser wird: Im Rückblick (S12) wird entschieden, ob Stufen zusammengelegt, umsortiert oder automatisiert werden, und diese Datei sowie `docs/LEARNINGS.md` werden angepasst — ohne dass Skills umgeschrieben werden müssen.
