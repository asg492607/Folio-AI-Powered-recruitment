import { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, Users, Eye, Star, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCandidateStore } from '../store/candidateStore';

interface PageHeaderProps {
  title: string;
}

const notifications = [
  {
    id: 1,
    icon: Eye,
    iconBg: 'bg-[#ede9fe]',
    iconColor: 'text-[#6366f1]',
    title: 'Razorpay viewed your application',
    time: '2h ago',
  },
  {
    id: 2,
    icon: Star,
    iconBg: 'bg-[#ede9fe]',
    iconColor: 'text-[#6366f1]',
    title: 'New 92% match: Product Designer at Figma',
    time: '5h ago',
  },
  {
    id: 3,
    icon: CheckCircle,
    iconBg: 'bg-[#d1fae5]',
    iconColor: 'text-[#059669]',
    title: 'Portfolio analysis complete',
    time: '1d ago',
  },
  {
    id: 4,
    icon: Bell,
    iconBg: 'bg-[#ffedd5]',
    iconColor: 'text-[#ea580c]',
    title: 'Interview scheduled: Cred — Jun 30',
    time: '2d ago',
  },
];

export function PageHeader({ title }: PageHeaderProps) {
  const navigate = useNavigate();
  const candidate = useCandidateStore((state) => state.candidate);
  const initial = candidate.personalInfo.name.charAt(0) || 'A';

  const [notifOpen, setNotifOpen] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
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
            {!markedRead && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-orange-500 border border-chalk-50" />
            )}
          </button>

          {/* Dropdown panel */}
          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+12px)] w-[360px] rounded-2xl border border-chalk-200 bg-white shadow-[0_8px_32px_-4px_rgba(0,0,0,0.12)] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <span className="text-[15px] font-bold text-navy">Notifications</span>
                <button
                  className="text-navy/40 hover:text-navy transition-colors"
                  onClick={() => setNotifOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Notification list */}
              <ul className="divide-y divide-chalk-100">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <li
                      key={n.id}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-chalk-50 cursor-pointer transition-colors"
                    >
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.iconBg}`}>
                        <Icon className={`h-4.5 w-4.5 ${n.iconColor}`} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-navy leading-snug">{n.title}</p>
                        <p className="mt-0.5 text-[12.5px] text-navy/45 font-medium">{n.time}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Footer */}
              <div className="border-t border-chalk-100 px-5 py-4 text-center">
                <button
                  className="text-[14px] font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors"
                  onClick={() => {
                    setMarkedRead(true);
                    setNotifOpen(false);
                  }}
                >
                  Mark all as read
                </button>
              </div>
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
