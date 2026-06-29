import { Link } from 'react-router-dom';
import { Card } from '../../../components/Card';
import { useNotificationStore } from '../../../store/notificationStore';

export function NotificationsWidget() {
  const notifications = useNotificationStore((state) => state.notifications);
  return (
    <Card className="flex flex-1 flex-col">
      <div className="mb-6 flex items-center justify-between border-b border-chalk-200 pb-4">
        <h2 className="section-title">Notifications</h2>
        <Link
          className="text-sm font-medium text-indigo hover:text-indigo-700 transition-colors"
          to="/notifications"
        >
          Open center
        </Link>
      </div>
      <div className="flex flex-col space-y-4">
        {notifications.slice(0, 3).map((notification) => (
          <Link
            key={notification.id}
            className="group relative flex items-start gap-3 rounded-xl border border-transparent p-3 transition-all duration-micro ease-folio hover:bg-chalk hover:border-chalk-200"
            to={notification.linkTo ?? '/notifications'}
          >
            <div className="mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center">
              {!notification.read && (
                <div className="h-2 w-2 rounded-full bg-orange-500" />
              )}
            </div>
            <p
              className={`text-sm ${
                !notification.read
                  ? 'font-medium text-navy'
                  : 'text-navy/70'
              } group-hover:text-indigo-600 transition-colors`}
            >
              {notification.message}
            </p>
          </Link>
        ))}
        {notifications.length === 0 && (
          <p className="text-center text-sm text-navy/60 italic">
            You're all caught up.
          </p>
        )}
      </div>
    </Card>
  );
}

