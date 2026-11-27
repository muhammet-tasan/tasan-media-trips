// Shared motion primitives for the reusable components in this folder
// (catalog: docs/REMOTION_LIBRARY.md). Values are the approved ones from the
// NaturOparC Route Check — change them only deliberately: they affect every scene using them.

export const FONT = 'Helvetica Neue, Arial, sans-serif';
export const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const SPRING_CONFIG = { damping: 16, stiffness: 120, mass: 0.6, overshootClamping: true };
