import { Link } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { StatusBadge } from '../../../components/StatusBadge';
import { useApplicationStore } from '../../../store/applicationStore';
import { useOpportunityStore } from '../../../store/opportunityStore';

export function ApplicationStatusWidget() {
  const applications = useApplicationStore((state) => state.applications);
  const opportunities = useOpportunityStore((state) => state.opportunities);

  return (
    <Card className="flex flex-col">
      <div className="mb-6 flex items-center justify-between border-b border-chalk-200 pb-4">
        <h2 className="section-title">Application status</h2>
        <Link
          className="text-sm font-medium text-indigo hover:text-indigo-700 transition-colors"
          to="/applications"
        >
          View all
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center space-y-4">
        {applications.slice(0, 3).map((application, i) => {
          const opportunity = opportunities.find(
            (item) => item.id === application.opportunityId
          );
          return (
            <Link
              key={application.id}
              to="/applications"
              className="group relative flex items-center justify-between rounded-xl border border-transparent p-3 transition-all duration-micro ease-folio hover:bg-chalk hover:border-chalk-200"
            >
              <div>
                <p className="font-sans font-medium text-navy group-hover:text-indigo-600 transition-colors">
                  {opportunity?.title ?? 'Opportunity'}
                </p>
                <p className="text-sm text-navy/60">{opportunity?.companyName}</p>
              </div>
              <StatusBadge status={application.status} />
            </Link>
          );
        })}
        {applications.length === 0 && (
          <p className="text-center text-sm text-navy/60 italic">
            No active applications.
          </p>
        )}
      </div>
    </Card>
  );
}

