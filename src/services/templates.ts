/**
 * Mock de Templates
 */

import { DashboardTemplate } from '@/types/saas';

// ===== MOCK DATA =====
const MOCK_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'tpl-executivo',
    name: 'Executivo',
    description: 'Dashboard executivo com visão geral de leads, reuniões e conversões. Ideal para acompanhamento diário de resultados.',
    category: 'executivo',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Total de Leads',
        config: { metric: 'total_leads', aggregation: 'count' },
        layout: { x: 0, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Reuniões Realizadas',
        config: { metric: 'total_reunioes', aggregation: 'count' },
        layout: { x: 3, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'Taxa de Conversão',
        config: { metric: 'taxa_conversao', format: { type: 'percentage' } },
        layout: { x: 6, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w4',
        type: 'kpi',
        title: 'Valor em Pipeline',
        config: { metric: 'valor_pipeline', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 9, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w5',
        type: 'line',
        title: 'Evolução Diária',
        config: { metric: 'total_leads', dateColumn: 'created_at' },
        layout: { x: 0, y: 1, w: 8, h: 2 },
      },
      {
        id: 'w6',
        type: 'funnel',
        title: 'Funil de Vendas',
        config: { dimension: 'status' },
        layout: { x: 8, y: 1, w: 4, h: 2 },
      },
    ],
    requiredMetrics: ['total_leads', 'total_reunioes', 'taxa_conversao', 'valor_pipeline'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-vendas',
    name: 'Vendas',
    description: 'Acompanhamento detalhado do time comercial com métricas de vendas, ticket médio e performance por vendedor.',
    category: 'vendas',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Vendas Fechadas',
        config: { metric: 'vendas_fechadas', aggregation: 'count' },
        layout: { x: 0, y: 0, w: 4, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Receita',
        config: { metric: 'receita_total', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 4, y: 0, w: 4, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'Ticket Médio',
        config: { metric: 'ticket_medio', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 8, y: 0, w: 4, h: 1 },
      },
      {
        id: 'w4',
        type: 'bar',
        title: 'Vendas por Vendedor',
        config: { metric: 'vendas_fechadas', dimension: 'vendedor' },
        layout: { x: 0, y: 1, w: 6, h: 2 },
      },
      {
        id: 'w5',
        type: 'line',
        title: 'Receita Mensal',
        config: { metric: 'receita_total', dateColumn: 'data_fechamento' },
        layout: { x: 6, y: 1, w: 6, h: 2 },
      },
    ],
    requiredMetrics: ['vendas_fechadas', 'receita_total', 'ticket_medio'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-trafego',
    name: 'Tráfego Pago',
    description: 'Análise de campanhas de tráfego pago com CPL, CTR, investimento e performance por campanha.',
    category: 'trafego',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Investimento',
        config: { metric: 'investimento', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 0, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Leads Gerados',
        config: { metric: 'leads_gerados', aggregation: 'count' },
        layout: { x: 3, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'CPL',
        config: { metric: 'cpl', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 6, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w4',
        type: 'kpi',
        title: 'CTR',
        config: { metric: 'ctr', format: { type: 'percentage' } },
        layout: { x: 9, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w5',
        type: 'line',
        title: 'Investimento vs Leads',
        config: { metric: 'investimento', dateColumn: 'date' },
        layout: { x: 0, y: 1, w: 12, h: 2 },
      },
      {
        id: 'w6',
        type: 'bar',
        title: 'Performance por Campanha',
        config: { metric: 'leads_gerados', dimension: 'campaign' },
        layout: { x: 0, y: 3, w: 12, h: 2 },
      },
    ],
    requiredMetrics: ['investimento', 'leads_gerados', 'cpl', 'ctr'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-operacoes',
    name: 'Operações',
    description: 'Visão operacional com métricas de atendimento, tempo de resposta e SLAs.',
    category: 'operacoes',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Tickets Abertos',
        config: { metric: 'tickets_abertos', aggregation: 'count' },
        layout: { x: 0, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Tempo Médio',
        config: { metric: 'tempo_medio' },
        layout: { x: 3, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'SLA Cumprido',
        config: { metric: 'sla_cumprido', format: { type: 'percentage' } },
        layout: { x: 6, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w4',
        type: 'kpi',
        title: 'Satisfação',
        config: { metric: 'nps' },
        layout: { x: 9, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w5',
        type: 'line',
        title: 'Volume de Atendimentos',
        config: { metric: 'tickets_abertos', dateColumn: 'created_at' },
        layout: { x: 0, y: 1, w: 12, h: 2 },
      },
    ],
    requiredMetrics: ['tickets_abertos', 'tempo_medio', 'sla_cumprido', 'nps'],
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// ===== TEMPLATES SERVICE =====
export const templatesService = {
  /**
   * Listar templates
   */
  list: async (filters?: {
    category?: string;
    search?: string;
  }): Promise<DashboardTemplate[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let result = [...MOCK_TEMPLATES];
    
    if (filters?.category) {
      result = result.filter(t => t.category === filters.category);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  /**
   * Obter por ID
   */
  getById: async (id: string): Promise<DashboardTemplate | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_TEMPLATES.find(t => t.id === id) || null;
  },

  /**
   * Aplicar template a um dataset
   */
  apply: async (templateId: string, dataSetId: string, orgId: string): Promise<{ dashboardId: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular criação de dashboard a partir do template
    return { dashboardId: `dash-from-tpl-${Date.now()}` };
  },

  /**
   * Categorias disponíveis
   */
  getCategories: async (): Promise<{ value: string; label: string }[]> => {
    return [
      { value: 'executivo', label: 'Executivo' },
      { value: 'vendas', label: 'Vendas' },
      { value: 'trafego', label: 'Tráfego Pago' },
      { value: 'operacoes', label: 'Operações' },
      { value: 'custom', label: 'Personalizado' },
    ];
  },
};
