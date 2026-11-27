import React from 'react';

/** Minimal line icons (24x24 viewBox, stroke = currentColor) for info lines; no coloured emojis. */
const Svg: React.FC<{ size: number; color: string; children: React.ReactNode }> = ({ size, color, children }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
		{children}
	</svg>
);

export type IconName = 'parking' | 'bus' | 'pin';

export const Icon: React.FC<{ name: IconName; size?: number; color?: string }> = ({ name, size = 28, color = 'currentColor' }) => (
	<Svg size={size} color={color}>
		{name === 'parking' && (
			<>
				<rect x={3.5} y={3.5} width={17} height={17} rx={4} />
				<path d="M9.5 17V7.5h3.4a2.9 2.9 0 0 1 0 5.8H9.5" />
			</>
		)}
		{name === 'bus' && (
			<>
				<rect x={4} y={3.5} width={16} height={13.5} rx={3} />
				<path d="M4 11h16M8 17v2.5M16 17v2.5" />
				<circle cx={8} cy={14} r={0.6} fill={color} />
				<circle cx={16} cy={14} r={0.6} fill={color} />
			</>
		)}
		{name === 'pin' && (
			<>
				<path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z" />
				<circle cx={12} cy={10} r={2.3} />
			</>
		)}
	</Svg>
);
