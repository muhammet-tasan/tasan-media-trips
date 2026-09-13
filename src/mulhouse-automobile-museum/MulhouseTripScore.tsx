import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';

// ---------------------------------------------------------------------
// TASAN Trip Check — final editorial verdict B-roll (major redesign #2,
// pacing pass #3).
//
// Scoring philosophy: the 8 category ratings below ARE the final
// editorial TASAN scores (not a "personal" score merged with community
// data on screen). They already reflect our balanced judgment after
// considering our visit, research, and broader visitor sentiment. The
// community section (Google/Tripadvisor) is shown purely as CONTEXT —
// there is no visible formula anywhere, and the category scores sum to
// the final score by construction (computed in code, never hard-coded).
//
// PACING MODEL (this pass): every important message is built from three
// explicit, named phases — ENTER (reveal, does not count as reading
// time), HOLD (completely static, genuinely readable), EXIT (crossfade
// into whatever comes next). There is no total-duration target; the
// composition's length is purely the sum of these phases. See
// `layoutBeats` below — it turns a list of {enter,hold,exit} specs into
// absolute frame windows, cursor-advanced so each beat's exit overlaps
// the next beat's enter (a single crossfade), matching the 0.5–0.9s
// transition guidance without ever eating into a HOLD.
// ---------------------------------------------------------------------

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const GOLD = '#d4a24e';
const MUTED = 'rgba(224,224,228,0.6)';
const FONT = 'Helvetica Neue, Arial, sans-serif';

// RECHECK BEFORE PUBLICATION: review scores/counts drift over time.
// Captured 2026-09-05. Google = broad general-visitor audience;
// Tripadvisor = travel/attraction-visitor perspective. Shown as context
// only — never mathematically combined into the score on screen.
const COMMUNITY_RATINGS = {
	google: { score: 4.7, outOf: 5 },
	tripadvisor: { score: 4.6, outOf: 5, reviewCount: 3025 },
};

// Final editorial TASAN category scores. These sum to the final score —
// computed below, never hard-coded, so the two can never silently drift
// apart.
const FINAL_CATEGORIES = [
	{ label: 'Erlebnis & Wow', score: 15, max: 20 },
	{ label: 'Preis-Leistung', score: 8, max: 15 },
	{ label: 'Familienfaktor', score: 7, max: 15 },
	{ label: 'Aufwand & Stress', score: 8, max: 10 },
	{ label: 'Abwechslung', score: 7, max: 10 },
	{ label: 'Komfort & Infrastruktur', score: 6, max: 10 },
	{ label: 'Wetter & Planbarkeit', score: 8, max: 10 },
	{ label: 'Wiederholungswert', score: 4, max: 10 },
] as const;
const FINAL_SCORE = FINAL_CATEGORIES.reduce((sum, c) => sum + c.score, 0); // 63

const FINAL_VERDICT_LABEL = 'FÜR AUTO-FANS EMPFEHLENSWERT';
const FINAL_VERDICT_SUB = 'Als Familienausflug nur bedingt.';

const QUOTE_LINES = [
	'„Ich würde nochmals kommen –',
	'aber vor allem mit jemandem,',
	'der Oldtimer, Bugatti oder Formel 1',
	'wirklich liebt.“',
];

// Real photographs from our own museum visit. All EXIF-rotated (verified
// Remotion's <Img> respects orientation correctly); staticFile() resolves
// them from the canonical per-project asset folder.
const IMG_DIR = 'images/mulhouse-automobile-museum/';
const IMAGES = {
	classicCarsRow: IMG_DIR + 'classic-cars-row.png',
	lamborghiniBlack: IMG_DIR + 'lamborghini-black.png',
	ferrariF1: IMG_DIR + 'ferrari-f1-2007.jpg',
	kidsElectric: IMG_DIR + 'kids-electric-cars.png',
	benzVictoria: IMG_DIR + 'benz-victoria-1893.jpg',
	kidsVintage: IMG_DIR + 'kids-vintage-cars.png',
	formula1Cars: IMG_DIR + 'formula1-gallery-cars.png',
	formula1Wide: IMG_DIR + 'formula1-gallery-wide.png',
} as const;

// --- Timing primitives ----------------------------------------------------
const FPS = 30;
const S = (sec: number) => Math.round(sec * FPS);
const CLAMP = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

// Named minimum/typical durations, all in seconds, converted to frames
// once here. These are the ONLY numbers that should ever need touching
// to retime the piece — every scene below is calculated from them.
const ENTER_T = S(0.6); // generic reveal / crossfade length (0.5–0.9s band)
const EXIT_T = S(0.6);

const HEADER_HOLD = S(3.2); // section title / question minimum 3.0s — small buffer
const CONTEXT_ENTER = S(1.3); // slow cinematic masked-typography reveal
const CONTEXT_HOLD = S(4.0); // opening question is a "large statement": >=3.5s

const POSITIVE_HOLD = S(4.0); // each "what we liked" point: >=3.5s
const NEGATIVE_HOLD = S(4.0); // normal negative point: >=3.5s
const NEGATIVE_STRONG_HOLD = S(4.7); // strongest criticism (KAUM INTERAKTION): more time, not less

const RATING_HOLD = S(4.0); // Google / Tripadvisor rating: >=3.5s
const TAKEAWAY_HOLD = S(4.3); // community takeaway: >=4.0s

const AUDIENCE_HOLD = S(3.7); // audience-fit point: >=3.5s
const AUDIENCE_STRONG_HOLD = S(4.2); // "Familien / Nur bedingt" caveat: a touch more

const QUOTE_ENTER = S(3.33); // 4 staggered lines + attribution, slow reveal
const QUOTE_HOLD = S(8.0); // personal quote: >=7.0s, one of the slowest moments

// Score overview: all 8 categories shown together (see "UNSERE BEWERTUNG"
// below), not built up one at a time — a deliberate, explicitly-approved
// restructure of this section only. OVERVIEW_ENTER is the single block
// fade/rise (category names, all together — no per-row stagger for the
// text). After that, a separate star-fill wave (see STAR_ROW_STAGGER /
// STAR_ROW_FILL_DURATION below) reveals each row's gold rating left-to-
// right. Only once that wave finishes does OVERVIEW_HOLD begin — a
// genuine, completely static ~5s pause so an interested viewer can pause
// and read every row. This scene no longer shows the 63/100 total — that
// reveal now belongs solely to the following FinalScene, so the score
// never appears twice in a row.
const OVERVIEW_ENTER = S(1.8);
const OVERVIEW_HOLD = S(5.2); // >=5.0s genuine hold, required minimum + small buffer
const OVERVIEW_EXIT = EXIT_T;

// Star gold-fill wave: starts once the text block has fully appeared, runs
// as one calm overlapping wave (not row-by-row waiting), total span ~1.5s.
const STAR_ROW_STAGGER = S(0.1); // ~100ms between each row's fill starting
const STAR_ROW_FILL_DURATION = S(0.8); // one row's own gold reveal, ~0.8s

const FINAL_HOLD = S(4.5); // final TASAN score: >=4.0s completely static

// --- Beat layout system ----------------------------------------------------
// A "beat" is one on-screen message. `enter` is reveal time (not reading
// time), `hold` is the real, static, readable duration, `exit` crossfades
// into whatever follows. Beats within a scene are laid out back-to-back:
// the next beat's enter starts exactly when the previous beat's hold
// ends, so the exit/enter overlap becomes a single crossfade and never
// eats into anyone's hold.
type BeatSpec = {
	title: string;
	subtitle?: string;
	enter: number;
	hold: number;
	exit: number;
	titleSize?: number;
	subtitleSize?: number;
};
type BeatWindow = BeatSpec & { start: number; fullyVisibleStart: number; fullyVisibleEnd: number; end: number };

const layoutBeats = (specs: BeatSpec[]): BeatWindow[] => {
	let cursor = 0;
	return specs.map((s) => {
		const start = cursor;
		const fullyVisibleStart = start + s.enter;
		const fullyVisibleEnd = fullyVisibleStart + s.hold;
		const end = fullyVisibleEnd + s.exit;
		cursor = fullyVisibleEnd;
		return { ...s, start, fullyVisibleStart, fullyVisibleEnd, end };
	});
};
const sceneDuration = (ws: BeatWindow[]) => ws[ws.length - 1].end;

const beatStyle = (frame: number, w: BeatWindow) => {
	if (frame <= w.fullyVisibleStart) {
		return {
			opacity: interpolate(frame, [w.start, w.fullyVisibleStart], [0, 1], CLAMP),
			rise: interpolate(frame, [w.start, w.fullyVisibleStart], [22, 0], CLAMP),
		};
	}
	if (frame <= w.fullyVisibleEnd) {
		return { opacity: 1, rise: 0 };
	}
	return { opacity: interpolate(frame, [w.fullyVisibleEnd, w.end], [1, 0], CLAMP), rise: 0 };
};

const HeaderBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity } = beatStyle(frame, w);
	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, opacity }}>
			<div style={{ textAlign: 'center' }}>
				<div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 3, color: '#ffffff' }}>{w.title}</div>
				<div style={{ width: 100, height: 3, backgroundColor: GOLD, margin: '24px auto 0' }} />
			</div>
		</AbsoluteFill>
	);
};

const TextBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity, rise } = beatStyle(frame, w);
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				textAlign: 'center',
				fontFamily: FONT,
				opacity,
				transform: `translateY(${rise}px)`,
				padding: '0 130px',
			}}
		>
			<div style={{ fontSize: w.titleSize ?? 88, fontWeight: 700, color: '#ffffff', lineHeight: 1.15 }}>{w.title}</div>
			{w.subtitle && (
				<div style={{ fontSize: w.subtitleSize ?? 48, fontWeight: 500, color: MUTED, marginTop: 30 }}>{w.subtitle}</div>
			)}
		</AbsoluteFill>
	);
};

// --- Photo beats -----------------------------------------------------------
// Same enter/hold/exit timing contract as TextBeat/HeaderBeat (driven by the
// identical BeatWindow), but with a photograph integrated into the layout
// instead of centered text. Text sizes match what TextBeat already used for
// the same message elsewhere in the piece — repositioned, never shrunk.

const kenBurnsScale = (frame: number, w: BeatWindow, growth = 0.04) =>
	interpolate(frame - w.start, [0, w.end - w.start], [1, 1 + growth], CLAMP);

// A) "BEEINDRUCKENDE SAMMLUNG" — near-full-bleed photo, text moved into a
// protected gradient area at the bottom instead of dead-center.
const SammlungBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity } = beatStyle(frame, w);
	const scale = kenBurnsScale(frame, w, 0.035);
	return (
		<AbsoluteFill style={{ opacity, fontFamily: FONT }}>
			<AbsoluteFill style={{ overflow: 'hidden' }}>
				<Img
					src={staticFile(IMAGES.classicCarsRow)}
					style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }}
				/>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(8,10,15,0.1) 0%, rgba(8,10,15,0.22) 42%, rgba(8,10,15,0.9) 100%)',
				}}
			/>
			<AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', textAlign: 'center', paddingBottom: 100 }}>
				<div style={{ fontSize: 88, fontWeight: 700, color: '#ffffff', lineHeight: 1.15, textShadow: '0 4px 26px rgba(0,0,0,0.55)' }}>
					BEEINDRUCKENDE SAMMLUNG
				</div>
				<div style={{ fontSize: 48, fontWeight: 500, color: MUTED, marginTop: 30, textShadow: '0 2px 16px rgba(0,0,0,0.55)' }}>
					Oldtimer · Bugatti · Automobilgeschichte
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// B) "UNSERE HIGHLIGHTS" — text column left (~38%), dominant photo hero
// right (~62%), slow crossfade between the two priority hero images
// (lamborghini-black.png then ferrari-f1-2007.jpg — the third candidate,
// mercedes-f1-hamilton-front.jpg, would only get ~1.7s each if all three
// were used inside this beat's existing window, under the ~2.5s comfortable
// minimum, so it's left out here rather than speeding up the cycle).
const HighlightsBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity, rise } = beatStyle(frame, w);
	const local = frame - w.start;
	const scale = kenBurnsScale(frame, w, 0.04);
	const crossStart = 60;
	const crossEnd = 96;
	const imgAOpacity = interpolate(local, [crossStart, crossEnd], [1, 0], CLAMP);
	const imgBOpacity = interpolate(local, [crossStart, crossEnd], [0, 1], CLAMP);
	return (
		<AbsoluteFill style={{ opacity, fontFamily: FONT }}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '38%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					paddingLeft: 110,
					paddingRight: 40,
					transform: `translateY(${rise}px)`,
				}}
			>
				<div style={{ fontSize: 88, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>UNSERE HIGHLIGHTS</div>
				<div style={{ fontSize: 48, fontWeight: 500, color: MUTED, marginTop: 28 }}>Lamborghini &amp; Formel 1</div>
			</div>
			<div style={{ position: 'absolute', right: 0, top: 0, width: '62%', height: '100%', overflow: 'hidden' }}>
				<div style={{ position: 'absolute', inset: 0, transform: `scale(${scale})` }}>
					<Img
						src={staticFile(IMAGES.lamborghiniBlack)}
						style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imgAOpacity }}
					/>
					<Img
						src={staticFile(IMAGES.ferrariF1)}
						style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: imgBOpacity }}
					/>
				</div>
				<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,12,18,0.85) 0%, rgba(10,12,18,0) 14%)' }} />
			</div>
		</AbsoluteFill>
	);
};

// D) "VIELE EXTRAS KOSTEN ZUSÄTZLICH" — image left, text right; the two
// supporting lines reveal progressively inside the existing 4.0s hold
// (not simultaneously as tiny text), framed explicitly as our own visit
// experience rather than a universal guarantee.
const EXTRAS_LINE1_START = 15;
const EXTRAS_LINE1_FADE = 20;
const EXTRAS_LINE2_START = 55;
const EXTRAS_LINE2_FADE = 20;

const ExtrasBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity, rise } = beatStyle(frame, w);
	const scale = kenBurnsScale(frame, w, 0.04);
	const holdLocal = frame - w.fullyVisibleStart;
	const line1Opacity = interpolate(holdLocal, [EXTRAS_LINE1_START, EXTRAS_LINE1_START + EXTRAS_LINE1_FADE], [0, 1], CLAMP);
	const line2Opacity = interpolate(holdLocal, [EXTRAS_LINE2_START, EXTRAS_LINE2_START + EXTRAS_LINE2_FADE], [0, 1], CLAMP);
	return (
		<AbsoluteFill style={{ opacity, fontFamily: FONT }}>
			<div style={{ position: 'absolute', left: 0, top: 0, width: '42%', height: '100%', overflow: 'hidden' }}>
				<Img
					src={staticFile(IMAGES.kidsElectric)}
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }}
				/>
				<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(10,12,18,0.9) 0%, rgba(10,12,18,0) 16%)' }} />
			</div>
			<div
				style={{
					position: 'absolute',
					right: 0,
					top: 0,
					width: '58%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					paddingLeft: 70,
					paddingRight: 110,
					transform: `translateY(${rise}px)`,
				}}
			>
				<div style={{ fontSize: 76, fontWeight: 700, color: '#ffffff', lineHeight: 1.14 }}>
					VIELE EXTRAS
					<br />
					KOSTEN ZUSÄTZLICH
				</div>
				<div style={{ fontSize: 32, fontWeight: 500, color: MUTED, marginTop: 32, lineHeight: 1.4, opacity: line1Opacity }}>
					Kinder-Elektroautos &amp; Fahr-/Rennangebote
					<br />
					teilweise gegen Aufpreis
				</div>
				<div style={{ fontSize: 32, fontWeight: 500, color: MUTED, marginTop: 22, lineHeight: 1.4, opacity: line2Opacity }}>
					Wenige Plätze — bei unserem Besuch
					<br />
					teilweise Wartezeit
				</div>
			</div>
		</AbsoluteFill>
	);
};

// E) "KAUM INTERAKTION" — text on one side, a true portrait panel on the
// other (630×840 = the photo's own EXIF-corrected 3:4 aspect ratio, so
// `cover` needs zero crop — never distorted, never stretched to 16:9).
const InteraktionBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity, rise } = beatStyle(frame, w);
	const scale = kenBurnsScale(frame, w, 0.03);
	return (
		<AbsoluteFill style={{ opacity, fontFamily: FONT }}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '50%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					textAlign: 'center',
					padding: '0 50px',
					transform: `translateY(${rise}px)`,
				}}
			>
				<div style={{ fontSize: 104, fontWeight: 700, color: '#ffffff', lineHeight: 1.08 }}>
					KAUM
					<br />
					INTERAKTION
				</div>
				<div style={{ fontSize: 40, fontWeight: 500, color: MUTED, marginTop: 28, lineHeight: 1.35 }}>
					Einsteigen &amp; Anfassen
					<br />
					fast nicht möglich
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					right: 140,
					top: '50%',
					transform: 'translateY(-50%)',
					width: 630,
					height: 840,
					overflow: 'hidden',
					borderRadius: 6,
					boxShadow: '0 30px 90px rgba(0,0,0,0.5)',
				}}
			>
				<Img
					src={staticFile(IMAGES.benzVictoria)}
					style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }}
				/>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.22) 100%)',
					}}
				/>
			</div>
		</AbsoluteFill>
	);
};

// F) "FAMILIENFAKTOR" — photo right, text left, plus one small supporting
// line (not a shrink of the main statement, an addition below it).
const FamilienBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity, rise } = beatStyle(frame, w);
	const scale = kenBurnsScale(frame, w, 0.04);
	return (
		<AbsoluteFill style={{ opacity, fontFamily: FONT }}>
			<div style={{ position: 'absolute', right: 0, top: 0, width: '44%', height: '100%', overflow: 'hidden' }}>
				<Img
					src={staticFile(IMAGES.kidsVintage)}
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }}
				/>
				<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,12,18,0.9) 0%, rgba(10,12,18,0) 16%)' }} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '56%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					paddingLeft: 110,
					transform: `translateY(${rise}px)`,
				}}
			>
				<div style={{ fontSize: 88, fontWeight: 700, color: '#ffffff' }}>FAMILIENFAKTOR</div>
				<div style={{ fontSize: 48, fontWeight: 500, color: MUTED, marginTop: 30 }}>Für uns nur mittelmäßig</div>
				<div style={{ fontSize: 28, fontWeight: 500, color: 'rgba(224,224,228,0.45)', marginTop: 22 }}>Kinderangebote vorhanden</div>
			</div>
		</AbsoluteFill>
	);
};

// G) "FORMEL 1 & RENNSPORT" audience-fit beat — text left, photo right.
// "OLDTIMER & BUGATTI FANS" and "FAMILIEN" stay plain TextBeat: none of
// the available photos is a clear fit for the oldtimer-fan line without
// reusing an image already doing a different job elsewhere.
const RennsportBeat: React.FC<{ w: BeatWindow }> = ({ w }) => {
	const frame = useCurrentFrame();
	if (frame < w.start || frame > w.end) return null;
	const { opacity, rise } = beatStyle(frame, w);
	const scale = kenBurnsScale(frame, w, 0.04);
	return (
		<AbsoluteFill style={{ opacity, fontFamily: FONT }}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '42%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					paddingLeft: 110,
					transform: `translateY(${rise}px)`,
				}}
			>
				<div style={{ fontSize: 78, fontWeight: 700, color: '#ffffff', lineHeight: 1.12 }}>
					FORMEL 1 &amp;
					<br />
					RENNSPORT
				</div>
				<div style={{ fontSize: 48, fontWeight: 500, color: MUTED, marginTop: 26 }}>Sehr interessant</div>
			</div>
			<div style={{ position: 'absolute', right: 0, top: 0, width: '58%', height: '100%', overflow: 'hidden' }}>
				<Img
					src={staticFile(IMAGES.formula1Cars)}
					style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})` }}
				/>
				<div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(270deg, rgba(10,12,18,0.85) 0%, rgba(10,12,18,0) 14%)' }} />
			</div>
		</AbsoluteFill>
	);
};

const StarIcon: React.FC<{ size?: number }> = ({ size = 52 }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill={GOLD}>
		<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6 6.1 20.6l1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" />
	</svg>
);

// --- Continuous premium automotive background ----------------------------
// Deep graphite/navy base + slow-drifting bokeh + one original abstract
// long-hood hypercar silhouette (hand-built path, not traced from any real
// car/logo) + a slow gold light sweep + faint contour lines + grain +
// vignette. `frame` here is the GLOBAL frame (passed down), independent of
// which scene is active, so the environment drifts continuously for the
// whole piece rather than resetting per scene.
const CarSilhouette: React.FC<{ frame: number }> = ({ frame }) => {
	const drift = Math.sin(frame / 900) * 22;
	const sweepPos = (frame % 900) / 900; // one slow sweep roughly every 30s
	const sweepX = interpolate(sweepPos, [0, 1], [-500, 2400]);
	return (
		<div
			style={{
				position: 'absolute',
				right: -260 + drift,
				bottom: -60,
				width: 1500,
				height: 470,
				opacity: 0.22,
				filter: 'blur(14px)',
			}}
		>
			<svg width="100%" height="100%" viewBox="0 0 1600 500" style={{ overflow: 'visible' }}>
				<defs>
					<clipPath id="carClip">
						<path
							d="M30 380 C30 330 70 300 140 300 C160 260 220 235 300 230 C420 220 520 205 650 195
							 C660 140 700 100 780 85 C860 60 980 55 1080 65 C1140 70 1180 90 1210 120
							 C1260 150 1320 165 1380 175 C1460 185 1520 205 1560 240 C1580 260 1590 280 1592 300
							 C1594 330 1580 355 1550 370 C1500 385 1440 390 1380 392 L260 392
							 C200 392 150 388 30 380 Z"
						/>
					</clipPath>
					<radialGradient id="carBodyGradient" cx="45%" cy="45%" r="65%">
						<stop offset="0%" stopColor="rgba(200,212,230,0.8)" />
						<stop offset="55%" stopColor="rgba(175,190,215,0.45)" />
						<stop offset="100%" stopColor="rgba(150,165,195,0)" />
					</radialGradient>
					<linearGradient id="sweepGradient" x1="0" y1="0" x2="1" y2="0">
						<stop offset="0%" stopColor="#f4d78a" stopOpacity="0" />
						<stop offset="50%" stopColor="#f4d78a" stopOpacity="0.35" />
						<stop offset="100%" stopColor="#f4d78a" stopOpacity="0" />
					</linearGradient>
				</defs>
				{/* Flat fill + hard stroke previously read as a solid gray blob even
				    at low element opacity; a soft radial fill with no outline, under
				    moderate blur, reads as atmosphere instead of a shape. */}
				<path
					d="M30 380 C30 330 70 300 140 300 C160 260 220 235 300 230 C420 220 520 205 650 195
					 C660 140 700 100 780 85 C860 60 980 55 1080 65 C1140 70 1180 90 1210 120
					 C1260 150 1320 165 1380 175 C1460 185 1520 205 1560 240 C1580 260 1590 280 1592 300
					 C1594 330 1580 355 1550 370 C1500 385 1440 390 1380 392 L260 392
					 C200 392 150 388 30 380 Z"
					fill="url(#carBodyGradient)"
				/>
				<circle cx={220} cy={390} r={82} fill="none" stroke="rgba(210,220,235,0.3)" strokeWidth={2} />
				<circle cx={1300} cy={392} r={82} fill="none" stroke="rgba(210,220,235,0.3)" strokeWidth={2} />
				<path d="M300 258 C520 235 900 220 1300 208" fill="none" stroke="rgba(230,235,245,0.22)" strokeWidth={1.5} />
				{/* Soft light sweep clipped to the car body only */}
				<g clipPath="url(#carClip)">
					<rect x={sweepX} y={-50} width={140} height={600} fill="url(#sweepGradient)" transform={`rotate(20 ${sweepX} 250)`} />
				</g>
			</svg>
		</div>
	);
};

const Background: React.FC<{ frame: number }> = ({ frame }) => {
	const drift = (period: number, phase: number, amplitude: number) => Math.sin(frame / period + phase) * amplitude;

	return (
		<AbsoluteFill style={{ overflow: 'hidden' }}>
			<AbsoluteFill style={{ background: 'linear-gradient(150deg, #10131b 0%, #090b11 55%, #12151d 100%)' }} />

			<div
				style={{
					position: 'absolute',
					width: 800,
					height: 800,
					left: 220 + drift(500, 0, 40),
					top: 140 + drift(560, 1, 30),
					borderRadius: '50%',
					filter: 'blur(130px)',
					background: 'radial-gradient(circle, rgba(212,162,78,0.14) 0%, rgba(212,162,78,0) 70%)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 950,
					height: 950,
					left: 1300 + drift(520, 2, 35),
					top: 520 + drift(600, 0.5, 30),
					borderRadius: '50%',
					filter: 'blur(150px)',
					background: 'radial-gradient(circle, rgba(150,175,205,0.09) 0%, rgba(150,175,205,0) 70%)',
				}}
			/>

			<CarSilhouette frame={frame} />

			{/* Faint automotive contour hint, upper area */}
			<svg width="100%" height="100%" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.045 }}>
				<circle cx={1800} cy={160} r={440} fill="none" stroke="#ffffff" strokeWidth={1.2} />
				<circle cx={1800} cy={160} r={540} fill="none" stroke="#ffffff" strokeWidth={0.8} />
			</svg>

			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
					backgroundSize: '5px 5px',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 38%, rgba(0,0,0,0.5) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};

// =========================================================================
// SCENES — each uses local frame numbers (0 = scene start)
// =========================================================================

const TRANSITION_DURATION = ENTER_T; // 0.6s, within the 0.5–0.9s transition band

// --- Context ---------------------------------------------------------------
const CONTEXT_DURATION = CONTEXT_ENTER + CONTEXT_HOLD + EXIT_T;

const ContextScene: React.FC = () => {
	const frame = useCurrentFrame();
	const fullyVisibleEnd = CONTEXT_ENTER + CONTEXT_HOLD;
	const wholeOpacity = frame > fullyVisibleEnd ? interpolate(frame, [fullyVisibleEnd, CONTEXT_DURATION], [1, 0], CLAMP) : 1;

	const kickerSize = interpolate(frame, [0, CONTEXT_ENTER], [96, 36], CLAMP);
	const kickerY = interpolate(frame, [0, CONTEXT_ENTER], [0, -230], CLAMP);
	const kickerOpacity = interpolate(frame, [0, 16], [0, 1], CLAMP);
	// Masked cinematic reveal for the main question — a horizontal wipe
	// rather than a plain fade, per the "slow cinematic masked typography
	// reveal" requirement for the opening statement.
	const maskProgress = interpolate(frame, [10, CONTEXT_ENTER], [0, 100], CLAMP);
	const questionOpacity = interpolate(frame, [10, 24], [0, 1], CLAMP);
	const destinationOpacity = interpolate(frame, [CONTEXT_ENTER - 8, CONTEXT_ENTER + 8], [0, 1], CLAMP);

	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center', opacity: wholeOpacity }}>
			<div
				style={{
					position: 'absolute',
					transform: `translateY(${kickerY}px)`,
					fontSize: kickerSize,
					fontWeight: 700,
					letterSpacing: 4,
					color: '#ffffff',
					opacity: kickerOpacity,
				}}
			>
				UNSER FAZIT
			</div>
			<div
				style={{
					opacity: questionOpacity,
					padding: '0 150px',
					clipPath: `inset(0 ${100 - maskProgress}% 0 0)`,
				}}
			>
				<div style={{ fontSize: 84, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
					Lohnt sich das
					<br />
					Automuseum Mulhouse?
				</div>
			</div>
			<div style={{ position: 'absolute', bottom: 130, fontSize: 30, fontWeight: 500, color: MUTED, opacity: destinationOpacity }}>
				Musée National de l'Automobile
			</div>
		</AbsoluteFill>
	);
};

// --- Liked -------------------------------------------------------------
const LIKED_BEATS: BeatSpec[] = [
	{ title: 'WAS UNS GEFALLEN HAT', enter: ENTER_T, hold: HEADER_HOLD, exit: EXIT_T },
	{ title: 'BEEINDRUCKENDE SAMMLUNG', subtitle: 'Oldtimer · Bugatti · Automobilgeschichte', enter: ENTER_T, hold: POSITIVE_HOLD, exit: EXIT_T },
	{ title: 'UNSERE HIGHLIGHTS', subtitle: 'Lamborghini & Formel 1', enter: ENTER_T, hold: POSITIVE_HOLD, exit: EXIT_T },
	{ title: 'ANFAHRT EINFACH', subtitle: 'Großer Parkplatz · unkompliziert erreichbar', enter: ENTER_T, hold: POSITIVE_HOLD, exit: EXIT_T },
];
const LIKED_WINDOWS = layoutBeats(LIKED_BEATS);
const LIKED_DURATION = sceneDuration(LIKED_WINDOWS);

const LikedScene: React.FC = () => (
	<>
		<HeaderBeat w={LIKED_WINDOWS[0]} />
		<SammlungBeat w={LIKED_WINDOWS[1]} />
		<HighlightsBeat w={LIKED_WINDOWS[2]} />
		<TextBeat w={LIKED_WINDOWS[3]} />
	</>
);

// --- Disliked ----------------------------------------------------------
const DISLIKED_BEATS: BeatSpec[] = [
	{ title: 'WAS UNS GEFEHLT HAT', enter: ENTER_T, hold: HEADER_HOLD, exit: EXIT_T },
	{ title: 'VIELE EXTRAS KOSTEN ZUSÄTZLICH', enter: ENTER_T, hold: NEGATIVE_HOLD, exit: EXIT_T },
	// The interaction complaint is the strongest criticism — it gets the
	// longest hold and the largest title of the three.
	{
		title: 'KAUM INTERAKTION',
		subtitle: 'Einsteigen & Anfassen fast nicht möglich',
		enter: ENTER_T,
		hold: NEGATIVE_STRONG_HOLD,
		exit: EXIT_T,
		titleSize: 104,
	},
	{ title: 'FAMILIENFAKTOR', subtitle: 'Für uns nur mittelmäßig', enter: ENTER_T, hold: NEGATIVE_HOLD, exit: EXIT_T },
];
const DISLIKED_WINDOWS = layoutBeats(DISLIKED_BEATS);
const DISLIKED_DURATION = sceneDuration(DISLIKED_WINDOWS);

const DislikedScene: React.FC = () => (
	<>
		<HeaderBeat w={DISLIKED_WINDOWS[0]} />
		<ExtrasBeat w={DISLIKED_WINDOWS[1]} />
		<InteraktionBeat w={DISLIKED_WINDOWS[2]} />
		<FamilienBeat w={DISLIKED_WINDOWS[3]} />
	</>
);

// --- Community -----------------------------------------------------------
const COMMUNITY_BEATS: BeatSpec[] = [
	{ title: 'WAS SAGEN ANDERE BESUCHER?', enter: ENTER_T, hold: HEADER_HOLD, exit: EXIT_T },
	{ title: 'GOOGLE', enter: ENTER_T, hold: RATING_HOLD, exit: EXIT_T },
	{ title: 'TRIPADVISOR', enter: ENTER_T, hold: RATING_HOLD, exit: EXIT_T },
	{ title: 'ONLINE DEUTLICH POSITIVER ALS UNSERE ERFAHRUNG', enter: ENTER_T, hold: TAKEAWAY_HOLD, exit: EXIT_T },
];
const COMMUNITY_WINDOWS = layoutBeats(COMMUNITY_BEATS);
const COMMUNITY_DURATION = sceneDuration(COMMUNITY_WINDOWS);

const CommunityScene: React.FC = () => {
	const frame = useCurrentFrame();
	const [header, google, trip, takeaway] = COMMUNITY_WINDOWS;
	const googleOpacity = frame >= google.start && frame <= google.end ? beatStyle(frame, google).opacity : 0;
	const tripOpacity = frame >= trip.start && frame <= trip.end ? beatStyle(frame, trip).opacity : 0;
	const takeawayOpacity = frame >= takeaway.start && frame <= takeaway.end ? beatStyle(frame, takeaway).opacity : 0;

	return (
		<>
			<HeaderBeat w={header} />
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center', opacity: googleOpacity }}>
				<div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 4, color: MUTED }}>GOOGLE</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 24 }}>
					<StarIcon size={64} />
					<div style={{ fontSize: 130, fontWeight: 700, color: GOLD }}>{COMMUNITY_RATINGS.google.score} / 5</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center', opacity: tripOpacity }}>
				<div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 4, color: MUTED }}>TRIPADVISOR</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 24 }}>
					<StarIcon size={64} />
					<div style={{ fontSize: 130, fontWeight: 700, color: GOLD }}>{COMMUNITY_RATINGS.tripadvisor.score} / 5</div>
				</div>
				<div style={{ fontSize: 24, color: MUTED, marginTop: 20 }}>
					≈{COMMUNITY_RATINGS.tripadvisor.reviewCount.toLocaleString('de-DE')} Bewertungen
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center', opacity: takeawayOpacity, padding: '0 160px' }}>
				<div style={{ fontSize: 62, fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
					ONLINE DEUTLICH POSITIVER
					<br />
					ALS UNSERE ERFAHRUNG
				</div>
			</AbsoluteFill>
		</>
	);
};

// --- Audience fit ----------------------------------------------------------
const AUDIENCE_BEATS: BeatSpec[] = [
	{ title: 'FÜR WEN LOHNT ES SICH?', enter: ENTER_T, hold: HEADER_HOLD, exit: EXIT_T },
	{ title: 'OLDTIMER & BUGATTI FANS', subtitle: 'Sehr gut geeignet', enter: ENTER_T, hold: AUDIENCE_HOLD, exit: EXIT_T, titleSize: 78 },
	{ title: 'FORMEL 1 & RENNSPORT', subtitle: 'Sehr interessant', enter: ENTER_T, hold: AUDIENCE_HOLD, exit: EXIT_T, titleSize: 78 },
	{ title: 'FAMILIEN', subtitle: 'Nur bedingt', enter: ENTER_T, hold: AUDIENCE_STRONG_HOLD, exit: EXIT_T, titleSize: 78 },
];
const AUDIENCE_WINDOWS = layoutBeats(AUDIENCE_BEATS);
const AUDIENCE_DURATION = sceneDuration(AUDIENCE_WINDOWS);

const AudienceScene: React.FC = () => (
	<>
		<HeaderBeat w={AUDIENCE_WINDOWS[0]} />
		<TextBeat w={AUDIENCE_WINDOWS[1]} />
		<RennsportBeat w={AUDIENCE_WINDOWS[2]} />
		<TextBeat w={AUDIENCE_WINDOWS[3]} />
	</>
);

// --- Personal quote ----------------------------------------------------
// The slowest moment of the piece by design: a long, calm, static hold
// with nothing important animating — only the shared background may
// keep drifting underneath.
const QUOTE_DURATION = QUOTE_ENTER + QUOTE_HOLD + EXIT_T;

const QuoteScene: React.FC = () => {
	const frame = useCurrentFrame();
	const fullyVisibleEnd = QUOTE_ENTER + QUOTE_HOLD;
	const wholeOpacity = frame > fullyVisibleEnd ? interpolate(frame, [fullyVisibleEnd, QUOTE_DURATION], [1, 0], CLAMP) : 1;
	const lineOpacity = (i: number) => interpolate(frame, [i * 20, i * 20 + 20], [0, 1], CLAMP);
	const attributionOpacity = interpolate(frame, [80, 100], [0, 1], CLAMP);

	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center', padding: '0 210px', opacity: wholeOpacity }}>
			{/* Very subtle atmospheric photo layer, heavily darkened + blurred —
			    low enough dominance to never compete with the quote itself. */}
			<AbsoluteFill style={{ opacity: 0.1, filter: 'blur(6px) grayscale(0.3)' }}>
				<Img src={staticFile(IMAGES.formula1Wide)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
			</AbsoluteFill>
			<div>
				{QUOTE_LINES.map((line, i) => (
					<div key={line} style={{ fontSize: 56, fontWeight: 500, color: '#ffffff', lineHeight: 1.55, opacity: lineOpacity(i) }}>
						{line}
					</div>
				))}
			</div>
			<div style={{ fontSize: 26, fontWeight: 500, color: MUTED, marginTop: 48, opacity: attributionOpacity }}>
				Unser Fazit nach dem Besuch
			</div>
		</AbsoluteFill>
	);
};

// --- Score overview: "UNSERE BEWERTUNG" -------------------------------
// All 8 categories shown together as a 5-star rating (star count derived
// proportionally from the real score/max — never hard-coded, half-star
// precision) instead of mixed-denominator fractions (15/20, 8/15, 8/10…),
// which read as an unnecessary maths puzzle. The header + 8 category names
// fade/rise in as ONE block, then each row's star rating builds up in a
// fast top-to-bottom cascade, then everything holds completely static and
// readable for ~5s before transitioning to the final score screen. The
// 63/100 total deliberately does NOT appear here — only in FinalScene
// below, so the overall score is never shown twice in a row. Individual
// x/y values are intentionally not shown anywhere in this scene either.
const starRating = (score: number, max: number) => Math.round((score / max) * 5 * 2) / 2;

const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6 6.1 20.6l1.3-6.6-4.9-4.6 6.6-.8L12 2.5z';

// A single star whose fill fraction (0, 0.5, or 1) is expressed as a hard
// two-stop gradient — gold up to the fill point, dim gray after — so a
// half star reads as a clean, deliberate gold/gray split rather than a
// blur or an overlaid clip hack.
const RatingStar: React.FC<{ fill: number; size: number; gradientId: string }> = ({ fill, size, gradientId }) => {
	const pct = Math.round(Math.max(0, Math.min(1, fill)) * 100);
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			<defs>
				<linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
					<stop offset={`${pct}%`} stopColor={GOLD} />
					<stop offset={`${pct}%`} stopColor="rgba(255,255,255,0.16)" />
				</linearGradient>
			</defs>
			<path d={STAR_PATH} fill={`url(#${gradientId})`} />
		</svg>
	);
};

const OVERVIEW_STAR_SIZE = 50;

// `rowIndex` (not the label) feeds the gradient id: SVG ids/URL fragments
// can't contain spaces or "&", both of which appear in labels like
// "Erlebnis & Wow" — using the label broke `url(#...)` silently on every
// multi-word category, leaving those stars fully unfilled. `idPrefix`
// keeps the always-visible gray base layer and the animated gold overlay
// (rendered on top of each other, see OverviewRow) from colliding on the
// same ids.
const StarRow: React.FC<{ rating: number; rowIndex: number; idPrefix: string }> = ({ rating, rowIndex, idPrefix }) => (
	<div style={{ display: 'flex', gap: OVERVIEW_STAR_SIZE * 0.22 }}>
		{[0, 1, 2, 3, 4].map((i) => (
			<RatingStar key={i} fill={rating - i} size={OVERVIEW_STAR_SIZE} gradientId={`star-${idPrefix}-${rowIndex}-${i}`} />
		))}
	</div>
);

const OVERVIEW_ROW_WIDTH = 1560;

// Dim gray star slots are visible from the moment the block appears (the
// base layer below, rating=0, always fully opaque). The true gold rating
// is a second, identical star row drawn directly on top, revealed
// left-to-right via a growing clip-path — the same inset() wipe idiom
// ContextScene already uses for its masked title reveal. Because the gold
// layer is the SAME pre-rendered half/full/empty stars as before (via
// RatingStar's existing gradient split), the wipe never has to re-derive
// half-star correctness — it just uncovers whatever was already correct.
const OverviewRow: React.FC<{ label: string; rating: number; rowIndex: number; starFillFrame: number }> = ({
	label,
	rating,
	rowIndex,
	starFillFrame,
}) => {
	const localFrame = starFillFrame - rowIndex * STAR_ROW_STAGGER;
	const progress = interpolate(localFrame, [0, STAR_ROW_FILL_DURATION], [0, 1], CLAMP);
	// Very subtle settle pulse exactly as this row's own fill completes —
	// small enough to read as quality finishing touch, not motion for its
	// own sake. No jump/rotate/heavy scale anywhere.
	const pulse = interpolate(localFrame, [STAR_ROW_FILL_DURATION - 6, STAR_ROW_FILL_DURATION, STAR_ROW_FILL_DURATION + 6], [1, 1.03, 1], CLAMP);

	return (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: OVERVIEW_ROW_WIDTH, marginBottom: 38 }}>
			<div style={{ fontSize: 40, fontWeight: 600, color: '#ffffff' }}>{label}</div>
			<div style={{ position: 'relative', transform: `scale(${pulse})` }}>
				<StarRow rating={0} rowIndex={rowIndex} idPrefix="base" />
				<div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}>
					<StarRow rating={rating} rowIndex={rowIndex} idPrefix="fill" />
				</div>
			</div>
		</div>
	);
};

// Hold begins only once the LAST row's gold fill has fully completed —
// not stolen from the text-block time, and not shortening the scene.
const STAR_ANIMATION_SPAN = (FINAL_CATEGORIES.length - 1) * STAR_ROW_STAGGER + STAR_ROW_FILL_DURATION;
const OVERVIEW_HOLD_START = OVERVIEW_ENTER + STAR_ANIMATION_SPAN;
const OVERVIEW_DURATION = OVERVIEW_HOLD_START + OVERVIEW_HOLD + OVERVIEW_EXIT;

const OverviewScene: React.FC = () => {
	const frame = useCurrentFrame();
	const fullyVisibleEnd = OVERVIEW_HOLD_START + OVERVIEW_HOLD;
	const wholeOpacity = frame > fullyVisibleEnd ? interpolate(frame, [fullyVisibleEnd, OVERVIEW_DURATION], [1, 0], CLAMP) : 1;
	// One single enter animation for the category-name block — deliberately
	// NOT per-row, per "Texte/Kategorien dürfen weiterhin gemeinsam
	// erscheinen". The gold-fill wave below is a separate, later phase.
	const enterOpacity = interpolate(frame, [0, OVERVIEW_ENTER], [0, 1], CLAMP);
	const enterRise = interpolate(frame, [0, OVERVIEW_ENTER], [24, 0], CLAMP);
	const starFillFrame = frame - OVERVIEW_ENTER;

	return (
		<AbsoluteFill style={{ fontFamily: FONT, opacity: wholeOpacity, justifyContent: 'center', alignItems: 'center' }}>
			<div style={{ opacity: enterOpacity, transform: `translateY(${enterRise}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
				<div style={{ textAlign: 'center' }}>
					<div style={{ fontSize: 42, fontWeight: 700, letterSpacing: 3, color: '#ffffff' }}>UNSERE BEWERTUNG</div>
					<div style={{ width: 100, height: 3, backgroundColor: GOLD, margin: '20px auto 0' }} />
				</div>
				<div style={{ marginTop: 68 }}>
					{FINAL_CATEGORIES.map((cat, i) => (
						<OverviewRow key={cat.label} label={cat.label} rating={starRating(cat.score, cat.max)} rowIndex={i} starFillFrame={starFillFrame} />
					))}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Final screen ------------------------------------------------------
// The actual score reveal now lives here (OverviewScene no longer shows
// 63/100, so it never appears twice in a row). Sequential choreography:
// label appears first and dezent → the big number counts up 0→FINAL_SCORE
// → a very subtle settle pulse when it lands → verdict → sub-line → then
// everything holds completely still. Still the simplest screen of the
// whole piece — same four elements as before, nothing repeated from
// earlier sections.
const FINAL_LABEL_END = 12;
const FINAL_SCORE_FADE_START = 8;
const FINAL_SCORE_FADE_END = 18;
const FINAL_COUNT_START = 14;
const FINAL_COUNT_END = 44; // 30 frames ≈ 1.0s count-up, within the requested 0.8–1.2s
const FINAL_PULSE_PEAK = 50;
const FINAL_PULSE_END = 56;
const FINAL_VERDICT_START = 58;
const FINAL_VERDICT_END = 70;
const FINAL_SUB_START = 74;
const FINAL_SUB_END = 86;
const FINAL_ENTER = FINAL_SUB_END; // everything has finished appearing by here

const FinalScene: React.FC = () => {
	const frame = useCurrentFrame();
	const labelOpacity = interpolate(frame, [0, FINAL_LABEL_END], [0, 1], CLAMP);
	const scoreBlockOpacity = interpolate(frame, [FINAL_SCORE_FADE_START, FINAL_SCORE_FADE_END], [0, 1], CLAMP);
	const scoreValue = Math.round(interpolate(frame, [FINAL_COUNT_START, FINAL_COUNT_END], [0, FINAL_SCORE], CLAMP));
	// Very subtle settle pulse exactly as the count-up lands — no bounce,
	// no gimmick, just enough to feel like the number "arrived".
	const pulseScale = interpolate(frame, [FINAL_COUNT_END, FINAL_PULSE_PEAK, FINAL_PULSE_END], [1, 1.035, 1], CLAMP);
	const verdictOpacity = interpolate(frame, [FINAL_VERDICT_START, FINAL_VERDICT_END], [0, 1], CLAMP);
	const subOpacity = interpolate(frame, [FINAL_SUB_START, FINAL_SUB_END], [0, 1], CLAMP);

	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center' }}>
			<div style={{ fontSize: 38, fontWeight: 500, letterSpacing: 4, color: MUTED, opacity: labelOpacity }}>TASAN TRIP SCORE</div>
			<div style={{ fontSize: 200, fontWeight: 700, color: GOLD, marginTop: 12, opacity: scoreBlockOpacity, transform: `scale(${pulseScale})` }}>
				{scoreValue} / 100
			</div>
			<div style={{ opacity: verdictOpacity, marginTop: 28 }}>
				<div style={{ fontSize: 54, fontWeight: 700, color: '#ffffff' }}>{FINAL_VERDICT_LABEL}</div>
			</div>
			<div style={{ opacity: subOpacity, marginTop: 16 }}>
				<div style={{ fontSize: 34, fontWeight: 500, color: MUTED }}>{FINAL_VERDICT_SUB}</div>
			</div>
		</AbsoluteFill>
	);
};

// =========================================================================

const SCENE = {
	context: CONTEXT_DURATION,
	liked: LIKED_DURATION,
	disliked: DISLIKED_DURATION,
	community: COMMUNITY_DURATION,
	audience: AUDIENCE_DURATION,
	quote: QUOTE_DURATION,
	overview: OVERVIEW_DURATION,
	final: FINAL_ENTER + FINAL_HOLD,
};

export const MulhouseTripScore: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	void fps;

	const transition = () => <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION_DURATION })} />;

	return (
		<AbsoluteFill style={{ backgroundColor: '#0a0c12' }}>
			<Background frame={frame} />
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={SCENE.context}>
					<ContextScene />
				</TransitionSeries.Sequence>
				{transition()}
				<TransitionSeries.Sequence durationInFrames={SCENE.liked}>
					<LikedScene />
				</TransitionSeries.Sequence>
				{transition()}
				<TransitionSeries.Sequence durationInFrames={SCENE.disliked}>
					<DislikedScene />
				</TransitionSeries.Sequence>
				{transition()}
				<TransitionSeries.Sequence durationInFrames={SCENE.community}>
					<CommunityScene />
				</TransitionSeries.Sequence>
				{transition()}
				<TransitionSeries.Sequence durationInFrames={SCENE.audience}>
					<AudienceScene />
				</TransitionSeries.Sequence>
				{transition()}
				<TransitionSeries.Sequence durationInFrames={SCENE.quote}>
					<QuoteScene />
				</TransitionSeries.Sequence>
				{transition()}
				<TransitionSeries.Sequence durationInFrames={SCENE.overview}>
					<OverviewScene />
				</TransitionSeries.Sequence>
				{transition()}
				<TransitionSeries.Sequence durationInFrames={SCENE.final}>
					<FinalScene />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

// Net composition length = sum(scene durations) - sum(transition durations).
// No total-duration target: this is purely the result of the readable
// holds above. Exported for Root.tsx so the two never drift apart.
export const MULHOUSE_TRIP_SCORE_DURATION =
	Object.values(SCENE).reduce((a, b) => a + b, 0) - 7 * TRANSITION_DURATION;
