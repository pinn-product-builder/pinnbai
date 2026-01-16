/**
 * Componente de Rota Protegida para o MicroSaaS
 * Gerencia acesso baseado em roles
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import { Loader2, Sparkles } from 'lucide-react';

interface SaasProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowAfonsina?: boolean;
}

export function SaasProtectedRoute({ 
  children, 
  requireAdmin = false,
  allowAfonsina = false 
}: SaasProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isAfonsina, loading } = useSaasAuth();
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

  // Não autenticado - redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cliente Afonsina tentando acessar área admin ou app
  if (isAfonsina && !allowAfonsina) {
    return <Navigate to="/dash/executivo" replace />;
  }

  // Requer admin mas usuário não é admin
  if (requireAdmin && !isAdmin) {
    // Se for Afonsina, vai para dash
    if (isAfonsina) {
      return <Navigate to="/dash/executivo" replace />;
    }
    // Senão vai para app
    return <Navigate to="/app/dashboards" replace />;
  }

  return <>{children}</>;
}

/**
 * Rota específica para o dashboard Afonsina
 */
export function AfonsinaRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isAfonsina, loading } = useSaasAuth();
  const location = useLocation();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Apenas Afonsina e Admin podem acessar o dashboard legado
  if (!isAfonsina && !isAdmin) {
    return <Navigate to="/app/dashboards" replace />;
  }

  return <>{children}</>;
}
