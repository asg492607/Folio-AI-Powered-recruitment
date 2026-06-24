import { Link } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { ArrowRight } from 'lucide-react';

export function SuggestedActionsWidget() {
  return (
    <Card className="flex flex-1 flex-col">
      <div className="mb-6 border-b border-chalk-200 pb-4">
        <h2 className="section-title">Suggested actions</h2>
      </div>
      <div className="flex flex-col space-y-3">
        <Link
          className="group flex items-center justify-between rounded-xl border-l-4 border-indigo bg-indigo-50 p-4 transition-all duration-micro hover:bg-indigo-100"
          to="/portfolio"
        >
          <span className="font-medium text-indigo-700">
            Add one more portfolio case study
          </span>
          <ArrowRight className="h-4 w-4 text-indigo-600 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          className="group flex items-center justify-between rounded-xl border border-chalk-200 bg-white p-4 transition-all duration-micro hover:border-indigo hover:shadow-soft"
          to="/profile"
        >
          <span className="font-medium text-navy/80">
            Add accessibility as a skill if relevant
          </span>
          <ArrowRight className="h-4 w-4 text-navy/40 transition-transform group-hover:translate-x-1 group-hover:text-indigo" />
        </Link>
        <Link
          className="group flex items-center justify-between rounded-xl border border-chalk-200 bg-white p-4 transition-all duration-micro hover:border-indigo hover:shadow-soft"
          to="/career-coach"
        >
          <span className="font-medium text-navy/80">
            Try the career coach preview
          </span>
          <ArrowRight className="h-4 w-4 text-navy/40 transition-transform group-hover:translate-x-1 group-hover:text-indigo" />
        </Link>
      </div>
    </Card>
  );
}

