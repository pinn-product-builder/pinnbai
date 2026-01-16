/**
 * Mock de Pipelines
 */

import { PipelineRun } from '@/types/saas';

// ===== MOCK DATA =====
const MOCK_PIPELINE_RUNS: PipelineRun[] = [
  {
    id: 'run-001',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    type: 'sync',
    status: 'success',
    sourceId: 'ds-afonsina-001',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    finishedAt: new Date(Date.now() - 3500000).toISOString(),
    logs: '[INFO] Iniciando sincronização...\n[INFO] Conectando ao Supabase...\n[INFO] Lendo tabela leads...\n[INFO] 1523 registros encontrados\n[INFO] Sincronização concluída com sucesso',
    recordsProcessed: 1523,
  },
  {
    id: 'run-002',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    type: 'refresh',
    status: 'success',
    dataSetId: 'dset-afonsina-001',
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    finishedAt: new Date(Date.now() - 7100000).toISOString(),
    logs: '[INFO] Iniciando refresh do dataset...\n[INFO] Processando dados...\n[INFO] Calculando métricas...\n[INFO] Refresh concluído',
    recordsProcessed: 1523,
  },
  {
    id: 'run-003',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    type: 'sync',
    status: 'error',
    sourceId: 'ds-afonsina-002',
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    finishedAt: new Date(Date.now() - 86300000).toISOString(),
    logs: '[INFO] Iniciando sincronização...\n[INFO] Lendo arquivo Excel...\n[ERROR] Erro ao processar linha 1542: formato de data inválido',
    errorMessage: 'Erro ao processar linha 1542: formato de data inválido',
    recordsProcessed: 1541,
  },
  {
    id: 'run-004',
    orgId: 'pinn-org-001',
    type: 'sync',
    status: 'running',
    sourceId: 'ds-pinn-001',
    startedAt: new Date(Date.now() - 60000).toISOString(),
    logs: '[INFO] Iniciando sincronização...\n[INFO] Conectando ao PostgreSQL...\n[INFO] Processando...',
    recordsProcessed: 0,
  },
  {
    id: 'run-005',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    type: 'transform',
    status: 'success',
    dataSetId: 'dset-afonsina-003',
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    finishedAt: new Date(Date.now() - 172700000).toISOString(),
    logs: '[INFO] Aplicando transformações...\n[INFO] Calculando CTR...\n[INFO] Calculando CPL...\n[INFO] Transformação concluída',
    recordsProcessed: 847,
  },
];

// ===== PIPELINES SERVICE =====
export const pipelinesService = {
  /**
   * Listar execuções de um workspace
   */
  list: async (orgId: string, filters?: {
    type?: 'sync' | 'refresh' | 'transform';
    status?: string;
    limit?: number;
  }): Promise<PipelineRun[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = MOCK_PIPELINE_RUNS.filter(r => r.orgId === orgId);
    
    if (filters?.type) {
      result = result.filter(r => r.type === filters.type);
    }
    
    if (filters?.status) {
      result = result.filter(r => r.status === filters.status);
    }
    
    // Ordenar por data mais recente
    result.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    
    return result;
  },

  /**
   * Listar todos (admin)
   */
  listAll: async (filters?: {
    status?: string;
    limit?: number;
  }): Promise<PipelineRun[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...MOCK_PIPELINE_RUNS];
    
    if (filters?.status) {
      result = result.filter(r => r.status === filters.status);
    }
    
    result.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    
    return result;
  },

  /**
   * Obter por ID
   */
  getById: async (id: string): Promise<PipelineRun | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_PIPELINE_RUNS.find(r => r.id === id) || null;
  },

  /**
   * Reprocessar (mock)
   */
  reprocess: async (id: string): Promise<PipelineRun> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const original = MOCK_PIPELINE_RUNS.find(r => r.id === id);
    
    const newRun: PipelineRun = {
      id: `run-${Date.now()}`,
      orgId: original?.orgId || '',
      type: original?.type || 'sync',
      status: 'running',
      sourceId: original?.sourceId,
      dataSetId: original?.dataSetId,
      startedAt: new Date().toISOString(),
      logs: '[INFO] Reprocessando...',
    };
    
    MOCK_PIPELINE_RUNS.unshift(newRun);
    
    // Simular conclusão após 3 segundos
    setTimeout(() => {
      newRun.status = 'success';
      newRun.finishedAt = new Date().toISOString();
      newRun.logs += '\n[INFO] Reprocessamento concluído com sucesso';
      newRun.recordsProcessed = Math.floor(Math.random() * 2000) + 500;
    }, 3000);
    
    return newRun;
  },

  /**
   * Estatísticas
   */
  getStats: async (orgId?: string): Promise<{
    total: number;
    running: number;
    success: number;
    error: number;
  }> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let runs = orgId 
      ? MOCK_PIPELINE_RUNS.filter(r => r.orgId === orgId)
      : MOCK_PIPELINE_RUNS;
    
    return {
      total: runs.length,
      running: runs.filter(r => r.status === 'running').length,
      success: runs.filter(r => r.status === 'success').length,
      error: runs.filter(r => r.status === 'error').length,
    };
  },
};
