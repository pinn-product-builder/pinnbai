/**
 * Workspaces/Organizations Service
 * Integrado com schemas isolados por workspace
 */

import { Organization } from '@/types/saas';
import { schemaService } from './schemaService';
import { toast } from 'sonner';

// ===== MOCK DATA =====
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: '073605bb-b60f-4928-b5b9-5fa149f35941',
    name: 'Afonsina',
    slug: 'afonsina',
    status: 'active',
    plan: 'enterprise',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
    },
  },
  {
    id: 'pinn-org-001',
    name: 'Pinn',
    slug: 'pinn',
    status: 'active',
    plan: 'enterprise',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
    },
  },
  {
    id: 'demo-org-001',
    name: 'Demo Company',
    slug: 'demo',
    status: 'active',
    plan: 'pro',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
    },
  },
  {
    id: 'startup-org-001',
    name: 'StartupX',
    slug: 'startupx',
    status: 'active',
    plan: 'basic',
    createdAt: '2024-04-15T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
    },
  },
  {
    id: 'inactive-org-001',
    name: 'Old Client',
    slug: 'old-client',
    status: 'inactive',
    plan: 'basic',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    settings: {
      timezone: 'America/Sao_Paulo',
      currency: 'BRL',
    },
  },
];

// ===== WORKSPACE SERVICE =====
export const workspaceService = {
  /**
   * Listar todos os workspaces
   */
  list: async (filters?: { 
    status?: 'active' | 'inactive'; 
    plan?: string;
    search?: string;
  }): Promise<Organization[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...MOCK_ORGANIZATIONS];
    
    if (filters?.status) {
      result = result.filter(org => org.status === filters.status);
    }
    
    if (filters?.plan) {
      result = result.filter(org => org.plan === filters.plan);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(org => 
        org.name.toLowerCase().includes(search) ||
        org.slug.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  /**
   * Obter workspace por ID
   */
  getById: async (id: string): Promise<Organization | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_ORGANIZATIONS.find(org => org.id === id) || null;
  },

  /**
   * Criar workspace COM schema isolado
   */
  create: async (data: Partial<Organization>): Promise<Organization> => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: data.name || 'Novo Workspace',
      slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'novo',
      status: 'active',
      plan: data.plan || 'basic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
      },
    };
    
    // Criar schema isolado para o workspace
    console.log('Creating isolated schema for workspace:', newOrg.slug);
    const schemaResult = await schemaService.createWorkspaceSchema(
      newOrg.id,
      newOrg.slug,
      newOrg.name
    );
    
    if (!schemaResult.success) {
      console.warn('Failed to create workspace schema:', schemaResult.error);
      // Continue anyway - schema can be created later
      toast.warning('Schema do workspace será criado na primeira importação');
    } else {
      console.log('Schema created:', schemaResult.schemaName);
      toast.success(`Schema ${schemaResult.schemaName} criado com sucesso`);
    }
    
    MOCK_ORGANIZATIONS.push(newOrg);
    return newOrg;
  },

  /**
   * Atualizar workspace
   */
  update: async (id: string, data: Partial<Organization>): Promise<Organization | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = MOCK_ORGANIZATIONS.findIndex(org => org.id === id);
    if (index === -1) return null;
    
    MOCK_ORGANIZATIONS[index] = {
      ...MOCK_ORGANIZATIONS[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return MOCK_ORGANIZATIONS[index];
  },

  /**
   * Estatísticas do workspace
   */
  getStats: async (id: string): Promise<{
    users: number;
    dashboards: number;
    dataSources: number;
    dataSets: number;
    lastActivity: string;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock stats baseado no org
    const statsMap: Record<string, any> = {
      '073605bb-b60f-4928-b5b9-5fa149f35941': {
        users: 3,
        dashboards: 5,
        dataSources: 4,
        dataSets: 8,
        lastActivity: new Date().toISOString(),
      },
      'pinn-org-001': {
        users: 5,
        dashboards: 10,
        dataSources: 6,
        dataSets: 15,
        lastActivity: new Date().toISOString(),
      },
    };
    
    return statsMap[id] || {
      users: 1,
      dashboards: 2,
      dataSources: 1,
      dataSets: 3,
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
    };
  },

  /**
   * Contagem total
   */
  getCount: async (): Promise<{ total: number; active: number; inactive: number }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      total: MOCK_ORGANIZATIONS.length,
      active: MOCK_ORGANIZATIONS.filter(o => o.status === 'active').length,
      inactive: MOCK_ORGANIZATIONS.filter(o => o.status === 'inactive').length,
    };
  },
};
