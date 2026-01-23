/**
 * Gerador Automático de Dashboard Premium
 * Cria widgets de alto nível com ícones, descrições, trends e layout profissional
 */

import { DashboardWidget, WidgetType } from '@/types/saas';
import { DetectedColumn, DetectedSchema } from '@/components/imports/ImportWizard';

interface DashboardGeneratorOptions {
  schema: DetectedSchema;
  datasetId: string;
  template: 'auto' | 'sales' | 'analytics' | 'overview';
  primaryDateColumn: string | null;
}

interface GeneratedDashboard {
  widgets: DashboardWidget[];
  name: string;
  description: string;
  sections: DashboardSection[];
}

interface DashboardSection {
  id: string;
  title: string;
  description?: string;
  widgets: string[]; // Widget IDs
}

// Ícones sugeridos baseados no tipo/nome do campo
const ICON_SUGGESTIONS: Record<string, string> = {
  // Financeiros
  'valor': 'DollarSign',
  'receita': 'DollarSign',
  'revenue': 'DollarSign',
  'venda': 'DollarSign',
  'preco': 'DollarSign',
  'price': 'DollarSign',
  'custo': 'TrendingDown',
  'cost': 'TrendingDown',
  'investimento': 'TrendingUp',
  'spend': 'DollarSign',
  'cpl': 'TrendingUp',
  'cpm': 'TrendingUp',
  'ticket': 'Receipt',
  
  // Leads/Usuários
  'lead': 'Users',
  'leads': 'Users',
  'usuario': 'User',
  'user': 'User',
  'cliente': 'UserCheck',
  'customer': 'UserCheck',
  'aluno': 'GraduationCap',
  
  // Comunicação
  'mensagem': 'MessageSquare',
  'message': 'MessageSquare',
  'msg': 'MessageSquare',
  'email': 'Mail',
  'conversa': 'MessageCircle',
  
  // Reuniões/Agenda
  'reuniao': 'CalendarCheck',
  'reunioes': 'CalendarCheck',
  'meeting': 'CalendarCheck',
  'agenda': 'Calendar',
  'cancelamento': 'CalendarX',
  'cancelled': 'CalendarX',
  
  // Métricas
  'conversao': 'Percent',
  'conversion': 'Percent',
  'taxa': 'Percent',
  'rate': 'Percent',
  'total': 'Hash',
  'quantidade': 'Hash',
  'count': 'Hash',
  
  // Status/Progresso
  'status': 'Activity',
  'etapa': 'GitBranch',
  'stage': 'GitBranch',
  'ativo': 'CheckCircle',
  'active': 'CheckCircle',
};

function getIconForField(fieldName: string): string {
  const lowerName = fieldName.toLowerCase();
  for (const [key, icon] of Object.entries(ICON_SUGGESTIONS)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }
  return 'BarChart3';
}

function getVariantForField(fieldName: string, dataType: string): 'default' | 'primary' | 'success' | 'warning' | 'destructive' {
  const lowerName = fieldName.toLowerCase();
  
  if (lowerName.includes('lead') || lowerName.includes('total')) return 'primary';
  if (lowerName.includes('conversao') || lowerName.includes('realiz') || lowerName.includes('done') || lowerName.includes('ativo')) return 'success';
  if (lowerName.includes('investimento') || lowerName.includes('spend') || lowerName.includes('custo')) return 'warning';
  if (lowerName.includes('cancel') || lowerName.includes('perda') || lowerName.includes('churn')) return 'destructive';
  if (dataType === 'currency') return 'warning';
  if (dataType === 'percent') return 'success';
  
  return 'default';
}

function generateDescription(fieldName: string, dataType: string, aggregation: string): string {
  const fieldLower = fieldName.toLowerCase();
  
  if (fieldLower.includes('lead')) {
    return 'Total de leads capturados no período selecionado';
  }
  if (fieldLower.includes('mensagem') || fieldLower.includes('msg')) {
    return 'Mensagens recebidas e processadas';
  }
  if (fieldLower.includes('reuniao') || fieldLower.includes('meeting')) {
    if (fieldLower.includes('cancel')) {
      return 'Reuniões que foram canceladas no período';
    }
    if (fieldLower.includes('realiz') || fieldLower.includes('done')) {
      return 'Reuniões efetivamente realizadas';
    }
    return 'Reuniões agendadas no período';
  }
  if (fieldLower.includes('invest') || fieldLower.includes('spend')) {
    return 'Valor total investido em mídia paga';
  }
  if (fieldLower.includes('cpl')) {
    return 'Custo por lead - quanto custa adquirir cada lead';
  }
  if (fieldLower.includes('conv') || fieldLower.includes('taxa')) {
    return 'Taxa de conversão entre etapas do funil';
  }
  if (dataType === 'currency') {
    return `Valor monetário - ${aggregation === 'avg' ? 'média' : 'soma total'}`;
  }
  if (dataType === 'percent') {
    return 'Percentual calculado automaticamente';
  }
  
  return `Métrica calculada automaticamente (${aggregation})`;
}

/**
 * Gera widgets automaticamente baseado no esquema detectado
 */
export function generateDashboardFromSchema(options: DashboardGeneratorOptions): GeneratedDashboard {
  const { schema, datasetId, template, primaryDateColumn } = options;

  // Separar colunas por tipo
  const measures = schema.columns.filter(c => c.isMeasure);
  const dimensions = schema.columns.filter(c => c.isDimension && !['date', 'datetime'].includes(c.dataType));
  const dateColumns = schema.columns.filter(c => ['date', 'datetime'].includes(c.dataType));
  const categories = schema.columns.filter(c => c.dataType === 'category');
  const booleans = schema.columns.filter(c => c.dataType === 'boolean');

  // Selecionar estratégia baseada no template
  switch (template) {
    case 'sales':
      return generateSalesDashboard({ schema, datasetId, measures, dimensions, dateColumns, primaryDateColumn });
    case 'analytics':
      return generateAnalyticsDashboard({ schema, datasetId, measures, dimensions, dateColumns, primaryDateColumn });
    case 'overview':
      return generateOverviewDashboard({ schema, datasetId, measures, dimensions, primaryDateColumn });
    case 'auto':
    default:
      return generateAutoDashboard({ schema, datasetId, measures, dimensions, dateColumns, categories, booleans, primaryDateColumn });
  }
}

interface GeneratorContext {
  schema: DetectedSchema;
  datasetId: string;
  measures: DetectedColumn[];
  dimensions: DetectedColumn[];
  dateColumns?: DetectedColumn[];
  categories?: DetectedColumn[];
  booleans?: DetectedColumn[];
  primaryDateColumn: string | null;
}

/**
 * Geração automática inteligente - Layout Premium
 */
function generateAutoDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
  const sections: DashboardSection[] = [];
  let currentY = 0;

  // === SEÇÃO 1: KPIs PRINCIPAIS ===
  const section1Widgets: string[] = [];
  
  // Primeira linha de KPIs (até 5)
  const topMeasures = ctx.measures.slice(0, 5);
  const kpiWidth = Math.max(2, Math.floor(12 / Math.max(topMeasures.length, 1)));

  topMeasures.forEach((measure, index) => {
    const widgetId = `kpi-main-${index}`;
    const aggregation = getAggregationForType(measure.dataType);
    widgets.push(createPremiumKPIWidget({
      id: widgetId,
      title: measure.displayName,
      metric: measure.name,
      datasetId: ctx.datasetId,
      x: index * kpiWidth,
      y: currentY,
      w: kpiWidth,
      aggregation,
      format: getFormatForType(measure.dataType),
      icon: getIconForField(measure.name),
      variant: getVariantForField(measure.name, measure.dataType),
      description: generateDescription(measure.name, measure.dataType, aggregation),
      showTrend: true,
    }));
    section1Widgets.push(widgetId);
  });

  if (topMeasures.length > 0) currentY += 1;

  // Segunda linha de KPIs (métricas secundárias, até 4)
  const secondaryMeasures = ctx.measures.slice(5, 9);
  if (secondaryMeasures.length > 0) {
    const kpi2Width = Math.max(3, Math.floor(12 / Math.max(secondaryMeasures.length, 1)));
    secondaryMeasures.forEach((measure, index) => {
      const widgetId = `kpi-secondary-${index}`;
      const aggregation = getAggregationForType(measure.dataType);
      widgets.push(createPremiumKPIWidget({
        id: widgetId,
        title: measure.displayName,
        metric: measure.name,
        datasetId: ctx.datasetId,
        x: index * kpi2Width,
        y: currentY,
        w: kpi2Width,
        aggregation,
        format: getFormatForType(measure.dataType),
        icon: getIconForField(measure.name),
        variant: getVariantForField(measure.name, measure.dataType),
        description: generateDescription(measure.name, measure.dataType, aggregation),
      }));
      section1Widgets.push(widgetId);
    });
    currentY += 1;
  }

  sections.push({
    id: 'section-kpis',
    title: 'Indicadores Principais',
    description: 'Métricas-chave de performance',
    widgets: section1Widgets,
  });

  // === SEÇÃO 2: GRÁFICOS DE TENDÊNCIA ===
  const section2Widgets: string[] = [];
  const dateCol = ctx.primaryDateColumn || ctx.dateColumns?.[0]?.name;
  const mainMeasure = ctx.measures[0];

  if (dateCol && mainMeasure) {
    // Gráfico de evolução diária (múltiplas métricas)
    const trendId = 'trend-daily';
    const trendMetrics = ctx.measures.slice(0, 4).map(m => m.name);
    widgets.push(createMultiLineChartWidget({
      id: trendId,
      title: 'Evolução Diária',
      subtitle: `${ctx.measures.slice(0, 4).map(m => m.displayName).join(', ')}`,
      metrics: trendMetrics,
      dateColumn: dateCol,
      datasetId: ctx.datasetId,
      x: 0,
      y: currentY,
      w: 8,
      h: 3,
    }));
    section2Widgets.push(trendId);

    // Gráfico de distribuição (pizza ou funil)
    const stageColumn = ctx.dimensions.find(d => 
      d.name.toLowerCase().includes('status') ||
      d.name.toLowerCase().includes('stage') ||
      d.name.toLowerCase().includes('etapa')
    );

    if (stageColumn) {
      const funnelId = 'funnel-pipeline';
      widgets.push(createPremiumFunnelWidget({
        id: funnelId,
        title: 'Pipeline de Conversão',
        subtitle: 'Funil atual por etapa',
        dimension: stageColumn.name,
        datasetId: ctx.datasetId,
        x: 8,
        y: currentY,
        w: 4,
        h: 3,
      }));
      section2Widgets.push(funnelId);
    } else if (ctx.categories && ctx.categories.length > 0) {
      const category = ctx.categories[0];
      const pieId = 'pie-distribution';
      widgets.push(createPieChartWidget({
        id: pieId,
        title: `Distribuição por ${category.displayName}`,
        dimension: category.name,
        metric: mainMeasure?.name,
        datasetId: ctx.datasetId,
        x: 8,
        y: currentY,
        w: 4,
        h: 3,
      }));
      section2Widgets.push(pieId);
    }

    currentY += 3;
  }

  if (section2Widgets.length > 0) {
    sections.push({
      id: 'section-trends',
      title: 'Análise de Tendências',
      description: 'Evolução temporal e distribuição',
      widgets: section2Widgets,
    });
  }

  // === SEÇÃO 3: ANÁLISE DIMENSIONAL ===
  const section3Widgets: string[] = [];
  const mainDimension = ctx.dimensions.find(d => d.dataType === 'category') || ctx.dimensions[0];
  
  if (mainDimension && mainMeasure) {
    const bar1Id = 'bar-dimension-1';
    widgets.push(createPremiumBarChartWidget({
      id: bar1Id,
      title: `${mainMeasure.displayName} por ${mainDimension.displayName}`,
      subtitle: 'Comparativo por categoria',
      metric: mainMeasure.name,
      dimension: mainDimension.name,
      datasetId: ctx.datasetId,
      x: 0,
      y: currentY,
      w: 6,
      h: 3,
    }));
    section3Widgets.push(bar1Id);
    
    // Segunda dimensão se existir
    const secondDimension = ctx.dimensions.find(d => d.name !== mainDimension.name);
    if (secondDimension) {
      const bar2Id = 'bar-dimension-2';
      widgets.push(createPremiumBarChartWidget({
        id: bar2Id,
        title: `${mainMeasure.displayName} por ${secondDimension.displayName}`,
        subtitle: 'Análise secundária',
        metric: mainMeasure.name,
        dimension: secondDimension.name,
        datasetId: ctx.datasetId,
        x: 6,
        y: currentY,
        w: 6,
        h: 3,
      }));
      section3Widgets.push(bar2Id);
    }

    currentY += 3;
  }

  if (section3Widgets.length > 0) {
    sections.push({
      id: 'section-analysis',
      title: 'Análise Dimensional',
      description: 'Detalhamento por categorias',
      widgets: section3Widgets,
    });
  }

  // === SEÇÃO 4: INSIGHTS E DADOS ===
  const section4Widgets: string[] = [];

  // Widget de Insights IA
  const insightsId = 'insights-ai';
  widgets.push(createInsightsWidget({
    id: insightsId,
    title: 'Insights IA',
    subtitle: 'Análises baseadas nos dados reais',
    datasetId: ctx.datasetId,
    x: 0,
    y: currentY,
    w: 6,
    h: 3,
  }));
  section4Widgets.push(insightsId);

  // Tabela de dados detalhados
  const tableId = 'table-details';
  widgets.push(createPremiumTableWidget({
    id: tableId,
    title: 'Dados Detalhados',
    subtitle: 'Registros mais recentes',
    datasetId: ctx.datasetId,
    columns: ctx.schema.columns.slice(0, 6).map(c => c.name),
    x: 6,
    y: currentY,
    w: 6,
    h: 3,
  }));
  section4Widgets.push(tableId);

  sections.push({
    id: 'section-details',
    title: 'Detalhamento',
    description: 'Insights automáticos e dados brutos',
    widgets: section4Widgets,
  });

  return {
    widgets,
    sections,
    name: 'Dashboard Inteligente',
    description: `Dashboard gerado automaticamente com ${widgets.length} visualizações organizadas em ${sections.length} seções`,
  };
}

/**
 * Template de Vendas - Layout Premium
 */
function generateSalesDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
  const sections: DashboardSection[] = [];
  let currentY = 0;

  // Encontrar métricas relevantes para vendas
  const valueMeasure = ctx.measures.find(m => 
    m.dataType === 'currency' || 
    m.name.toLowerCase().includes('valor') ||
    m.name.toLowerCase().includes('receita') ||
    m.name.toLowerCase().includes('venda')
  ) || ctx.measures[0];

  const countMeasure = ctx.measures.find(m => 
    m.dataType === 'integer' ||
    m.name.toLowerCase().includes('quantidade') ||
    m.name.toLowerCase().includes('total')
  );

  // === SEÇÃO 1: KPIs DE VENDAS ===
  const section1Widgets: string[] = [];

  if (valueMeasure) {
    const kpi1 = 'kpi-revenue';
    widgets.push(createPremiumKPIWidget({
      id: kpi1,
      title: 'Receita Total',
      metric: valueMeasure.name,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 3,
      aggregation: 'sum',
      format: { type: 'currency', currency: 'BRL' },
      icon: 'DollarSign',
      variant: 'warning',
      description: 'Valor total de receita no período',
      showTrend: true,
    }));
    section1Widgets.push(kpi1);
  }

  if (countMeasure) {
    const kpi2 = 'kpi-count';
    widgets.push(createPremiumKPIWidget({
      id: kpi2,
      title: 'Total de Vendas',
      metric: countMeasure.name,
      datasetId: ctx.datasetId,
      x: 3, y: currentY, w: 3,
      aggregation: 'count',
      icon: 'ShoppingCart',
      variant: 'primary',
      description: 'Número de vendas realizadas',
      showTrend: true,
    }));
    section1Widgets.push(kpi2);
  }

  if (valueMeasure && countMeasure) {
    const kpi3 = 'kpi-ticket';
    widgets.push(createPremiumKPIWidget({
      id: kpi3,
      title: 'Ticket Médio',
      metric: valueMeasure.name,
      datasetId: ctx.datasetId,
      x: 6, y: currentY, w: 3,
      aggregation: 'avg',
      format: { type: 'currency', currency: 'BRL' },
      icon: 'Receipt',
      variant: 'success',
      description: 'Valor médio por transação',
    }));
    section1Widgets.push(kpi3);
  }

  // Taxa de conversão estimada
  const kpi4 = 'kpi-conversion';
  widgets.push(createPremiumKPIWidget({
    id: kpi4,
    title: 'Taxa de Conversão',
    metric: ctx.measures[0]?.name || '',
    datasetId: ctx.datasetId,
    x: 9, y: currentY, w: 3,
    aggregation: 'count',
    format: { type: 'percentage' },
    icon: 'Percent',
    variant: 'success',
    description: 'Percentual de leads convertidos',
  }));
  section1Widgets.push(kpi4);

  currentY += 1;

  sections.push({
    id: 'section-sales-kpis',
    title: 'Performance de Vendas',
    description: 'Indicadores principais do período',
    widgets: section1Widgets,
  });

  // === SEÇÃO 2: TENDÊNCIA E FUNIL ===
  const section2Widgets: string[] = [];
  const dateCol = ctx.primaryDateColumn || ctx.dateColumns?.[0]?.name;

  if (dateCol && valueMeasure) {
    const trendId = 'trend-revenue';
    widgets.push(createMultiLineChartWidget({
      id: trendId,
      title: 'Evolução de Receita',
      subtitle: 'Receita e volume ao longo do tempo',
      metrics: [valueMeasure.name, countMeasure?.name].filter(Boolean) as string[],
      dateColumn: dateCol,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 8, h: 3,
    }));
    section2Widgets.push(trendId);
  }

  // Funil se tiver status/stage
  const stageColumn = ctx.dimensions.find(d => 
    d.name.toLowerCase().includes('status') ||
    d.name.toLowerCase().includes('stage') ||
    d.name.toLowerCase().includes('etapa')
  );
  
  if (stageColumn) {
    const funnelId = 'funnel-sales';
    widgets.push(createPremiumFunnelWidget({
      id: funnelId,
      title: 'Funil de Vendas',
      subtitle: 'Conversão por etapa',
      dimension: stageColumn.name,
      datasetId: ctx.datasetId,
      x: 8, y: currentY, w: 4, h: 3,
    }));
    section2Widgets.push(funnelId);
  }

  currentY += 3;

  if (section2Widgets.length > 0) {
    sections.push({
      id: 'section-sales-trends',
      title: 'Tendências',
      description: 'Evolução e pipeline',
      widgets: section2Widgets,
    });
  }

  // === SEÇÃO 3: ANÁLISE POR VENDEDOR/ORIGEM ===
  const section3Widgets: string[] = [];

  const sellerColumn = ctx.dimensions.find(d => 
    d.name.toLowerCase().includes('vendedor') ||
    d.name.toLowerCase().includes('seller') ||
    d.name.toLowerCase().includes('origem') ||
    d.name.toLowerCase().includes('canal')
  );

  if (sellerColumn && valueMeasure) {
    const barId = 'bar-seller';
    widgets.push(createPremiumBarChartWidget({
      id: barId,
      title: `Receita por ${sellerColumn.displayName}`,
      subtitle: 'Comparativo de performance',
      metric: valueMeasure.name,
      dimension: sellerColumn.name,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 6, h: 3,
    }));
    section3Widgets.push(barId);
  }

  // Insights
  const insightsId = 'insights-sales';
  widgets.push(createInsightsWidget({
    id: insightsId,
    title: 'Insights de Vendas',
    subtitle: 'Análises e recomendações',
    datasetId: ctx.datasetId,
    x: 6, y: currentY, w: 6, h: 3,
  }));
  section3Widgets.push(insightsId);

  sections.push({
    id: 'section-sales-analysis',
    title: 'Análise Detalhada',
    description: 'Performance por canal e insights',
    widgets: section3Widgets,
  });

  return {
    widgets,
    sections,
    name: 'Dashboard de Vendas',
    description: 'Acompanhamento completo de receita, conversões e performance comercial',
  };
}

/**
 * Template Analytics - Layout Premium
 */
function generateAnalyticsDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
  const sections: DashboardSection[] = [];
  let currentY = 0;

  // === SEÇÃO 1: KPIs ANALÍTICOS ===
  const section1Widgets: string[] = [];

  ctx.measures.slice(0, 4).forEach((measure, i) => {
    const kpiId = `kpi-analytics-${i}`;
    const aggregation = getAggregationForType(measure.dataType);
    widgets.push(createPremiumKPIWidget({
      id: kpiId,
      title: measure.displayName,
      metric: measure.name,
      datasetId: ctx.datasetId,
      x: i * 3, y: currentY, w: 3,
      aggregation,
      format: getFormatForType(measure.dataType),
      icon: getIconForField(measure.name),
      variant: getVariantForField(measure.name, measure.dataType),
      description: generateDescription(measure.name, measure.dataType, aggregation),
      showTrend: true,
    }));
    section1Widgets.push(kpiId);
  });

  currentY += 1;

  sections.push({
    id: 'section-analytics-kpis',
    title: 'Métricas Principais',
    description: 'Indicadores-chave de performance',
    widgets: section1Widgets,
  });

  // === SEÇÃO 2: GRÁFICOS COMPARATIVOS ===
  const section2Widgets: string[] = [];
  const dateCol = ctx.primaryDateColumn || ctx.dateColumns?.[0]?.name;
  
  if (dateCol && ctx.measures.length >= 2) {
    const chartId = 'multi-trend-analytics';
    widgets.push(createMultiLineChartWidget({
      id: chartId,
      title: 'Comparativo de Métricas',
      subtitle: 'Evolução temporal das principais métricas',
      metrics: ctx.measures.slice(0, 4).map(m => m.name),
      dateColumn: dateCol,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 12, h: 3,
    }));
    section2Widgets.push(chartId);
    currentY += 3;
  }

  if (section2Widgets.length > 0) {
    sections.push({
      id: 'section-analytics-trends',
      title: 'Análise Temporal',
      description: 'Comparativo de evolução',
      widgets: section2Widgets,
    });
  }

  // === SEÇÃO 3: ANÁLISE POR DIMENSÃO ===
  const section3Widgets: string[] = [];

  ctx.dimensions.slice(0, 2).forEach((dim, i) => {
    const measure = ctx.measures[0];
    if (measure) {
      const barId = `bar-analytics-${i}`;
      widgets.push(createPremiumBarChartWidget({
        id: barId,
        title: `${measure.displayName} por ${dim.displayName}`,
        subtitle: 'Análise segmentada',
        metric: measure.name,
        dimension: dim.name,
        datasetId: ctx.datasetId,
        x: i * 6, y: currentY, w: 6, h: 3,
      }));
      section3Widgets.push(barId);
    }
  });

  if (section3Widgets.length > 0) {
    currentY += 3;
    sections.push({
      id: 'section-analytics-dimensions',
      title: 'Segmentação',
      description: 'Análise por categorias',
      widgets: section3Widgets,
    });
  }

  // === SEÇÃO 4: INSIGHTS ===
  const insightsId = 'insights-analytics';
  widgets.push(createInsightsWidget({
    id: insightsId,
    title: 'Insights Analíticos',
    subtitle: 'Descobertas automáticas nos dados',
    datasetId: ctx.datasetId,
    x: 0, y: currentY, w: 12, h: 3,
  }));

  sections.push({
    id: 'section-analytics-insights',
    title: 'Inteligência',
    description: 'Insights gerados por IA',
    widgets: [insightsId],
  });

  return {
    widgets,
    sections,
    name: 'Dashboard Analytics',
    description: 'Análise detalhada de métricas e comparativos',
  };
}

/**
 * Template Visão Geral (simples) - Layout Premium
 */
function generateOverviewDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
  const sections: DashboardSection[] = [];
  let currentY = 0;

  // === SEÇÃO 1: KPIs RESUMO ===
  const section1Widgets: string[] = [];

  ctx.measures.slice(0, 4).forEach((measure, i) => {
    const kpiId = `kpi-overview-${i}`;
    const aggregation = getAggregationForType(measure.dataType);
    widgets.push(createPremiumKPIWidget({
      id: kpiId,
      title: measure.displayName,
      metric: measure.name,
      datasetId: ctx.datasetId,
      x: i * 3, y: currentY, w: 3,
      aggregation,
      format: getFormatForType(measure.dataType),
      icon: getIconForField(measure.name),
      variant: getVariantForField(measure.name, measure.dataType),
      description: generateDescription(measure.name, measure.dataType, aggregation),
    }));
    section1Widgets.push(kpiId);
  });

  currentY += 1;

  sections.push({
    id: 'section-overview-kpis',
    title: 'Resumo Executivo',
    description: 'Visão geral dos principais indicadores',
    widgets: section1Widgets,
  });

  // === SEÇÃO 2: DADOS ===
  const tableId = 'table-overview';
  widgets.push(createPremiumTableWidget({
    id: tableId,
    title: 'Dados Completos',
    subtitle: 'Todos os registros do dataset',
    datasetId: ctx.datasetId,
    columns: ctx.schema.columns.slice(0, 8).map(c => c.name),
    x: 0, y: currentY, w: 12, h: 4,
  }));

  sections.push({
    id: 'section-overview-data',
    title: 'Dados',
    description: 'Tabela detalhada',
    widgets: [tableId],
  });

  return {
    widgets,
    sections,
    name: 'Visão Geral',
    description: 'Dashboard simplificado com resumo e dados completos',
  };
}

// ===== WIDGET CREATORS PREMIUM =====

interface PremiumKPIOptions {
  id: string;
  title: string;
  metric: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'distinct';
  format?: { type: 'currency' | 'percentage' | 'number'; currency?: string; decimals?: number };
  icon?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  description?: string;
  showTrend?: boolean;
}

function createPremiumKPIWidget(opts: PremiumKPIOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'kpi',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      metric: opts.metric,
      aggregation: opts.aggregation || 'sum',
      format: opts.format,
      icon: opts.icon || 'BarChart3',
      variant: opts.variant || 'default',
      description: opts.description,
      showTrend: opts.showTrend ?? false,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 3, h: 1 },
  };
}

interface MultiLineChartOptions {
  id: string;
  title: string;
  subtitle?: string;
  metrics: string[];
  dateColumn: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createMultiLineChartWidget(opts: MultiLineChartOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'line',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      metrics: opts.metrics,
      dateColumn: opts.dateColumn,
      subtitle: opts.subtitle,
      showLegend: true,
      showGrid: true,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 6, h: opts.h || 3 },
  };
}

interface PremiumBarChartOptions {
  id: string;
  title: string;
  subtitle?: string;
  metric: string;
  dimension: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createPremiumBarChartWidget(opts: PremiumBarChartOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'bar',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      metric: opts.metric,
      dimension: opts.dimension,
      subtitle: opts.subtitle,
      showValues: true,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 6, h: opts.h || 3 },
  };
}

interface PremiumFunnelOptions {
  id: string;
  title: string;
  subtitle?: string;
  dimension: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createPremiumFunnelWidget(opts: PremiumFunnelOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'funnel',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      dimension: opts.dimension,
      subtitle: opts.subtitle,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 4, h: opts.h || 3 },
  };
}

interface PremiumTableOptions {
  id: string;
  title: string;
  subtitle?: string;
  datasetId: string;
  columns: string[];
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createPremiumTableWidget(opts: PremiumTableOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'table',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      columns: opts.columns,
      subtitle: opts.subtitle,
      limit: 10,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 12, h: opts.h || 3 },
  };
}

interface InsightsOptions {
  id: string;
  title: string;
  subtitle?: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createInsightsWidget(opts: InsightsOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'insights',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      subtitle: opts.subtitle,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 6, h: opts.h || 3 },
  };
}

interface PieChartOptions {
  id: string;
  title: string;
  dimension: string;
  metric?: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createPieChartWidget(opts: PieChartOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'pie',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      dimension: opts.dimension,
      metric: opts.metric,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 4, h: opts.h || 3 },
  };
}

// ===== HELPERS =====

function getAggregationForType(dataType: string): 'sum' | 'avg' | 'count' {
  switch (dataType) {
    case 'currency':
    case 'number':
      return 'sum';
    case 'percent':
      return 'avg';
    case 'integer':
      return 'count';
    default:
      return 'count';
  }
}

function getFormatForType(dataType: string): { type: 'currency' | 'percentage' | 'number'; currency?: string } | undefined {
  switch (dataType) {
    case 'currency':
      return { type: 'currency', currency: 'BRL' };
    case 'percent':
      return { type: 'percentage' };
    case 'number':
    case 'integer':
      return { type: 'number' };
    default:
      return undefined;
  }
}

export { generateAutoDashboard, generateSalesDashboard, generateAnalyticsDashboard, generateOverviewDashboard };
