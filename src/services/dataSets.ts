/**
 * Mock de Data Sets
 */

import { DataSet, DataSetColumn, DataSetMetric } from '@/types/saas';

// ===== MOCK COLUMNS =====
const leadsColumns: DataSetColumn[] = [
  { name: 'id', dataType: 'string', semanticRole: 'id' },
  { name: 'created_at', dataType: 'datetime', semanticRole: 'date', displayName: 'Data de Criação' },
  { name: 'name', dataType: 'string', semanticRole: 'dimension', displayName: 'Nome' },
  { name: 'email', dataType: 'string', semanticRole: 'dimension', displayName: 'Email' },
  { name: 'phone', dataType: 'string', semanticRole: 'dimension', displayName: 'Telefone' },
  { name: 'source', dataType: 'string', semanticRole: 'dimension', displayName: 'Origem' },
  { name: 'status', dataType: 'string', semanticRole: 'dimension', displayName: 'Status' },
  { name: 'value', dataType: 'float', semanticRole: 'metric', displayName: 'Valor', format: { type: 'currency', currency: 'BRL', decimals: 2 } },
];

const metricsLeads: DataSetMetric[] = [
  { id: 'm1', name: 'total_leads', displayName: 'Total de Leads', formula: 'count()', aggregation: 'count' },
  { id: 'm2', name: 'valor_total', displayName: 'Valor Total', formula: 'sum(value)', aggregation: 'sum', format: { type: 'currency', currency: 'BRL' } },
  { id: 'm3', name: 'valor_medio', displayName: 'Ticket Médio', formula: 'avg(value)', aggregation: 'avg', format: { type: 'currency', currency: 'BRL' } },
];

// ===== MOCK DATA =====
const MOCK_DATA_SETS: DataSet[] = [
  {
    id: 'dset-afonsina-001',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    sourceId: 'ds-afonsina-001',
    sourceName: 'CRM Principal',
    name: 'Leads Qualificados',
    description: 'Dataset de leads qualificados do CRM',
    status: 'published',
    objectName: 'leads',
    columns: leadsColumns,
    metrics: metricsLeads,
    primaryKeyColumn: 'id',
    dateColumn: 'created_at',
    stageColumn: 'status',
    timezone: 'America/Sao_Paulo',
    lastRefreshAt: new Date().toISOString(),
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dset-afonsina-002',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    sourceId: 'ds-afonsina-001',
    sourceName: 'CRM Principal',
    name: 'Reuniões',
    description: 'Dataset de reuniões agendadas e realizadas',
    status: 'published',
    objectName: 'meetings',
    columns: [
      { name: 'id', dataType: 'string', semanticRole: 'id' },
      { name: 'scheduled_at', dataType: 'datetime', semanticRole: 'date', displayName: 'Data Agendada' },
      { name: 'lead_id', dataType: 'string', semanticRole: 'dimension', displayName: 'Lead' },
      { name: 'status', dataType: 'string', semanticRole: 'dimension', displayName: 'Status' },
      { name: 'duration_minutes', dataType: 'int', semanticRole: 'metric', displayName: 'Duração (min)' },
    ],
    metrics: [
      { id: 'm1', name: 'total_reunioes', displayName: 'Total de Reuniões', formula: 'count()', aggregation: 'count' },
      { id: 'm2', name: 'duracao_media', displayName: 'Duração Média', formula: 'avg(duration_minutes)', aggregation: 'avg' },
    ],
    primaryKeyColumn: 'id',
    dateColumn: 'scheduled_at',
    stageColumn: 'status',
    timezone: 'America/Sao_Paulo',
    lastRefreshAt: new Date().toISOString(),
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dset-afonsina-003',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    sourceId: 'ds-afonsina-002',
    sourceName: 'Relatório Meta Ads',
    name: 'Campanhas Meta',
    description: 'Dados de campanhas do Meta Ads',
    status: 'published',
    objectName: 'campanhas',
    columns: [
      { name: 'campaign_name', dataType: 'string', semanticRole: 'dimension', displayName: 'Campanha' },
      { name: 'date', dataType: 'date', semanticRole: 'date', displayName: 'Data' },
      { name: 'spend', dataType: 'float', semanticRole: 'metric', displayName: 'Investimento', format: { type: 'currency', currency: 'BRL' } },
      { name: 'impressions', dataType: 'int', semanticRole: 'metric', displayName: 'Impressões' },
      { name: 'clicks', dataType: 'int', semanticRole: 'metric', displayName: 'Cliques' },
      { name: 'conversions', dataType: 'int', semanticRole: 'metric', displayName: 'Conversões' },
    ],
    metrics: [
      { id: 'm1', name: 'investimento_total', displayName: 'Investimento Total', formula: 'sum(spend)', aggregation: 'sum', format: { type: 'currency', currency: 'BRL' } },
      { id: 'm2', name: 'cpl', displayName: 'CPL', formula: 'sum(spend) / sum(conversions)', aggregation: 'custom', format: { type: 'currency', currency: 'BRL' } },
      { id: 'm3', name: 'ctr', displayName: 'CTR', formula: 'sum(clicks) / sum(impressions)', aggregation: 'custom', format: { type: 'percentage', decimals: 2 } },
    ],
    primaryKeyColumn: undefined,
    dateColumn: 'date',
    timezone: 'America/Sao_Paulo',
    lastRefreshAt: '2024-06-15T10:30:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
  },
  {
    id: 'dset-pinn-001',
    orgId: 'pinn-org-001',
    sourceId: 'ds-pinn-001',
    sourceName: 'Database Interno',
    name: 'Clientes e Projetos',
    description: 'Dataset consolidado de clientes e projetos',
    status: 'published',
    objectName: 'clients_projects_view',
    columns: [
      { name: 'client_id', dataType: 'string', semanticRole: 'id' },
      { name: 'client_name', dataType: 'string', semanticRole: 'dimension', displayName: 'Cliente' },
      { name: 'project_name', dataType: 'string', semanticRole: 'dimension', displayName: 'Projeto' },
      { name: 'start_date', dataType: 'date', semanticRole: 'date', displayName: 'Data Início' },
      { name: 'mrr', dataType: 'float', semanticRole: 'metric', displayName: 'MRR', format: { type: 'currency', currency: 'BRL' } },
    ],
    metrics: [
      { id: 'm1', name: 'mrr_total', displayName: 'MRR Total', formula: 'sum(mrr)', aggregation: 'sum', format: { type: 'currency', currency: 'BRL' } },
      { id: 'm2', name: 'total_clientes', displayName: 'Total Clientes', formula: 'count_distinct(client_id)', aggregation: 'count_distinct' },
    ],
    primaryKeyColumn: 'client_id',
    dateColumn: 'start_date',
    timezone: 'America/Sao_Paulo',
    lastRefreshAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

// ===== DATA SETS SERVICE =====
export const dataSetsService = {
  /**
   * Listar datasets de um workspace
   */
  list: async (orgId: string, filters?: {
    status?: string;
    sourceId?: string;
    search?: string;
  }): Promise<DataSet[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = MOCK_DATA_SETS.filter(ds => ds.orgId === orgId);
    
    if (filters?.status) {
      result = result.filter(ds => ds.status === filters.status);
    }
    
    if (filters?.sourceId) {
      result = result.filter(ds => ds.sourceId === filters.sourceId);
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
  listAll: async (): Promise<DataSet[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...MOCK_DATA_SETS];
  },

  /**
   * Obter por ID
   */
  getById: async (id: string): Promise<DataSet | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_DATA_SETS.find(ds => ds.id === id) || null;
  },

  /**
   * Criar dataset
   */
  create: async (data: Partial<DataSet>): Promise<DataSet> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDs: DataSet = {
      id: `dset-${Date.now()}`,
      orgId: data.orgId || '',
      sourceId: data.sourceId || '',
      name: data.name || 'Novo Dataset',
      description: data.description,
      status: 'draft',
      objectName: data.objectName || '',
      columns: data.columns || [],
      metrics: data.metrics || [],
      timezone: 'America/Sao_Paulo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    MOCK_DATA_SETS.push(newDs);
    return newDs;
  },

  /**
   * Publicar dataset
   */
  publish: async (id: string): Promise<DataSet | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const ds = MOCK_DATA_SETS.find(d => d.id === id);
    if (ds) {
      ds.status = 'published';
      ds.updatedAt = new Date().toISOString();
    }
    return ds || null;
  },

  /**
   * Refresh dataset (mock)
   */
  refresh: async (id: string): Promise<{ success: boolean; recordsProcessed: number }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const ds = MOCK_DATA_SETS.find(d => d.id === id);
    if (ds) {
      ds.lastRefreshAt = new Date().toISOString();
    }
    
    return { success: true, recordsProcessed: Math.floor(Math.random() * 5000) + 500 };
  },

  /**
   * Preview de dados (mock)
   */
  preview: async (id: string, limit: number = 20): Promise<Record<string, any>[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Gerar dados mock
    const rows: Record<string, any>[] = [];
    for (let i = 0; i < limit; i++) {
      rows.push({
        id: `row-${i + 1}`,
        created_at: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
        name: `Lead ${i + 1}`,
        email: `lead${i + 1}@example.com`,
        source: ['Meta Ads', 'Google Ads', 'Orgânico', 'Indicação'][Math.floor(Math.random() * 4)],
        status: ['novo', 'qualificado', 'negociando', 'fechado'][Math.floor(Math.random() * 4)],
        value: Math.floor(Math.random() * 50000) + 1000,
      });
    }
    
    return rows;
  },

  /**
   * Contagem por workspace
   */
  getCount: async (orgId?: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (orgId) {
      return MOCK_DATA_SETS.filter(ds => ds.orgId === orgId).length;
    }
    return MOCK_DATA_SETS.length;
  },
};
