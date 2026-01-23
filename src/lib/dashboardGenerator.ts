/**
 * Gerador Automático de Dashboard
 * Cria widgets baseados no esquema de dados importado
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

  const widgets: DashboardWidget[] = [];
  let currentY = 0;

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
 * Geração automática inteligente
 */
function generateAutoDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
  let currentY = 0;

  // 1. KPIs para as principais métricas (até 4)
  const topMeasures = ctx.measures.slice(0, 4);
  const kpiWidth = Math.floor(12 / Math.max(topMeasures.length, 1));

  topMeasures.forEach((measure, index) => {
    widgets.push(createKPIWidget({
      id: `kpi-${index}`,
      title: measure.displayName,
      metric: measure.name,
      datasetId: ctx.datasetId,
      x: index * kpiWidth,
      y: currentY,
      w: kpiWidth,
      aggregation: getAggregationForType(measure.dataType),
      format: getFormatForType(measure.dataType),
    }));
  });

  if (topMeasures.length > 0) currentY += 1;

  // 2. Gráfico de tendência se tiver coluna de data
  const dateCol = ctx.primaryDateColumn || ctx.dateColumns?.[0]?.name;
  const mainMeasure = ctx.measures[0];
  
  if (dateCol && mainMeasure) {
    widgets.push(createLineChartWidget({
      id: 'trend-1',
      title: `${mainMeasure.displayName} ao longo do tempo`,
      metric: mainMeasure.name,
      dateColumn: dateCol,
      datasetId: ctx.datasetId,
      x: 0,
      y: currentY,
      w: 8,
      h: 2,
    }));

    // Gráfico de pizza para distribuição se tiver categorias
    if (ctx.categories && ctx.categories.length > 0) {
      const category = ctx.categories[0];
      widgets.push(createPieChartWidget({
        id: 'pie-1',
        title: `Distribuição por ${category.displayName}`,
        dimension: category.name,
        metric: mainMeasure?.name,
        datasetId: ctx.datasetId,
        x: 8,
        y: currentY,
        w: 4,
        h: 2,
      }));
    }

    currentY += 2;
  }

  // 3. Gráfico de barras por dimensão
  const mainDimension = ctx.dimensions.find(d => d.dataType === 'category') || ctx.dimensions[0];
  if (mainDimension && mainMeasure) {
    widgets.push(createBarChartWidget({
      id: 'bar-1',
      title: `${mainMeasure.displayName} por ${mainDimension.displayName}`,
      metric: mainMeasure.name,
      dimension: mainDimension.name,
      datasetId: ctx.datasetId,
      x: 0,
      y: currentY,
      w: 6,
      h: 2,
    }));
    
    // Segunda dimensão se existir
    const secondDimension = ctx.dimensions.find(d => d.name !== mainDimension.name);
    if (secondDimension) {
      widgets.push(createBarChartWidget({
        id: 'bar-2',
        title: `${mainMeasure.displayName} por ${secondDimension.displayName}`,
        metric: mainMeasure.name,
        dimension: secondDimension.name,
        datasetId: ctx.datasetId,
        x: 6,
        y: currentY,
        w: 6,
        h: 2,
      }));
    }

    currentY += 2;
  }

  // 4. Tabela de dados
  widgets.push(createTableWidget({
    id: 'table-1',
    title: 'Dados Detalhados',
    datasetId: ctx.datasetId,
    columns: ctx.schema.columns.slice(0, 6).map(c => c.name),
    x: 0,
    y: currentY,
    w: 12,
    h: 2,
  }));

  return {
    widgets,
    name: 'Dashboard Automático',
    description: `Dashboard gerado automaticamente com ${widgets.length} visualizações`,
  };
}

/**
 * Template de Vendas
 */
function generateSalesDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
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

  // KPIs
  if (valueMeasure) {
    widgets.push(createKPIWidget({
      id: 'kpi-revenue',
      title: valueMeasure.displayName,
      metric: valueMeasure.name,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 4,
      aggregation: 'sum',
      format: { type: 'currency', currency: 'BRL' },
    }));
  }

  if (countMeasure) {
    widgets.push(createKPIWidget({
      id: 'kpi-count',
      title: countMeasure.displayName,
      metric: countMeasure.name,
      datasetId: ctx.datasetId,
      x: 4, y: currentY, w: 4,
      aggregation: 'count',
    }));
  }

  // Ticket médio calculado
  if (valueMeasure && countMeasure) {
    widgets.push(createKPIWidget({
      id: 'kpi-avg',
      title: 'Ticket Médio',
      metric: valueMeasure.name,
      datasetId: ctx.datasetId,
      x: 8, y: currentY, w: 4,
      aggregation: 'avg',
      format: { type: 'currency', currency: 'BRL' },
    }));
  }

  currentY += 1;

  // Tendência de vendas
  const dateCol = ctx.primaryDateColumn || ctx.dateColumns?.[0]?.name;
  if (dateCol && valueMeasure) {
    widgets.push(createAreaChartWidget({
      id: 'trend-revenue',
      title: 'Evolução de Receita',
      metric: valueMeasure.name,
      dateColumn: dateCol,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 8, h: 2,
    }));
  }

  // Funil se tiver status/stage
  const stageColumn = ctx.dimensions.find(d => 
    d.name.toLowerCase().includes('status') ||
    d.name.toLowerCase().includes('stage') ||
    d.name.toLowerCase().includes('etapa')
  );
  
  if (stageColumn) {
    widgets.push(createFunnelWidget({
      id: 'funnel-1',
      title: 'Funil de Vendas',
      dimension: stageColumn.name,
      datasetId: ctx.datasetId,
      x: 8, y: currentY, w: 4, h: 2,
    }));
  }

  currentY += 2;

  // Vendas por vendedor/origem
  const sellerColumn = ctx.dimensions.find(d => 
    d.name.toLowerCase().includes('vendedor') ||
    d.name.toLowerCase().includes('seller') ||
    d.name.toLowerCase().includes('origem')
  );

  if (sellerColumn && valueMeasure) {
    widgets.push(createBarChartWidget({
      id: 'bar-seller',
      title: `Receita por ${sellerColumn.displayName}`,
      metric: valueMeasure.name,
      dimension: sellerColumn.name,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 12, h: 2,
    }));
    currentY += 2;
  }

  return {
    widgets,
    name: 'Dashboard de Vendas',
    description: 'Acompanhamento de receita, conversões e performance comercial',
  };
}

/**
 * Template Analytics
 */
function generateAnalyticsDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
  let currentY = 0;

  // KPIs para todas as métricas numéricas
  ctx.measures.slice(0, 4).forEach((measure, i) => {
    widgets.push(createKPIWidget({
      id: `kpi-${i}`,
      title: measure.displayName,
      metric: measure.name,
      datasetId: ctx.datasetId,
      x: i * 3, y: currentY, w: 3,
      aggregation: getAggregationForType(measure.dataType),
      format: getFormatForType(measure.dataType),
    }));
  });

  currentY += 1;

  // Múltiplos gráficos de linha para comparação
  const dateCol = ctx.primaryDateColumn || ctx.dateColumns?.[0]?.name;
  
  if (dateCol && ctx.measures.length >= 2) {
    widgets.push(createLineChartWidget({
      id: 'multi-trend',
      title: 'Comparativo de Métricas',
      metric: ctx.measures[0].name,
      dateColumn: dateCol,
      datasetId: ctx.datasetId,
      x: 0, y: currentY, w: 12, h: 2,
    }));
    currentY += 2;
  }

  // Gráficos de barra por cada dimensão
  ctx.dimensions.slice(0, 2).forEach((dim, i) => {
    const measure = ctx.measures[0];
    if (measure) {
      widgets.push(createBarChartWidget({
        id: `bar-${i}`,
        title: `${measure.displayName} por ${dim.displayName}`,
        metric: measure.name,
        dimension: dim.name,
        datasetId: ctx.datasetId,
        x: i * 6, y: currentY, w: 6, h: 2,
      }));
    }
  });

  return {
    widgets,
    name: 'Dashboard Analytics',
    description: 'Análise detalhada de métricas e comparativos',
  };
}

/**
 * Template Visão Geral (simples)
 */
function generateOverviewDashboard(ctx: GeneratorContext): GeneratedDashboard {
  const widgets: DashboardWidget[] = [];
  let currentY = 0;

  // Apenas 2 KPIs principais
  ctx.measures.slice(0, 2).forEach((measure, i) => {
    widgets.push(createKPIWidget({
      id: `kpi-${i}`,
      title: measure.displayName,
      metric: measure.name,
      datasetId: ctx.datasetId,
      x: i * 6, y: currentY, w: 6,
      aggregation: getAggregationForType(measure.dataType),
      format: getFormatForType(measure.dataType),
    }));
  });

  currentY += 1;

  // Tabela principal
  widgets.push(createTableWidget({
    id: 'table-main',
    title: 'Dados',
    datasetId: ctx.datasetId,
    columns: ctx.schema.columns.slice(0, 8).map(c => c.name),
    x: 0, y: currentY, w: 12, h: 3,
  }));

  return {
    widgets,
    name: 'Visão Geral',
    description: 'Dashboard simplificado com KPIs e tabela de dados',
  };
}

// ===== WIDGET CREATORS =====

interface KPIWidgetOptions {
  id: string;
  title: string;
  metric: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  aggregation?: 'sum' | 'avg' | 'count' | 'distinct';
  format?: { type: 'currency' | 'percentage' | 'number'; currency?: string; decimals?: number };
}

function createKPIWidget(opts: KPIWidgetOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'kpi',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      metric: opts.metric,
      aggregation: opts.aggregation || 'sum',
      format: opts.format,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 3, h: 1 },
  };
}

interface LineChartOptions {
  id: string;
  title: string;
  metric: string;
  dateColumn: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createLineChartWidget(opts: LineChartOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'line',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      metric: opts.metric,
      dateColumn: opts.dateColumn,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 6, h: opts.h || 2 },
  };
}

function createAreaChartWidget(opts: LineChartOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'area',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      metric: opts.metric,
      dateColumn: opts.dateColumn,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 6, h: opts.h || 2 },
  };
}

interface BarChartOptions {
  id: string;
  title: string;
  metric: string;
  dimension: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createBarChartWidget(opts: BarChartOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'bar',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      metric: opts.metric,
      dimension: opts.dimension,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 6, h: opts.h || 2 },
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
    layout: { x: opts.x, y: opts.y, w: opts.w || 4, h: opts.h || 2 },
  };
}

interface FunnelOptions {
  id: string;
  title: string;
  dimension: string;
  datasetId: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createFunnelWidget(opts: FunnelOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'funnel',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      dimension: opts.dimension,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 4, h: opts.h || 2 },
  };
}

interface TableOptions {
  id: string;
  title: string;
  datasetId: string;
  columns: string[];
  x: number;
  y: number;
  w?: number;
  h?: number;
}

function createTableWidget(opts: TableOptions): DashboardWidget {
  return {
    id: opts.id,
    type: 'table',
    title: opts.title,
    dataSetId: opts.datasetId,
    config: {
      limit: 10,
    },
    layout: { x: opts.x, y: opts.y, w: opts.w || 12, h: opts.h || 2 },
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
