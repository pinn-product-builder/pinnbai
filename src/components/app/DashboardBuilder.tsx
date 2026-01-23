/**
 * Builder de Dashboard com Grid Arrastável
 */

import React, { useState, useCallback } from 'react';
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
  Plus, Save, Eye, Settings, Trash2, Move,
  BarChart3, LineChart, PieChart, Table2, ListOrdered, Hash
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
  SheetTrigger,
} from '@/components/ui/sheet';
import { DashboardWidget, WidgetType, DataSet } from '@/types/saas';

interface DashboardBuilderProps {
  dashboardId: string;
  dashboardName: string;
  initialWidgets: DashboardWidget[];
  dataSets: DataSet[];
  onSave: (widgets: DashboardWidget[]) => void;
  onPreview: () => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; icon: React.ElementType; defaultSize: { w: number; h: number } }[] = [
  { type: 'kpi', label: 'KPI Card', icon: Hash, defaultSize: { w: 3, h: 2 } },
  { type: 'line', label: 'Gráfico de Linha', icon: LineChart, defaultSize: { w: 6, h: 4 } },
  { type: 'bar', label: 'Gráfico de Barras', icon: BarChart3, defaultSize: { w: 6, h: 4 } },
  { type: 'funnel', label: 'Funil', icon: PieChart, defaultSize: { w: 4, h: 5 } },
  { type: 'table', label: 'Tabela', icon: Table2, defaultSize: { w: 6, h: 4 } },
  { type: 'list', label: 'Lista', icon: ListOrdered, defaultSize: { w: 4, h: 4 } },
  { type: 'insights', label: 'Insights IA', icon: Hash, defaultSize: { w: 6, h: 4 } },
];

// Mock data for widgets
const generateMockKPIValue = () => Math.floor(Math.random() * 10000);
const generateMockChartData = () => [
  { name: 'Jan', value: Math.floor(Math.random() * 100) },
  { name: 'Fev', value: Math.floor(Math.random() * 100) },
  { name: 'Mar', value: Math.floor(Math.random() * 100) },
  { name: 'Abr', value: Math.floor(Math.random() * 100) },
  { name: 'Mai', value: Math.floor(Math.random() * 100) },
  { name: 'Jun', value: Math.floor(Math.random() * 100) },
];

function WidgetPreview({ widget }: { widget: DashboardWidget }) {
  const { type, title } = widget;

  const renderContent = () => {
    switch (type) {
      case 'kpi':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-3xl font-bold text-text-1">{generateMockKPIValue().toLocaleString('pt-BR')}</span>
            <span className="text-sm text-success mt-1">+12.5%</span>
          </div>
        );
      case 'line':
      case 'bar':
        const data = generateMockChartData();
        return (
          <div className="h-full flex items-end justify-around p-4 pt-0">
            {data.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    "w-8 rounded-t transition-all",
                    type === 'bar' ? "bg-pinn-orange-500" : "bg-pinn-orange-500/50"
                  )}
                  style={{ height: `${item.value}%`, minHeight: 4 }}
                />
                <span className="text-[10px] text-text-3">{item.name}</span>
              </div>
            ))}
          </div>
        );
      case 'funnel':
        return (
          <div className="flex flex-col items-center justify-center gap-1 h-full p-4">
            {[100, 75, 50, 25].map((width, i) => (
              <div
                key={i}
                className="h-6 bg-pinn-orange-500 rounded"
                style={{ width: `${width}%`, opacity: 1 - i * 0.2 }}
              />
            ))}
          </div>
        );
      case 'table':
        return (
          <div className="p-2 text-xs overflow-hidden">
            <div className="grid grid-cols-3 gap-2 font-medium text-text-2 border-b border-border pb-1 mb-1">
              <span>Nome</span>
              <span>Status</span>
              <span>Valor</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-3 gap-2 text-text-3 py-1">
                <span>Item {i}</span>
                <span>Ativo</span>
                <span>R$ {(Math.random() * 1000).toFixed(0)}</span>
              </div>
            ))}
          </div>
        );
      case 'list':
        return (
          <div className="p-2 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-pinn-orange-500" />
                <span className="text-text-2">Item da lista {i}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-1 rounded-xl border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-bg-2/50">
        <span className="text-sm font-medium text-text-1 truncate">{title}</span>
        <Move className="w-3 h-3 text-text-3 cursor-move drag-handle" />
      </div>
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
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

  const layout: LayoutItem[] = widgets.map((w) => ({
    i: w.id,
    x: w.layout.x,
    y: w.layout.y,
    w: w.layout.w,
    h: w.layout.h,
    minW: 2,
    minH: 2,
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
      config: {},
      layout: {
        x: 0,
        y: Infinity,
        w: config.defaultSize.w,
        h: config.defaultSize.h,
      },
    };
    setWidgets([...widgets, newWidget]);
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
      <div className="w-64 border-r border-border bg-bg-1 p-4 space-y-4">
        <h3 className="font-semibold text-text-1">Widgets</h3>
        <div className="space-y-2">
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

      {/* Main - Grid Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-border bg-bg-1 px-4 flex items-center justify-between">
          <h2 className="font-semibold text-text-1">{dashboardName}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
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

        {/* Grid */}
        <div className="flex-1 p-6 overflow-auto bg-bg-0">
          {widgets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Plus className="w-16 h-16 text-text-3 mb-4" />
              <h3 className="text-lg font-semibold text-text-1 mb-2">Dashboard vazio</h3>
              <p className="text-text-3 mb-4">Arraste widgets da barra lateral para começar</p>
            </div>
          ) : (
            <div>
              {React.createElement(GridLayout, {
                className: "layout",
                layout: layout,
                cols: 12,
                rowHeight: 60,
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
                  <WidgetPreview widget={widget} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWidget(widget.id);
                    }}
                    className="absolute top-1 right-1 p-1 rounded bg-danger/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )))}
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
                <Label>Data Set</Label>
                <Select
                  value={selectedWidget.dataSetId}
                  onValueChange={(value) => updateWidget(selectedWidget.id, { dataSetId: value })}
                >
                  <SelectTrigger className="bg-bg-2 border-border">
                    <SelectValue placeholder="Selecione um Data Set" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-1 border-border">
                    {dataSets.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Métrica</Label>
                <Select
                  value={selectedWidget.config.metric || ''}
                  onValueChange={(value) => 
                    updateWidget(selectedWidget.id, { 
                      config: { ...selectedWidget.config, metric: value } 
                    })
                  }
                >
                  <SelectTrigger className="bg-bg-2 border-border">
                    <SelectValue placeholder="Selecione uma métrica" />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-1 border-border">
                    <SelectItem value="total_leads">Total de Leads</SelectItem>
                    <SelectItem value="total_meetings">Total de Reuniões</SelectItem>
                    <SelectItem value="conversion_rate">Taxa de Conversão</SelectItem>
                    <SelectItem value="revenue">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Agregação</Label>
                <Select
                  value={selectedWidget.config.aggregation || 'sum'}
                  onValueChange={(value: any) => 
                    updateWidget(selectedWidget.id, { 
                      config: { ...selectedWidget.config, aggregation: value } 
                    })
                  }
                >
                  <SelectTrigger className="bg-bg-2 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-bg-1 border-border">
                    <SelectItem value="sum">Soma</SelectItem>
                    <SelectItem value="avg">Média</SelectItem>
                    <SelectItem value="count">Contagem</SelectItem>
                    <SelectItem value="distinct">Distintos</SelectItem>
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
