import type { ReactNode } from 'react';

const toneClasses = {
  indigo: 'bg-indigo-100 text-indigo-600',
  orange: 'bg-orange-50 text-orange-500',
  mint: 'bg-mint-50 text-mint-600',
  lavender: 'bg-lavender-100 text-lavender-500',
  navy: 'bg-navy text-white',
  chalk: 'bg-chalk-200 text-navy/70',
  // Legacy aliases kept for compatibility
  blue: 'bg-indigo-100 text-indigo-600',
  green: 'bg-mint-50 text-mint-600',
  red: 'bg-orange-50 text-orange-500',
  slate: 'bg-chalk-200 text-navy/70',
  amber: 'bg-orange-50 text-orange-500',
};

export function Badge({
  children,
  tone = 'chalk',
}: {
  children: ReactNode;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-meta font-mono ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

