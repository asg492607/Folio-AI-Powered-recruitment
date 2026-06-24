import { Link } from 'react-router-dom';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useNotificationStore } from '../../store/notificationStore';
import type { Notification } from '../../types';

const typeLabels: Record<Notification['type'], string> = {
  application_update: 'Application update',
  interview_update: 'Interview update',
  new_opportunity: 'New opportunity',
  profile_suggestion: 'Profile suggestion',
};

export function NotificationsCenter() {
  const { notifications, markAllRead, markAsRead } = useNotificationStore();
  return (
    <div className="page max-w-4xl animate-slide-up">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="page-label">Notifications</span>
          <h1 className="page-title">Updates and nudges</h1>
        </div>
        <Button variant="secondary" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`transition-all duration-ui ease-folio ${
              notification.read
                ? 'opacity-80 hover:opacity-100 hover:shadow-soft'
                : 'border-orange-200 shadow-card bg-orange-50/10'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  {!notification.read && (
                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-pulse-glow" />
                  )}
                  <Badge tone={notification.read ? 'chalk' : 'indigo'}>
                    {typeLabels[notification.type]}
                  </Badge>
                </div>
                <p className="mt-4 font-serif text-xl text-navy">
                  {notification.message}
                </p>
                <p className="mt-2 font-mono text-meta tracking-widest text-navy/60">
                  {new Date(notification.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {notification.linkTo ? (
                  <Link
                    className="flex h-10 items-center justify-center rounded-full bg-navy px-5 font-sans text-sm font-medium text-white transition-all duration-micro hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-md"
                    to={notification.linkTo}
                  >
                    Open
                  </Link>
                ) : null}
                {!notification.read ? (
                  <Button
                    variant="ghost"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

