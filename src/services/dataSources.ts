/**
 * Mock de Data Sources
 */

import { DataSource, DataSourceType } from '@/types/saas';

// ===== MOCK DATA =====
const MOCK_DATA_SOURCES: DataSource[] = [
  {
    id: 'ds-afonsina-001',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    name: 'CRM Principal',
    description: 'Dados do CRM integrado via Supabase',
    type: 'supabase',
    status: 'active',
    config: {
      projectUrl: 'https://mpbrjezmxmrdhgtvldvi.supabase.co',
      schema: 'public',
    },
    tables: ['leads', 'meetings', 'calls', 'traffic_daily'],
    lastSyncAt: new Date().toISOString(),
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    tags: ['crm', 'leads', 'vendas'],
  },
  {
    id: 'ds-afonsina-002',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    name: 'Relatório Meta Ads',
    description: 'Arquivo Excel com dados do Meta Ads',
    type: 'upload',
    status: 'active',
    config: {
      fileName: 'meta_ads_junho_2024.xlsx',
      fileType: 'xlsx',
      sheet: 'Campanhas',
    },
    lastSyncAt: '2024-06-15T10:30:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    tags: ['ads', 'meta', 'trafego'],
  },
  {
    id: 'ds-pinn-001',
    orgId: 'pinn-org-001',
    name: 'Database Interno',
    description: 'PostgreSQL interno da Pinn',
    type: 'postgres',
    status: 'active',
    config: {
      host: 'db.pinn.internal',
      port: 5432,
      database: 'pinn_analytics',
      ssl: true,
    },
    tables: ['clients', 'projects', 'metrics', 'revenue'],
    lastSyncAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    tags: ['interno', 'financeiro'],
  },
  {
    id: 'ds-demo-001',
    orgId: 'demo-org-001',
    name: 'Sample Data',
    description: 'Dados de demonstração',
    type: 'upload',
    status: 'active',
    config: {
      fileName: 'sample_data.csv',
      fileType: 'csv',
      delimiter: ',',
    },
    lastSyncAt: '2024-05-01T00:00:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-05-01T00:00:00Z',
    tags: ['demo'],
  },
];

// ===== DATA SOURCES SERVICE =====
export const dataSourcesService = {
  /**
   * Listar data sources de um workspace
   */
  list: async (orgId: string, filters?: {
    type?: DataSourceType;
    status?: string;
    search?: string;
  }): Promise<DataSource[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = MOCK_DATA_SOURCES.filter(ds => ds.orgId === orgId);
    
    if (filters?.type) {
      result = result.filter(ds => ds.type === filters.type);
    }
    
    if (filters?.status) {
      result = result.filter(ds => ds.status === filters.status);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(ds => 
        ds.name.toLowerCase().includes(search) ||
        ds.description?.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  /**
   * Listar todos (admin)
   */
  listAll: async (filters?: {
    type?: DataSourceType;
    status?: string;
    search?: string;
  }): Promise<DataSource[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...MOCK_DATA_SOURCES];
    
    if (filters?.type) {
      result = result.filter(ds => ds.type === filters.type);
    }
    
    if (filters?.status) {
      result = result.filter(ds => ds.status === filters.status);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(ds => 
        ds.name.toLowerCase().includes(search) ||
        ds.description?.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  /**
   * Obter por ID
   */
  getById: async (id: string): Promise<DataSource | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_DATA_SOURCES.find(ds => ds.id === id) || null;
  },

  /**
   * Criar data source
   */
  create: async (data: Partial<DataSource>): Promise<DataSource> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDs: DataSource = {
      id: `ds-${Date.now()}`,
      orgId: data.orgId || '',
      name: data.name || 'Novo Data Source',
      description: data.description,
      type: data.type || 'upload',
      status: 'active',
      config: data.config || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags || [],
    };
    
    MOCK_DATA_SOURCES.push(newDs);
    return newDs;
  },

  /**
   * Testar conexão (mock)
   */
  testConnection: async (config: any): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 80% de chance de sucesso
    if (Math.random() > 0.2) {
      return { success: true, message: 'Conexão estabelecida com sucesso' };
    }
    return { success: false, message: 'Não foi possível conectar. Verifique as credenciais.' };
  },

  /**
   * Sincronizar data source (mock)
   */
  sync: async (id: string): Promise<{ success: boolean; recordsProcessed: number }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ds = MOCK_DATA_SOURCES.find(d => d.id === id);
    if (ds) {
      ds.lastSyncAt = new Date().toISOString();
      ds.status = 'active';
    }
    
    return { success: true, recordsProcessed: Math.floor(Math.random() * 10000) + 1000 };
  },

  /**
   * Contagem por workspace
   */
  getCount: async (orgId?: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (orgId) {
      return MOCK_DATA_SOURCES.filter(ds => ds.orgId === orgId).length;
    }
    return MOCK_DATA_SOURCES.length;
  },
};
