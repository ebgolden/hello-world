'use client';

import { ICONS } from '@/lib/icons';

// Inline UI icon (game-icons.net, CC BY 3.0).
export function GIcon({ name, size = 15, color = 'currentColor', style }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      style={{ verticalAlign: '-0.15em', ...style }}
      aria-hidden="true"
    >
      <path d={ICONS[name]} fill={color} />
    </svg>
  );
}

// Icon placed inside the board SVG, centered on (x, y) at s pixels.
export function BoardIcon({ name, x, y, s, color, opacity = 1, stroke, strokeWidth = 0 }) {
  return (
    <path
      d={ICONS[name]}
      transform={`translate(${x - s / 2} ${y - s / 2}) scale(${s / 512})`}
      fill={color}
      opacity={opacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      paintOrder="stroke"
    />
  );
}
