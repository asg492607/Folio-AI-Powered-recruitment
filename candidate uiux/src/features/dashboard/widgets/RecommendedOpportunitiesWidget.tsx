import { Link } from 'react-router-dom';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import { useCandidateStore } from '../../../store/candidateStore';
import { useOpportunityStore } from '../../../store/opportunityStore';
import { Sparkles } from 'lucide-react';

export function RecommendedOpportunitiesWidget() {
  const skills = useCandidateStore((state) => state.candidate.skills);
  const opportunities = useOpportunityStore((state) => state.opportunities);
  const recommended = opportunities
    .map((opportunity) => ({
      opportunity,
      score: opportunity.requiredSkills.filter((skill) => skills.includes(skill))
        .length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <Card variant="dark">
      <div className="mb-6 flex items-center justify-between border-b border-navy-700 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h2 className="text-h2">Recommended opportunities</h2>
        </div>
        <Link
          className="text-sm font-medium text-lavender-300 hover:text-white transition-colors"
          to="/opportunities"
        >
          View all
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {recommended.map(({ opportunity, score }) => (
          <Link
            key={opportunity.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-navy-700 bg-navy-800 p-5 transition-all duration-ui ease-folio hover:-translate-y-1 hover:border-indigo-500 hover:shadow-glow"
            to={`/opportunities/${opportunity.id}`}
          >
            <div>
              <div className="mb-4 flex items-start justify-between">
                <Badge tone="mint">{score} match</Badge>
              </div>
              <h3 className="mb-1 font-sans text-lg font-medium text-white group-hover:text-indigo-100 transition-colors">
                {opportunity.title}
              </h3>
              <p className="text-sm text-lavender-300">
                {opportunity.companyName}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-navy-400">
              <span className="font-mono uppercase tracking-widest">
                {opportunity.locationType}
              </span>
              <span className="font-medium text-indigo-400 opacity-0 transition-opacity duration-micro group-hover:opacity-100">
                Review &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

