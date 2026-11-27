import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CLAMP } from './shared';

/**
 * A route line that draws itself on (SVG stroke reveal, pathLength 1) with a soft casing
 * underneath so it stays visible over any map. Works with ANY pixel coordinates
 * (projected map points, hand-placed points). Renders a full-canvas, non-interactive <svg>.
 */
export const RouteDraw: React.FC<{
	points: { x: number; y: number }[];
	/** Frames: drawing starts / is complete. */
	start: number;
	end: number;
	color: string;
	casingColor: string;
	/** Line width in px (default 3); casing is `casingExtra` wider. */
	width?: number;
	casingExtra?: number;
}> = ({ points, start, end, color, casingColor, width = 3, casingExtra = 2.2 }) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [start, end], [0, 1], CLAMP);
	const d = `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;
	const common = { d, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - progress } as const;
	return (
		<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
			<path {...common} stroke={casingColor} strokeWidth={width + casingExtra} />
			<path {...common} stroke={color} strokeWidth={width} />
		</svg>
	);
};
