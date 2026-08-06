import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}
