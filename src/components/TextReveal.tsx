import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CLAMP, easeOutCubic } from './shared';

/**
 * Calm text reveal: fade-in with a minimal upward move (easeOutCubic).
 * Renders one <div> carrying `style` plus opacity/transform, so it can replace any
 * text block without changing layout. The slot is occupied from frame 0 (opacity 0),
 * so nothing shifts when later blocks appear. Times in frames (use seconds * fps).
 */
export const TextReveal: React.FC<{
	/** Frame at which the fade starts. */
	at: number;
	/** Fade duration in frames. */
	duration: number;
	/** Start offset in px (moves up to 0). Default 10. */
	rise?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({ at, duration, rise = 10, style, children }) => {
	const frame = useCurrentFrame();
	const p = easeOutCubic(interpolate(frame, [at, at + duration], [0, 1], CLAMP));
	return (
		<div style={{ ...style, opacity: p, transform: p >= 1 ? undefined : `translateY(${((1 - p) * rise).toFixed(2)}px)` }}>
			{children}
		</div>
	);
};
