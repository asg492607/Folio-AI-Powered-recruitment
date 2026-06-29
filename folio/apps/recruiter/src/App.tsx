import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes';
import { initializeAnalytics } from '@/services/firebase/app';

function App() {
  useEffect(() => {
    void initializeAnalytics();
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
