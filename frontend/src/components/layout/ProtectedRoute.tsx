import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from './Navbar';
import { PageLoader } from '../common';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children || <Outlet />}</>;
};

// Public route - redirects to dashboard if already authenticated
export const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Loading..." />;
  }

  if (isAuthenticated) {
    // Redirect to the page they were trying to visit or dashboard
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children || <Outlet />}</>;
};

// Main app layout with navbar
export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
