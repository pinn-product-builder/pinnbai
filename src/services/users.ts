/**
 * Mock de Usuários
 */

import { SaasUser, UserOrganization, UserRole } from '@/types/saas';

// ===== MOCK DATA =====
const MOCK_USERS: SaasUser[] = [
  {
    id: 'admin-pinn-001',
    email: 'admin@pinn.com',
    name: 'Admin Pinn',
    role: 'super_admin',
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'afonsina-user-001',
    email: 'afonsinaoliveirasdr@gmail.com',
    name: 'Afonsina Oliveira',
    role: 'client_afonsina',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    createdAt: '2024-01-15T00:00:00Z',
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'user-002',
    email: 'joao@afonsina.com',
    name: 'João Silva',
    role: 'editor',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    createdAt: '2024-02-01T00:00:00Z',
    lastLoginAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'user-003',
    email: 'maria@afonsina.com',
    name: 'Maria Santos',
    role: 'viewer',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    createdAt: '2024-02-15T00:00:00Z',
    lastLoginAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'user-004',
    email: 'pedro@pinn.com',
    name: 'Pedro Costa',
    role: 'org_admin',
    orgId: 'pinn-org-001',
    createdAt: '2024-01-10T00:00:00Z',
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user-005',
    email: 'ana@demo.com',
    name: 'Ana Lima',
    role: 'org_admin',
    orgId: 'demo-org-001',
    createdAt: '2024-03-01T00:00:00Z',
  },
];

const MOCK_USER_ORGS: UserOrganization[] = [
  { userId: 'afonsina-user-001', orgId: '073605bb-b60f-4928-b5b9-5fa149f35941', role: 'client_afonsina', joinedAt: '2024-01-15T00:00:00Z' },
  { userId: 'user-002', orgId: '073605bb-b60f-4928-b5b9-5fa149f35941', role: 'editor', joinedAt: '2024-02-01T00:00:00Z' },
  { userId: 'user-003', orgId: '073605bb-b60f-4928-b5b9-5fa149f35941', role: 'viewer', joinedAt: '2024-02-15T00:00:00Z' },
  { userId: 'user-004', orgId: 'pinn-org-001', role: 'org_admin', joinedAt: '2024-01-10T00:00:00Z' },
  { userId: 'user-005', orgId: 'demo-org-001', role: 'org_admin', joinedAt: '2024-03-01T00:00:00Z' },
];

// ===== USERS SERVICE =====
export const usersService = {
  /**
   * Listar usuários de um workspace
   */
  listByOrg: async (orgId: string): Promise<SaasUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_USERS.filter(u => u.orgId === orgId);
  },

  /**
   * Listar todos (admin)
   */
  listAll: async (filters?: {
    role?: UserRole;
    search?: string;
  }): Promise<SaasUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...MOCK_USERS];
    
    if (filters?.role) {
      result = result.filter(u => u.role === filters.role);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  /**
   * Obter por ID
   */
  getById: async (id: string): Promise<SaasUser | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_USERS.find(u => u.id === id) || null;
  },

  /**
   * Convidar usuário (mock)
   */
  invite: async (data: {
    email: string;
    name: string;
    role: UserRole;
    orgId: string;
  }): Promise<SaasUser> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: SaasUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: data.role,
      orgId: data.orgId,
      createdAt: new Date().toISOString(),
    };
    
    MOCK_USERS.push(newUser);
    MOCK_USER_ORGS.push({
      userId: newUser.id,
      orgId: data.orgId,
      role: data.role,
      joinedAt: new Date().toISOString(),
    });
    
    return newUser;
  },

  /**
   * Atualizar role
   */
  updateRole: async (userId: string, role: UserRole): Promise<SaasUser | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      user.role = role;
    }
    return user || null;
  },

  /**
   * Remover usuário
   */
  remove: async (userId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = MOCK_USERS.findIndex(u => u.id === userId);
    if (index > -1) {
      MOCK_USERS.splice(index, 1);
    }
  },

  /**
   * Contagem
   */
  getCount: async (orgId?: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (orgId) {
      return MOCK_USERS.filter(u => u.orgId === orgId).length;
    }
    return MOCK_USERS.length;
  },

  /**
   * Roles disponíveis
   */
  getRoles: (): { value: UserRole; label: string; description: string }[] => {
    return [
      { value: 'super_admin', label: 'Super Admin', description: 'Acesso total à plataforma' },
      { value: 'org_admin', label: 'Admin da Organização', description: 'Gerencia usuários e dados do workspace' },
      { value: 'editor', label: 'Editor', description: 'Pode criar e editar dashboards' },
      { value: 'viewer', label: 'Visualizador', description: 'Apenas visualização de dashboards' },
    ];
  },
};
