export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-meta">
        <span className="text-navy/70">{label ?? 'Progress'}</span>
        <span className="text-indigo font-bold">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-chalk-200">
        <div
          className="h-full rounded-full bg-mint transition-all duration-page ease-folio"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

