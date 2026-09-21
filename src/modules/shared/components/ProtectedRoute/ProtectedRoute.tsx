import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

type Props = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

export const ProtectedRoute: React.FC<Props> = ({ children, requireAdmin }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
