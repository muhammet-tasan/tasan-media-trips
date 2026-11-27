import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CLAMP, SPRING_CONFIG } from './shared';

/**
 * Map/graphic marker: a dot that springs in with a thin halo ring and (optionally) one
 * expanding pulse ring. Defaults = destination marker; for a quiet origin marker use
 * `pulse={false} fadeInFrames={10} springDelay={4} haloGap={8} haloOpacity={0.4} haloWidth={1.5}`.
 * Renders a full-canvas, non-interactive <svg>; `x`/`y` are canvas pixels.
 */
export const MarkerPulse: React.FC<{
	x: number;
	y: number;
	/** Frame at which the marker appears. */
	at: number;
	color: string;
	radius?: number;
	/** Distance of the halo ring from the dot, its opacity and stroke width. */
	haloGap?: number;
	haloOpacity?: number;
	haloWidth?: number;
	/** Expanding pulse ring (34 frames) when true. */
	pulse?: boolean;
	/** Fade-in length in frames (0 = none, the spring alone reveals it). */
	fadeInFrames?: number;
	/** Frames the spring starts after `at`. */
	springDelay?: number;
}> = ({ x, y, at, color, radius = 18, haloGap = 11, haloOpacity = 0.55, haloWidth = 2, pulse = true, fadeInFrames = 0, springDelay = 0 }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const scale = spring({ frame: frame - at - springDelay, fps, config: SPRING_CONFIG });
	const opacity = fadeInFrames > 0 ? interpolate(frame, [at, at + fadeInFrames], [0, 1], CLAMP) : undefined;
	const ring = interpolate(frame, [at, at + 34], [0.4, 1.5], CLAMP);
	const ringOpacity = interpolate(frame, [at, at + 10, at + 34], [0, 0.5, 0], CLAMP);
	return (
		<svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
			<g transform={`translate(${x}, ${y})`} opacity={opacity}>
				{pulse && <circle r={(radius + 8) * ring} fill="none" stroke={color} strokeWidth={2} opacity={ringOpacity} />}
				<g transform={`scale(${scale})`}>
					<circle r={radius} fill={color} />
					<circle r={radius + haloGap} fill="none" stroke={color} strokeWidth={haloWidth} opacity={haloOpacity} />
				</g>
			</g>
		</svg>
	);
};
