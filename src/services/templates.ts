/**
 * Templates de Dashboard Pinn
 * 5 níveis de complexidade: básico (1) até avançado (5)
 */

import { DashboardTemplate } from '@/types/saas';

// ===== MOCK DATA - 5 Templates Pinn com níveis de complexidade =====
const MOCK_TEMPLATES: DashboardTemplate[] = [
  // ===== NÍVEL 1 - Básico (porém completo) =====
  {
    id: 'tpl-agent-sales',
    name: 'Pinn Agent Sales',
    description: 'Dashboard básico e completo para acompanhamento de vendas. Ideal para equipes comerciais iniciando com análise de dados.',
    category: 'vendas',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Total de Vendas',
        config: { metric: 'total_vendas', aggregation: 'count' },
        layout: { x: 0, y: 0, w: 4, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Receita Total',
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
        type: 'line',
        title: 'Evolução de Vendas',
        config: { metric: 'total_vendas', dateColumn: 'data_venda' },
        layout: { x: 0, y: 1, w: 12, h: 2 },
      },
    ],
    requiredMetrics: ['total_vendas', 'receita_total', 'ticket_medio'],
    createdAt: '2024-01-01T00:00:00Z',
  },

  // ===== NÍVEL 2 - Intermediário =====
  {
    id: 'tpl-revenue-os',
    name: 'Pinn Revenue OS',
    description: 'Sistema operacional de receita com análise de pipeline, conversões e projeções. Para times que precisam visibilidade do funil completo.',
    category: 'executivo',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'MRR',
        config: { metric: 'mrr', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 0, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'ARR',
        config: { metric: 'arr', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 3, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'Churn Rate',
        config: { metric: 'churn_rate', format: { type: 'percentage' } },
        layout: { x: 6, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w4',
        type: 'kpi',
        title: 'LTV',
        config: { metric: 'ltv', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 9, y: 0, w: 3, h: 1 },
      },
      {
        id: 'w5',
        type: 'line',
        title: 'Evolução MRR',
        config: { metric: 'mrr', dateColumn: 'month' },
        layout: { x: 0, y: 1, w: 8, h: 2 },
      },
      {
        id: 'w6',
        type: 'funnel',
        title: 'Funil de Conversão',
        config: { dimension: 'stage' },
        layout: { x: 8, y: 1, w: 4, h: 2 },
      },
      {
        id: 'w7',
        type: 'bar',
        title: 'Receita por Plano',
        config: { metric: 'receita', dimension: 'plano' },
        layout: { x: 0, y: 3, w: 6, h: 2 },
      },
      {
        id: 'w8',
        type: 'pie',
        title: 'Distribuição de Clientes',
        config: { metric: 'clientes', dimension: 'segmento' },
        layout: { x: 6, y: 3, w: 6, h: 2 },
      },
    ],
    requiredMetrics: ['mrr', 'arr', 'churn_rate', 'ltv', 'receita', 'clientes'],
    createdAt: '2024-01-01T00:00:00Z',
  },

  // ===== NÍVEL 3 - Avançado =====
  {
    id: 'tpl-growth-engine',
    name: 'Pinn Growth Engine',
    description: 'Motor de crescimento com métricas de aquisição, ativação, retenção e referência. Análise completa do ciclo de vida do cliente.',
    category: 'trafego',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Novos Usuários',
        config: { metric: 'novos_usuarios', aggregation: 'count' },
        layout: { x: 0, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Taxa de Ativação',
        config: { metric: 'taxa_ativacao', format: { type: 'percentage' } },
        layout: { x: 2, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'Retenção D7',
        config: { metric: 'retencao_d7', format: { type: 'percentage' } },
        layout: { x: 4, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w4',
        type: 'kpi',
        title: 'NPS',
        config: { metric: 'nps' },
        layout: { x: 6, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w5',
        type: 'kpi',
        title: 'CAC',
        config: { metric: 'cac', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 8, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w6',
        type: 'kpi',
        title: 'Viral Coef.',
        config: { metric: 'viral_coefficient' },
        layout: { x: 10, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w7',
        type: 'line',
        title: 'Cohort de Retenção',
        config: { metric: 'retencao', dateColumn: 'cohort_week' },
        layout: { x: 0, y: 1, w: 6, h: 2 },
      },
      {
        id: 'w8',
        type: 'area',
        title: 'Funil AARRR',
        config: { metric: 'usuarios', dateColumn: 'date' },
        layout: { x: 6, y: 1, w: 6, h: 2 },
      },
      {
        id: 'w9',
        type: 'bar',
        title: 'Aquisição por Canal',
        config: { metric: 'novos_usuarios', dimension: 'canal' },
        layout: { x: 0, y: 3, w: 4, h: 2 },
      },
      {
        id: 'w10',
        type: 'bar',
        title: 'Custo por Canal',
        config: { metric: 'custo', dimension: 'canal' },
        layout: { x: 4, y: 3, w: 4, h: 2 },
      },
      {
        id: 'w11',
        type: 'pie',
        title: 'Referências',
        config: { metric: 'referencias', dimension: 'fonte' },
        layout: { x: 8, y: 3, w: 4, h: 2 },
      },
    ],
    requiredMetrics: ['novos_usuarios', 'taxa_ativacao', 'retencao_d7', 'nps', 'cac', 'viral_coefficient', 'custo', 'referencias'],
    createdAt: '2024-01-01T00:00:00Z',
  },

  // ===== NÍVEL 4 - Muito Avançado =====
  {
    id: 'tpl-process-automation',
    name: 'Pinn Process Automation',
    description: 'Dashboard de automação de processos com métricas de eficiência, SLAs, gargalos e produtividade. Para operações que precisam de controle granular.',
    category: 'operacoes',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      {
        id: 'w1',
        type: 'kpi',
        title: 'Processos Ativos',
        config: { metric: 'processos_ativos', aggregation: 'count' },
        layout: { x: 0, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Taxa de Automação',
        config: { metric: 'taxa_automacao', format: { type: 'percentage' } },
        layout: { x: 2, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'Tempo Médio',
        config: { metric: 'tempo_medio' },
        layout: { x: 4, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w4',
        type: 'kpi',
        title: 'SLA Cumprido',
        config: { metric: 'sla_cumprido', format: { type: 'percentage' } },
        layout: { x: 6, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w5',
        type: 'kpi',
        title: 'Erros',
        config: { metric: 'erros', aggregation: 'count' },
        layout: { x: 8, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w6',
        type: 'kpi',
        title: 'Economia Gerada',
        config: { metric: 'economia', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 10, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w7',
        type: 'line',
        title: 'Volume de Processamento',
        config: { metric: 'processos_executados', dateColumn: 'date' },
        layout: { x: 0, y: 1, w: 8, h: 2 },
      },
      {
        id: 'w8',
        type: 'bar',
        title: 'Gargalos por Etapa',
        config: { metric: 'tempo_espera', dimension: 'etapa' },
        layout: { x: 8, y: 1, w: 4, h: 2 },
      },
      {
        id: 'w9',
        type: 'heatmap',
        title: 'Mapa de Calor - Horários',
        config: { metric: 'processos', dimension: 'hora' },
        layout: { x: 0, y: 3, w: 6, h: 2 },
      },
      {
        id: 'w10',
        type: 'bar',
        title: 'Performance por Equipe',
        config: { metric: 'produtividade', dimension: 'equipe' },
        layout: { x: 6, y: 3, w: 6, h: 2 },
      },
      {
        id: 'w11',
        type: 'line',
        title: 'Tendência de Erros',
        config: { metric: 'erros', dateColumn: 'date' },
        layout: { x: 0, y: 5, w: 6, h: 2 },
      },
      {
        id: 'w12',
        type: 'funnel',
        title: 'Pipeline de Processos',
        config: { dimension: 'status' },
        layout: { x: 6, y: 5, w: 6, h: 2 },
      },
    ],
    requiredMetrics: ['processos_ativos', 'taxa_automacao', 'tempo_medio', 'sla_cumprido', 'erros', 'economia', 'produtividade'],
    createdAt: '2024-01-01T00:00:00Z',
  },

  // ===== NÍVEL 5 - Máxima Complexidade =====
  {
    id: 'tpl-microsaas-studio',
    name: 'Pinn MicroSaaS Studio',
    description: 'Dashboard completo para MicroSaaS com todas as métricas de produto, receita, growth, operações e customer success. Visão 360° do negócio.',
    category: 'executivo',
    previewImageUrl: '/placeholder.svg',
    widgets: [
      // Row 1 - KPIs principais
      {
        id: 'w1',
        type: 'kpi',
        title: 'MRR',
        config: { metric: 'mrr', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 0, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w2',
        type: 'kpi',
        title: 'Usuários Ativos',
        config: { metric: 'mau', aggregation: 'count' },
        layout: { x: 2, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w3',
        type: 'kpi',
        title: 'Churn',
        config: { metric: 'churn', format: { type: 'percentage' } },
        layout: { x: 4, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w4',
        type: 'kpi',
        title: 'NRR',
        config: { metric: 'nrr', format: { type: 'percentage' } },
        layout: { x: 6, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w5',
        type: 'kpi',
        title: 'CAC',
        config: { metric: 'cac', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 8, y: 0, w: 2, h: 1 },
      },
      {
        id: 'w6',
        type: 'kpi',
        title: 'LTV:CAC',
        config: { metric: 'ltv_cac_ratio' },
        layout: { x: 10, y: 0, w: 2, h: 1 },
      },
      // Row 2 - Gráficos principais
      {
        id: 'w7',
        type: 'area',
        title: 'Evolução MRR & Cohorts',
        config: { metric: 'mrr', dateColumn: 'month' },
        layout: { x: 0, y: 1, w: 6, h: 2 },
      },
      {
        id: 'w8',
        type: 'funnel',
        title: 'Funil de Conversão',
        config: { dimension: 'stage' },
        layout: { x: 6, y: 1, w: 3, h: 2 },
      },
      {
        id: 'w9',
        type: 'pie',
        title: 'Receita por Plano',
        config: { metric: 'receita', dimension: 'plano' },
        layout: { x: 9, y: 1, w: 3, h: 2 },
      },
      // Row 3 - Growth
      {
        id: 'w10',
        type: 'line',
        title: 'Aquisição Semanal',
        config: { metric: 'signups', dateColumn: 'week' },
        layout: { x: 0, y: 3, w: 4, h: 2 },
      },
      {
        id: 'w11',
        type: 'bar',
        title: 'Canais de Aquisição',
        config: { metric: 'signups', dimension: 'canal' },
        layout: { x: 4, y: 3, w: 4, h: 2 },
      },
      {
        id: 'w12',
        type: 'heatmap',
        title: 'Mapa de Retenção',
        config: { metric: 'retencao', dimension: 'cohort' },
        layout: { x: 8, y: 3, w: 4, h: 2 },
      },
      // Row 4 - Produto
      {
        id: 'w13',
        type: 'bar',
        title: 'Features Mais Usadas',
        config: { metric: 'uso', dimension: 'feature' },
        layout: { x: 0, y: 5, w: 4, h: 2 },
      },
      {
        id: 'w14',
        type: 'line',
        title: 'Engajamento Diário',
        config: { metric: 'dau', dateColumn: 'date' },
        layout: { x: 4, y: 5, w: 4, h: 2 },
      },
      {
        id: 'w15',
        type: 'bar',
        title: 'Health Score por Segmento',
        config: { metric: 'health_score', dimension: 'segmento' },
        layout: { x: 8, y: 5, w: 4, h: 2 },
      },
      // Row 5 - Customer Success
      {
        id: 'w16',
        type: 'kpi',
        title: 'CSAT',
        config: { metric: 'csat', format: { type: 'percentage' } },
        layout: { x: 0, y: 7, w: 2, h: 1 },
      },
      {
        id: 'w17',
        type: 'kpi',
        title: 'NPS',
        config: { metric: 'nps' },
        layout: { x: 2, y: 7, w: 2, h: 1 },
      },
      {
        id: 'w18',
        type: 'kpi',
        title: 'Tickets Abertos',
        config: { metric: 'tickets_abertos', aggregation: 'count' },
        layout: { x: 4, y: 7, w: 2, h: 1 },
      },
      {
        id: 'w19',
        type: 'kpi',
        title: 'Tempo Resposta',
        config: { metric: 'tempo_resposta' },
        layout: { x: 6, y: 7, w: 2, h: 1 },
      },
      {
        id: 'w20',
        type: 'kpi',
        title: 'Resolução 1º Contato',
        config: { metric: 'fcr', format: { type: 'percentage' } },
        layout: { x: 8, y: 7, w: 2, h: 1 },
      },
      {
        id: 'w21',
        type: 'kpi',
        title: 'Expansão MRR',
        config: { metric: 'expansion_mrr', format: { type: 'currency', currency: 'BRL' } },
        layout: { x: 10, y: 7, w: 2, h: 1 },
      },
      // Row 6 - Financeiro
      {
        id: 'w22',
        type: 'line',
        title: 'Runway & Burn Rate',
        config: { metric: 'cash', dateColumn: 'month' },
        layout: { x: 0, y: 8, w: 6, h: 2 },
      },
      {
        id: 'w23',
        type: 'bar',
        title: 'Unit Economics por Cohort',
        config: { metric: 'unit_economics', dimension: 'cohort' },
        layout: { x: 6, y: 8, w: 6, h: 2 },
      },
    ],
    requiredMetrics: [
      'mrr', 'mau', 'churn', 'nrr', 'cac', 'ltv_cac_ratio', 'signups', 'retencao',
      'uso', 'dau', 'health_score', 'csat', 'nps', 'tickets_abertos', 'tempo_resposta',
      'fcr', 'expansion_mrr', 'cash', 'unit_economics'
    ],
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
      { value: 'trafego', label: 'Growth & Tráfego' },
      { value: 'operacoes', label: 'Operações' },
      { value: 'custom', label: 'Personalizado' },
    ];
  },

  /**
   * Obter nível de complexidade do template
   */
  getComplexityLevel: (templateId: string): { level: number; label: string } => {
    const complexityMap: Record<string, { level: number; label: string }> = {
      'tpl-agent-sales': { level: 1, label: 'Básico' },
      'tpl-revenue-os': { level: 2, label: 'Intermediário' },
      'tpl-growth-engine': { level: 3, label: 'Avançado' },
      'tpl-process-automation': { level: 4, label: 'Muito Avançado' },
      'tpl-microsaas-studio': { level: 5, label: 'Expert' },
    };
    return complexityMap[templateId] || { level: 1, label: 'Básico' };
  },
};
