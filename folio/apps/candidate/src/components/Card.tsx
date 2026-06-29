import type { ReactNode } from 'react';

type CardVariant = 'default' | 'elevated' | 'dark';

const cardVariants: Record<CardVariant, string> = {
  default: 'bg-white border border-chalk-200 shadow-soft',
  elevated: 'bg-white border border-chalk-200 shadow-card',
  dark: 'bg-navy border border-navy-700 text-white',
};

export function Card({
  children,
  className = '',
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}) {
  return (
    <section
      className={`rounded-2xl p-6 transition-all duration-ui ease-folio ${cardVariants[variant]} ${className}`}
    >
      {children}
    </section>
  );
}

