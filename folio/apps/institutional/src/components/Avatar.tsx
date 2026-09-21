import React from 'react';

/**
 * Avatar component — generates a deterministic gradient circle with initials.
 * No external image URLs needed. Works for students, companies, faculty, anyone.
 */

const PALETTE: [string, string][] = [
  ['#6366f1', '#8b5cf6'],  // indigo→violet
  ['#0ea5e9', '#06b6d4'],  // sky→cyan
  ['#f59e0b', '#f97316'],  // amber→orange
  ['#10b981', '#14b8a6'],  // emerald→teal
  ['#ec4899', '#f43f5e'],  // pink→rose
  ['#8b5cf6', '#a855f7'],  // violet→purple
  ['#0284c7', '#0369a1'],  // blue shades
  ['#059669', '#047857'],  // green shades
  ['#dc2626', '#b91c1c'],  // red shades
  ['#d97706', '#b45309'],  // amber shades
  ['#7c3aed', '#6d28d9'],  // purple shades
  ['#0891b2', '#0e7490'],  // cyan shades
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
  borderRadius?: string | number;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 40,
  style,
  className,
  borderRadius,
}) => {
  const hash = hashString(name || '?');
  const [from, to] = PALETTE[hash % PALETTE.length];
  const initials = getInitials(name);
  const fontSize = Math.max(10, Math.floor(size * 0.38));
  const radius = borderRadius ?? '50%';

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: radius,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: fontSize,
        fontFamily: 'inherit',
        letterSpacing: '0.02em',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
};

/** Smaller square variant for company logos */
export const CompanyBadge: React.FC<{ name: string; size?: number; style?: React.CSSProperties }> = ({
  name,
  size = 40,
  style,
}) => (
  <Avatar
    name={name}
    size={size}
    borderRadius="10px"
    style={{ fontSize: Math.max(10, Math.floor(size * 0.35)), ...style }}
  />
);

export default Avatar;
