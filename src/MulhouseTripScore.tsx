import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
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
	{ label: 'Zeitwert', score: 7, max: 10 },
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

const ENTER_CAT = S(1.0); // category name + bar animate in
const HOLD_CAT = S(2.3); // >=2.0s AFTER the score/bar has fully animated in
const DOCK_CAT = S(0.5); // cross-dissolve into the accumulating list
const CATEGORY_ADVANCE = ENTER_CAT + HOLD_CAT; // next category's enter starts here
const CATEGORY_TOTAL = CATEGORY_ADVANCE + DOCK_CAT;

const SCORE_TOTAL_ENTER = S(1.5); // "GESAMT" label + count-up reveal
const SCORE_TOTAL_HOLD = S(5.5); // full 8-row breakdown + total: >=5.0s
const SCORE_TOTAL_EXIT = EXIT_T;

const FINAL_ENTER = S(2.2); // score count-up + staggered verdict/sub reveal
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
		<TextBeat w={LIKED_WINDOWS[1]} />
		<TextBeat w={LIKED_WINDOWS[2]} />
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
		<TextBeat w={DISLIKED_WINDOWS[1]} />
		<TextBeat w={DISLIKED_WINDOWS[2]} />
		<TextBeat w={DISLIKED_WINDOWS[3]} />
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
		<TextBeat w={AUDIENCE_WINDOWS[2]} />
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

// --- Score build (FOCUS → DOCK → NEXT) -------------------------------------
// Per category: enter (name + bar animate in) → hold (score fully visible,
// completely static, genuinely readable) → dock (cross-dissolve into the
// accumulating list). The dock is a cross-dissolve, not a physical slide:
// sliding a card down through the same column the list occupies is
// geometrically guaranteed to cross every earlier row, which is exactly
// the collision bug already root-caused and fixed earlier — retiming here
// must not reintroduce it, so the mechanism itself is unchanged, only its
// durations are.
const DOCK_ROW_HEIGHT = 50;
const LIST_TOP = 430;
const FOCUS_Y = 210;

const CategoryRow: React.FC<{ index: number; localFrame: number }> = ({ index, localFrame }) => {
	const cat = FINAL_CATEGORIES[index];
	const slotStart = index * CATEGORY_ADVANCE;
	const frame = localFrame - slotStart;
	if (frame < 0) return null;

	const appear = spring({ frame, fps: FPS, config: { damping: 16, stiffness: 120, mass: 0.6, overshootClamping: true } });
	const rowOpacity = Math.min(1, appear * 1.4);
	const dockY = LIST_TOP + index * DOCK_ROW_HEIGHT;

	// Bar fills only during ENTER; extrapolateRight clamp means it then
	// holds at its final value for the rest of the beat — no further
	// motion during the readable hold.
	const fill = (cat.score / cat.max) * interpolate(frame, [0, ENTER_CAT], [0, 1], CLAMP);

	const focusFade = interpolate(frame, [CATEGORY_ADVANCE, CATEGORY_ADVANCE + 8], [1, 0], CLAMP);
	const focusScale = interpolate(frame, [CATEGORY_ADVANCE, CATEGORY_ADVANCE + 8], [1, 0.62], CLAMP);
	const dockFade = interpolate(frame, [CATEGORY_ADVANCE + 5, CATEGORY_TOTAL], [0, 1], CLAMP);
	const dockRiseY = interpolate(dockFade, [0, 1], [dockY + 16, dockY]);

	return (
		<>
			{focusFade > 0.01 && (
				<div
					style={{
						position: 'absolute',
						top: FOCUS_Y,
						left: '50%',
						transform: `translate(-50%, -50%) scale(${focusScale})`,
						textAlign: 'center',
						opacity: rowOpacity * focusFade,
						fontFamily: FONT,
					}}
				>
					<div style={{ fontSize: 44, fontWeight: 700, color: '#ffffff' }}>{cat.label}</div>
					<div style={{ fontSize: 110, fontWeight: 700, color: GOLD, marginTop: 14 }}>
						{cat.score} / {cat.max}
					</div>
					<div style={{ width: 560, height: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', margin: '14px auto 0' }}>
						<div style={{ width: `${fill * 100}%`, height: '100%', borderRadius: 14, backgroundColor: GOLD }} />
					</div>
				</div>
			)}
			{dockFade > 0.01 && (
				<div
					style={{
						position: 'absolute',
						top: dockRiseY,
						left: '50%',
						transform: 'translate(-50%, -50%)',
						display: 'flex',
						alignItems: 'center',
						width: 780,
						fontFamily: FONT,
						opacity: rowOpacity * dockFade,
					}}
				>
					<div style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', width: 300 }}>{cat.label}</div>
					<div style={{ flex: 1, height: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)', margin: '0 20px' }}>
						<div style={{ width: `${(cat.score / cat.max) * 100}%`, height: '100%', borderRadius: 6, backgroundColor: GOLD }} />
					</div>
					<div style={{ fontSize: 24, fontWeight: 700, color: GOLD, width: 70, textAlign: 'right' }}>
						{cat.score}/{cat.max}
					</div>
				</div>
			)}
		</>
	);
};

const CATEGORIES_PHASE_END = (FINAL_CATEGORIES.length - 1) * CATEGORY_ADVANCE + CATEGORY_TOTAL;
const SCORE_BUILD_DURATION = CATEGORIES_PHASE_END + SCORE_TOTAL_ENTER + SCORE_TOTAL_HOLD + SCORE_TOTAL_EXIT;

const ScoreBuildScene: React.FC = () => {
	const frame = useCurrentFrame();
	const totalPhaseFrame = frame - CATEGORIES_PHASE_END;
	const totalOpacity = totalPhaseFrame < 0 ? 0 : interpolate(totalPhaseFrame, [0, SCORE_TOTAL_ENTER], [0, 1], CLAMP);
	const totalScoreValue = Math.round(interpolate(totalPhaseFrame, [0, SCORE_TOTAL_ENTER], [0, FINAL_SCORE], CLAMP));
	const sceneFullyVisibleEnd = CATEGORIES_PHASE_END + SCORE_TOTAL_ENTER + SCORE_TOTAL_HOLD;
	const wholeOpacity = frame > sceneFullyVisibleEnd ? interpolate(frame, [sceneFullyVisibleEnd, SCORE_BUILD_DURATION], [1, 0], CLAMP) : 1;

	return (
		<AbsoluteFill style={{ fontFamily: FONT, opacity: wholeOpacity }}>
			<div style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
				<div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 3, color: MUTED }}>WIE SICH DER SCORE ZUSAMMENSETZT</div>
			</div>
			{FINAL_CATEGORIES.map((_, i) => (
				<CategoryRow key={FINAL_CATEGORIES[i].label} index={i} localFrame={frame} />
			))}
			<div
				style={{
					position: 'absolute',
					top: LIST_TOP + FINAL_CATEGORIES.length * DOCK_ROW_HEIGHT + 70,
					left: '50%',
					transform: 'translateX(-50%)',
					textAlign: 'center',
					opacity: totalOpacity,
				}}
			>
				<div style={{ fontSize: 32, fontWeight: 500, letterSpacing: 3, color: MUTED }}>GESAMT</div>
				<div style={{ fontSize: 96, fontWeight: 700, color: GOLD, marginTop: 6 }}>{totalScoreValue} / 100</div>
			</div>
		</AbsoluteFill>
	);
};

// --- Final screen ------------------------------------------------------
// Simplest screen of the whole piece: four elements, nothing repeated
// from earlier sections, then genuinely nothing moves for the hold.
const FinalScene: React.FC = () => {
	const frame = useCurrentFrame();
	const blockOpacity = interpolate(frame, [0, 15], [0, 1], CLAMP);
	const scoreValue = Math.round(interpolate(frame, [8, 40], [0, FINAL_SCORE], CLAMP));
	const verdictOpacity = interpolate(frame, [40, 52], [0, 1], CLAMP);
	const subOpacity = interpolate(frame, [52, 64], [0, 1], CLAMP);

	return (
		<AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily: FONT, textAlign: 'center', opacity: blockOpacity }}>
			<div style={{ fontSize: 38, fontWeight: 500, letterSpacing: 4, color: MUTED }}>TASAN TRIP SCORE</div>
			<div style={{ fontSize: 200, fontWeight: 700, color: GOLD, marginTop: 12 }}>{scoreValue} / 100</div>
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
	scoreBuild: SCORE_BUILD_DURATION,
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
				<TransitionSeries.Sequence durationInFrames={SCENE.scoreBuild}>
					<ScoreBuildScene />
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
