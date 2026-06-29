import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary:
    'bg-indigo text-white hover:bg-indigo-600 active:bg-indigo-700 shadow-soft hover:shadow-glow',
  secondary:
    'bg-white text-navy border border-chalk-200 hover:bg-chalk hover:border-chalk-200 shadow-soft',
  ghost:
    'bg-transparent text-indigo hover:bg-indigo-50 border border-transparent',
  danger:
    'bg-orange text-white hover:bg-orange-600 active:bg-orange-600 shadow-soft',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-sans font-medium rounded-xl transition-all duration-micro ease-folio disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

