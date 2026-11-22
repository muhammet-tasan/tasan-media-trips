import React from 'react';
import { AbsoluteFill, Audio, Easing, Video, interpolate, staticFile, useCurrentFrame } from 'remotion';

/**
 * TASAN brand intro — pure compositing, no redesign.
 *
 * The entire visual and audio comes directly from the original
 * Kling-generated video. The original animation is used exactly as
 * rendered: letters forming, the underline, the light point travelling
 * from left toward center, the bright center glint, and its fade-down are
 * ALL native Kling content — nothing here recreates, continues, or adds to
 * any of that.
 *
 * The only two things this file does:
 *
 * 1. CROP/MASK, active identically from frame 0. The source later reveals
 *    a large circular ring around TASAN that must never be visible. Rather
 *    than cutting the clip short (which would lose the center-glint
 *    sequence we want to keep), a fixed centered rectangular window is cut
 *    out of the video from the very first frame and held constant for the
 *    whole composition — so there is no crop change to notice, and the
 *    excluded outer area (where the ring eventually appears) is simply
 *    never part of the picture. The window size was chosen by measuring
 *    the ring's own radius over time directly off stills of the source
 *    (see RING MEASUREMENTS below): it shrinks continuously once formed,
 *    so the crop only needs to stay safely inside its radius for as long
 *    as this composition actually plays. Two things then make that window
 *    invisible against the canvas: a mix-blend-mode:lighten pass lifts the
 *    video's own near-black background up to exactly match
 *    BACKGROUND_COLOR (per channel, max(video, bg) — letters and glint stay
 *    untouched since they're already brighter), and a thin linear-gradient
 *    alpha mask feathers the window's outer edge into transparency (see
 *    FEATHER below) — true transparency, not a painted overlay, so the
 *    glint's blue glow dims into the background rather than getting cut or
 *    covered.
 *
 * 2. FADE OUT, once the source's own glint has visibly begun fading back
 *    down (matching the "ring safely small enough" window from the
 *    measurements above — see FADE_START), the whole cropped picture fades
 *    to the canvas background color over 0.5s, then that plain background
 *    holds for ~1s before the composition ends. The audio fades with the
 *    visual (silence during the hold) since the composition ends before
 *    the source audio's natural end.
 */

const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };
const EASE = Easing.inOut(Easing.cubic);

export const FPS = 30;
export const KLING_VIDEO_FILE = 'brand/videos/kling_20260911_VIDEO_Edit__Vide_5980_0.mp4';

// ---------------------------------------------------------------------------
// Timeline (30fps).
//
// RING MEASUREMENTS — a ray-scan for the ring's inner edge, done directly on
// stills of the raw 1920x1080 source, centered on the canvas center
// (960,540) where the ring itself is centered (not the wordmark, which sits
// a bit higher):
//   frame 112 (3.73s): ring not yet detectable — this is the glint's peak.
//   frame 120 (4.00s): ring fully formed, radius ~590-740 depending on angle.
//   frame 128 (4.27s): glint fully settled to a small point; ring ~588-708.
//   frame 136 (4.53s): ring already shrunk to ~524-660.
//   frame 145 (4.83s): ~484-624.
//   frame 150 (5.00s): ~476-616 — visually already grazing the T (confirmed
//     by inspection, not just the scan).
// The ring keeps closing in after it forms, so the crop only has to clear
// whatever the ring's radius is at the LAST frame this composition shows,
// not its largest size. Ending the sequence earlier — while the source's
// own glint is still fading down rather than fully settled — keeps that
// last frame's ring radius comfortably larger than the crop needs.
// ---------------------------------------------------------------------------
export const FADE_START = 116; // ~3.87s — glint already past peak (112) and fading in the source itself
export const FADE_DURATION = 15; // 0.5s
export const FADE_END = FADE_START + FADE_DURATION; // 131 — ring radius here still ~560-616, well outside the crop
export const HOLD_DURATION = 30; // 1.0s of clean background after the fade completes
export const INTRO_DURATION = FADE_END + HOLD_DURATION; // 161

// ---------------------------------------------------------------------------
// Crop window — a fixed rectangle in the native 1920x1080 source, doubled
// for the 4K canvas.
//
// IMPORTANT: the wordmark and the ring are NOT concentric in the source.
// The wordmark's own bounding-box center (measured directly on a raw,
// unscaled still) is (957, 482) — letters top at y=366, underline at
// y~594. The ring, however, is centered on the canvas center (960, 540):
// confirmed both by the ring ray-scan below being clean and consistent
// only when measured from (960,540), and by visual inspection showing
// TASAN sitting slightly above the ring's own vertical middle. So this
// crop is defined as absolute bounds, not as a single symmetric
// half-width/half-height around one shared center — it has to satisfy two
// different reference points at once.
// ---------------------------------------------------------------------------
const SOURCE_W = 1920;
const CANVAS_W = 3840;
const CANVAS_H = 2160;

// Content bounds (letters 448-1466 horizontally, 366 top; underline/glint
// visibly fade out well before y=770, so the bottom is trimmed in from 770
// to 730 — still clear of the glint's visible reach, just less empty space
// below it) plus a small margin. This is the zone that must stay 100%
// opaque — see FEATHER below for why it can't be much larger.
const CONTENT_X0 = 433;
const CONTENT_X1 = 1481;
const CONTENT_Y0 = 356;
const CONTENT_Y1 = 730;

// Feather width, in native-source pixels, added OUTSIDE the content bounds
// on every side. The requested 200-300px (4K) feather is not reachable
// here: the ring's measured radius at FADE_END (~595px from its center,
// 960,540, in native-source pixels — see RING MEASUREMENTS above) sets a
// hard ceiling on how far this window can extend before the ring itself
// would be sampled, however faintly masked. Letters alone need a 509px
// half-width, leaving only ~86px of native-pixel budget before the ring's
// radius — solved exactly (worst corner distance == ring radius) gives a
// maximum uniform feather of ~27px native pixels; 20px is used here for a
// safety margin against measurement noise. That's ~40px at 4K, well under
// the requested 200-300px — a hard geometric ceiling, not a rounding
// choice, given the fade timing and crop concept were both off-limits this
// round. A larger feather is possible only by trading off one of those.
const FEATHER = 20;

const TOTAL_X0 = CONTENT_X0 - FEATHER;
const TOTAL_X1 = CONTENT_X1 + FEATHER;
const TOTAL_Y0 = CONTENT_Y0 - FEATHER;
const TOTAL_Y1 = CONTENT_Y1 + FEATHER;

const SCALE = CANVAS_W / SOURCE_W; // 2 — uniform upscale of the native source to the 4K canvas
const CROP_W_4K = (TOTAL_X1 - TOTAL_X0) * SCALE;
const CROP_H_4K = (TOTAL_Y1 - TOTAL_Y0) * SCALE;

// Feather as a fraction of the crop box's own width/height, for the linear
// mask gradients below (one per axis, combined with mask-composite:
// intersect — a two-length radial-gradient mask was tried first but
// rendered with a consistent, unexplained left-side offset in this
// pipeline; independent horizontal/vertical linear gradients render
// correctly and are equivalent for a rectangular feather).
const FEATHER_FRACTION_X = (FEATHER * SCALE) / CROP_W_4K;
const FEATHER_FRACTION_Y = (FEATHER * SCALE) / CROP_H_4K;

// The crop window's on-screen position: centered on the canvas, then
// nudged down by a constant amount (applied identically from frame 0) so
// TASAN + underline read as optically centered rather than sitting high.
const VERTICAL_NUDGE = 100;
const CROP_LEFT_ON_CANVAS = (CANVAS_W - CROP_W_4K) / 2;
const CROP_TOP_ON_CANVAS = (CANVAS_H - CROP_H_4K) / 2 + VERTICAL_NUDGE;

const BACKGROUND_COLOR = '#030509';

export const TasanBrandIntro: React.FC = () => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [FADE_START, FADE_END], [1, 0], { ...CLAMP, easing: EASE });
	const volume = interpolate(frame, [FADE_START, FADE_END], [1, 0], { ...CLAMP, easing: EASE });

	// A true alpha mask (not a painted overlay) so the canvas background
	// shows through where the video fades out — needed for the glint's
	// blue glow to visibly dim into the background rather than being
	// covered by an opaque shadow. Two linear gradients (one per axis)
	// combined with mask-composite:intersect, so a pixel is only opaque
	// where BOTH agree — a rectangular feather. Each is a symmetric
	// transparent-black-black-transparent ramp along its own axis.
	const hFade = FEATHER_FRACTION_X * 100;
	const vFade = FEATHER_FRACTION_Y * 100;
	const maskImage = [
		`linear-gradient(to right, transparent 0%, black ${hFade}%, black ${100 - hFade}%, transparent 100%)`,
		`linear-gradient(to bottom, transparent 0%, black ${vFade}%, black ${100 - vFade}%, transparent 100%)`,
	].join(', ');

	return (
		<AbsoluteFill style={{ backgroundColor: BACKGROUND_COLOR }}>
			<div
				style={{
					position: 'absolute',
					left: CROP_LEFT_ON_CANVAS,
					top: CROP_TOP_ON_CANVAS,
					width: CROP_W_4K,
					height: CROP_H_4K,
					overflow: 'hidden',
					opacity,
					maskImage,
					WebkitMaskImage: maskImage,
					maskComposite: 'intersect',
					WebkitMaskComposite: 'source-in',
				}}
			>
				{/* Lightens the video's own near-black background up to exactly
				    BACKGROUND_COLOR — per channel, result = max(video, bg) — via
				    mix-blend-mode:lighten against a same-color backdrop, isolated
				    to this stacking context so the blend can't reach past it to
				    whatever's behind. Letters/glint are already brighter than
				    3,5,9 on every channel, so max() leaves them untouched; only
				    truly-dark pixels (compression noise included) get lifted. */}
				<div style={{ position: 'absolute', inset: 0, isolation: 'isolate' }}>
					<div style={{ position: 'absolute', inset: 0, backgroundColor: BACKGROUND_COLOR }} />
					<Video
						src={staticFile(KLING_VIDEO_FILE)}
						muted
						style={{
							position: 'absolute',
							left: -TOTAL_X0 * SCALE,
							top: -TOTAL_Y0 * SCALE,
							width: CANVAS_W,
							height: CANVAS_H,
							objectFit: 'fill',
							mixBlendMode: 'lighten',
						}}
					/>
				</div>
			</div>

			<Audio src={staticFile(KLING_VIDEO_FILE)} volume={volume} />
		</AbsoluteFill>
	);
};
