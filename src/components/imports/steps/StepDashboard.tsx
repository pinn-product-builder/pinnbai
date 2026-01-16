/**
 * Step 5: Geração de Dashboard
 */

import React from 'react';
import { 
  Sparkles, LayoutDashboard, BarChart3, LineChart, 
  PieChart, TrendingUp, Gauge, Check
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ImportWizardData } from '../ImportWizard';

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

export function StepDashboard({ wizardData, onDataChange }: StepDashboardProps) {
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
          onCheckedChange={(v) => onDataChange({ generateDashboard: v })}
          className="data-[state=checked]:bg-pinn-orange-500"
        />
      </div>

      {/* Template Selection */}
      {wizardData.generateDashboard && (
        <div className="space-y-4">
          <Label className="text-text-2">Escolha um template</Label>
          
          <RadioGroup
            value={wizardData.dashboardTemplate || 'auto'}
            onValueChange={(v) => onDataChange({ dashboardTemplate: v })}
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

      {/* Preview of what will be generated */}
      {wizardData.generateDashboard && (
        <div className="p-4 rounded-xl bg-bg-2 border border-border">
          <p className="text-sm font-medium text-text-1 mb-3">
            O que será criado
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Gauge, label: 'KPIs', count: wizardData.schema?.columns.filter(c => c.isMeasure).length || 0 },
              { icon: LineChart, label: 'Tendência', count: wizardData.primaryDateColumn ? 1 : 0 },
              { icon: BarChart3, label: 'Comparativos', count: Math.min(2, (wizardData.schema?.columns.filter(c => c.isDimension).length || 0)) },
              { icon: PieChart, label: 'Distribuição', count: wizardData.schema?.columns.filter(c => c.dataType === 'category').length ? 1 : 0 },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-bg-3">
                  <Icon className="w-4 h-4 text-pinn-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-text-1">{item.count}</p>
                    <p className="text-xs text-text-3">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
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
          {wizardData.generateDashboard && ' e gerar o dashboard automaticamente'}.
        </p>
      </div>
    </div>
  );
}

export default StepDashboard;
