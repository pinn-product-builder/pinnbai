import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuthContext();
  const location = useLocation();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pinn-gradient flex items-center justify-center shadow-pinn-glow animate-pulse">
            <Sparkles className="w-6 h-6 text-bg-0" />
          </div>
          <div className="flex items-center gap-2 text-text-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Requires admin but user is not admin - redirect to dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dash/executivo" replace />;
  }

  return <>{children}</>;
}
