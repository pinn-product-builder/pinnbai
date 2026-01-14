import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { SUPABASE_RPC } from '@/lib/supabaseViews';

export type AppRole = 'admin' | 'user';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  error: AuthError | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
    error: null,
  });

  // Buscar role do usuário
  const fetchUserRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    try {
      const { data, error } = await supabase
        .rpc(SUPABASE_RPC.GET_USER_ROLE, { _user_id: userId });
      
      if (error) {
        console.error('Error fetching role:', error);
        return 'user'; // Default para user se erro
      }
      
      return data as AppRole || 'user';
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      return 'user';
    }
  }, []);

  useEffect(() => {
    // Configurar listener ANTES de getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          // Defer role fetch to avoid blocking
          setTimeout(async () => {
            const role = await fetchUserRole(session.user.id);
            setAuthState({
              user: session.user,
              session,
              role,
              loading: false,
              error: null,
            });
          }, 0);
        } else {
          setAuthState({
            user: null,
            session: null,
            role: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));
        return;
      }

      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setAuthState({
          user: session.user,
          session,
          role,
          loading: false,
          error: null,
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  // Login com email/senha
  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }

    return { success: true, data };
  };

  // Logout
  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      setAuthState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }

    return { success: true };
  };

  // Verificar se é admin
  const isAdmin = authState.role === 'admin';

  return {
    ...authState,
    signIn,
    signOut,
    isAdmin,
    isAuthenticated: !!authState.user,
  };
}
