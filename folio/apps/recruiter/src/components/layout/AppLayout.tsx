import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, BriefcaseBusiness, Building2, CalendarClock, Gauge, LogOut, Settings2, UsersRound, Handshake, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { useCollection } from '@/hooks/useCollection';
import type { NotificationItem } from '@/types';
import { useState, useRef, useEffect } from 'react';
import RecruiterProfileModal from '@/features/recruiter/RecruiterProfileModal';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/jobs', label: 'Job Posts', icon: BriefcaseBusiness },
  { to: '/pipeline', label: 'Candidates', icon: UsersRound },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/interviews', label: 'Interviews', icon: CalendarClock },
  { to: '/campus', label: 'Campus Drives', icon: Building2 },
  { to: '/offers', label: 'Offer Desk', icon: Handshake },
  { to: '/admin', label: 'System Settings', icon: Settings2 },
];

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/jobs': 'Job Requisitions',
  '/pipeline': 'Candidate Pipeline',
  '/messages': 'Messages',
  '/interviews': 'Interview Calendar',
  '/campus': 'Campus Recruitment',
  '/offers': 'Offer Desk',
  '/admin': 'System Settings',
  '/notifications': 'Notifications Center', // Added to support your header workspace text
};

export default function AppLayout() {
  const { user, logout, recruiterProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { items: notifications } = useCollection<NotificationItem>('notifications');
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfilePopover(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const labelFontStyle = { fontFamily: '"DM Sans", system-ui, sans-serif' };

  const allowedNavItems = navItems.filter((item) => {
    if (item.to === '/admin') {
      return user?.role === 'Admin';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F2EFEA] text-brand-navy font-sans antialiased">
      {/* Desktop Sidebar (Figma Proportions: 225px width) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-shrink-0 flex-col justify-between bg-[#1B1C38] px-5 py-7 lg:flex border-r border-white/5">
        <div>
          {/* Brand Header */}
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="relative flex h-[36px] w-[36px] items-center justify-center">
              {/* Outer Ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-[#5B4FE9]" />

              {/* Middle Circle */}
              <div className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[#2b2864]">
                {/* Orange Dot */}
                <div className="h-[10px] w-[10px] rounded-full bg-[#FF6B35]" />
              </div>
            </div>

            <span
              className="text-xl tracking-wide"
              style={{ fontFamily: "DM Serif Display" }}
            >
              <span className="text-white">Fo</span>
              <span className="text-[#8B82FF]">lio</span>
            </span>
          </div>
          <div className="w-[224px] h-px bg-white/10"></div>

          {/* Navigation links */}
          <nav className="mt-6 flex flex-col gap-1">
            {allowedNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex h-[46.4px] w-[216px] items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150 ${
                    isActive
                      ? "bg-[#5B4EFF40] text-white"
                      : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"
                  }`
                }
                style={{
                  fontFamily: '"DM Sans", system-ui, sans-serif',
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <Icon
                  className="h-5 w-5 flex-shrink-0"
                  strokeWidth={1.75}
                />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex h-[46px] w-[216px] items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium text-[#A1A1AA] transition-all duration-150 hover:bg-white/5 hover:text-white"
            style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
          >
            <LogOut className="h-5 w-5" strokeWidth={1.75} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="lg:ml-64">
        {/* Sticky Top Header (Compact Figma size) */}
        <header className="sticky top-0 z-10 h-[72px] border-b border-[#ECE8E2] bg-[#FAF9F7]">
          <div className="flex h-full items-center justify-between px-8">

            {/* Left */}
            <h1
              className="text-[20px] font-medium text-[#151633]"
              style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
            >
              {titles[location.pathname] ?? "Dashboard"}
            </h1>

            {/* Right */}
            <div className="flex items-center gap-4">

              {/* Recruiter Pill */}
              <div className="flex h-12 items-center rounded-full border border-[#ECE8E2] bg-white px-5">
                <span className="mr-2 h-2 w-2 rounded-full bg-[#5B4FE9]" />
                <span className="folio-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#6D6B8D]">
                  {user?.role}
                </span>
              </div>

              {/* Notification Bell Link */}
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `relative flex h-12 w-12 items-center justify-center rounded-full border transition duration-150 ${
                    isActive
                      ? "bg-brand-purple/10 border-brand-purple/30 text-brand-purple"
                      : "border-[#ECE8E2] bg-white text-brand-navy hover:border-brand-purple/20"
                  }`
                }
              >
                <Bell className="h-5 w-5" strokeWidth={1.75} />

                {notifications.some(n => n.status !== "Sent") && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#FF6B35]" />
                )}
              </NavLink>

              {/* Avatar / Profile Popover Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfilePopover(!showProfilePopover)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#151633] text-white font-semibold cursor-pointer hover:opacity-90 transition duration-150"
                >
                  {userInitial}
                </button>

                {showProfilePopover && (
                  <div className="absolute right-0 mt-2.5 w-72 rounded-2xl border border-[#ECE8E2] bg-white p-5 shadow-2xl z-50 text-brand-navy animate-slide-up">
                    {user?.role === 'Recruiter' && recruiterProfile ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-[#ECE8E2]">
                          {recruiterProfile.companyLogo ? (
                            <img 
                              src={recruiterProfile.companyLogo} 
                              alt="Company Logo" 
                              className="h-10 w-10 rounded-lg object-contain bg-stone-50 border border-stone-100" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple font-serif font-bold">
                              {recruiterProfile.companyName?.charAt(0) || 'C'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Recruiter</h4>
                            <h3 className="text-sm font-bold truncate leading-tight mt-0.5" style={labelFontStyle}>{recruiterProfile.fullName}</h3>
                            <p className="text-[11px] text-[#6D6B8D] truncate leading-normal">{recruiterProfile.designation} at {recruiterProfile.companyName}</p>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-stone-600">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-[#6D6B8D] font-bold uppercase w-16 flex-shrink-0">Email:</span>
                            <span className="truncate font-sans font-bold text-brand-navy">{recruiterProfile.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-[#6D6B8D] font-bold uppercase w-16 flex-shrink-0">Phone:</span>
                            <span className="truncate font-sans font-bold text-brand-navy">{recruiterProfile.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-[#6D6B8D] font-bold uppercase w-16 flex-shrink-0">Office:</span>
                            <span className="truncate font-sans font-bold text-brand-navy">{recruiterProfile.officeLocation}</span>
                          </div>
                          {recruiterProfile.linkedinUrl && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono text-[#6D6B8D] font-bold uppercase w-16 flex-shrink-0">LinkedIn:</span>
                              <a 
                                href={recruiterProfile.linkedinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="truncate font-sans font-bold text-[#5B4FE9] hover:underline"
                              >
                                Profile Link
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#ECE8E2] flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setShowProfilePopover(false);
                              setShowProfileModal(true);
                            }}
                            className="w-full rounded-xl border border-brand-purple/20 bg-brand-purple/5 py-2 text-center text-xs font-bold text-brand-purple hover:bg-brand-purple/10 transition cursor-pointer"
                            style={labelFontStyle}
                          >
                            Edit Profile
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full rounded-xl border border-stone-200 py-2 text-center text-xs font-bold text-stone-500 hover:bg-stone-50 transition cursor-pointer"
                            style={labelFontStyle}
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-[#ECE8E2]">
                          <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple font-serif font-bold">
                            {user?.displayName?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">{user?.role}</h4>
                            <h3 className="text-sm font-bold truncate leading-tight mt-0.5" style={labelFontStyle}>{user?.displayName}</h3>
                            <p className="text-[11px] text-[#6D6B8D] truncate leading-normal">{user?.email}</p>
                          </div>
                        </div>

                        <div className="pt-3 flex flex-col gap-2">
                          <button
                            onClick={handleLogout}
                            className="w-full rounded-xl border border-stone-200 py-2 text-center text-xs font-bold text-stone-500 hover:bg-stone-50 transition cursor-pointer"
                            style={labelFontStyle}
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="px-8 py-6">
          {/* Mobile responsive navigation toolbar */}
          <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1.5 lg:hidden scrollbar-none">
            {allowedNavItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold border transition ${
                    isActive 
                      ? 'bg-brand-navy text-white border-brand-navy' 
                      : 'bg-white text-stone-600 border-[#ECE8E2] hover:bg-stone-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
          
          <div key={location.pathname} className="animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Recruiter Profile Editor Modal */}
      <RecruiterProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
}