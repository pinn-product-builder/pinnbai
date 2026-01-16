/**
 * Mock de Dashboards
 */

import { Dashboard, DashboardWidget } from '@/types/saas';

// ===== MOCK DATA =====
const MOCK_DASHBOARDS: Dashboard[] = [
  {
    id: 'dash-afonsina-001',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    name: 'Executivo',
    description: 'Visão executiva de performance',
    status: 'published',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Total de Leads',
        dataSetId: 'dset-afonsina-001',
        config: { metric: 'total_leads', aggregation: 'count' },
        layout: { x: 0, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Valor Total',
        dataSetId: 'dset-afonsina-001',
        config: { metric: 'valor_total', aggregation: 'sum', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 3, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w3',
        type: 'line',
        title: 'Evolução de Leads',
        dataSetId: 'dset-afonsina-001',
        config: { metric: 'total_leads', dateColumn: 'created_at' },
        layout: { x: 0, y: 1, w: 6, h: 2 },
      },
      {
        id: 'w4',
        type: 'funnel',
        title: 'Funil de Vendas',
        dataSetId: 'dset-afonsina-001',
        config: { dimension: 'status' },
        layout: { x: 6, y: 0, w: 6, h: 3 },
      },
    ],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dash-afonsina-002',
    orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
    name: 'Tráfego Pago',
    description: 'Análise de campanhas de tráfego',
    status: 'published',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Investimento',
        dataSetId: 'dset-afonsina-003',
        config: { metric: 'investimento_total', aggregation: 'sum', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 0, y: 0, w: 4, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'CPL',
        dataSetId: 'dset-afonsina-003',
        config: { metric: 'cpl', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 4, y: 0, w: 4, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'CTR',
        dataSetId: 'dset-afonsina-003',
        config: { metric: 'ctr', format: { type: 'percentage' } },
        layout: { x: 8, y: 0, w: 4, h: 1 },
      },
      {
        id: 'w4',
        type: 'bar',
        title: 'Investimento por Campanha',
        dataSetId: 'dset-afonsina-003',
        config: { metric: 'investimento_total', dimension: 'campaign_name' },
        layout: { x: 0, y: 1, w: 12, h: 2 },
      },
    ],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dash-pinn-001',
    orgId: 'pinn-org-001',
    name: 'MRR Overview',
    description: 'Acompanhamento de receita recorrente',
    status: 'published',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'MRR Total',
        dataSetId: 'dset-pinn-001',
        config: { metric: 'mrr_total', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 0, y: 0, w: 6, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Clientes Ativos',
        dataSetId: 'dset-pinn-001',
        config: { metric: 'total_clientes' },
        layout: { x: 6, y: 0, w: 6, h: 1 },
      },
      {
        id: 'w3',
        type: 'line',
        title: 'Evolução MRR',
        dataSetId: 'dset-pinn-001',
        config: { metric: 'mrr_total', dateColumn: 'start_date' },
        layout: { x: 0, y: 1, w: 12, h: 2 },
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'dash-demo-001',
    orgId: 'demo-org-001',
    name: 'Dashboard Demo',
    description: 'Dashboard de demonstração',
    status: 'draft',
    widgets: [],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
  },
];

// ===== DASHBOARDS SERVICE =====
export const dashboardsService = {
  /**
   * Listar dashboards de um workspace
   */
  list: async (orgId: string, filters?: {
    status?: string;
    search?: string;
  }): Promise<Dashboard[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = MOCK_DASHBOARDS.filter(d => d.orgId === orgId);
    
    if (filters?.status) {
      result = result.filter(d => d.status === filters.status);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(search) ||
        d.description?.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  /**
   * Listar todos (admin)
   */
  listAll: async (): Promise<Dashboard[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...MOCK_DASHBOARDS];
  },

  /**
   * Obter por ID
   */
  getById: async (id: string): Promise<Dashboard | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_DASHBOARDS.find(d => d.id === id) || null;
  },

  /**
   * Criar dashboard
   */
  create: async (data: Partial<Dashboard>): Promise<Dashboard> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newDash: Dashboard = {
      id: `dash-${Date.now()}`,
      orgId: data.orgId || '',
      name: data.name || 'Novo Dashboard',
      description: data.description,
      status: 'draft',
      widgets: data.widgets || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    MOCK_DASHBOARDS.push(newDash);
    return newDash;
  },

  /**
   * Atualizar dashboard
   */
  update: async (id: string, data: Partial<Dashboard>): Promise<Dashboard | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = MOCK_DASHBOARDS.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    MOCK_DASHBOARDS[index] = {
      ...MOCK_DASHBOARDS[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return MOCK_DASHBOARDS[index];
  },

  /**
   * Adicionar widget
   */
  addWidget: async (dashboardId: string, widget: Omit<DashboardWidget, 'id'>): Promise<DashboardWidget> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const dash = MOCK_DASHBOARDS.find(d => d.id === dashboardId);
    if (!dash) throw new Error('Dashboard não encontrado');
    
    const newWidget: DashboardWidget = {
      ...widget,
      id: `w-${Date.now()}`,
    };
    
    dash.widgets.push(newWidget);
    dash.updatedAt = new Date().toISOString();
    
    return newWidget;
  },

  /**
   * Remover widget
   */
  removeWidget: async (dashboardId: string, widgetId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const dash = MOCK_DASHBOARDS.find(d => d.id === dashboardId);
    if (!dash) throw new Error('Dashboard não encontrado');
    
    dash.widgets = dash.widgets.filter(w => w.id !== widgetId);
    dash.updatedAt = new Date().toISOString();
  },

  /**
   * Publicar dashboard
   */
  publish: async (id: string): Promise<Dashboard | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dash = MOCK_DASHBOARDS.find(d => d.id === id);
    if (dash) {
      dash.status = 'published';
      dash.updatedAt = new Date().toISOString();
    }
    return dash || null;
  },

  /**
   * Contagem por workspace
   */
  getCount: async (orgId?: string): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (orgId) {
      return MOCK_DASHBOARDS.filter(d => d.orgId === orgId).length;
    }
    return MOCK_DASHBOARDS.length;
  },
};
