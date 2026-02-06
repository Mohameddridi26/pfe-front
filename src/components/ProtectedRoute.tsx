import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
  blockAdmin?: boolean; // Empêche les admins d'accéder à la page
}

const ProtectedRoute = ({ children, requiredRole, requireAuth, blockAdmin }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // Bloquer les admins si blockAdmin est true
  if (blockAdmin && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Si blockAdmin est défini mais pas requireAuth, permettre l'accès aux non connectés
  // (utilisé pour la page d'inscription qui doit être accessible aux non connectés mais pas aux admins)
  if (blockAdmin && !user) {
    return <>{children}</>;
  }

  // Si requireAuth est défini et qu'il n'y a pas d'utilisateur, rediriger vers login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiredRole est défini et qu'il n'y a pas d'utilisateur, rediriger vers login
  if (requiredRole && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAuth) {
    return <>{children}</>;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (requiredRole === "admin") {
      return <Navigate to="/espace-membre" replace />;
    }
    if (requiredRole === "membre") {
      return <Navigate to="/admin" replace />;
    }
    if (requiredRole === "coach") {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
