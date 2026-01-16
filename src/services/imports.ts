/**
 * Service para gerenciamento de importações de dados
 */

import { supabase } from '@/lib/supabaseClient';

export type ImportStatus = 'pending' | 'processing' | 'success' | 'error';
export type FileType = 'xlsx' | 'xls' | 'csv' | 'json';
export type ColumnDataType = 'date' | 'datetime' | 'currency' | 'percent' | 'integer' | 'number' | 'text' | 'category' | 'id' | 'boolean';

export interface DataImport {
  id: string;
  org_id: string;
  workspace_id: string;
  created_by: string | null;
  file_name: string;
  file_type: FileType;
  storage_path: string;
  status: ImportStatus;
  rows_count: number | null;
  columns_count: number | null;
  error_message: string | null;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  org_id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  source_import_id: string | null;
  primary_date_column: string | null;
  currency_code: string;
  rows_count: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatasetColumn {
  id: string;
  dataset_id: string;
  name_original: string;
  name_display: string;
  data_type: ColumnDataType;
  is_measure: boolean;
  is_dimension: boolean;
  is_primary_date: boolean;
  formatter: Record<string, any>;
  null_ratio: number | null;
  cardinality: number | null;
  sample_values: any[];
  column_order: number;
  created_at: string;
}

export interface ImportFilters {
  workspace_id?: string;
  status?: ImportStatus;
  file_type?: FileType;
  search?: string;
}

export interface ImportStats {
  total_imports_30d: number;
  active_datasets: number;
  errors_7d: number;
  last_success: string | null;
}

// Mock data for development (will be replaced with real Supabase queries)
const MOCK_IMPORTS: DataImport[] = [
  {
    id: '1',
    org_id: 'org-1',
    workspace_id: 'ws-1',
    created_by: 'user-1',
    file_name: 'vendas_janeiro_2025.xlsx',
    file_type: 'xlsx',
    storage_path: 'org-1/ws-1/imports/1/vendas_janeiro_2025.xlsx',
    status: 'success',
    rows_count: 15420,
    columns_count: 12,
    error_message: null,
    processing_started_at: '2025-01-15T10:30:00Z',
    processing_completed_at: '2025-01-15T10:32:15Z',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:32:15Z',
  },
  {
    id: '2',
    org_id: 'org-1',
    workspace_id: 'ws-1',
    created_by: 'user-1',
    file_name: 'leads_q4_2024.csv',
    file_type: 'csv',
    storage_path: 'org-1/ws-1/imports/2/leads_q4_2024.csv',
    status: 'success',
    rows_count: 8750,
    columns_count: 8,
    error_message: null,
    processing_started_at: '2025-01-14T14:20:00Z',
    processing_completed_at: '2025-01-14T14:21:30Z',
    created_at: '2025-01-14T14:20:00Z',
    updated_at: '2025-01-14T14:21:30Z',
  },
  {
    id: '3',
    org_id: 'org-1',
    workspace_id: 'ws-2',
    created_by: 'user-2',
    file_name: 'custos_operacionais.xlsx',
    file_type: 'xlsx',
    storage_path: 'org-1/ws-2/imports/3/custos_operacionais.xlsx',
    status: 'error',
    rows_count: null,
    columns_count: null,
    error_message: 'Formato de data inválido na coluna "data_vencimento"',
    processing_started_at: '2025-01-13T09:15:00Z',
    processing_completed_at: '2025-01-13T09:15:45Z',
    created_at: '2025-01-13T09:15:00Z',
    updated_at: '2025-01-13T09:15:45Z',
  },
  {
    id: '4',
    org_id: 'org-2',
    workspace_id: 'ws-3',
    created_by: 'user-3',
    file_name: 'metricas_marketing.json',
    file_type: 'json',
    storage_path: 'org-2/ws-3/imports/4/metricas_marketing.json',
    status: 'processing',
    rows_count: null,
    columns_count: null,
    error_message: null,
    processing_started_at: '2025-01-16T08:00:00Z',
    processing_completed_at: null,
    created_at: '2025-01-16T08:00:00Z',
    updated_at: '2025-01-16T08:00:00Z',
  },
  {
    id: '5',
    org_id: 'org-1',
    workspace_id: 'ws-1',
    created_by: 'user-1',
    file_name: 'clientes_base.csv',
    file_type: 'csv',
    storage_path: 'org-1/ws-1/imports/5/clientes_base.csv',
    status: 'pending',
    rows_count: null,
    columns_count: null,
    error_message: null,
    processing_started_at: null,
    processing_completed_at: null,
    created_at: '2025-01-16T09:30:00Z',
    updated_at: '2025-01-16T09:30:00Z',
  },
];

const MOCK_DATASETS: Dataset[] = [
  {
    id: 'ds-1',
    org_id: 'org-1',
    workspace_id: 'ws-1',
    name: 'Vendas Janeiro 2025',
    description: 'Dados de vendas do mês de janeiro',
    source_import_id: '1',
    primary_date_column: 'data_venda',
    currency_code: 'BRL',
    rows_count: 15420,
    is_active: true,
    created_by: 'user-1',
    created_at: '2025-01-15T10:32:15Z',
    updated_at: '2025-01-15T10:32:15Z',
  },
  {
    id: 'ds-2',
    org_id: 'org-1',
    workspace_id: 'ws-1',
    name: 'Leads Q4 2024',
    description: 'Base de leads do último trimestre de 2024',
    source_import_id: '2',
    primary_date_column: 'created_at',
    currency_code: 'BRL',
    rows_count: 8750,
    is_active: true,
    created_by: 'user-1',
    created_at: '2025-01-14T14:21:30Z',
    updated_at: '2025-01-14T14:21:30Z',
  },
];

export const importsService = {
  /**
   * Lista importações com filtros
   */
  async list(filters?: ImportFilters): Promise<DataImport[]> {
    // TODO: Replace with real Supabase query
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let result = [...MOCK_IMPORTS];
    
    if (filters?.workspace_id) {
      result = result.filter(i => i.workspace_id === filters.workspace_id);
    }
    if (filters?.status) {
      result = result.filter(i => i.status === filters.status);
    }
    if (filters?.file_type) {
      result = result.filter(i => i.file_type === filters.file_type);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(i => i.file_name.toLowerCase().includes(search));
    }
    
    return result.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  /**
   * Busca uma importação por ID
   */
  async getById(id: string): Promise<DataImport | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_IMPORTS.find(i => i.id === id) || null;
  },

  /**
   * Retorna estatísticas de importação
   */
  async getStats(): Promise<ImportStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const imports30d = MOCK_IMPORTS.filter(i => 
      new Date(i.created_at) >= thirtyDaysAgo
    );
    
    const errors7d = MOCK_IMPORTS.filter(i => 
      i.status === 'error' && new Date(i.created_at) >= sevenDaysAgo
    );
    
    const successImports = MOCK_IMPORTS
      .filter(i => i.status === 'success')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return {
      total_imports_30d: imports30d.length,
      active_datasets: MOCK_DATASETS.filter(d => d.is_active).length,
      errors_7d: errors7d.length,
      last_success: successImports[0]?.processing_completed_at || null,
    };
  },

  /**
   * Lista datasets
   */
  async listDatasets(workspaceId?: string): Promise<Dataset[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let result = [...MOCK_DATASETS];
    if (workspaceId) {
      result = result.filter(d => d.workspace_id === workspaceId);
    }
    
    return result;
  },

  /**
   * Cria uma nova importação
   */
  async create(data: Partial<DataImport>): Promise<DataImport> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newImport: DataImport = {
      id: `import-${Date.now()}`,
      org_id: data.org_id || 'org-1',
      workspace_id: data.workspace_id || 'ws-1',
      created_by: data.created_by || null,
      file_name: data.file_name || 'unknown.csv',
      file_type: data.file_type || 'csv',
      storage_path: data.storage_path || '',
      status: 'pending',
      rows_count: null,
      columns_count: null,
      error_message: null,
      processing_started_at: null,
      processing_completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    MOCK_IMPORTS.unshift(newImport);
    return newImport;
  },
};

export default importsService;
