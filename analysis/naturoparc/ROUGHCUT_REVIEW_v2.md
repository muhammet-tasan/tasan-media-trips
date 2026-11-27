# NaturOparC — Schnittanleitung für CapCut (Stand: Entwurf `1124`, 30 fps)

Alle Zeiten im CapCut-Format `HH:MM:SS:FF` (Projekt 30 fps; die verwendeten Originalclips haben 29,97 fps, die Zeiten sind wie in CapCut angezeigt). Die erste Spalte ist immer die **Timeline**; Zeiten **„im Originalclip“** stehen nur in der Spalte „Änderung“.
**Reihenfolge = Abarbeitung:** vom Videoende zum Videoanfang, die Hook-Clips ganz zum Schluss (in Abspielreihenfolge). So bleiben die Timecodes der noch offenen Zeilen gültig. Raw-Clips: `…\capcut\2026 - Naturoparc Colmar\Raw\`.

| Timecode (CapCut-Timeline) | Szene | Änderung | Dauer | Priorität |
|---|---|---|---|---|
| 00:02:46:02 – 00:02:49:14 | Ziege geht weg, Schwenk auf kleine Ziege im Stall | Kürzen: Schnitt setzen bei 00:02:48:17 | 00:00:02:15 | optional |
| 00:02:42:26 – 00:02:46:02 | Ziege mit Hörnern, Hand streichelt | Verlängern: Ende bei 00:02:46:26 setzen (Originalclip `DJI_20260906222458_0054_D.MP4` läuft dann bis 00:00:04:00) | 00:00:04:00 | optional |
| 00:02:34:15 – 00:02:39:19 | Schweinegehege, Schwein klein (zwei Einstellungen) | Beide löschen (die Einstellung danach zeigt das Schwein groß) | – | optional |
| 00:02:14:14 – 00:02:17:02 | Enten auf dunklem Wasser, kontrastarm | Löschen | – | optional |
| 00:02:07:29 – 00:02:10:25 | Schwäne laufen im Gras | Verlängern: Ende bei 00:02:11:14 setzen | 00:00:03:15 | optional |
| 00:02:07:11 – 00:02:07:29 | Schwäne, Rest-Schnipsel | Löschen | – | notwendig |
| 00:02:04:28 – 00:02:07:11 | Schwäne weit weg im Efeu | Ersetzen durch `DJI_20260906221707_0051_D.MP4`, im Originalclip 00:00:03:00 – 00:00:05:12 (Schwäne nah am Ufer) | 00:00:02:12 | optional |
| 00:01:53:10 – 00:01:57:13 | Grünes Tunnelfenster ohne Tier | Kürzen: Schnitt setzen bei 00:01:55:10 | 00:00:02:00 | optional |
| 00:01:50:18 – 00:01:53:10 | Otter im Unterwasserfenster | Anfang im Originalclip verschieben: `DJI_20260906213728_0037_D.MP4`, im Originalclip 00:00:02:24 – 00:00:05:15 (Otter schwimmt dort mittig); Länge bleibt | 00:00:02:21 | optional |
| 00:01:43:23 – 00:01:46:11 | Seerosen, fast gleich wie davor | Löschen | – | optional |
| 00:01:15:13 – 00:01:19:02 | Wiese mit fernen Vögeln | Kürzen: Schnitt setzen bei 00:01:17:13 | 00:00:02:00 | optional |
| 00:01:07:26 – 00:01:11:08 | Wassertropfen-Schild an Efeuwand | Kürzen: Schnitt setzen bei 00:01:09:26 | 00:00:02:00 | optional |
| 00:01:04:05 – 00:01:07:26 | Koi-Fütterung, Mädchen und Mann sichtbar | Ersetzen durch `DJI_20260906205019_0017_D.MP4`, im Originalclip 00:00:06:24 – 00:00:09:09. Bild auf ca. 160 % vergrößern und so verschieben, dass nur die untere rechte Hälfte (Hände, Fische) zu sehen ist: links keine Köpfe, oben rechts kein Mann | 00:00:02:15 | notwendig |
| 00:01:00:10 – 00:01:04:05 | Koi-Fütterung, Kindergesichter deutlich zu sehen | Löschen | – | notwendig |
| 00:00:57:08 – 00:01:00:10 | Enten am Ufer, fast derselbe Standpunkt wie davor | Löschen | – | optional |
| 00:00:23:07 – 00:00:29:10 | Holzschild „Quel bruit fait la cigogne ?“ | Ende abschneiden: Schnitt setzen bei 00:00:25:22 | 00:00:02:15 | notwendig |
| 00:00:00:00 – 00:00:23:07 | Zwei Ziegen-Clips am Anfang (neu seit dem Export, nicht Teil der Analyse) | Nur falls Platzhalter: löschen, erst nach allen Änderungen darüber (sonst verschieben sich alle Timecodes in dieser Tabelle) | – | optional |
| 00:00:00:00 – 00:00:01:21 (neu, nach allen anderen Änderungen) | Hook: Ziege senkt die Hörner, Hand streichelt | Ganz an den Anfang einfügen: `DJI_20260906222458_0054_D.MP4`, im Originalclip 00:00:04:24 – 00:00:06:15 | 00:00:01:21 | notwendig |
| 00:00:01:21 – 00:00:03:12 (neu, nach allen anderen Änderungen) | Hook: Schildkröte schwimmt neben den sonnenden | Direkt hinter dem vorherigen Hook-Clip einfügen: `DJI_20260906204349_0014_D.MP4`, im Originalclip 00:00:29:12 – 00:00:31:03 | 00:00:01:21 | notwendig |
| 00:00:03:12 – 00:00:05:03 (neu, nach allen anderen Änderungen) | Hook: Holzbrücken und Trittsteine über grünem Teich | Direkt hinter dem vorherigen Hook-Clip einfügen: `DJI_20260906221910_0052_D.MP4`, im Originalclip 00:00:08:00 – 00:00:09:21 | 00:00:01:21 | notwendig |
| 00:00:05:03 – 00:00:06:24 (neu, nach allen anderen Änderungen) | Hook: Otter schwimmt im Unterwasserfenster | Direkt hinter dem vorherigen Hook-Clip einfügen: `DJI_20260906213728_0037_D.MP4`, im Originalclip 00:00:03:00 – 00:00:04:21 | 00:00:01:21 | notwendig |

Alle anderen Schnitte bleiben unverändert, auch die ruhigen Umgebungsszenen und die Schlussszene.
Danach: Export, kurzes visuelles Abschlussreview (ohne Audio), nach deiner Freigabe weiter mit der Erzählung.
