/**
 * DynamicDashboardView - Renderizador Premium de Dashboards Gerados
 * Exibe dashboards dinâmicos com o mesmo nível visual do ExecutivePage
 */

import React, { useMemo } from 'react';
import { 
  Users, User, UserCheck, GraduationCap,
  MessageSquare, MessageCircle, Mail,
  CalendarCheck, Calendar, CalendarX,
  DollarSign, TrendingUp, TrendingDown, Receipt,
  Percent, Hash, Activity, GitBranch, CheckCircle,
  BarChart3, ShoppingCart, Sparkles, Target
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart, BarChartHorizontal } from '@/components/dashboard/Charts';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { DashboardWidget, WidgetConfig } from '@/types/saas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
  Users, User, UserCheck, GraduationCap,
  MessageSquare, MessageCircle, Mail,
  CalendarCheck, Calendar, CalendarX,
  DollarSign, TrendingUp, TrendingDown, Receipt,
  Percent, Hash, Activity, GitBranch, CheckCircle,
  BarChart3, ShoppingCart, Sparkles, Target
};

interface DashboardSection {
  id: string;
  title: string;
  description?: string;
  widgets: string[];
}

interface DynamicDashboardViewProps {
  widgets: DashboardWidget[];
  sections?: DashboardSection[];
  dashboardName?: string;
  dashboardDescription?: string;
  isLoading?: boolean;
  // Optional real data for widgets
  widgetData?: Record<string, any>;
}

// Mock data generators for preview
const generateMockKPIValue = (config: WidgetConfig) => {
  if (config.format?.type === 'currency') {
    return Math.floor(Math.random() * 10000);
  }
  if (config.format?.type === 'percentage') {
    return Math.random() * 100;
  }
  return Math.floor(Math.random() * 1000);
};

const generateMockTrendData = () => {
  const days = ['01/01', '02/01', '03/01', '04/01', '05/01', '06/01', '07/01', '08/01', '09/01', '10/01'];
  return days.map(day => ({
    day,
    value1: Math.floor(Math.random() * 100 + 50),
    value2: Math.floor(Math.random() * 80 + 20),
    value3: Math.floor(Math.random() * 60 + 10),
    value4: Math.floor(Math.random() * 40 + 5),
  }));
};

const generateMockBarData = () => [
  { name: 'Categoria A', value: Math.floor(Math.random() * 100 + 50) },
  { name: 'Categoria B', value: Math.floor(Math.random() * 80 + 30) },
  { name: 'Categoria C', value: Math.floor(Math.random() * 60 + 20) },
  { name: 'Categoria D', value: Math.floor(Math.random() * 40 + 10) },
  { name: 'Categoria E', value: Math.floor(Math.random() * 30 + 5) },
];

const generateMockFunnelData = () => [
  { stage_name: 'Novo Lead', leads: 100, stage_order: 1 },
  { stage_name: 'Qualificado', leads: 75, stage_order: 2 },
  { stage_name: 'Proposta', leads: 40, stage_order: 3 },
  { stage_name: 'Negociação', leads: 25, stage_order: 4 },
  { stage_name: 'Fechado', leads: 15, stage_order: 5 },
];

const generateMockPieData = () => [
  { name: 'Segmento A', value: 40 },
  { name: 'Segmento B', value: 30 },
  { name: 'Segmento C', value: 20 },
  { name: 'Segmento D', value: 10 },
];

const generateMockTableData = () => [
  { id: 1, nome: 'Item Alpha', status: 'Ativo', valor: 1250, data: '2024-01-15' },
  { id: 2, nome: 'Item Beta', status: 'Ativo', valor: 890, data: '2024-01-14' },
  { id: 3, nome: 'Item Gamma', status: 'Pendente', valor: 2100, data: '2024-01-13' },
  { id: 4, nome: 'Item Delta', status: 'Ativo', valor: 750, data: '2024-01-12' },
  { id: 5, nome: 'Item Epsilon', status: 'Inativo', valor: 1500, data: '2024-01-11' },
];

const PIE_COLORS = ['hsl(var(--pinn-orange-500))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'];

// Widget Renderers
function renderKPIWidget(widget: DashboardWidget, data?: any) {
  const config = widget.config;
  const IconComponent = config.icon ? ICON_MAP[config.icon] : BarChart3;
  const value = data?.value ?? generateMockKPIValue(config);
  
  const formatValue = () => {
    if (config.format?.type === 'currency') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (config.format?.type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString('pt-BR');
  };

  const trend = data?.trend ?? {
    value: Math.random() * 20 - 10,
    isPositive: Math.random() > 0.3,
    label: 'vs período anterior'
  };

  return (
    <KpiCard
      key={widget.id}
      title={widget.title}
      value={formatValue()}
      icon={IconComponent ? <IconComponent className="w-5 h-5" /> : undefined}
      variant={config.variant || 'default'}
      description={config.description}
      trend={config.showTrend ? trend : undefined}
      isLoading={false}
    />
  );
}

function renderLineChartWidget(widget: DashboardWidget, data?: any) {
  const config = widget.config;
  const chartData = data || generateMockTrendData();
  
  const lines = config.metrics?.map((metric, i) => ({
    key: `value${i + 1}`,
    name: metric,
    color: ['primary', 'success', 'warning', 'destructive'][i % 4] as 'primary' | 'success' | 'warning' | 'destructive'
  })) || [
    { key: 'value1', name: 'Métrica Principal', color: 'primary' as const }
  ];

  return (
    <ChartCard
      key={widget.id}
      title={widget.title}
      subtitle={config.subtitle}
      isLoading={false}
      isEmpty={!chartData?.length}
    >
      <DailyChart
        data={chartData}
        lines={lines}
        height={240}
      />
    </ChartCard>
  );
}

function renderBarChartWidget(widget: DashboardWidget, data?: any) {
  const config = widget.config;
  const chartData = data || generateMockBarData();

  return (
    <ChartCard
      key={widget.id}
      title={widget.title}
      subtitle={config.subtitle}
      isLoading={false}
      isEmpty={!chartData?.length}
    >
      <BarChartHorizontal
        data={chartData}
        height={200}
      />
    </ChartCard>
  );
}

function renderFunnelWidget(widget: DashboardWidget, data?: any) {
  const config = widget.config;
  const funnelData = data || generateMockFunnelData();

  return (
    <ChartCard
      key={widget.id}
      title={widget.title}
      subtitle={config.subtitle}
      isLoading={false}
      isEmpty={!funnelData?.length}
    >
      <FunnelChart
        data={funnelData}
        onStageClick={() => {}}
      />
    </ChartCard>
  );
}

function renderPieChartWidget(widget: DashboardWidget, data?: any) {
  const config = widget.config;
  const pieData = data || generateMockPieData();

  return (
    <ChartCard
      key={widget.id}
      title={widget.title}
      subtitle={config.subtitle}
      isLoading={false}
      isEmpty={!pieData?.length}
    >
      <ResponsiveContainer width="100%" height={200}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((_: any, index: number) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--bg-1))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function renderTableWidget(widget: DashboardWidget, data?: any) {
  const config = widget.config;
  const tableData = data || generateMockTableData();
  const columns = config.columns || Object.keys(tableData[0] || {});

  return (
    <ChartCard
      key={widget.id}
      title={widget.title}
      subtitle={config.subtitle}
      isLoading={false}
      isEmpty={!tableData?.length}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              {columns.slice(0, 5).map((col) => (
                <TableHead key={col} className="text-text-2 font-medium">
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.slice(0, config.limit || 5).map((row: any, i: number) => (
              <TableRow key={i} className="border-border">
                {columns.slice(0, 5).map((col) => (
                  <TableCell key={col} className="text-text-1">
                    {typeof row[col] === 'number' && col.toLowerCase().includes('valor')
                      ? `R$ ${row[col].toLocaleString('pt-BR')}`
                      : row[col]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}

function renderInsightsWidget(widget: DashboardWidget, _data?: any) {
  const config = widget.config;

  return (
    <ChartCard
      key={widget.id}
      title={widget.title}
      subtitle={config.subtitle}
      isLoading={false}
      className="h-full"
    >
      <div className="h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-muted/20 pr-2">
        <InsightsPanel 
          insight={null} 
          orgId="" 
          scope="executive"
          kpis={{}}
          funnel={[]}
          totalLeads={0}
        />
      </div>
    </ChartCard>
  );
}

function renderWidget(widget: DashboardWidget, data?: any) {
  switch (widget.type) {
    case 'kpi':
      return renderKPIWidget(widget, data);
    case 'line':
    case 'area':
      return renderLineChartWidget(widget, data);
    case 'bar':
      return renderBarChartWidget(widget, data);
    case 'funnel':
      return renderFunnelWidget(widget, data);
    case 'pie':
      return renderPieChartWidget(widget, data);
    case 'table':
    case 'list':
      return renderTableWidget(widget, data);
    case 'insights':
      return renderInsightsWidget(widget, data);
    default:
      return null;
  }
}

export function DynamicDashboardView({
  widgets,
  sections,
  dashboardName = 'Dashboard',
  dashboardDescription,
  isLoading,
  widgetData = {}
}: DynamicDashboardViewProps) {
  // Group widgets by row (y position)
  const widgetsByRow = useMemo(() => {
    const rows: Record<number, DashboardWidget[]> = {};
    widgets.forEach(widget => {
      const y = widget.layout.y;
      if (!rows[y]) rows[y] = [];
      rows[y].push(widget);
    });
    // Sort widgets by x within each row
    Object.values(rows).forEach(row => row.sort((a, b) => a.layout.x - b.layout.x));
    return rows;
  }, [widgets]);

  const sortedRows = Object.keys(widgetsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  // If sections are provided, render by section
  if (sections && sections.length > 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title={dashboardName}
          description={dashboardDescription}
        />

        {sections.map((section) => {
          const sectionWidgets = widgets.filter(w => section.widgets.includes(w.id));
          
          // Group KPIs separately
          const kpiWidgets = sectionWidgets.filter(w => w.type === 'kpi');
          const otherWidgets = sectionWidgets.filter(w => w.type !== 'kpi');

          return (
            <Section 
              key={section.id} 
              title={section.title} 
              description={section.description}
            >
              {/* KPIs in grid */}
              {kpiWidgets.length > 0 && (
                <KpiGrid columns={Math.min(kpiWidgets.length, 5) as 2 | 3 | 4 | 5 | 6}>
                  {kpiWidgets.map(widget => renderWidget(widget, widgetData[widget.id]))}
                </KpiGrid>
              )}

              {/* Other widgets in responsive grid */}
              {otherWidgets.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {otherWidgets.map(widget => {
                    const isFullWidth = widget.layout.w >= 10;
                    return (
                      <div 
                        key={widget.id} 
                        className={isFullWidth ? 'lg:col-span-2' : ''}
                      >
                        {renderWidget(widget, widgetData[widget.id])}
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          );
        })}
      </div>
    );
  }

  // Fallback: render by row position
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={dashboardName}
        description={dashboardDescription}
      />

      {sortedRows.map((rowY, rowIndex) => {
        const rowWidgets = widgetsByRow[rowY];
        const isKPIRow = rowWidgets.every(w => w.type === 'kpi');

        if (isKPIRow) {
          return (
            <Section key={`row-${rowY}`} title={rowIndex === 0 ? "Indicadores Principais" : "Métricas"}>
              <KpiGrid columns={Math.min(rowWidgets.length, 5) as 2 | 3 | 4 | 5 | 6}>
                {rowWidgets.map(widget => renderWidget(widget, widgetData[widget.id]))}
              </KpiGrid>
            </Section>
          );
        }

        return (
          <div key={`row-${rowY}`} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rowWidgets.map(widget => {
              const isFullWidth = widget.layout.w >= 10;
              return (
                <div 
                  key={widget.id} 
                  className={isFullWidth ? 'lg:col-span-2' : ''}
                >
                  {renderWidget(widget, widgetData[widget.id])}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default DynamicDashboardView;
