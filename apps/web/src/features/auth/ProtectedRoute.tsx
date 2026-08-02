import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { ReactNode } from "react";

export function ProtectedRoute({
  children,
  roles,
  permissions,
}: {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
}) {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-muted">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to="/account" replace />;
  }

  if (permissions?.length && !permissions.every((p) => hasPermission(p))) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
