# TASAN MEDIA Trips — Footage Analysis Workflow

**Reference implementation:** `scripts/footage-analysis/analyze.py` is the only script in this workflow so far. Consult it alongside this document before extending the pipeline.

**Role since 2026-11-24:** a *supporting* tool. The user makes the scene selection and the CapCut rough cut; Claude reviews that cut (`docs/PRODUCTION_STANDARDS.md` §7). This tool's main remaining job is to help find **interesting scenes in the original footage that the rough cut overlooked** (§10). It does not build cuts or CapCut projects.

**Purpose:** sight raw DJI Osmo Pocket 3 footage fast — metadata, timestamped thumbnails, and an HTML gallery. This tool is separate from the Remotion/B-roll workflow: it never touches `src/`, never produces anything that gets imported into a Remotion composition, and has no relationship to CapCut's project format. It only produces things to *look at* while editing in CapCut.

## 1. What this is not

- Not a replacement for CapCut editing — it produces a sighting aid and a draft edit list, not an edited video.
- Not a Remotion B-roll — completely separate tool, separate folder, no shared code.
- Not automatic scene-content understanding — see §4.
- Not a CapCut project/XML importer — no CapCut project format is written. The edit list is a human-readable CSV, read by a person (or by Claude on request), not imported automatically.

## 2. Tooling and dependencies

- **ffmpeg / ffprobe:** reused from the binaries Remotion already bundles — `node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe` and `ffprobe.exe`. No system-wide FFmpeg install. This specific binary is deliberately stripped down for Remotion's rendering needs (`--disable-filters` + an allowlist) — it has no `select`, `scdet`, `freezedetect`, `blackdetect`, or `signalstats` filters, only `scale`/`crop`/`trim`/`concat`-class filters. That's enough for metadata and timestamped thumbnails (§3), but not for native scene/quality detection — see §5 for how that gap is closed.
- **Python 3** (already on the machine) — no virtualenv, no new runtime. One-time setup: `pip install -r scripts/footage-analysis/requirements.txt` (Pillow + numpy — see §5 for why they're needed).
- Read-only on source footage: every call uses `-ss` + `-frames:v 1` to decode a single preview frame; nothing is written back to the source path, nothing is re-encoded, nothing is deleted.

## 3. Pipeline (current MVP)

Three scripts, run in order, all under `scripts/footage-analysis/`:

1. **`analyze.py --source <raw-footage-folder> --slug <project-slug> [--limit N]`**
   - **Discover** — walks the source folder for `.mp4`/`.mov`, skips `.LRF` proxy sidecars. DJI's `DJI_<timestamp>_<seq>_D.MP4` naming already sorts chronologically by filename, so no extra ordering logic is needed.
   - **Probe (ffprobe)** — duration, resolution, fps, video/audio codec, bit rate, audio sample rate/channels, file size, camera tag, creation time. DJI files carry an embedded MJPEG cover-art stream alongside the real HEVC video stream (`disposition.attached_pic`) — the script explicitly skips it so metadata always reflects the real video stream, not the cover thumbnail.
   - **Thumbnails (ffmpeg)** — one JPEG every ~2s (minimum 3 per clip, for clips too short for that interval), scaled to 480px wide. Written to `analysis/<slug>/thumbs/<clip-name>/t_<seconds>.jpg`.
   - **Gallery (HTML)** — one static `analysis/<slug>/gallery.html`, no server, no JS framework. One section per clip: technical metadata header, thumbnail row with timestamp captions. If `detect.py` (below) has already run, each thumbnail also gets small colored badges for whatever technical flags apply near that timestamp. Every metadata/flag field is explicitly labeled as a technical measurement, never implied to be content understanding (see §4).
   - `--rebuild-gallery-only` (no `--source` needed) re-renders `gallery.html` from the existing `metadata.json` + `events/` — used after running `detect.py`, so the slow probe/thumbnail pass isn't repeated just to pick up new flags.
2. **`detect.py --slug <project-slug>`** — see §5.
3. **`editlist.py --slug <project-slug>`** — see §6.

Outputs live under `analysis/<slug>/`, which is **gitignored** — large and fully regenerable from the source footage, so it never reaches git (same reasoning as `out/`).

## 4. Technical measurements vs. actual image content — kept strictly separate

Two different kinds of "analysis" happen here, and they are never blended into one undifferentiated judgment:

- **Technical measurements** (ffprobe/ffmpeg/Python): duration, resolution, fps, codec, audio levels, brightness/motion-difference proxies once §5 is built. 100% reproducible, pure signal processing — no understanding of what's actually in frame.
- **Actual image content** (what's visible — a stork in frame, a good establishing shot, a shaky pan): this is done by **Claude, on request**, looking directly at the generated thumbnails in an active session. There is no local vision model and no cloud vision API wired into the pipeline — adding one was considered and rejected for this project's scale (a ~4-minute video from ~20 minutes of raw footage) as unnecessary complexity. Claude's content judgments, when given, are always labeled as editorial/content assessment, never mixed into the technical fields. First real use (NaturOparC, all 54 clips): see §6.5.

## 5. Scene-change / static-section / quality detection (`detect.py`)

The bundled FFmpeg can't do this natively (§2), so the approved approach is: reuse the thumbnails `analyze.py` already extracted (2s-spaced, 480px JPEGs — no separate dense frame-extraction pass) and do the detection in Python with **Pillow + numpy** (two small, standard packages — the only new dependency this tool adds). Each clip is one continuous DJI take (the camera doesn't cut in-camera), so what's detected is framing/motion change *within* a take, not scene cuts between takes.

Per clip: downscale each thumbnail to 160×90 grayscale, then compute
- **brightness** (mean luma, 0–255) → flags `dark`/`bright`,
- **sharpness** (variance of a manual discrete Laplacian — a standard cheap blur proxy, no OpenCV needed) → flags `blurry`,
- **frame-to-frame diff** (mean absolute pixel difference, normalized 0–1) between consecutive thumbnails → classifies `static` (held) and `high_motion` (abrupt framing change) ranges.

**Calibration finding from the first real run (NaturOparC, 5-clip pilot):** the first version used fixed global thresholds for diff and sharpness, guessed before seeing real numbers. Checking the actual values showed why that fails for this footage: normalized frame-diffs for ordinary handheld/gimbal walking motion sit around 0.1–0.2 (not near-zero like static security-cam footage), and Laplacian sharpness for genuinely sharp 160×90 frames here runs in the ~1000–1700 range (not single digits). A fixed constant for either would have mislabeled almost everything — the very first run flagged *every* gap as `high_motion` and *nothing* as `static`. Fix: **motion and sharpness are now classified relative to each clip's own distribution** (percentiles — `STATIC_PERCENTILE`/`HIGH_MOTION_PERCENTILE` for diffs, `BLUR_RELATIVE_FACTOR` × the clip's own median for sharpness), which is robust to this kind of scale surprise. Brightness keeps a fixed global threshold, since 0–255 luma is a genuinely absolute, content-independent scale. Spot-checked against the actual thumbnails afterward: a flagged `static` range (0.3–6.3s in clip 3) is visually a held shot of a parked car; a flagged `high_motion` range (58–62s, same clip) is a fast whip from a wide parking-lot shot to a close-up face — both correct.

One more thing the spot-check surfaced, worth stating precisely rather than overselling: `blurry` is "lower edge detail than this clip's own typical frame," which can mean true focus blur, but can equally mean a soft close-up (skin, sky, shallow depth of field) that's perfectly in focus — read it as a soft hint to glance at that timestamp, not a verdict.

Re-check these percentiles again once this has run against more varied footage (different light, more genuinely static tripod shots) — same lesson as `docs/BROLL_GUIDELINES.md` §2 (duration follows narration, not assumption): here, thresholds follow real footage, not a guessed constant.

## 6. Edit list (`editlist.py`)

`analysis/<slug>/editlist.csv` — columns: filename, start, end, duration, suggested use, note. One row **per clip**, not per detected sub-event: thumbnails are 2s apart, which is a sighting resolution, not a frame-accurate in/out point, so start/end is deliberately the whole clip rather than a precision trim — the note column instead lists the clip's most relevant detected timestamps (e.g. "ruhig 00:20–00:30, starker Bildwechsel bei 00:48") so you still know where to look.

Suggested-use classification (first pass, simple and explainable on purpose):
1. If a clip's dark/bright/blurry flags cover more than ~30% of its sampled frames → **Pruefen** (check before using), regardless of position.
2. Else, if it's among the first 3 clips chronologically, contains an abrupt framing change, and is long enough (≥5s) → **Hook**.
3. Else, if it's among the last 3 clips chronologically and long enough → **Schluss**.
4. Else, if ≥30% of its duration is a relatively calm/static range → **Uebergang** (good for voice-over/cutaway).
5. Otherwise → **Hauptteil**.

This is a heuristic draft, not an editorial decision — meant to be read and adjusted by hand (or by asking Claude to adjust it after reviewing the gallery) before building the CapCut timeline.

## 6.5. Editorial content review (`contact_sheet.py` + Claude's own vision)

When an actual editorial pass is wanted (not just technical flags — see §4), reading up to ~670 individual thumbnail files one at a time doesn't scale. `contact_sheet.py` tiles one clip's full set of extracted thumbnails (every one of them, not a sample) into a single labeled grid image per clip, written to `analysis/<slug>/contact_sheets/<clip>.jpg`. Claude then reads one contact sheet per clip — one image call instead of dozens — and does the actual content judgment from there: visible animals/activities/landscape, composition/quality, duplicate-scene detection, hook candidates.

```
python scripts/footage-analysis/contact_sheet.py --slug <slug> [--filename <one clip>]
```

When a specific moment might fall between the regular 2s-spaced thumbnails (fast motion, an animal that could easily be missed), extract denser frames for just that clip/range — e.g. every 0.5s instead of 2s — by calling `extract_thumbnail()` from `analyze.py` directly over a tighter loop, then tile or view those individually. This is exactly how one confirmed otter sighting was found in the NaturOparC review (see below) that the standard 2s thumbnails had completely missed.

**First real run (NaturOparC, all 54 clips, 2026-11-22):** produced three outputs, deliberately kept separate from the technical pipeline's own files (and from each other):
- `analysis/<slug>/content_review.md` — the full clip-by-clip content analysis, preserved in full (not just the recommended subset)
- `analysis/<slug>/editorial_editlist.csv` — the actual editorial cut recommendation (filename, start, end, duration, description, priority, justification), a human judgment call, **not regenerable by re-running a script**
- `analysis/<slug>/CAPCUT_INSTRUCTIONS.md` — a proposed running order + practical CapCut steps

Because these three are genuine editorial work product rather than derived/regenerable cache, they are the one part of `analysis/` that **is** committed to git (see `.gitignore` — it ignores `thumbs/`, `contact_sheets/`, `extra_frames/`, `metadata.json`, `gallery.html`, `editlist.csv` by pattern, but not these three files).

## 7. Known limitations (stated up front, not discovered later)

1. No real image-content understanding in the automated pipeline — pixel/signal-based only (see §4).
2. DJI gimbal footage is adversarial for motion heuristics — solved with per-clip relative thresholds instead of global constants (§5), but still expect further calibration as more/different footage goes through this.
3. `blurry` means "less edge detail than this clip's own typical frame," not necessarily true optical focus blur — a soft close-up can trigger it without being out of focus (§5).
4. No automatic CapCut project import — output is a list/gallery for a human (or Claude) to act on.
5. Audio analysis is level-only (`silencedetect` is available in the bundled FFmpeg) — things like wind noise or speech intelligibility need actual listening.
6. Heuristic suggestions are a draft, not an editorial judgment — `editlist.csv` rows are a starting point, not a cut.
7. Edit-list start/end is always the whole clip, not a sub-clip trim — 2s-spaced thumbnails aren't frame-accurate enough to claim precise in/out points (§6).
8. Species/content identification from thumbnails has real limits — murky water, distance, and 480px resolution sometimes make a confident call impossible. The honest answer is "plausible, not confirmed" (and the editorial write-up says so explicitly), not a guess dressed up as fact.

## 8. Where the big win actually is

Not automatic cutting — **sighting speed**. Instead of scrubbing every raw clip in CapCut, the gallery shows every clip with timestamps and flagged technical issues in a few minutes, and the edit list gives a concrete starting point instead of an empty timeline.

## 9. Full run, in order

```
python scripts/footage-analysis/analyze.py --source "<raw-footage-folder>" --slug <project-slug>
python scripts/footage-analysis/detect.py --slug <project-slug>
python scripts/footage-analysis/editlist.py --slug <project-slug>
python scripts/footage-analysis/analyze.py --slug <project-slug> --rebuild-gallery-only
```

The last step re-renders `gallery.html` so it picks up the flags `detect.py` just computed (the first `analyze.py` run already built a gallery, but without flags, since `detect.py` hadn't run yet). Use `--limit N` on the first command to test against a handful of clips before committing to a full run on a large folder — a 54-clip, 22-minute, 12.5GB NaturOparC shoot took roughly 30–35 minutes end to end on this machine, almost all of it in per-thumbnail 4K HEVC decode.

## 10. Role in the current workflow: finding overlooked scenes (added 2026-11-24)

After the user's rough cut exists, use the existing analysis outputs (`content_review.md`, `editorial_editlist.csv`, thumbnails/contact sheets, `metadata.json`) to answer: *which strong moments in the raw footage are not in the cut?*
1. Get the cut's used source ranges: from the CapCut draft (read-only, `draft_content.json` → segments' `source_timerange` + material path; see `docs/CAPCUT_DRAFT_RESEARCH.md`) or, if only an export exists, by matching exported frames against the thumbnails.
2. Subtract used ranges from the clips rated Hoch/Mittel in `editorial_editlist.csv` and from notable moments in `content_review.md`.
3. Report candidates as `clip name | time range | what is visible | why it could help (hook, variety, info, B-roll cover)` — suggestions only; the user decides. Re-check family-privacy (`docs/PRODUCTION_STANDARDS.md` §2) for every candidate.
4. Dense-frame extraction (§6.5) can be re-run for a specific clip/range when a moment might fall between the 2 s samples.

Do **not** use this tool to assemble or order a cut; scene selection and sequence are the user's.
