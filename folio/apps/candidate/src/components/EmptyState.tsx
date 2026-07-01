import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export function EmptyState({
  title,
  children,
  icon: Icon = Sparkles,
}: {
  title: string;
  children: ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-chalk-200 bg-white p-12 text-center shadow-sm hover:shadow-card transition-all duration-500 group animate-slide-up">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo/20 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-700"></div>
        <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl bg-[#1A1A2E] text-white shadow-lg transform group-hover:-translate-y-1 transition-transform duration-500">
          <Icon className="h-10 w-10" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-[24px] font-bold text-[#1A1A2E] mb-3 tracking-tight">{title}</h3>
      <p className="text-[#8c8c8c] font-sans text-[16px] max-w-md leading-relaxed">{children}</p>
    </div>
  );
}
