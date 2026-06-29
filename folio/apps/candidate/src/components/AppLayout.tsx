import { useEffect } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  UserRound,
  Search,
  Building2,
  CircleDot,
  LogOut,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useOpportunityStore } from '../store/opportunityStore';
import { useCandidateStore } from '../store/candidateStore';
import { useNotificationStore } from '../store/notificationStore';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfolio', icon: FolderOpen },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/opportunities', label: 'Opportunities', icon: Search },
  { to: '/applications', label: 'Applications', icon: Building2 },
  { to: '/assessments', label: 'Assessments', icon: CircleDot },
];

export function AppLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const subscribeToOpportunities = useOpportunityStore((state) => state.subscribeToOpportunities);
  const initializeAuth = useCandidateStore((state) => state.initializeAuth);
  const initNotifications = useNotificationStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
    initNotifications();
    const unsubscribe = subscribeToOpportunities();
    return () => unsubscribe();
  }, [subscribeToOpportunities, initializeAuth, initNotifications]);

  return (
    <div className="flex h-screen overflow-hidden bg-chalk selection:bg-indigo-100 selection:text-navy">
      {/* Desktop Sidebar — fixed, full height, no scroll */}
      <aside className="sidebar-nav hidden w-64 flex-shrink-0 flex-col justify-between bg-navy px-5 py-7 md:flex h-screen">
        <div>
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-3 px-2 mb-10 group">
            <div className="sidebar-logo-icon">
              <div className="sidebar-logo-ring"></div>
              <div className="sidebar-logo-dot"></div>
            </div>
            <span className="text-xl font-serif text-white tracking-wide">
              Fo<span className="text-indigo-400">lio</span>
            </span>
          </NavLink>

          {/* Divider */}
          <div className="sidebar-divider"></div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-6">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                }
              >
                <Icon className="sidebar-link-icon" />
                <span className="sidebar-link-label">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sign Out — always visible at bottom */}
        <button
          className="sidebar-signout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <LogOut className="sidebar-link-icon" />
          <span className="sidebar-link-label">Sign out</span>
        </button>
      </aside>

      {/* Mobile Top Header */}
      <div className="flex flex-1 flex-col overflow-hidden md:block">
        <header className="flex items-center justify-between bg-navy px-4 py-3 md:hidden">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="sidebar-logo-icon" style={{ width: 26, height: 26 }}>
              <div className="sidebar-logo-ring" style={{ width: 26, height: 26 }}></div>
              <div className="sidebar-logo-dot" style={{ width: 5, height: 5 }}></div>
            </div>
            <span className="text-lg font-serif text-white tracking-wide">
              Fo<span className="text-indigo-400">lio</span>
            </span>
          </NavLink>
          <button
            className="text-lavender-300"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        {/* Main Content Area — scrolls independently */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 h-full">
          <Outlet />
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-navy-800 bg-navy pb-safe pt-2 md:hidden">
          {links.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 text-[10px] uppercase tracking-wider font-mono transition-colors duration-micro ${
                  isActive ? 'text-indigo-400' : 'text-lavender-500'
                }`
              }
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span className="sr-only">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

