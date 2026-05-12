import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserType } from "@/features/auth/types";

interface Props {
  children: React.ReactNode;
  allowedTypes?: UserType[];
}

export function ProtectedRoute({ children, allowedTypes }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedTypes && user) {
    const todosLosRoles = [user.tipo, ...(user.rolesAdicionales ?? [])];
    if (!allowedTypes.some((t) => todosLosRoles.includes(t))) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}