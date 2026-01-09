import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const { user, loading } = useUser();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setChecking(false);
        return;
      }

      try {
        // Get token from storage
        const localData = localStorage.getItem('supabase.auth.token');
        const sessionData = sessionStorage.getItem('supabase.auth.token');
        const data = localData || sessionData;
        
        if (!data) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        const { currentSession } = JSON.parse(data);
        const token = currentSession?.access_token;

        if (!token) {
          setIsAdmin(false);
          setChecking(false);
          return;
        }

        // Check admins table
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/admins?email=eq.${encodeURIComponent(user.email)}&is_active=eq.true&select=id`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const adminData = await response.json();
        setIsAdmin(adminData && adminData.length > 0);
      } catch (err) {
        console.error('Admin check failed:', err);
        setIsAdmin(false);
      }
      
      setChecking(false);
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  // Show loading spinner while checking auth
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
