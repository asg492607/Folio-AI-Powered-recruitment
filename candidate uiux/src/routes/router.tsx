import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../features/landing/LandingPage';
import { SignUp } from '../features/auth/SignUp';
import { Login } from '../features/auth/Login';
import { PasswordReset } from '../features/auth/PasswordReset';
import { OnboardingWizard } from '../features/onboarding/OnboardingWizard';
import { CandidateProfile } from '../features/profile/CandidateProfile';
import { PortfolioManager } from '../features/portfolio/PortfolioManager';
import { Dashboard } from '../features/dashboard/Dashboard';
import { OpportunityDiscovery } from '../features/opportunities/OpportunityDiscovery';
import { OpportunityDetails } from '../features/opportunities/OpportunityDetails';
import { ApplicationForm } from '../features/applications/ApplicationForm';
import { ApplicationTracking } from '../features/applications/ApplicationTracking';
import { NotificationsCenter } from '../features/notifications/NotificationsCenter';
import { AICareerCoach } from '../features/career/AICareerCoach';
import { AssessmentView } from '../features/assessments/AssessmentView';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/signup', element: <SignUp /> },
  { path: '/login', element: <Login /> },
  { path: '/reset-password', element: <PasswordReset /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboarding', element: <OnboardingWizard /> },
      {
        element: <AppLayout />,
        children: [
          { path: '/profile', element: <CandidateProfile /> },
          { path: '/portfolio', element: <PortfolioManager /> },
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/opportunities', element: <OpportunityDiscovery /> },
          { path: '/opportunities/:id', element: <OpportunityDetails /> },
          { path: '/opportunities/:id/apply', element: <ApplicationForm /> },
          { path: '/applications', element: <ApplicationTracking /> },
          { path: '/notifications', element: <NotificationsCenter /> },
          { path: '/career-coach', element: <AICareerCoach /> },
          { path: '/assessments', element: <AssessmentView /> },
        ],
      },
    ],
  },
]);
