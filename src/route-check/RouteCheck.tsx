import React, { useEffect, useRef, useState } from 'react';
import {
	AbsoluteFill,
	continueRender,
	delayRender,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { LngLat, LngLatBounds, Map as MapLibreMap, config as maplibreConfig } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ---------------------------------------------------------------------
// Generic, config-driven Route Check. Visual design, timing logic, map
// style and animation follow the reference implementation
// src/mulhouse-automobile-museum/MulhouseRouteCheck.tsx 1:1 (that file
// stays untouched so video 1 renders exactly as before). Per video only
// a RouteCheckConfig JSON (src/<slug>/route-check.json) and the cached
// routes file public/geo/<slug>-routes.geojson (scripts/fetch-routes.py)
// are needed. Basemap: MapLibre + OpenFreeMap; borders: Natural Earth
// (public/geo/country-borders.geojson); routes: OSRM, cached locally.
// ---------------------------------------------------------------------

maplibreConfig.WORKER_URL = staticFile('maplibre/maplibre-gl-worker.mjs');

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

export type Coords = { lon: number; lat: number };
export type RouteCheckOrigin = {
	key: string;
	label: string;
	country?: string; // 'FR' | 'DE' | 'CH' ...
	time: string; // on-screen label, e.g. '50 Min.'
	emphasis?: boolean; // primary origin: bigger line/label
	coords: Coords;
	labelOffset?: { x: number; y: number }; // override default label position (px from marker)
	/** Reveal time in s (default: firstOriginAt + index * originStep). */
	at?: number;
};
export type RouteCheckConfig = {
	heading: string;
	subtitle: string;
	destination: { name: string; tagline?: string; /** where it is, e.g. 'in Hunawihr · bei Colmar' */ location?: string; country?: string; coords: Coords };
	origins: RouteCheckOrigin[];
	/** Optional practical info on the plate, revealed after the last route (e.g. parking, public transport). */
	infoLines?: { text: string; size?: 'main' | 'detail'; /** reveal time in s (default: with the title) */ at?: number; /** fade duration in s */ fade?: number }[];
	countryLabels?: { code: string; lon: number; lat: number }[];
	cameraPadding?: { top: number; bottom: number; left: number; right: number };
	/** 'dark' (default, TASAN dark/gold as in video 1) or 'light' (cream/green, family look). */
	theme?: 'dark' | 'light';
	/** Vertical shift of the destination info plate in px (default -55 = as reference). */
	plateOffsetY?: number;
	/** Horizontal shift (px, negative = left) and width of the info plate (default 0 / 660). */
	plateOffsetX?: number;
	plateWidth?: number;
	/** Map background colour (default: theme). */
	mapBackground?: string;
	/** Frosted-glass plate: fill colour incl. alpha, blur radius (px), saturation, border, shadow. All optional (default: theme). */
	plate?: { background?: string; blur?: number; saturate?: number; border?: string; shadow?: string };
	/** Timing in SECONDS: sync the reveals to the voice-over here, no code changes needed. */
	timing?: RouteCheckTiming;
};
/** at = reveal time (s), fade = fade-in duration (s). */
export type TextTiming = { at?: number; fade?: number };
export type RouteCheckTiming = {
	/** Destination marker (default 2). */
	destinationAt?: number;
	/** First origin route starts (default 4); next origins follow every `originStep` s (default 62/30). */
	/** Map + heading only until then; the camera push-in ends here (default 2). Keep <= first text reveal so the plate does not drift. */
	establishSeconds?: number;
	firstOriginAt?: number;
	originStep?: number;
	/** Default fade-in duration of all text blocks (default 0.6) incl. a small upward move. */
	fadeSeconds?: number;
	/** Start of the static end image; total duration = endImageAt + holdSeconds (default: after the last reveal). */
	endImageAt?: number;
	/** Info plate itself (default: with the title). */
	plate?: TextTiming;
	title?: TextTiming;
	tagline?: TextTiming;
	location?: TextTiming;
};
export type RouteCheckProps = { holdSeconds: number };

type Theme = {
	style: string; bg: string; accent: string; accentSoft: string; tag: string;
	heading: string; subheading: string; headingShadow: string;
	border: string; countryLabel: string;
	routeCasing: string; routeMain: string; routeSecondary: string;
	marker: string; label: string; labelShadow: string;
	plateBg: string; plateBlur: number; plateSaturate: number; plateBorder?: string; plateShadow?: string; plateName: string; plateTagline: string; plateDetail: string; attribution: string; attributionBg: string; timeText: string;
};
// 'dark' = exact values of the reference (video 1). 'light' = cream/green family look.
const THEMES: Record<'dark' | 'light', Theme> = {
	dark: {
		style: 'geo/tasan-map-style.json', bg: '#0a0d13', accent: '#d4a24e', accentSoft: '#f4d78a', tag: 'rgba(220,220,220,0.55)',
		heading: '#f5f5f5', subheading: 'rgba(255,255,255,0.5)', headingShadow: '0 2px 14px rgba(0,0,0,0.8)',
		border: 'rgba(195,205,215,0.55)', countryLabel: 'rgba(255,255,255,0.22)',
		routeCasing: 'rgba(6,8,12,0.55)', routeMain: 'rgba(220,172,90,0.95)', routeSecondary: 'rgba(212,162,78,0.75)',
		marker: '#ffffff', label: '#ffffff', labelShadow: '0 2px 10px rgba(0,0,0,0.7)',
		plateBg: 'rgba(8,10,15,0.65)', plateBlur: 0, plateSaturate: 1, plateName: '#ffffff', plateTagline: '#e4e4e4', plateDetail: 'rgba(255,255,255,0.68)',
		attribution: 'rgba(255,255,255,0.55)', attributionBg: 'transparent', timeText: '#d4a24e',
	},
	light: {
		style: 'geo/tasan-map-style-light.json', bg: '#f6f1e3', accent: '#d9622b', accentSoft: '#b8460f', tag: 'rgba(60,80,65,0.6)',
		heading: '#1f3d2b', subheading: 'rgba(31,61,43,0.7)', headingShadow: '0 1px 10px rgba(246,241,227,0.95)',
		border: 'rgba(70,95,85,0.5)', countryLabel: 'rgba(31,61,43,0.28)',
		routeCasing: 'rgba(255,255,255,0.9)', routeMain: 'rgba(217,98,43,1)', routeSecondary: 'rgba(217,98,43,0.88)',
		marker: '#1f3d2b', label: '#1f3d2b', labelShadow: '0 1px 8px rgba(246,241,227,0.95)',
		plateBg: 'rgba(250,247,235,0.24)', plateBlur: 5, plateSaturate: 1.15, plateBorder: '1.5px solid rgba(255,255,255,0.7)', plateShadow: '0 6px 28px rgba(31,61,43,0.10)', plateName: '#1f3d2b', plateTagline: '#2f5a40', plateDetail: 'rgba(31,61,43,0.75)',
		attribution: 'rgba(31,61,43,0.75)', attributionBg: 'rgba(246,241,227,0.85)', timeText: '#b8460f',
	},
};

// Timeline (30 fps), all times configurable in seconds via config.timing (defaults below):
// 2 s establish (map + heading) -> origins in config order (each: route draw + marker + label)
// -> title / tagline / location / every infoLine fade in at their own `at` -> static end image
// (`endImageAt` + `holdSeconds`). The plate keeps its final size from the start, so nothing shifts.
const ORIGIN_DRAW = 24;
const LABEL_IN = 32; // marker + label fully visible this many frames after an origin starts
const HEADING_FADE_IN = [6, 28] as const;
const RISE_PX = 10; // small upward move of fading text

type Block = { at: number; dur: number };

export const routeCheckTimeline = (cfg: RouteCheckConfig, holdSeconds: number, fps = 30) => {
	const t = cfg.timing ?? {};
	const f = (sec: number) => Math.round(sec * fps);
	const destSec = t.destinationAt ?? 2;
	const fadeDef = t.fadeSeconds ?? 0.6;
	const block = (tt: TextTiming | undefined, fallbackAt: number, fallbackFade = fadeDef): Block => ({
		at: f(tt?.at ?? fallbackAt),
		dur: Math.max(1, f(tt?.fade ?? fallbackFade)),
	});
	const establish = f(t.establishSeconds ?? 2);
	const firstOrigin = f(t.firstOriginAt ?? 4);
	const step = f(t.originStep ?? 62 / 30);
	const phases = cfg.origins.map((o, i) => {
		const start = o.at !== undefined ? f(o.at) : firstOrigin + i * step;
		return { key: o.key, start, drawEnd: start + ORIGIN_DRAW, end: start + LABEL_IN };
	});
	const title = block(t.title, destSec);
	const tagline = block(t.tagline, destSec);
	const location = block(t.location, destSec);
	const plate = block(t.plate, t.title?.at ?? destSec, t.title?.fade ?? fadeDef);
	const info = (cfg.infoLines ?? []).map((l) => block({ at: l.at, fade: l.fade }, destSec));
	const blocks = [title, tagline, location, plate, ...info];
	const lastEnd = Math.max(phases[phases.length - 1].end, ...blocks.map((x) => x.at + x.dur));
	const endImage = Math.max(lastEnd, t.endImageAt !== undefined ? f(t.endImageAt) : 0);
	const duration = Math.round(endImage + holdSeconds * fps);
	return { establish, phases, destReveal: f(destSec), title, tagline, location, plate, info, endImage, duration };
};

const SPRING_CONFIG = { damping: 16, stiffness: 120, mass: 0.6, overshootClamping: true };
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

type RouteCollection = {
	type: 'FeatureCollection';
	features: { type: 'Feature'; properties: { origin: string }; geometry: { type: 'LineString'; coordinates: [number, number][] } }[];
};
type BorderCollection = {
	type: 'FeatureCollection';
	features: { type: 'Feature'; properties: { left: string; right: string }; geometry: { type: 'MultiLineString'; coordinates: [number, number][][] } }[];
};
type Camera = { lng: number; lat: number; zoom: number };

const cameraAt = (frame: number, start: Camera, end: Camera, establish: number): Camera => {
	const t = easeOutCubic(interpolate(frame, [0, establish], [0, 1], CLAMP));
	return { lng: start.lng + (end.lng - start.lng) * t, lat: start.lat + (end.lat - start.lat) * t, zoom: start.zoom + (end.zoom - start.zoom) * t };
};

const FONT = 'Helvetica Neue, Arial, sans-serif';

export const RouteCheck: React.FC<{ config: RouteCheckConfig; routesFile: string } & RouteCheckProps> = ({
	config,
	routesFile,
	holdSeconds,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const tl = routeCheckTimeline(config, holdSeconds, fps);
	const { phases } = tl;
	const th = { ...THEMES[config.theme ?? 'dark'] };
	if (config.mapBackground) th.bg = config.mapBackground;
	const ps = config.plate ?? {};
	const plateBlur = ps.blur ?? th.plateBlur;
	const plateFilter = plateBlur > 0 ? `blur(${plateBlur}px) saturate(${ps.saturate ?? th.plateSaturate})` : 'none';
	const dest = config.destination;
	const infoLines = config.infoLines ?? [];
	const plateWidth = config.plateWidth ?? 660;
	const cameraPadding = config.cameraPadding ?? { top: 160, bottom: 320, left: 460, right: 160 };

	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const endCameraRef = useRef<Camera | null>(null);
	const startCameraRef = useRef<Camera | null>(null);
	const lastCameraKeyRef = useRef<string>('');
	const initialHandleRef = useRef<number | null>(null);
	const frameRef = useRef(frame); // frame this tab starts on (renders can begin mid-video)
	frameRef.current = frame;

	const [ready, setReady] = useState(false);
	const [, forceRerender] = useState(0);
	const [routes, setRoutes] = useState<RouteCollection | null>(null);
	const [borders, setBorders] = useState<BorderCollection | null>(null);

	// One-time setup: map, routes, resting camera from real geometry, and a
	// delayRender until the first frame's tiles are in.
	useEffect(() => {
		if (!containerRef.current) return;
		initialHandleRef.current = delayRender('Loading MapLibre map + routes');

		fetch(staticFile(routesFile))
			.then((res) => res.json())
			.then(setRoutes)
			.catch((err) => console.error('Failed to load routes', err));
		fetch(staticFile('geo/country-borders.geojson'))
			.then((res) => res.json())
			.then(setBorders)
			.catch((err) => console.error('Failed to load country-borders.geojson', err));

		const lons = [dest.coords.lon, ...config.origins.map((o) => o.coords.lon)];
		const lats = [dest.coords.lat, ...config.origins.map((o) => o.coords.lat)];
		const bounds = new LngLatBounds([Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]);

		const map = new MapLibreMap({
			container: containerRef.current,
			style: staticFile(th.style),
			center: [dest.coords.lon, dest.coords.lat],
			zoom: 9,
			interactive: false,
			attributionControl: false,
			canvasContextAttributes: { preserveDrawingBuffer: true },
		});
		mapRef.current = map;

		map.once('load', () => {
			map.resize();
			if (config.mapBackground) {
				const bgLayer = map.getStyle().layers.find((l) => l.type === 'background');
				if (bgLayer) map.setPaintProperty(bgLayer.id, 'background-color', config.mapBackground);
			}
			const cam = map.cameraForBounds(bounds, { padding: cameraPadding });
			const camCenter = cam?.center ? LngLat.convert(cam.center) : null;
			const end: Camera = { lng: camCenter?.lng ?? dest.coords.lon, lat: camCenter?.lat ?? dest.coords.lat, zoom: cam?.zoom ?? 9.5 };
			// Very subtle cinematic push-in (~4% scale), no pan — same as reference.
			const start: Camera = { lng: end.lng, lat: end.lat, zoom: end.zoom - 0.057 };
			endCameraRef.current = end;
			startCameraRef.current = start;
			// Start on the camera of the CURRENT frame, not always the start camera: a render tab
			// that begins mid-video would otherwise show one zoomed-out frame (camera effect ran too early).
			const first = cameraAt(frameRef.current, start, end, tl.establish);
			map.jumpTo({ center: [first.lng, first.lat], zoom: first.zoom });
			lastCameraKeyRef.current = JSON.stringify(first);
			map.once('idle', () => {
				setReady(true);
				if (initialHandleRef.current !== null) continueRender(initialHandleRef.current);
			});
		});
		map.once('error', (e) => {
			console.error('MapLibre error', e.error);
			if (initialHandleRef.current !== null) continueRender(initialHandleRef.current);
		});

		return () => map.remove();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Camera moves only during the establish phase; afterwards it is identical
	// every frame, so no jump/idle-wait is needed.
	useEffect(() => {
		const map = mapRef.current;
		const start = startCameraRef.current;
		const end = endCameraRef.current;
		if (!map || !start || !end) return;

		const camera = cameraAt(frame, start, end, tl.establish);
		const key = JSON.stringify(camera);
		if (key === lastCameraKeyRef.current) return;

		const handle = delayRender(`Camera settle for frame ${frame}`);
		map.jumpTo({ center: [camera.lng, camera.lat], zoom: camera.zoom });
		lastCameraKeyRef.current = key;
		map.once('idle', () => {
			continueRender(handle);
			forceRerender((n) => n + 1);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [frame]);

	const DEST_REVEAL = tl.destReveal;
	const destScale = spring({ frame: frame - DEST_REVEAL, fps, config: SPRING_CONFIG });
	const destRing = interpolate(frame, [DEST_REVEAL, DEST_REVEAL + 34], [0.4, 1.5], CLAMP);
	const destRingOpacity = interpolate(frame, [DEST_REVEAL, DEST_REVEAL + 10, DEST_REVEAL + 34], [0, 0.5, 0], CLAMP);
	// Text block reveal: short fade-in with a minimal upward move; the layout slot is always reserved.
	const reveal = (b: Block): React.CSSProperties => {
		const p = easeOutCubic(interpolate(frame, [b.at, b.at + b.dur], [0, 1], CLAMP));
		return { opacity: p, transform: p >= 1 ? undefined : `translateY(${((1 - p) * RISE_PX).toFixed(2)}px)` };
	};
	const platePct = interpolate(frame, [tl.plate.at, tl.plate.at + tl.plate.dur], [0, 1], CLAMP);
	const headingOpacity = interpolate(frame, [HEADING_FADE_IN[0], HEADING_FADE_IN[1]], [0, 1], CLAMP);

	const map = mapRef.current;
	const destPx = ready && map ? map.project([dest.coords.lon, dest.coords.lat]) : null;

	return (
		<AbsoluteFill style={{ backgroundColor: th.bg }}>
			{/* Always mounted so the ref exists for MapLibre */}
			<div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }} />

			{!ready || !map || !destPx ? null : (
				<>
					{/* Section heading — fades in once, stays for the whole scene */}
					<div style={{ position: 'absolute', top: 34, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', opacity: headingOpacity }}>
						<div style={{ fontFamily: FONT, fontSize: 54, fontWeight: 700, letterSpacing: 5, color: th.heading, textShadow: th.headingShadow }}>
							{config.heading}
						</div>
						<div style={{ fontFamily: FONT, fontSize: 21, fontWeight: 500, letterSpacing: 2, color: th.subheading, marginTop: 8, textShadow: th.headingShadow }}>
							{config.subtitle}
						</div>
					</div>

					{/* International borders: real Natural Earth lines, subtle light gray, below the gold routes in the hierarchy */}
					<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
						{borders?.features.map((feature, i) => {
							const d = feature.geometry.coordinates
								.map((line) => {
									const pts = line.map(([lon, lat]) => map.project([lon, lat]));
									return `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
								})
								.join(' ');
							return <path key={i} d={d} fill="none" stroke={th.border} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" />;
						})}
					</svg>

					{/* Large secondary country labels (background context only) */}
					{(config.countryLabels ?? []).map((c) => {
						const p = map.project([c.lon, c.lat]);
						return (
							<div key={c.code} style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-50%, -50%)', fontFamily: FONT, fontSize: 30, fontWeight: 600, letterSpacing: 7, color: th.countryLabel, whiteSpace: 'nowrap' }}>
								{c.code}
							</div>
						);
					})}

					{/* Route lines: real OSRM road geometry, drawn on with a reveal */}
					<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
						{config.origins.map((origin, i) => {
							const phase = phases[i];
							const feature = routes?.features.find((f) => f.properties.origin === origin.key);
							if (!feature) return null;
							const progress = interpolate(frame, [phase.start, phase.drawEnd], [0, 1], CLAMP);
							const points = feature.geometry.coordinates.map(([lon, lat]) => map.project([lon, lat]));
							const d = `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
							const mainWidth = origin.emphasis ? 4 : 3;
							return (
								<React.Fragment key={origin.key}>
									<path d={d} fill="none" stroke={th.routeCasing} strokeWidth={mainWidth + 2.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
									<path d={d} fill="none" stroke={origin.emphasis ? th.routeMain : th.routeSecondary} strokeWidth={mainWidth} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress} />
								</React.Fragment>
							);
						})}
					</svg>

					{/* Origin markers + labels */}
					{config.origins.map((origin, i) => {
						const phase = phases[i];
						const px = map.project([origin.coords.lon, origin.coords.lat]);
						const markerScale = spring({ frame: frame - phase.start - 4, fps, config: SPRING_CONFIG });
						const markerOpacity = interpolate(frame, [phase.start, phase.start + 10], [0, 1], CLAMP);
						const labelOpacity = interpolate(frame, [phase.start + 16, phase.start + 32], [0, 1], CLAMP);
						const labelY = interpolate(frame, [phase.start + 16, phase.start + 32], [10, 0], CLAMP);
						const radius = origin.emphasis ? 10 : 7;
						const off = origin.labelOffset ?? { x: origin.emphasis ? 100 : 30, y: origin.emphasis ? 46 : -14 };
						return (
							<React.Fragment key={origin.key}>
								<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
									<g transform={`translate(${px.x}, ${px.y}) scale(${markerScale})`} opacity={markerOpacity}>
										<circle r={radius} fill={th.marker} />
										<circle r={radius + 8} fill="none" stroke={th.marker} strokeWidth={1.5} opacity={0.4} />
									</g>
								</svg>
								<div style={{ position: 'absolute', left: Math.round(px.x + off.x), top: Math.round(px.y + off.y), fontFamily: FONT, opacity: labelOpacity, transform: `translateY(${labelY}px)`, textShadow: th.labelShadow, whiteSpace: 'nowrap' }}>
									<div style={{ fontSize: origin.emphasis ? 30 : 26, fontWeight: origin.emphasis ? 700 : 600, color: th.label }}>
										{origin.label}{' '}
										{origin.country && <span style={{ color: th.tag, fontWeight: 500, fontSize: origin.emphasis ? 22 : 19 }}>{origin.country}</span>}{' '}
										<span style={{ color: th.tag, fontWeight: 500 }}>· Auto</span>{' '}
										<span style={{ color: th.timeText, fontWeight: 500 }}>≈ {origin.time}</span>
									</div>
								</div>
							</React.Fragment>
						);
					})}

					{/* Destination marker */}
					<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
						<g transform={`translate(${destPx.x}, ${destPx.y})`}>
							<circle r={26 * destRing} fill="none" stroke={th.accent} strokeWidth={2} opacity={destRingOpacity} />
							<g transform={`scale(${destScale})`}>
								<circle r={18} fill={th.accent} />
								<circle r={29} fill="none" stroke={th.accent} strokeWidth={2} opacity={0.55} />
							</g>
						</g>
					</svg>

					{/* Destination info plate: glass layer (own opacity) + fully opaque text blocks on top; final size from frame 0 */}
					<div
						style={{
							position: 'absolute',
							left: Math.round(Math.max(40, destPx.x - 40 - plateWidth + (config.plateOffsetX ?? 0))),
							top: Math.round(Math.min(CANVAS_HEIGHT - 380, destPx.y + (config.plateOffsetY ?? -55))),
							width: plateWidth,
							textAlign: 'right',
							fontFamily: FONT,
						}}
					>
						<div
							style={{
								position: 'absolute',
								inset: 0,
								borderRadius: 16,
								background: ps.background ?? th.plateBg,
								backdropFilter: plateFilter,
								WebkitBackdropFilter: plateFilter,
								border: plateBlur > 0 ? (ps.border ?? th.plateBorder) : undefined,
								boxShadow: plateBlur > 0 ? (ps.shadow ?? th.plateShadow) : undefined,
								opacity: platePct,
							}}
						/>
						<div style={{ position: 'relative', padding: '20px 30px' }}>
							<div style={{ fontSize: 59, fontWeight: 700, color: th.plateName, letterSpacing: 0.5, ...reveal(tl.title) }}>
								{dest.name}{' '}
								{dest.country && <span style={{ color: th.tag, fontWeight: 500, fontSize: 30 }}>{dest.country}</span>}
							</div>
							{dest.tagline && <div style={{ fontSize: 38, fontWeight: 500, color: th.plateTagline, marginTop: 11, ...reveal(tl.tagline) }}>{dest.tagline}</div>}
							{dest.location && <div style={{ fontSize: 30, fontWeight: 500, color: th.plateDetail, marginTop: 8, ...reveal(tl.location) }}>📍 {dest.location}</div>}
							{infoLines.map((line, i) => (
								<div
									key={i}
									style={{
										fontSize: line.size === 'detail' ? 24 : 32,
										fontWeight: line.size === 'detail' ? 400 : 500,
										color: line.size === 'detail' ? th.plateDetail : th.accentSoft,
										marginTop: i === 0 ? 22 : line.size === 'detail' ? 8 : 26,
										...reveal(tl.info[i]),
									}}
								>
									{line.text}
								</div>
							))}
						</div>
					</div>

					{/* Required attribution, permanently visible */}
					<div style={{ position: 'absolute', right: 24, bottom: 18, background: th.attributionBg, padding: '2px 8px', borderRadius: 6, fontFamily: FONT, fontSize: 15, color: th.attribution, textShadow: th.headingShadow }}>
						OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors
					</div>
				</>
			)}
		</AbsoluteFill>
	);
};
