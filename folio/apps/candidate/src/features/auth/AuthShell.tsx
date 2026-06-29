import type { ReactNode } from 'react';

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-chalk">
      {/* Brand Panel (Hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-navy p-12 lg:flex xl:p-20">
        <div>
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500">
              <div className="h-2.5 w-2.5 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-2xl font-serif text-white tracking-wide">
              Folio <span className="text-indigo-400">Space</span>
            </span>
          </div>
          <h1 className="text-display mb-6 text-white max-w-lg leading-tight">
            Your work speaks first.
          </h1>
          <p className="text-lavender-100 max-w-md font-sans text-lg">
            Career intelligence platform for designers. We evaluate portfolio-first.
            Skill before resume. Work before words.
          </p>
        </div>
        <div className="text-meta text-lavender-500">
          Folio Space © 2026
        </div>
      </div>

      <div className="flex w-full flex-col justify-center p-8 sm:p-12 lg:w-1/2 xl:p-20">
        <div className="mx-auto w-full max-w-md animate-slide-up">
          {/* Mobile Logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-xl font-serif text-navy tracking-wide">
              Folio <span className="text-indigo-600">Space</span>
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-h1 text-navy mb-3">{title}</h2>
            <p className="text-navy/60 font-sans text-lg leading-relaxed">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

