import { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, Users, CheckCircle, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCandidateStore } from '../store/candidateStore';
import { useNotificationStore } from '../store/notificationStore';

interface PageHeaderProps {
  title: string;
}

// Icon mapping for notification types
const TYPE_ICON_MAP: Record<string, { bg: string; color: string; label: string }> = {
  application_update:  { bg: 'bg-[#d1fae5]', color: 'text-[#059669]', label: '✓' },
  interview_update:    { bg: 'bg-[#ffedd5]', color: 'text-[#ea580c]', label: '📅' },
  new_opportunity:     { bg: 'bg-[#ede9fe]', color: 'text-[#6366f1]', label: '✦' },
  profile_suggestion:  { bg: 'bg-[#e0f2fe]', color: 'text-[#0284c7]', label: '↑' },
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PageHeader({ title }: PageHeaderProps) {
  const navigate = useNavigate();
  const candidate = useCandidateStore((state) => state.candidate);
  const initial = candidate.personalInfo.name?.charAt(0)?.toUpperCase() || '?';

  const { notifications, markAllRead } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-chalk-200 bg-chalk-50 px-8 py-4 relative z-50">
      <h1 className="text-xl font-medium text-navy">{title}</h1>
      <div className="flex items-center gap-4">
        {/* AI Intelligence Pill */}
        <button className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo hover:bg-indigo-100 transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
          AI Intelligence
        </button>

        {/* Recruiter View Button */}
        <button className="flex items-center gap-2 rounded-lg border border-chalk-200 bg-white px-3 py-1.5 text-sm font-medium text-navy/70 hover:bg-chalk-50 hover:text-navy transition-colors shadow-soft">
          <Users className="h-4 w-4" />
          Recruiter view
        </button>

        {/* Notification Bell + Dropdown */}
        <div className="relative ml-2" ref={dropdownRef}>
          <button
            className="relative text-navy/60 hover:text-navy transition-colors"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-chalk-50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-[380px] rounded-2xl border border-chalk-200 bg-white shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-navy">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      className="text-[12px] font-medium text-indigo hover:text-indigo-700"
                      onClick={() => markAllRead()}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    className="text-navy/40 hover:text-navy transition-colors"
                    onClick={() => setNotifOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <ul className="divide-y divide-chalk-100 max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                    <CheckCircle className="h-8 w-8 text-navy/20" />
                    <p className="text-[14px] font-medium text-navy/50">All caught up!</p>
                    <p className="text-[12.5px] text-navy/35">Notifications will appear here as things happen.</p>
                  </li>
                ) : (
                  notifications.slice(0, 8).map((n) => {
                    const style = TYPE_ICON_MAP[n.type] || TYPE_ICON_MAP['new_opportunity'];
                    return (
                      <li
                        key={n.id}
                        className={`flex items-start gap-4 px-5 py-4 hover:bg-chalk-50 cursor-pointer transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => {
                          setNotifOpen(false);
                          if (n.linkTo) navigate(n.linkTo);
                        }}
                      >
                        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${style.bg}`}>
                          <span className={style.color}>{style.label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] leading-snug ${!n.read ? 'font-semibold text-navy' : 'font-medium text-navy/80'}`}>
                            {n.message}
                          </p>
                          <p className="mt-0.5 text-[12.5px] text-navy/45 font-medium">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="mt-2 h-2 w-2 rounded-full bg-indigo shrink-0" />
                        )}
                      </li>
                    );
                  })
                )}
              </ul>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-chalk-100 px-5 py-3 text-center">
                  <Link
                    to="/notifications"
                    className="text-[13px] font-semibold text-indigo hover:text-indigo-700 transition-colors"
                    onClick={() => setNotifOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar — clicks to profile */}
        <button
          onClick={() => navigate('/profile')}
          title="Go to profile"
          className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-medium text-white shadow-soft hover:opacity-80 transition-opacity cursor-pointer"
        >
          {initial}
        </button>
      </div>
    </header>
  );
}
