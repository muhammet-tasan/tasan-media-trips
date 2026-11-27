import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CLAMP, FONT } from './shared';

/**
 * Centered section heading with optional subtitle that fades in once and stays
 * (Route Check: "ANFAHRT ZUM NATURPARK" / "Hunawihr · Elsass · Frankreich").
 * Absolutely positioned at the top centre of the canvas; colours/shadow come from the caller.
 */
export const AnimatedTitle: React.FC<{
	title: string;
	subtitle?: string;
	color: string;
	subtitleColor: string;
	/** CSS text-shadow keeping the text readable over a busy background. */
	shadow?: string;
	/** Fade window in frames (default 6–28). */
	fadeFrom?: number;
	fadeTo?: number;
	/** Distance from the top in px (default 34). */
	top?: number;
	titleSize?: number;
	subtitleSize?: number;
	/** Optional look overrides (defaults = approved Route Check values). */
	fontFamily?: string;
	titleSpacing?: number;
	subtitleSpacing?: number;
	titleWeight?: number;
}> = ({ title, subtitle, color, subtitleColor, shadow, fadeFrom = 6, fadeTo = 28, top = 34, titleSize = 54, subtitleSize = 21, fontFamily = FONT, titleSpacing = 5, subtitleSpacing = 2, titleWeight = 700 }) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [fadeFrom, fadeTo], [0, 1], CLAMP);
	return (
		<div style={{ position: 'absolute', top, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', opacity }}>
			<div style={{ fontFamily, fontSize: titleSize, fontWeight: titleWeight, letterSpacing: titleSpacing, color, textShadow: shadow }}>{title}</div>
			{subtitle && (
				<div style={{ fontFamily, fontSize: subtitleSize, fontWeight: 500, letterSpacing: subtitleSpacing, color: subtitleColor, marginTop: 8, textShadow: shadow }}>
					{subtitle}
				</div>
			)}
		</div>
	);
};
