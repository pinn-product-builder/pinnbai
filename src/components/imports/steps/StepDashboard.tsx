/**
 * Step 5: Geração de Dashboard com Preview Visual
 */

import React, { useMemo, useState } from 'react';
import { 
  Sparkles, LayoutDashboard, BarChart3, LineChart, 
  PieChart, TrendingUp, Gauge, Check, Table2, 
  GripVertical, Trash2, Settings2, ChevronDown, ChevronUp,
  AreaChart
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ImportWizardData } from '../ImportWizard';
import { generateDashboardFromSchema } from '@/lib/dashboardGenerator';
import { DashboardWidget, WidgetType } from '@/types/saas';

interface StepDashboardProps {
  wizardData: ImportWizardData;
  onDataChange: (updates: Partial<ImportWizardData>) => void;
}

const DASHBOARD_TEMPLATES = [
  {
    id: 'auto',
    name: 'Automático',
    description: 'IA analisa os dados e sugere a melhor visualização',
    icon: Sparkles,
    color: 'pinn-orange-500',
  },
  {
    id: 'sales',
    name: 'Vendas',
    description: 'KPIs de receita, tendências e funil de vendas',
    icon: TrendingUp,
    color: 'success',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Métricas de performance e análises comparativas',
    icon: BarChart3,
    color: 'info',
  },
  {
    id: 'overview',
    name: 'Visão Geral',
    description: 'Dashboard simples com KPIs e tabela de dados',
    icon: LayoutDashboard,
    color: 'warning',
  },
];

const WIDGET_ICONS: Record<WidgetType, React.ElementType> = {
  kpi: Gauge,
  line: LineChart,
  bar: BarChart3,
  area: AreaChart,
  pie: PieChart,
  funnel: TrendingUp,
  table: Table2,
  list: Table2,
  heatmap: LayoutDashboard,
};

const WIDGET_LABELS: Record<WidgetType, string> = {
  kpi: 'KPI',
  line: 'Linha',
  bar: 'Barras',
  area: 'Área',
  pie: 'Pizza',
  funnel: 'Funil',
  table: 'Tabela',
  list: 'Lista',
  heatmap: 'Heatmap',
};

export function StepDashboard({ wizardData, onDataChange }: StepDashboardProps) {
  const [previewWidgets, setPreviewWidgets] = useState<DashboardWidget[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingWidget, setEditingWidget] = useState<string | null>(null);

  // Gerar preview quando template muda
  const generatedPreview = useMemo(() => {
    if (!wizardData.generateDashboard || !wizardData.schema) return null;
    
    const result = generateDashboardFromSchema({
      schema: wizardData.schema,
      datasetId: 'preview',
      template: (wizardData.dashboardTemplate as 'auto' | 'sales' | 'analytics' | 'overview') || 'auto',
      primaryDateColumn: wizardData.primaryDateColumn,
    });
    
    return result;
  }, [wizardData.generateDashboard, wizardData.schema, wizardData.dashboardTemplate, wizardData.primaryDateColumn]);

  // Usar widgets editados ou gerados
  const displayWidgets = previewWidgets || generatedPreview?.widgets || [];

  const handleRemoveWidget = (widgetId: string) => {
    const updated = displayWidgets.filter(w => w.id !== widgetId);
    setPreviewWidgets(updated);
  };

  const handleUpdateWidgetTitle = (widgetId: string, newTitle: string) => {
    const updated = displayWidgets.map(w => 
      w.id === widgetId ? { ...w, title: newTitle } : w
    );
    setPreviewWidgets(updated);
  };

  const handleResetPreview = () => {
    setPreviewWidgets(null);
  };

  // Agrupar widgets por linha (y)
  const widgetsByRow = useMemo(() => {
    const rows: Record<number, DashboardWidget[]> = {};
    displayWidgets.forEach(widget => {
      const y = widget.layout.y;
      if (!rows[y]) rows[y] = [];
      rows[y].push(widget);
    });
    // Ordenar widgets por x dentro de cada linha
    Object.values(rows).forEach(row => row.sort((a, b) => a.layout.x - b.layout.x));
    return rows;
  }, [displayWidgets]);

  const sortedRows = Object.keys(widgetsByRow)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-1 mb-1">
          Gerar Dashboard
        </h3>
        <p className="text-sm text-text-3">
          Crie um dashboard automaticamente a partir dos seus dados
        </p>
      </div>

      {/* Toggle Generate Dashboard */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-bg-2 border border-border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pinn-gradient flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-bg-0" />
          </div>
          <div>
            <p className="font-medium text-text-1">Gerar dashboard automaticamente</p>
            <p className="text-sm text-text-3">
              A IA criará visualizações baseadas no seu esquema
            </p>
          </div>
        </div>
        <Switch
          checked={wizardData.generateDashboard}
          onCheckedChange={(v) => {
            onDataChange({ generateDashboard: v });
            setPreviewWidgets(null);
          }}
          className="data-[state=checked]:bg-pinn-orange-500"
        />
      </div>

      {/* Template Selection */}
      {wizardData.generateDashboard && (
        <div className="space-y-4">
          <Label className="text-text-2">Escolha um template</Label>
          
          <RadioGroup
            value={wizardData.dashboardTemplate || 'auto'}
            onValueChange={(v) => {
              onDataChange({ dashboardTemplate: v });
              setPreviewWidgets(null); // Reset para regenerar
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {DASHBOARD_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = wizardData.dashboardTemplate === template.id;
              
              return (
                <div key={template.id} className="relative">
                  <RadioGroupItem
                    value={template.id}
                    id={template.id}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={template.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected 
                        ? "border-pinn-orange-500 bg-pinn-orange-500/10" 
                        : "border-border bg-bg-2 hover:border-text-3"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      isSelected ? "bg-pinn-gradient text-bg-0" : "bg-bg-3 text-text-2"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-1">{template.name}</p>
                      <p className="text-sm text-text-3">{template.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-bg-0" />
                      </div>
                    )}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}

      {/* Preview Section */}
      {wizardData.generateDashboard && generatedPreview && (
        <Collapsible open={showPreview} onOpenChange={setShowPreview}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between border-border bg-bg-2 hover:bg-bg-3"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-pinn-orange-500" />
                Preview do Dashboard ({displayWidgets.length} widgets)
              </span>
              {showPreview ? (
                <ChevronUp className="w-4 h-4 text-text-3" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-3" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="rounded-xl border border-border bg-bg-2 overflow-hidden">
              {/* Preview Header */}
              <div className="flex items-center justify-between p-3 border-b border-border bg-bg-3">
                <p className="text-sm font-medium text-text-1">
                  {generatedPreview.name}
                </p>
                {previewWidgets && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetPreview}
                    className="text-text-3 hover:text-text-1"
                  >
                    Resetar alterações
                  </Button>
                )}
              </div>
              
              {/* Preview Grid */}
              <ScrollArea className="h-[320px] p-4">
                <div className="space-y-3">
                  {sortedRows.map((rowY) => (
                    <div key={rowY} className="flex gap-3">
                      {widgetsByRow[rowY].map((widget) => {
                        const Icon = WIDGET_ICONS[widget.type] || LayoutDashboard;
                        const isEditing = editingWidget === widget.id;
                        const widthPercent = (widget.layout.w / 12) * 100;
                        
                        return (
                          <div
                            key={widget.id}
                            style={{ width: `${widthPercent}%` }}
                            className={cn(
                              "rounded-lg border bg-bg-1 p-3 transition-all group relative",
                              widget.type === 'kpi' ? "min-h-[60px]" : "min-h-[100px]",
                              isEditing ? "border-pinn-orange-500" : "border-border hover:border-text-3"
                            )}
                          >
                            {/* Widget Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Icon className="w-4 h-4 text-pinn-orange-500 shrink-0" />
                                {isEditing ? (
                                  <Input
                                    value={widget.title}
                                    onChange={(e) => handleUpdateWidgetTitle(widget.id, e.target.value)}
                                    onBlur={() => setEditingWidget(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingWidget(null)}
                                    autoFocus
                                    className="h-6 text-xs bg-bg-2 border-border px-2"
                                  />
                                ) : (
                                  <span className="text-xs font-medium text-text-1 truncate">
                                    {widget.title}
                                  </span>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingWidget(widget.id)}
                                  className="p-1 rounded hover:bg-bg-3 text-text-3 hover:text-text-1"
                                >
                                  <Settings2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveWidget(widget.id)}
                                  className="p-1 rounded hover:bg-danger/20 text-text-3 hover:text-danger"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Widget Type Badge */}
                            <div className="mt-2">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-3 text-text-3">
                                {WIDGET_LABELS[widget.type]}
                              </span>
                              {widget.config.metric && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-3 text-text-3 ml-1">
                                  {widget.config.metric}
                                </span>
                              )}
                              {widget.config.dimension && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/20 text-info ml-1">
                                  {widget.config.dimension}
                                </span>
                              )}
                            </div>
                            
                            {/* Visual placeholder */}
                            {widget.type !== 'kpi' && (
                              <div className="mt-2 flex items-end gap-1 h-8">
                                {widget.type === 'bar' && (
                                  <>
                                    <div className="w-3 bg-pinn-orange-500/30 rounded-t" style={{ height: '60%' }} />
                                    <div className="w-3 bg-pinn-orange-500/50 rounded-t" style={{ height: '100%' }} />
                                    <div className="w-3 bg-pinn-orange-500/40 rounded-t" style={{ height: '80%' }} />
                                    <div className="w-3 bg-pinn-orange-500/60 rounded-t" style={{ height: '90%' }} />
                                  </>
                                )}
                                {(widget.type === 'line' || widget.type === 'area') && (
                                  <svg viewBox="0 0 60 20" className="w-full h-full">
                                    <path 
                                      d="M0,15 Q15,5 30,10 T60,5" 
                                      fill="none" 
                                      stroke="hsl(var(--pinn-orange-500))" 
                                      strokeWidth="1.5"
                                      opacity="0.6"
                                    />
                                  </svg>
                                )}
                                {widget.type === 'pie' && (
                                  <div className="w-8 h-8 rounded-full border-4 border-pinn-orange-500/40 border-t-pinn-orange-500" />
                                )}
                                {widget.type === 'funnel' && (
                                  <div className="flex flex-col gap-0.5 w-full">
                                    <div className="h-1.5 bg-pinn-orange-500/60 rounded w-full" />
                                    <div className="h-1.5 bg-pinn-orange-500/50 rounded w-4/5 mx-auto" />
                                    <div className="h-1.5 bg-pinn-orange-500/40 rounded w-3/5 mx-auto" />
                                  </div>
                                )}
                                {widget.type === 'table' && (
                                  <div className="flex flex-col gap-0.5 w-full">
                                    <div className="h-1 bg-text-3/30 rounded w-full" />
                                    <div className="h-1 bg-text-3/20 rounded w-full" />
                                    <div className="h-1 bg-text-3/20 rounded w-full" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Preview Footer */}
              <div className="p-3 border-t border-border bg-bg-3 flex items-center justify-between">
                <p className="text-xs text-text-3">
                  {previewWidgets 
                    ? `${displayWidgets.length} widgets (editado)`
                    : `${displayWidgets.length} widgets serão criados`
                  }
                </p>
                <p className="text-xs text-text-3">
                  Clique no ícone ⚙️ para editar títulos
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Summary Stats */}
      {wizardData.generateDashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Gauge, label: 'KPIs', count: displayWidgets.filter(w => w.type === 'kpi').length, color: 'text-pinn-orange-500' },
            { icon: LineChart, label: 'Tendência', count: displayWidgets.filter(w => ['line', 'area'].includes(w.type)).length, color: 'text-info' },
            { icon: BarChart3, label: 'Comparativos', count: displayWidgets.filter(w => w.type === 'bar').length, color: 'text-success' },
            { icon: PieChart, label: 'Outros', count: displayWidgets.filter(w => !['kpi', 'line', 'area', 'bar'].includes(w.type)).length, color: 'text-warning' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-2 border border-border">
                <Icon className={cn("w-5 h-5", item.color)} />
                <div>
                  <p className="text-lg font-bold text-text-1">{item.count}</p>
                  <p className="text-xs text-text-3">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Skip message */}
      {!wizardData.generateDashboard && (
        <div className="p-8 rounded-xl border-2 border-dashed border-border text-center">
          <LayoutDashboard className="w-12 h-12 text-text-3 mx-auto mb-3" />
          <p className="text-text-2 font-medium">Dashboard não será gerado</p>
          <p className="text-sm text-text-3 mt-1">
            Você poderá criar dashboards manualmente depois
          </p>
        </div>
      )}

      {/* Final Summary */}
      <div className="p-4 rounded-xl bg-success/10 border border-success/20">
        <p className="text-sm text-text-1">
          <span className="font-medium">Pronto para finalizar!</span> Clique em "Finalizar" para 
          criar o dataset <strong>"{wizardData.datasetName}"</strong>
          {wizardData.generateDashboard && ` e gerar o dashboard com ${displayWidgets.length} visualizações`}.
        </p>
      </div>
    </div>
  );
}

export default StepDashboard;
