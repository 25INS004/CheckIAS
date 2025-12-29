import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DashboardHome from './pages/DashboardHome';
import SubmissionPage from './pages/SubmissionPage';
import HistoryPage from './pages/HistoryPage';
import AdminOverview from './pages/admin/AdminOverview';
import UserManagement from './pages/admin/UserManagement';
import AdminTickets from './pages/admin/AdminTickets';
import AdminSettings from './pages/admin/AdminSettings';
import { AppProvider } from './context/AppProvider';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import ProfileSettings from './pages/ProfileSettings';

const App: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  return (
    <AppProvider>
      <ThemeProvider>
        <UserProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes (standalone, no layout) */}
              <Route path="/signup" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Public Routes */}
              <Route element={<PublicLayout><Outlet /></PublicLayout>}>
                <Route path="/" element={<LandingPage />} />
              </Route>

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout><Outlet /></DashboardLayout>}>
                <Route index element={<DashboardHome />} />
                <Route path="submit" element={<SubmissionPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="support" element={<div className="p-6">Support Center</div>} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout><Outlet /></AdminLayout>}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;