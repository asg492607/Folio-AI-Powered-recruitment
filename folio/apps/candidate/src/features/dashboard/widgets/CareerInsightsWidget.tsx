import { Card } from '../../../components/Card';

export function CareerInsightsWidget() {
  const stats = [
    ['Profile views', '128'],
    ['Portfolio saves', '14'],
    ['Skill trend', '+22%'],
  ];
  return (
    <Card className="flex flex-col">
      <div className="mb-6 border-b border-chalk-200 pb-4">
        <h2 className="section-title">Career insights</h2>
      </div>
      <div className="flex flex-1 items-center justify-between gap-4">
        {stats.map(([label, value]) => (
          <div key={label} className="text-center">
            <p className="text-display text-navy mb-1">{value}</p>
            <p className="text-meta text-navy/60">{label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

