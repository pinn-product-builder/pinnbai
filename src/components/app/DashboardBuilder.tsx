/**
 * Builder de Dashboard com Grid Arrastável e Preview Premium
 */

import React, { useState, useCallback, useMemo } from 'react';
// @ts-ignore - react-grid-layout types are inconsistent
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

import { 
  Plus, Save, Eye, Trash2, Move, Edit3, Sparkles,
  BarChart3, LineChart, PieChart, Table2, ListOrdered, Hash,
  Users, DollarSign, TrendingUp, CalendarCheck, MessageSquare,
  Percent, CheckCircle, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardWidget, WidgetType, DataSet } from '@/types/saas';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart, BarChartHorizontal } from '@/components/dashboard/Charts';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
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

interface DashboardBuilderProps {
  dashboardId: string;
  dashboardName: string;
  initialWidgets: DashboardWidget[];
  dataSets: DataSet[];
  onSave: (widgets: DashboardWidget[]) => void;
  onPreview: () => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; icon: React.ElementType; defaultSize: { w: number; h: number } }[] = [
  { type: 'kpi', label: 'KPI Card', icon: Hash, defaultSize: { w: 3, h: 1 } },
  { type: 'line', label: 'Gráfico de Linha', icon: LineChart, defaultSize: { w: 6, h: 3 } },
  { type: 'bar', label: 'Gráfico de Barras', icon: BarChart3, defaultSize: { w: 6, h: 3 } },
  { type: 'funnel', label: 'Funil', icon: PieChart, defaultSize: { w: 4, h: 3 } },
  { type: 'table', label: 'Tabela', icon: Table2, defaultSize: { w: 6, h: 3 } },
  { type: 'pie', label: 'Pizza', icon: PieChart, defaultSize: { w: 4, h: 3 } },
  { type: 'insights', label: 'Insights IA', icon: Sparkles, defaultSize: { w: 6, h: 3 } },
];

// Icon mapping para config
const ICON_MAP: Record<string, React.ElementType> = {
  Users, DollarSign, TrendingUp, CalendarCheck, MessageSquare,
  Percent, CheckCircle, BarChart3, Hash, Sparkles
};

const PIE_COLORS = ['hsl(var(--pinn-orange-500))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'];

// Mock data generators
const generateMockTrendData = () => {
  const days = ['01/01', '02/01', '03/01', '04/01', '05/01', '06/01', '07/01', '08/01', '09/01', '10/01'];
  return days.map(day => ({
    day,
    leads_new: Math.floor(Math.random() * 100 + 50),
    msg_in: Math.floor(Math.random() * 200 + 100),
    meetings_scheduled: Math.floor(Math.random() * 30 + 5),
    spend: Math.floor(Math.random() * 500 + 100),
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
  { org_id: 'mock', stage_key: 'novo_lead', stage_name: 'Novo Lead', stage_order: 1, stage_group: 'topo', leads: 100 },
  { org_id: 'mock', stage_key: 'qualificado', stage_name: 'Qualificado', stage_order: 2, stage_group: 'meio', leads: 75 },
  { org_id: 'mock', stage_key: 'proposta', stage_name: 'Proposta', stage_order: 3, stage_group: 'meio', leads: 40 },
  { org_id: 'mock', stage_key: 'negociacao', stage_name: 'Negociação', stage_order: 4, stage_group: 'fundo', leads: 25 },
];

const generateMockPieData = () => [
  { name: 'Segmento A', value: 40 },
  { name: 'Segmento B', value: 30 },
  { name: 'Segmento C', value: 20 },
  { name: 'Segmento D', value: 10 },
];

const generateMockTableData = () => [
  { nome: 'Item Alpha', status: 'Ativo', valor: 1250 },
  { nome: 'Item Beta', status: 'Ativo', valor: 890 },
  { nome: 'Item Gamma', status: 'Pendente', valor: 2100 },
  { nome: 'Item Delta', status: 'Ativo', valor: 750 },
  { nome: 'Item Epsilon', status: 'Inativo', valor: 1500 },
];

// Premium Widget Renderers for Preview Mode
function PremiumKPIWidget({ widget }: { widget: DashboardWidget }) {
  const config = widget.config;
  const IconComponent = config.icon ? ICON_MAP[config.icon] : BarChart3;
  
  const value = useMemo(() => {
    if (config.format?.type === 'currency') return Math.floor(Math.random() * 10000 + 1000);
    if (config.format?.type === 'percentage') return Math.random() * 50 + 10;
    return Math.floor(Math.random() * 500 + 50);
  }, [config.format?.type]);

  const formatValue = () => {
    if (config.format?.type === 'currency') {
      return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }
    if (config.format?.type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString('pt-BR');
  };

  const trend = config.showTrend ? {
    value: Math.random() * 30 - 10,
    isPositive: Math.random() > 0.3,
    label: 'vs período anterior'
  } : undefined;

  return (
    <KpiCard
      title={widget.title}
      value={formatValue()}
      icon={IconComponent ? <IconComponent className="w-5 h-5" /> : undefined}
      variant={config.variant || 'default'}
      description={config.description}
      trend={trend}
      isLoading={false}
    />
  );
}

function PremiumLineChartWidget({ widget }: { widget: DashboardWidget }) {
  const config = widget.config;
  const chartData = useMemo(() => generateMockTrendData(), []);

  return (
    <ChartCard
      title={widget.title}
      subtitle={config.subtitle || 'Evolução temporal'}
      isLoading={false}
      isEmpty={false}
    >
      <DailyChart
        data={chartData}
        lines={[
          { key: 'leads_new', name: 'Novos Leads', color: 'primary' },
          { key: 'msg_in', name: 'Mensagens', color: 'success' },
          { key: 'meetings_scheduled', name: 'Reuniões', color: 'warning' },
        ]}
        height={200}
      />
    </ChartCard>
  );
}

function PremiumBarChartWidget({ widget }: { widget: DashboardWidget }) {
  const config = widget.config;
  const chartData = useMemo(() => generateMockBarData(), []);

  return (
    <ChartCard
      title={widget.title}
      subtitle={config.subtitle || 'Comparativo por categoria'}
      isLoading={false}
      isEmpty={false}
    >
      <BarChartHorizontal data={chartData} height={180} />
    </ChartCard>
  );
}

function PremiumFunnelWidget({ widget }: { widget: DashboardWidget }) {
  const config = widget.config;
  const funnelData = useMemo(() => generateMockFunnelData(), []);

  return (
    <ChartCard
      title={widget.title}
      subtitle={config.subtitle || 'Pipeline de conversão'}
      isLoading={false}
      isEmpty={false}
    >
      <FunnelChart data={funnelData} onStageClick={() => {}} />
    </ChartCard>
  );
}

function PremiumPieChartWidget({ widget }: { widget: DashboardWidget }) {
  const config = widget.config;
  const pieData = useMemo(() => generateMockPieData(), []);

  return (
    <ChartCard
      title={widget.title}
      subtitle={config.subtitle || 'Distribuição'}
      isLoading={false}
      isEmpty={false}
    >
      <ResponsiveContainer width="100%" height={180}>
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((_, index) => (
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

function PremiumTableWidget({ widget }: { widget: DashboardWidget }) {
  const config = widget.config;
  const tableData = useMemo(() => generateMockTableData(), []);

  return (
    <ChartCard
      title={widget.title}
      subtitle={config.subtitle || 'Dados detalhados'}
      isLoading={false}
      isEmpty={false}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-text-2">Nome</TableHead>
              <TableHead className="text-text-2">Status</TableHead>
              <TableHead className="text-text-2">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.slice(0, 4).map((row, i) => (
              <TableRow key={i} className="border-border">
                <TableCell className="text-text-1">{row.nome}</TableCell>
                <TableCell className="text-text-1">{row.status}</TableCell>
                <TableCell className="text-text-1">R$ {row.valor.toLocaleString('pt-BR')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}

function PremiumInsightsWidget({ widget }: { widget: DashboardWidget }) {
  const config = widget.config;

  return (
    <ChartCard
      title={widget.title}
      subtitle={config.subtitle || 'Análises baseadas nos dados'}
      isLoading={false}
      isEmpty={false}
    >
      <div className="h-[180px] overflow-y-auto scrollbar-thin pr-2">
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

// Simple Widget Preview for Grid Editor Mode
function GridWidgetPreview({ widget }: { widget: DashboardWidget }) {
  const { type, title, config } = widget;
  const IconComponent = config.icon ? ICON_MAP[config.icon] : WIDGET_TYPES.find(w => w.type === type)?.icon || Hash;

  const renderMiniPreview = () => {
    switch (type) {
      case 'kpi':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-1">
            <IconComponent className="w-6 h-6 text-pinn-orange-500" />
            <span className="text-2xl font-bold text-text-1">
              {config.format?.type === 'currency' ? 'R$ 1.234' : '1.234'}
            </span>
            {config.showTrend && <span className="text-xs text-success">+12.5%</span>}
          </div>
        );
      case 'line':
      case 'area':
        return (
          <div className="h-full flex flex-col justify-center p-3">
            <svg viewBox="0 0 100 30" className="w-full h-16">
              <path 
                d="M0,25 Q15,10 30,15 T60,10 T100,5" 
                fill="none" 
                stroke="hsl(var(--pinn-orange-500))" 
                strokeWidth="2"
              />
              <path 
                d="M0,28 Q25,20 50,22 T100,15" 
                fill="none" 
                stroke="hsl(var(--success))" 
                strokeWidth="1.5"
                opacity="0.7"
              />
            </svg>
          </div>
        );
      case 'bar':
        return (
          <div className="h-full flex items-end justify-around p-3 gap-1">
            {[60, 85, 45, 70, 55].map((h, i) => (
              <div
                key={i}
                className="w-4 rounded-t bg-pinn-orange-500"
                style={{ height: `${h}%`, opacity: 0.6 + i * 0.08 }}
              />
            ))}
          </div>
        );
      case 'funnel':
        return (
          <div className="flex flex-col items-center justify-center gap-1 h-full p-3">
            {[100, 75, 50, 30].map((width, i) => (
              <div
                key={i}
                className="h-4 bg-pinn-orange-500 rounded"
                style={{ width: `${width}%`, opacity: 1 - i * 0.2 }}
              />
            ))}
          </div>
        );
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full border-8 border-pinn-orange-500/40 border-t-pinn-orange-500 border-r-success" />
          </div>
        );
      case 'table':
        return (
          <div className="p-2 text-xs space-y-1">
            <div className="flex gap-2 font-medium text-text-2 border-b border-border pb-1">
              <span className="flex-1">Nome</span>
              <span className="w-12">Status</span>
              <span className="w-14">Valor</span>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-2 text-text-3">
                <span className="flex-1">Item {i}</span>
                <span className="w-12">Ativo</span>
                <span className="w-14">R$ {i * 100}</span>
              </div>
            ))}
          </div>
        );
      case 'insights':
        return (
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pinn-orange-500" />
              <span className="text-xs font-medium text-text-1">Insights IA</span>
            </div>
            <div className="space-y-1">
              {['Resumo executivo', 'Alertas (2)', 'Oportunidades'].map((item, i) => (
                <div key={i} className="text-[10px] text-text-3 flex items-center gap-1">
                  <Info className="w-3 h-3" /> {item}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-1 rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-bg-2/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <IconComponent className="w-4 h-4 text-pinn-orange-500 shrink-0" />
          <span className="text-sm font-medium text-text-1 truncate">{title}</span>
        </div>
        <Move className="w-3 h-3 text-text-3 cursor-move drag-handle shrink-0" />
      </div>
      <div className="flex-1 overflow-hidden">
        {renderMiniPreview()}
      </div>
      {config.description && (
        <div className="px-3 py-1 border-t border-border bg-bg-2/30">
          <span className="text-[10px] text-text-3 line-clamp-1">{config.description}</span>
        </div>
      )}
    </div>
  );
}

// Premium Preview Mode Component
function PremiumPreview({ widgets, dashboardName }: { widgets: DashboardWidget[]; dashboardName: string }) {
  // Group widgets by row (y position)
  const widgetsByRow = useMemo(() => {
    const rows: Record<number, DashboardWidget[]> = {};
    widgets.forEach(widget => {
      const y = widget.layout.y;
      if (!rows[y]) rows[y] = [];
      rows[y].push(widget);
    });
    Object.values(rows).forEach(row => row.sort((a, b) => a.layout.x - b.layout.x));
    return rows;
  }, [widgets]);

  const sortedRows = Object.keys(widgetsByRow).map(Number).sort((a, b) => a - b);

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'kpi':
        return <PremiumKPIWidget key={widget.id} widget={widget} />;
      case 'line':
      case 'area':
        return <PremiumLineChartWidget key={widget.id} widget={widget} />;
      case 'bar':
        return <PremiumBarChartWidget key={widget.id} widget={widget} />;
      case 'funnel':
        return <PremiumFunnelWidget key={widget.id} widget={widget} />;
      case 'pie':
        return <PremiumPieChartWidget key={widget.id} widget={widget} />;
      case 'table':
      case 'list':
        return <PremiumTableWidget key={widget.id} widget={widget} />;
      case 'insights':
        return <PremiumInsightsWidget key={widget.id} widget={widget} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in overflow-auto h-full">
      <PageHeader
        title={dashboardName}
        description="Dashboard gerado automaticamente"
      />

      {sortedRows.map((rowY, rowIndex) => {
        const rowWidgets = widgetsByRow[rowY];
        const isKPIRow = rowWidgets.every(w => w.type === 'kpi');

        if (isKPIRow) {
          return (
            <Section 
              key={`row-${rowY}`} 
              title={rowIndex === 0 ? "Indicadores Principais" : "Métricas"}
            >
              <KpiGrid columns={Math.min(rowWidgets.length, 5) as 2 | 3 | 4 | 5 | 6}>
                {rowWidgets.map(widget => renderWidget(widget))}
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
                  {renderWidget(widget)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function DashboardBuilder({ 
  dashboardId, 
  dashboardName, 
  initialWidgets, 
  dataSets,
  onSave,
  onPreview
}: DashboardBuilderProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(initialWidgets);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');

  const layout: LayoutItem[] = widgets.map((w) => ({
    i: w.id,
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
    minW: 2,
    minH: 1,
  }));

  const handleLayoutChange = useCallback((newLayout: LayoutItem[]) => {
    setWidgets((prev) =>
      prev.map((widget) => {
        const layoutItem = newLayout.find((l) => l.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            layout: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return widget;
      })
    );
  }, []);

  const addWidget = (type: WidgetType) => {
    const config = WIDGET_TYPES.find((t) => t.type === type)!;
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: config.label,
      dataSetId: dataSets[0]?.id || '',
      config: {
        icon: type === 'kpi' ? 'BarChart3' : undefined,
        showTrend: type === 'kpi',
      },
      layout: {
        x: 0,
        y: Infinity,
        w: config.defaultSize.w,
        h: config.defaultSize.h,
      },
    };
    setWidgets([...widgets, newWidget]);
    setViewMode('edit');
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    setSelectedWidget(null);
  };

  const updateWidget = (id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    if (selectedWidget?.id === id) {
      setSelectedWidget({ ...selectedWidget, ...updates });
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - Widget Palette */}
      <div className="w-64 border-r border-border bg-bg-1 p-4 space-y-4 flex flex-col">
        <h3 className="font-semibold text-text-1">Widgets</h3>
        <div className="space-y-2 flex-1 overflow-auto">
          {WIDGET_TYPES.map((item) => (
            <button
              key={item.type}
              onClick={() => addWidget(item.type)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-bg-2 hover:bg-bg-3 border border-border hover:border-pinn-orange-500/50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-pinn-orange-500/10 flex items-center justify-center">
                <item.icon className="w-4 h-4 text-pinn-orange-500" />
              </div>
              <span className="text-sm font-medium text-text-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main - Grid/Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-border bg-bg-1 px-4 flex items-center justify-between">
          <h2 className="font-semibold text-text-1">{dashboardName}</h2>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'edit' | 'preview')}>
              <TabsList className="bg-bg-2">
                <TabsTrigger value="preview" className="data-[state=active]:bg-pinn-orange-500 data-[state=active]:text-bg-0">
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="edit" className="data-[state=active]:bg-pinn-orange-500 data-[state=active]:text-bg-0">
                  <Edit3 className="w-4 h-4 mr-1" />
                  Editar
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button 
              size="sm" 
              onClick={() => onSave(widgets)}
              className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-bg-0">
          {viewMode === 'preview' ? (
            <PremiumPreview widgets={widgets} dashboardName={dashboardName} />
          ) : (
            <div className="h-full p-6 overflow-auto">
              {widgets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Plus className="w-16 h-16 text-text-3 mb-4" />
                  <h3 className="text-lg font-semibold text-text-1 mb-2">Dashboard vazio</h3>
                  <p className="text-text-3 mb-4">Adicione widgets da barra lateral para começar</p>
                </div>
              ) : (
                <div>
                  {React.createElement(GridLayout, {
                    className: "layout",
                    layout: layout,
                    cols: 12,
                    rowHeight: 80,
                    width: 1200,
                    onLayoutChange: handleLayoutChange,
                    draggableHandle: ".drag-handle",
                    compactType: "vertical",
                    preventCollision: false,
                  } as any, widgets.map((widget) => (
                    <div 
                      key={widget.id} 
                      className="group"
                      onClick={() => {
                        setSelectedWidget(widget);
                        setConfigOpen(true);
                      }}
                    >
                      <GridWidgetPreview widget={widget} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWidget(widget.id);
                        }}
                        className="absolute top-1 right-6 p-1 rounded bg-danger/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Config Sheet */}
      <Sheet open={configOpen} onOpenChange={setConfigOpen}>
        <SheetContent className="bg-bg-1 border-border">
          <SheetHeader>
            <SheetTitle className="text-text-1">Configurar Widget</SheetTitle>
          </SheetHeader>
          {selectedWidget && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={selectedWidget.title}
                  onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                  className="bg-bg-2 border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input
                  value={selectedWidget.config.description || ''}
                  onChange={(e) => updateWidget(selectedWidget.id, { 
                    config: { ...selectedWidget.config, description: e.target.value } 
                  })}
                  placeholder="Breve descrição do indicador"
                  className="bg-bg-2 border-border"
                />
              </div>

              {selectedWidget.type === 'kpi' && (
                <>
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Select
                      value={selectedWidget.config.icon || 'BarChart3'}
                      onValueChange={(value) => 
                        updateWidget(selectedWidget.id, { 
                          config: { ...selectedWidget.config, icon: value } 
                        })
                      }
                    >
                      <SelectTrigger className="bg-bg-2 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-bg-1 border-border">
                        <SelectItem value="Users">Usuários</SelectItem>
                        <SelectItem value="DollarSign">Dinheiro</SelectItem>
                        <SelectItem value="TrendingUp">Tendência</SelectItem>
                        <SelectItem value="CalendarCheck">Agenda</SelectItem>
                        <SelectItem value="MessageSquare">Mensagens</SelectItem>
                        <SelectItem value="Percent">Porcentagem</SelectItem>
                        <SelectItem value="CheckCircle">Check</SelectItem>
                        <SelectItem value="BarChart3">Gráfico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Variante de Cor</Label>
                    <Select
                      value={selectedWidget.config.variant || 'default'}
                      onValueChange={(value: any) => 
                        updateWidget(selectedWidget.id, { 
                          config: { ...selectedWidget.config, variant: value } 
                        })
                      }
                    >
                      <SelectTrigger className="bg-bg-2 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-bg-1 border-border">
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="primary">Primário (Laranja)</SelectItem>
                        <SelectItem value="success">Sucesso (Verde)</SelectItem>
                        <SelectItem value="warning">Alerta (Amarelo)</SelectItem>
                        <SelectItem value="destructive">Crítico (Vermelho)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar tendência</Label>
                    <input
                      type="checkbox"
                      checked={selectedWidget.config.showTrend || false}
                      onChange={(e) => 
                        updateWidget(selectedWidget.id, { 
                          config: { ...selectedWidget.config, showTrend: e.target.checked } 
                        })
                      }
                      className="w-4 h-4"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Formato</Label>
                <Select
                  value={selectedWidget.config.format?.type || 'number'}
                  onValueChange={(value: any) => 
                    updateWidget(selectedWidget.id, { 
                      config: { 
                        ...selectedWidget.config, 
                        format: { type: value, currency: value === 'currency' ? 'BRL' : undefined } 
                      } 
                    })
                  }
                >
                  <SelectTrigger className="bg-bg-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-1 border-border">
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="currency">Moeda (R$)</SelectItem>
                    <SelectItem value="percentage">Porcentagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    removeWidget(selectedWidget.id);
                    setConfigOpen(false);
                  }}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remover Widget
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
