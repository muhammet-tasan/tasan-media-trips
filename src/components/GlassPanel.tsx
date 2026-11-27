import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CLAMP } from './shared';

export type PanelProps = {
	/** Outer box: position/size/text alignment/font (e.g. {position:'absolute', left, top, width}). */
	style?: React.CSSProperties;
	/** Fill incl. alpha, e.g. 'rgba(250,247,235,0.24)'. */
	background?: string;
	/** Backdrop blur in px (0 = no glass effect). */
	blur?: number;
	saturate?: number;
	border?: string;
	shadow?: string;
	radius?: number;
	padding?: string;
	/** Fades the panel surface in (frames); content has its own timing (e.g. TextReveal). */
	fadeIn?: { at: number; duration: number };
	/** Only used by PlainText: text-shadow for readability without a container. */
	textShadow?: string;
	children?: React.ReactNode;
};

/**
 * Frosted-glass panel: the glass surface is a separate layer with its own opacity,
 * the content sits above it fully opaque (never put `opacity` on a text wrapper).
 * `backdrop-filter` works in the Remotion render. Light-map standard:
 * background rgba(250,247,235,0.24), blur 5, saturate 1.15. The box keeps its
 * final size from frame 0 because the content occupies its layout slot.
 */
export const GlassPanel: React.FC<PanelProps> = ({
	style,
	background = 'rgba(250,247,235,0.24)',
	blur = 5,
	saturate = 1.15,
	border,
	shadow,
	radius = 16,
	padding = '20px 30px',
	fadeIn,
	children,
}) => {
	const frame = useCurrentFrame();
	const surface = fadeIn ? interpolate(frame, [fadeIn.at, fadeIn.at + fadeIn.duration], [0, 1], CLAMP) : 1;
	const filter = blur > 0 ? `blur(${blur}px) saturate(${saturate})` : 'none';
	return (
		<div style={style}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: radius,
					background,
					backdropFilter: filter,
					WebkitBackdropFilter: filter,
					border,
					boxShadow: shadow,
					opacity: surface,
				}}
			/>
			<div style={{ position: 'relative', padding }}>{children}</div>
		</div>
	);
};

/**
 * Container-free variant with the same API and the same box/padding as GlassPanel, so the text sits at
 * exactly the same position: no fill, blur, border or shadow box — only a subtle text-shadow.
 * Used when the plate is switched off in the config (`plate.enabled: false`).
 */
export const PlainText: React.FC<PanelProps> = ({ style, padding = '20px 30px', textShadow, children }) => (
	<div style={style}>
		<div style={{ position: 'relative', padding, textShadow }}>{children}</div>
	</div>
);

/** Dark, non-blurred panel (TASAN dark/gold look of Video 1): same API as GlassPanel, dark fill, no blur. */
export const DarkPanel: React.FC<PanelProps> = (props) => <GlassPanel background="rgba(8,10,15,0.65)" blur={0} {...props} />;
