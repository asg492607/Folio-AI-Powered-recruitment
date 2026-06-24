import { Link } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { useCandidateStore } from '../../../store/candidateStore';

export function ProfileCompletionWidget() {
  const candidate = useCandidateStore((state) => state.candidate);
  const percent = candidate.profileCompletionPercent;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <h2 className="section-title">Profile strength</h2>
        <div className="mt-6 flex items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="h-24 w-24 -rotate-90 transform">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-chalk-200 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-mint fill-none transition-all duration-page ease-folio"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-serif text-navy">{percent}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-navy/80 mb-1">
              Ready for recruiter review
            </p>
            <p className="text-xs text-navy/60 font-sans">
              Add one more portfolio piece to reach 100%.
            </p>
          </div>
        </div>
      </div>
      <Link
        className="mt-6 inline-block text-sm font-medium text-indigo hover:text-indigo-700 transition-colors"
        to="/profile"
      >
        Finish profile &rarr;
      </Link>
    </Card>
  );
}

