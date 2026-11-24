# TASAN MEDIA Trips — Production Standards

Verbindlicher editorialer Standard für **alle zukünftigen TASAN-Trips-Videos** — nicht nur für B-rolls (dafür gilt zusätzlich `docs/BROLL_GUIDELINES.md`), sondern für Planung, Schnitt und Storytelling insgesamt.

Diese Standards gelten automatisch, ohne dass sie pro Video neu erklärt werden müssen. Projektbezogene Ausnahmen sind möglich, aber nur wenn redaktionell begründet und explizit dokumentiert (z. B. als Session-Eintrag in `PROJECT_STATUS.md` oder als Notiz im jeweiligen Projektordner) — nie stillschweigend.

---

## 1. Kanal-Positionierung

TASAN Trips ist ein hochwertiger, moderner YouTube-Kanal für Reiseziele, Sehenswürdigkeiten und Ausflüge.

Fokus:
- Interessante Orte und Sehenswürdigkeiten
- Natur, Tiere, Landschaften
- Besondere Erlebnisse
- Informatives und ehrliches Storytelling
- Praktische Besucherinformationen
- Hochwertige Bildgestaltung und professioneller Schnitt

Visuell cineastisch, aber natürlich und authentisch.

**TASAN Trips ist ausdrücklich KEIN Familienvlog.**

## 2. Familienaufnahmen und Privatsphäre

Familienmitglieder stehen grundsätzlich nicht im Mittelpunkt.

Verbindlich:
- Möglichst keine erkennbaren Gesichter von Familienmitgliedern.
- Kinder/Familienmitglieder vorzugsweise von hinten, aus Distanz, oder ohne erkennbares Gesicht.
- Keine unnötigen Nahaufnahmen von Familienmitgliedern.
- Familienerlebnisse dürfen gezeigt werden, Fokus liegt aber auf der Aktivität, nicht der Person.
- Bei Tierfütterungen etc.: Hände, Tier, Interaktion zeigen statt Gesicht.
- Vor dem finalen Schnitt prüfen, ob Personen ausreichend anonym dargestellt sind.
- Keine automatischen Familien-/Kindersequenzen nur weil Material vorhanden ist — Auswahl nach Storytelling-Wert, nicht nach Verfügbarkeit.

Gilt standardmäßig für alle zukünftigen Videos.

## 3. Branding-Standard — geplante zukünftige Änderung (noch NICHT implementiert)

Das bisherige klassische TASAN-Intro (`TasanBrandIntro`) soll langfristig ersetzt werden.

**Status: nur als verbindlicher Designstandard dokumentiert.** Die konkrete Animation wird separat erstellt und optimiert; bestehende Branding-Komponenten bleiben bis dahin unverändert.

Neue Designidee:
1. Nach einem kurzen Hook erscheint der Schriftzug TASAN zentral im Bild.
2. Bleibt ca. 1 Sekunde prominent sichtbar.
3. Verkleinert sich elegant.
4. Schwebt/gleitet nach unten in eine dezente Wasserzeichenposition.
5. Die Videoaufnahme läuft nahtlos weiter.
6. Das Branding unterbricht die Geschichte nicht.

Designanforderungen: minimalistisch, hochwertig, ruhige moderne Animation, keine übertriebenen Effekte, keine langen Logo-Sequenzen, möglichst kein schwarzer Hintergrund/harter Cut, wiederverwendbar für zukünftige Videos.

## 4. Hook-Standard

Richtwert: ca. 6–10 Sekunden. Darf bei begründetem redaktionellem Bedarf abweichen.

- Kein Sprechertext während des Hooks.
- Direkt mit den interessantesten Aufnahmen beginnen.
- Keine langen Einleitungen oder langsamen Alltagsszenen.
- Mehrere starke Bilder dürfen schnell kombiniert werden.
- Die ersten Sekunden müssen Neugier erzeugen.
- Kein künstliches Clickbait.
- Keine unnötige Wiederholung der Hook-Highlights später im Video.

## 5. Schnitt- und Storytelling-Struktur

Keine einfache Aneinanderreihung aller guten Aufnahmen — die Videos erzählen eine nachvollziehbare Geschichte.

Grundstruktur (Reihenfolge je Reiseziel anpassbar):
Spannender Einstieg → kurze Orientierung zum Reiseziel → Sehenswürdigkeiten/Erlebnisse → interessante Informationen/Besonderheiten → praktische Besucherinformationen → ehrliche Bewertung/persönliches Fazit → kurzer natürlicher Abschluss.

Schnittregeln:
- Abwechslungsreicher Rhythmus.
- Ruhige Aufnahmen nur so lange zeigen, wie sie interessant bleiben.
- Szenen nicht künstlich verlängern.
- Kamerabewegungen bewusst einsetzen.
- Überwiegend saubere Hard Cuts.
- Effekte/Übergänge nur mit echtem Mehrwert.
- Natürliches Umgebungsgeräusch gezielt nutzen.
- Voice-over, Musik und Originalton sinnvoll kombinieren.
- Keine unnötigen Wiederholungen.
- Qualität vor Quantität.
- Keine starren Sekundenregeln pro Einstellung — Länge richtet sich nach Inhalt/Handlung.

## 6. Wiederverwendbare Informationsgrafiken

Der kanonische Katalog der Remotion-B-roll-Grafiktypen und ihre Design-/Timing-Standards leben in `PROJECT_STATUS.md` (Abschnitt „Production Workflow — Phase 3") und `docs/BROLL_GUIDELINES.md`. Dieser Abschnitt bestätigt sie als Teil der verbindlichen Standards, ohne sie zu duplizieren:

- Standort & Anreise (Route Check)
- Cost Check
- Planning Check
- TASAN Trip Check
- Google-Bewertungen
- TASAN Trip Score
- weitere nützliche Reiseziel-Infos nach Bedarf

Nicht jede Grafik muss in jedem Video erscheinen — Auswahl nach tatsächlichem Informationswert.

Anforderungen: einheitlich gestaltet, professionell und minimalistisch, gut lesbar, unterstützt den Film statt ihn zu unterbrechen, nach Möglichkeit über passendem Videomaterial eingeblendet. Google-Bewertungen müssen nachvollziehbar und korrekt wiedergegeben werden.

## 7. Produktions-Workflow: Rohschnitt durch den Nutzer, Review durch Claude

Verbindlich für alle Videos (seit 2026-11-24).

**Rollen**
- **Nutzer:** wählt die Szenen aus und erstellt den Rohschnitt selbst in CapCut (kreative Hoheit über Auswahl, Reihenfolge, Länge). Claude schlägt keinen Rohschnitt vor, den es dann selbst baut, und generiert keine CapCut-Projekte.
- **Claude:** analysiert den Rohschnitt und liefert konkrete, **zeitbasierte** Verbesserungsvorschläge. Entscheidungen bleiben beim Nutzer.

**Eingaben für das Review** werden **automatisch gefunden** (`scripts/video_assets.py`, Zuordnung pro Video in `PROJECT_STATUS.md` → `## Video Assets (portable)`: nur Ordnernamen; maschinenspezifische Pfade kommen aus Umgebungsvariable `TASAN_CAPCUT_ROOT`, optional der gitignorierten `.claude/local.json`, sonst `<Repo>/../capcut`). Nachgefragt wird nur, wenn etwas fehlt oder nicht eindeutig ist. Reihenfolge der Zuverlässigkeit:
1. Export des Rohschnitts als MP4 (niedrige Auflösung genügt) — Claude sichtet ihn über zeitgestempelte Frames/Kontaktbögen (`scripts/footage-analysis/`) und, soweit verfügbar, den Ton.
2. Optional: der CapCut-Entwurf (`draft_content.json`) **nur lesend** — liefert exakte Schnittliste (Quellclip, Ein-/Ausstieg, Timeline-Position). Format undokumentiert (siehe `docs/CAPCUT_DRAFT_RESEARCH.md`); nie schreiben, nie bestehende Entwürfe verändern.
3. Optional: Voice-over-Skript/Stichpunkte, Zielvorgabe zur Länge.

**Prüfdimensionen** — jede Anmerkung trägt einen Timecode (mm:ss, bei Bedarf Bereich) und ist einer Dimension zugeordnet:
- **Dramaturgie** — Aufbau gemäß §5, Hook gemäß §4, Spannungsbogen, Wiederholungen, Abschluss.
- **Bildqualität** — Schärfe, Belichtung, Wackler, Horizont, Farbanschluss zwischen Schnitten (technische Hinweise nur als Hinweise; Inhalt separat bewerten, vgl. `docs/FOOTAGE_ANALYSIS.md` §4).
- **Zuschauerbindung** — Durchhänger, Tempo, Abwechslung, Momente mit Abbruchrisiko.
- **Szenenlänge** — zu lang/zu kurz, relativ zum Inhalt (keine starren Sekundenregeln, §5).
- **Informationsvermittlung** — wo fehlt praktische Information, wo ist sie schwer verständlich, Passung zum Voice-over.
- **B-Roll-Platzierung** — wo eine Infografik/Karte/Titel einen echten Mehrwert hätte (Katalog §6), mit Vorschlag der Grafikart; Umsetzung in Remotion erst nach Freigabe und nach `docs/BROLL_GUIDELINES.md`.
- **Privatsphäre (Pflichtprüfung)** — erkennbare Gesichter von Familienmitgliedern gemäß §2 melden.

**Ausgabeformat** (`analysis/<slug>/ROUGHCUT_REVIEW.md`, bei Wiederholung versioniert, z. B. `ROUGHCUT_REVIEW_v2.md`): kurze Gesamteinschätzung (Länge, Struktur, 3 wichtigste Hebel), danach eine Tabelle `Timecode | Dimension | Beobachtung | Vorschlag | Priorität (Hoch/Mittel/Niedrig)`. Beobachtungen nennen, was tatsächlich zu sehen/hören war; Unsicheres wird als "nicht bestätigt" markiert, nicht geraten.

**Rolle der Footage-Analyse:** unterstützendes Werkzeug, nicht Schnittersteller. Sie hilft vor allem dabei, **übersehene interessante Szenen im Originalmaterial** zu finden (Abgleich: verwendete Quellbereiche des Rohschnitts gegen `content_review.md`/Thumbnails/`editorial_editlist.csv` → ungenutzte starke Momente, jeweils mit Clipname und Zeitbereich vorgeschlagen). Details: `docs/FOOTAGE_ANALYSIS.md` §10.

Skill: `/my-review-roughcut`.

## 8. Ausnahmen

Projektbezogene Abweichungen von diesen Standards sind zulässig, aber nur wenn redaktionell begründet und explizit dokumentiert — z. B. als Eintrag in `PROJECT_STATUS.md` zum jeweiligen Video. Keine stillschweigenden Abweichungen.
