import type { ReactNode } from 'react';

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-chalk-200 bg-chalk-50 p-8 text-center transition-all duration-ui">
      <h3 className="text-h2 text-navy mb-2">{title}</h3>
      <p className="text-navy/60 font-sans">{children}</p>
    </div>
  );
}
