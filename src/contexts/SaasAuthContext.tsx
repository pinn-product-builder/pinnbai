/**
 * Contexto de Autenticação SaaS
 * Gerencia estado de autenticação para o MicroSaaS
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '@/services/auth';
import { SaasSession, SaasUser } from '@/types/saas';

interface SaasAuthContextType {
  session: SaasSession | null;
  user: SaasUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAfonsina: boolean;
  orgId: string | undefined;
  impersonating: { orgId: string; orgName: string } | null;
  signIn: (email: string, password: string) => Promise<{ 
    success: boolean; 
    error?: string; 
    redirectTo?: string 
  }>;
  signOut: () => Promise<void>;
  impersonate: (orgId: string, orgName: string) => Promise<void>;
  exitImpersonate: () => Promise<void>;
}

const SaasAuthContext = createContext<SaasAuthContextType | undefined>(undefined);

export function SaasAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SaasSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState<{ orgId: string; orgName: string } | null>(null);

  // Carregar sessão inicial
  useEffect(() => {
    const loadSession = () => {
      const storedSession = authService.getSession();
      const storedImpersonating = authService.getImpersonating();
      setSession(storedSession);
      setImpersonating(storedImpersonating);
      setLoading(false);
    };

    loadSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    
    if (result.success && result.session) {
      setSession(result.session);
    }
    
    setLoading(false);
    return {
      success: result.success,
      error: result.error,
      redirectTo: result.redirectTo,
    };
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
    setImpersonating(null);
  }, []);

  const impersonate = useCallback(async (orgId: string, orgName: string) => {
    await authService.impersonate(orgId, orgName);
    const updatedSession = authService.getSession();
    setSession(updatedSession);
    setImpersonating({ orgId, orgName });
  }, []);

  const exitImpersonate = useCallback(async () => {
    await authService.exitImpersonate();
    const updatedSession = authService.getSession();
    setSession(updatedSession);
    setImpersonating(null);
  }, []);

  const value: SaasAuthContextType = {
    session,
    user: session?.user ?? null,
    loading,
    isAuthenticated: !!session,
    isAdmin: session?.isAdmin ?? false,
    isAfonsina: session?.isAfonsina ?? false,
    orgId: session?.orgId,
    impersonating,
    signIn,
    signOut,
    impersonate,
    exitImpersonate,
  };

  return (
    <SaasAuthContext.Provider value={value}>
      {children}
    </SaasAuthContext.Provider>
  );
}

export function useSaasAuth() {
  const context = useContext(SaasAuthContext);
  if (context === undefined) {
    throw new Error('useSaasAuth must be used within a SaasAuthProvider');
  }
  return context;
}
