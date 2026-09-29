// src/middleware/authMiddleware.tsx
import { Navigate, Outlet } from 'react-router-dom';

interface AuthMiddlewareProps {
  isAuthenticated: boolean;
  redirectPath?: string;
}

export const ProtectedRoute = ({
  isAuthenticated,
  redirectPath = '/signin',
}: AuthMiddlewareProps) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export const GuestRoute = ({
  isAuthenticated,
  redirectPath = '/',
}: AuthMiddlewareProps) => {
  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};