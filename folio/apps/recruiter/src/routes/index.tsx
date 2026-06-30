import { Navigate, RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/useAuth';
import AdminPage from '@/features/admin/AdminPage';
import LoginPage from '@/features/auth/LoginPage';
import CampusPage from '@/features/campus/CampusPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import InterviewsPage from '@/features/interviews/InterviewsPage';
import JobsPage from '@/features/jobs/JobsPage';
import NotificationsPage from '@/features/notifications/NotificationsPage';
import PipelinePage from '@/features/pipeline/PipelinePage';
import MessagesPage from '@/features/messages/MessagesPage';
import OfferManagementPage from '@/features/offers/OfferManagementPage';
import RecruiterProfilePage from '@/features/recruiter/RecruiterProfilePage';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, recruiterProfile, checkingProfile } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-[#F2EFEA] flex items-center justify-center">
        <div className="text-sm font-semibold text-[#151633] animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  // Redirect recruiter without profile to /complete-profile
  if (user.role === 'Recruiter' && !recruiterProfile && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // If recruiter profile exists, don't let them access /complete-profile
  if (user.role === 'Recruiter' && recruiterProfile && location.pathname === '/complete-profile') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/complete-profile',
    element: (
      <ProtectedRoute>
        <RecruiterProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'pipeline', element: <PipelinePage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'interviews', element: <InterviewsPage /> },
      { path: 'campus', element: <CampusPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'offers', element: <OfferManagementPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
], { basename: '/recruiter' });

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
