/**
 * Serviço de Autenticação MVP
 * Usuários mockados com credenciais fixas
 */

import { SaasUser, SaasSession, UserRole } from '@/types/saas';

// ===== USUÁRIOS MVP =====
const MVP_USERS: Record<string, { password: string; user: SaasUser }> = {
  'afonsinaoliveirasdr@gmail.com': {
    password: '123456',
    user: {
      id: 'afonsina-user-001',
      email: 'afonsinaoliveirasdr@gmail.com',
      name: 'Afonsina Oliveira',
      role: 'client_afonsina' as UserRole,
      orgId: '073605bb-b60f-4928-b5b9-5fa149f35941', // Afonsina org_id existente
      createdAt: '2024-01-01T00:00:00Z',
    },
  },
  'admin@pinn.com': {
    password: '123456',
    user: {
      id: 'admin-pinn-001',
      email: 'admin@pinn.com',
      name: 'Admin Pinn',
      role: 'super_admin' as UserRole,
      createdAt: '2024-01-01T00:00:00Z',
    },
  },
};

// ===== STORAGE KEYS =====
const SESSION_KEY = 'pinn_saas_session';

// ===== AUTH SERVICE =====
export const authService = {
  /**
   * Login com email e senha
   */
  signIn: async (email: string, password: string): Promise<{ 
    success: boolean; 
    session?: SaasSession; 
    error?: string;
    redirectTo?: string;
  }> => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const normalizedEmail = email.toLowerCase().trim();
    const userData = MVP_USERS[normalizedEmail];

    if (!userData) {
      return { 
        success: false, 
        error: 'Acesso restrito. Verifique suas credenciais.' 
      };
    }

    if (userData.password !== password) {
      return { 
        success: false, 
        error: 'Acesso restrito. Verifique suas credenciais.' 
      };
    }

    const session: SaasSession = {
      user: userData.user,
      orgId: userData.user.orgId,
      isAdmin: userData.user.role === 'super_admin',
      isAfonsina: userData.user.role === 'client_afonsina',
    };

    // Persistir sessão
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Determinar redirecionamento
    const redirectTo = session.isAfonsina 
      ? '/dash/executivo' 
      : '/admin/visao-geral';

    return { success: true, session, redirectTo };
  },

  /**
   * Logout
   */
  signOut: async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
  },

  /**
   * Obter sessão atual
   */
  getSession: (): SaasSession | null => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as SaasSession;
    } catch {
      return null;
    }
  },

  /**
   * Verificar se está autenticado
   */
  isAuthenticated: (): boolean => {
    return authService.getSession() !== null;
  },

  /**
   * Verificar se é admin
   */
  isAdmin: (): boolean => {
    const session = authService.getSession();
    return session?.isAdmin ?? false;
  },

  /**
   * Verificar se é cliente Afonsina
   */
  isAfonsina: (): boolean => {
    const session = authService.getSession();
    return session?.isAfonsina ?? false;
  },

  /**
   * Obter org_id atual
   */
  getCurrentOrgId: (): string | undefined => {
    const session = authService.getSession();
    return session?.orgId;
  },

  /**
   * Impersonate (admin acessar como cliente)
   */
  impersonate: async (orgId: string, orgName: string): Promise<void> => {
    const session = authService.getSession();
    if (!session?.isAdmin) {
      throw new Error('Apenas admins podem usar esta função');
    }

    const impersonatedSession: SaasSession = {
      ...session,
      orgId,
      isAfonsina: false, // Impersonate genérico
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(impersonatedSession));
    localStorage.setItem('pinn_impersonating', JSON.stringify({ orgId, orgName }));
  },

  /**
   * Sair do modo impersonate
   */
  exitImpersonate: async (): Promise<void> => {
    const session = authService.getSession();
    if (!session?.isAdmin) return;

    const originalSession: SaasSession = {
      ...session,
      orgId: undefined,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(originalSession));
    localStorage.removeItem('pinn_impersonating');
  },

  /**
   * Verificar se está impersonando
   */
  getImpersonating: (): { orgId: string; orgName: string } | null => {
    try {
      const stored = localStorage.getItem('pinn_impersonating');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
};
