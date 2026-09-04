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
// Real basemap: MapLibre GL + OpenFreeMap (OpenStreetMap data via the
// OpenMapTiles vector schema). No hand-drawn country shapes anywhere in
// this file — every road, border, and river pixel comes from the map
// itself, rendered live by MapLibre.
//
//   Style:  public/geo/tasan-map-style.json — a local copy of
//           OpenFreeMap's "dark" style (https://tiles.openfreemap.org/styles/dark,
//           itself © OpenMapTiles / OpenStreetMap contributors data) with
//           a handful of layers removed (footpaths, railways, one-way
//           arrows, minor place labels, state boundaries) and a few paint
//           properties nudged toward the TASAN dark/gold identity. Pinning
//           this file locally means the STYLE won't drift if OpenFreeMap's
//           default style changes later.
//   Tiles:  still fetched live from tiles.openfreemap.org at render time
//           (see PROJECT_STATUS.md for what that means for reproducibility).
//   Routes: public/geo/routes.geojson — real driving-route geometry from
//           OSRM (Project OSRM public demo server) over OSM roads, fetched
//           once and cached locally; NOT re-fetched at render time.
// ---------------------------------------------------------------------

// MapLibre's tile-parsing worker ships as an ES module with one sibling
// chunk; Remotion's dev/render server doesn't know how to serve a
// library's internal worker file, so both are vendored into public/ and
// pointed at explicitly. Without this, vector tiles silently never load.
maplibreConfig.WORKER_URL = staticFile('maplibre/maplibre-gl-worker.mjs');

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

const CITY_COORDS = {
	mulhouse: { lon: 7.3359, lat: 47.7508 },
	basel: { lon: 7.5886, lat: 47.5596 },
	freiburg: { lon: 7.8421, lat: 47.999 },
	colmar: { lon: 7.3585, lat: 48.0794 },
	strasbourg: { lon: 7.7521, lat: 48.5734 },
};

// Resting camera: fit exactly around the five cities, with asymmetric
// padding so the Mulhouse info plate (bottom-left) and the smaller origin
// labels have breathing room.
const CAMERA_BOUNDS = new LngLatBounds(
	[CITY_COORDS.mulhouse.lon, CITY_COORDS.basel.lat],
	[CITY_COORDS.freiburg.lon, CITY_COORDS.strasbourg.lat]
);
const CAMERA_PADDING = { top: 160, bottom: 320, left: 460, right: 160 };

type Camera = { lng: number; lat: number; zoom: number };

const ORIGINS = [
	{
		key: 'basel',
		coords: CITY_COORDS.basel,
		label: 'Basel',
		countryCode: 'CH',
		time: '30 Min.',
		emphasis: true,
	},
	{
		key: 'freiburg',
		coords: CITY_COORDS.freiburg,
		label: 'Freiburg',
		countryCode: 'DE',
		time: '45 Min.',
		emphasis: false,
	},
	{
		key: 'colmar',
		coords: CITY_COORDS.colmar,
		label: 'Colmar',
		countryCode: 'FR' as string | undefined,
		time: '20 Min.',
		emphasis: false,
	},
	{
		key: 'strasbourg',
		coords: CITY_COORDS.strasbourg,
		label: 'Strasbourg',
		countryCode: 'FR' as string | undefined,
		time: '1 Std.',
		emphasis: false,
	},
] as const;

const PARKING_TEXT = 'Parkplatz · 4 € / Tag';
const TRANSIT_HINT = 'Auch gut per Bahn erreichbar';
const TRANSIT_DETAIL = 'Mulhouse Gare → Tram 1 → Musée de l\'Auto';
const HEADING_TEXT = 'ANFAHRT ZUM MUSEUM';
const HEADING_SUBTITLE = 'Mulhouse · Frankreich';
const GOLD = '#d4a24e';
const GOLD_SOFT = '#f4d78a';
const COUNTRY_TAG_COLOR = 'rgba(220,220,220,0.55)';

// Timeline — 480 frames @ 30fps = 16.0s.
const ESTABLISH_END = 60; // 2.0s — map establishes, title/borders/country labels visible
const MULHOUSE_REVEAL = 60; // 2.0s — Mulhouse marker + "Mulhouse FR" + museum name only
const ARRIVAL_INFO_REVEAL = 270; // 9.0s — parking + public-transport hint, revealed later
const HEADING_FADE_IN = [6, 28] as const; // heading fades in once, then stays for the whole video
// Origin routes reveal progressively and calmly from 4.0–9.0s (frames 120–270),
// staggered so each city's label/time settles well before the next arrives.
const PHASES = {
	basel: { start: 120, drawEnd: 144, end: 158 },
	freiburg: { start: 158, drawEnd: 182, end: 196 },
	colmar: { start: 196, drawEnd: 218, end: 233 },
	strasbourg: { start: 233, drawEnd: 257, end: 270 },
};
// 345–480 (11.5–16.0s): fully static hold — ~4.5s of deliberate reading time.

const SPRING_CONFIG = { damping: 16, stiffness: 120, mass: 0.6, overshootClamping: true };

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

type RouteCollection = {
	type: 'FeatureCollection';
	features: { type: 'Feature'; properties: { origin: string }; geometry: { type: 'LineString'; coordinates: [number, number][] } }[];
};

type BorderCollection = {
	type: 'FeatureCollection';
	features: { type: 'Feature'; properties: { left: string; right: string }; geometry: { type: 'MultiLineString'; coordinates: [number, number][][] } }[];
};

// Real representative points (not the borders themselves) used only to
// place the large, secondary background country labels — chosen to sit in
// open real territory of each country within the fixed camera view.
const COUNTRY_LABEL_POINTS = [
	{ code: 'FRANKREICH', lon: 6.85, lat: 48.15 },
	{ code: 'DEUTSCHLAND', lon: 8.25, lat: 47.92 },
	{ code: 'SCHWEIZ', lon: 7.9, lat: 47.35 },
] as const;

export const MulhouseRouteCheck: React.FC = () => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const containerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<MapLibreMap | null>(null);
	const endCameraRef = useRef<Camera | null>(null);
	const startCameraRef = useRef<Camera | null>(null);
	const lastCameraKeyRef = useRef<string>('');
	const initialHandleRef = useRef<number | null>(null);

	const [ready, setReady] = useState(false);
	const [, forceRerender] = useState(0);
	const [routes, setRoutes] = useState<RouteCollection | null>(null);
	const [borders, setBorders] = useState<BorderCollection | null>(null);

	// One-time setup: create the map, load the real routes, resolve the
	// resting camera from real geometry (cameraForBounds), and hold
	// Remotion's render until the first frame's tiles are actually in.
	useEffect(() => {
		if (!containerRef.current) return;
		initialHandleRef.current = delayRender('Loading MapLibre map + routes');

		fetch(staticFile('geo/routes.geojson'))
			.then((res) => res.json())
			.then(setRoutes)
			.catch((err) => console.error('Failed to load routes.geojson', err));

		fetch(staticFile('geo/country-borders.geojson'))
			.then((res) => res.json())
			.then(setBorders)
			.catch((err) => console.error('Failed to load country-borders.geojson', err));

		const map = new MapLibreMap({
			container: containerRef.current,
			style: staticFile('geo/tasan-map-style.json'),
			center: [CITY_COORDS.mulhouse.lon, CITY_COORDS.mulhouse.lat],
			zoom: 9,
			interactive: false,
			attributionControl: false,
			canvasContextAttributes: { preserveDrawingBuffer: true },
		});
		mapRef.current = map;

		map.once('load', () => {
			map.resize();
			const cam = map.cameraForBounds(CAMERA_BOUNDS, { padding: CAMERA_PADDING });
			const camCenter = cam?.center ? LngLat.convert(cam.center) : null;
			const end: Camera = { lng: camCenter?.lng ?? CITY_COORDS.mulhouse.lon, lat: camCenter?.lat ?? CITY_COORDS.mulhouse.lat, zoom: cam?.zoom ?? 9.5 };
			// A very subtle cinematic push-in: ~4% scale change (zoom delta of
			// log2(1.04)), no pan, settling into `end` by frame 36. Deliberately
			// small — this is a push, not an establishing pan across the map.
			const start: Camera = { lng: end.lng, lat: end.lat, zoom: end.zoom - 0.057 };
			endCameraRef.current = end;
			startCameraRef.current = start;
			map.jumpTo({ center: [start.lng, start.lat], zoom: start.zoom });
			lastCameraKeyRef.current = JSON.stringify(start);
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

	// Per-frame: move the camera only during the establish phase; for every
	// later frame the camera is byte-for-byte the same, so we skip the
	// jump/idle-wait and just let the already-rendered canvas be captured.
	useEffect(() => {
		const map = mapRef.current;
		const start = startCameraRef.current;
		const end = endCameraRef.current;
		if (!map || !start || !end) return;

		const t = easeOutCubic(
			interpolate(frame, [0, ESTABLISH_END], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
		);
		const camera: Camera = {
			lng: start.lng + (end.lng - start.lng) * t,
			lat: start.lat + (end.lat - start.lat) * t,
			zoom: start.zoom + (end.zoom - start.zoom) * t,
		};
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

	const mulhouseScale = spring({ frame: frame - MULHOUSE_REVEAL, fps, config: SPRING_CONFIG });
	const mulhouseRing = interpolate(frame, [MULHOUSE_REVEAL, MULHOUSE_REVEAL + 34], [0.4, 1.5], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const mulhouseRingOpacity = interpolate(
		frame,
		[MULHOUSE_REVEAL, MULHOUSE_REVEAL + 10, MULHOUSE_REVEAL + 34],
		[0, 0.5, 0],
		{ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
	);
	const mulhouseTitleOpacity = interpolate(frame, [MULHOUSE_REVEAL, MULHOUSE_REVEAL + 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const arrivalInfoOpacity = interpolate(frame, [ARRIVAL_INFO_REVEAL, ARRIVAL_INFO_REVEAL + 30], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const headingOpacity = interpolate(frame, [HEADING_FADE_IN[0], HEADING_FADE_IN[1]], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const map = mapRef.current;
	const mulhousePx = ready && map ? map.project([CITY_COORDS.mulhouse.lon, CITY_COORDS.mulhouse.lat]) : null;

	return (
		<AbsoluteFill style={{ backgroundColor: '#0a0d13' }}>
			{/* Always mounted (even before the map is ready) so the ref exists
			    for the setup effect to attach MapLibre to. */}
			<div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }} />

			{!ready || !map || !mulhousePx ? null : (
				<>
			{/* Section title — the heading for this B-roll. Fades in once, then
			    stays on screen for the entire composition (does not animate away).
			    Kept within the top ~130px safe area, clear of the Strasbourg
			    marker/label which sits further down. */}
			<div
				style={{
					position: 'absolute',
					top: 34,
					left: '50%',
					transform: 'translateX(-50%)',
					textAlign: 'center',
					opacity: headingOpacity,
				}}
			>
				<div
					style={{
						fontFamily: 'Helvetica Neue, Arial, sans-serif',
						fontSize: 54,
						fontWeight: 700,
						letterSpacing: 5,
						color: '#f5f5f5',
						textShadow: '0 2px 14px rgba(0,0,0,0.8)',
					}}
				>
					{HEADING_TEXT}
				</div>
				<div
					style={{
						fontFamily: 'Helvetica Neue, Arial, sans-serif',
						fontSize: 21,
						fontWeight: 500,
						letterSpacing: 2,
						color: 'rgba(255,255,255,0.5)',
						marginTop: 8,
						textShadow: '0 1px 8px rgba(0,0,0,0.8)',
					}}
				>
					{HEADING_SUBTITLE}
				</div>
			</div>

			{/* International borders — a dedicated overlay above the basemap,
			    from real Natural Earth boundary-line data (see
			    public/geo/country-borders.geojson), NOT the Rhine and NOT
			    approximated by hand. A continuous, soft light-gray line —
			    clearly above the basemap's own subtle roads/rivers/admin
			    lines so FR/DE/CH stay identifiable, but kept below the gold
			    routes in the visual hierarchy (gold routes > borders > basemap
			    lines). Only this overlay's weight was tuned; the basemap's
			    own administrative lines are untouched. */}
			<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
				{borders?.features.map((feature, i) => {
					const d = feature.geometry.coordinates
						.map((line) => {
							const pts = line.map(([lon, lat]) => map.project([lon, lat]));
							return `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
						})
						.join(' ');
					return (
						<path
							key={i}
							d={d}
							fill="none"
							stroke="rgba(195,205,215,0.55)"
							strokeWidth={2.3}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					);
				})}
			</svg>

			{/* Large, secondary country-name labels — background context, kept
			    well below city-label prominence */}
			{COUNTRY_LABEL_POINTS.map((c) => {
				const p = map.project([c.lon, c.lat]);
				return (
					<div
						key={c.code}
						style={{
							position: 'absolute',
							left: p.x,
							top: p.y,
							transform: 'translate(-50%, -50%)',
							fontFamily: 'Helvetica Neue, Arial, sans-serif',
							fontSize: 30,
							fontWeight: 600,
							letterSpacing: 7,
							color: 'rgba(255,255,255,0.22)',
							whiteSpace: 'nowrap',
						}}
					>
						{c.code}
					</div>
				);
			})}

			{/* Route lines, drawn as an overlay so we control the reveal
			    animation; the geometry itself is the real OSRM road route. */}
			<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
				{ORIGINS.map((origin) => {
					const phase = PHASES[origin.key as keyof typeof PHASES];
					const feature = routes?.features.find((f) => f.properties.origin === origin.key);
					if (!feature) return null;
					const progress = interpolate(frame, [phase.start, phase.drawEnd], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					const points = feature.geometry.coordinates.map(([lon, lat]) => map.project([lon, lat]));
					const d = `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
					const mainWidth = origin.emphasis ? 4 : 3;
					return (
						<React.Fragment key={origin.key}>
							{/* Subtle dark casing so the gold line stays legible over the real basemap */}
							<path
								d={d}
								fill="none"
								stroke="rgba(6,8,12,0.55)"
								strokeWidth={mainWidth + 2.2}
								strokeLinecap="round"
								strokeLinejoin="round"
								pathLength={1}
								strokeDasharray={1}
								strokeDashoffset={1 - progress}
							/>
							<path
								d={d}
								fill="none"
								stroke={origin.emphasis ? 'rgba(220,172,90,0.95)' : 'rgba(212,162,78,0.75)'}
								strokeWidth={mainWidth}
								strokeLinecap="round"
								strokeLinejoin="round"
								pathLength={1}
								strokeDasharray={1}
								strokeDashoffset={1 - progress}
							/>
						</React.Fragment>
					);
				})}
			</svg>

			{/* Origin markers */}
			{ORIGINS.map((origin) => {
				const phase = PHASES[origin.key as keyof typeof PHASES];
				const px = map.project([origin.coords.lon, origin.coords.lat]);
				const markerScale = spring({ frame: frame - phase.start - 4, fps, config: SPRING_CONFIG });
				const markerOpacity = interpolate(frame, [phase.start, phase.start + 10], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const labelOpacity = interpolate(frame, [phase.start + 16, phase.start + 32], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const labelY = interpolate(frame, [phase.start + 16, phase.start + 32], [10, 0], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				const radius = origin.emphasis ? 10 : 7;
				return (
					<React.Fragment key={origin.key}>
						<svg
							width="100%"
							height="100%"
							style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
						>
							<g transform={`translate(${px.x}, ${px.y}) scale(${markerScale})`} opacity={markerOpacity}>
								<circle r={radius} fill="#ffffff" />
								<circle r={radius + 8} fill="none" stroke="#ffffff" strokeWidth={1.5} opacity={0.4} />
							</g>
						</svg>
						<div
							style={{
								position: 'absolute',
								left: px.x + (origin.emphasis ? 100 : 30),
								top: px.y + (origin.emphasis ? 46 : -14),
								fontFamily: 'Helvetica Neue, Arial, sans-serif',
								opacity: labelOpacity,
								transform: `translateY(${labelY}px)`,
								textShadow: '0 2px 10px rgba(0,0,0,0.7)',
								whiteSpace: 'nowrap',
							}}
						>
							<div style={{ fontSize: origin.emphasis ? 30 : 26, fontWeight: origin.emphasis ? 700 : 600, color: '#ffffff' }}>
								{origin.label}{' '}
								{origin.countryCode && (
									<span style={{ color: COUNTRY_TAG_COLOR, fontWeight: 500, fontSize: origin.emphasis ? 22 : 19 }}>
										{origin.countryCode}
									</span>
								)}{' '}
								<span style={{ color: COUNTRY_TAG_COLOR, fontWeight: 500 }}>· Auto</span>{' '}
								<span style={{ color: GOLD, fontWeight: 500 }}>≈ {origin.time}</span>
							</div>
						</div>
					</React.Fragment>
				);
			})}

			{/* Mulhouse — destination marker */}
			<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
				<g transform={`translate(${mulhousePx.x}, ${mulhousePx.y})`}>
					<circle r={26 * mulhouseRing} fill="none" stroke={GOLD} strokeWidth={2} opacity={mulhouseRingOpacity} />
					<g transform={`scale(${mulhouseScale})`}>
						<circle r={18} fill={GOLD} />
						<circle r={29} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.55} />
					</g>
				</g>
			</svg>

			{/* Mulhouse info plate — large, phone-readable text, on a plate so no
			    route line can ever cross it */}
			<div
				style={{
					position: 'absolute',
					left: Math.max(40, mulhousePx.x - 40 - 660),
					top: Math.min(CANVAS_HEIGHT - 380, mulhousePx.y - 55),
					width: 660,
					textAlign: 'right',
					fontFamily: 'Helvetica Neue, Arial, sans-serif',
					backgroundColor: 'rgba(8,10,15,0.65)',
					borderRadius: 16,
					padding: '20px 30px',
					opacity: mulhouseTitleOpacity,
				}}
			>
				<div style={{ fontSize: 59, fontWeight: 700, color: '#ffffff', letterSpacing: 0.5 }}>
					Mulhouse <span style={{ color: COUNTRY_TAG_COLOR, fontWeight: 500, fontSize: 30 }}>FR</span>
				</div>
				<div style={{ fontSize: 38, fontWeight: 500, color: '#e4e4e4', marginTop: 11 }}>
					Musée National de l'Automobile
				</div>
				<div style={{ fontSize: 32, fontWeight: 500, color: GOLD_SOFT, marginTop: 22, opacity: arrivalInfoOpacity }}>
					{PARKING_TEXT}
				</div>
				<div style={{ fontSize: 30, fontWeight: 500, color: '#cfcfcf', marginTop: 26, opacity: arrivalInfoOpacity }}>
					{TRANSIT_HINT}
				</div>
				<div
					style={{
						fontSize: 24,
						fontWeight: 400,
						color: 'rgba(255,255,255,0.68)',
						marginTop: 8,
						opacity: arrivalInfoOpacity,
					}}
				>
					{TRANSIT_DETAIL}
				</div>
			</div>

			{/* Required attribution — kept permanently visible, not hidden behind a click */}
			<div
				style={{
					position: 'absolute',
					right: 24,
					bottom: 18,
					fontFamily: 'Helvetica Neue, Arial, sans-serif',
					fontSize: 15,
					color: 'rgba(255,255,255,0.55)',
					textShadow: '0 1px 4px rgba(0,0,0,0.8)',
				}}
			>
				OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors
			</div>
				</>
			)}
		</AbsoluteFill>
	);
};
