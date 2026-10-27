import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Landing from '@/pages/Landing';
import RegisterChurch from '@/pages/RegisterChurch';
import JoinChurch from '@/pages/JoinChurch';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Announcements from '@/pages/Announcements';
import Departments from '@/pages/Departments';
import DepartmentDetail from '@/pages/DepartmentDetail';
import ChurchCalendar from '@/pages/Calendar';
import Giving from '@/pages/Giving';
import Members from '@/pages/Members';
import News from '@/pages/News';
import ChurchSettings from '@/pages/ChurchSettings';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register-church" element={<RegisterChurch />} />
      <Route path="/join" element={<JoinChurch />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/departments/:departmentId" element={<DepartmentDetail />} />
        <Route path="/calendar" element={<ChurchCalendar />} />
        <Route path="/giving" element={<Giving />} />
        <Route path="/news" element={<News />} />
        <Route path="/members" element={<Members />} />
        <Route path="/settings" element={<ChurchSettings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App