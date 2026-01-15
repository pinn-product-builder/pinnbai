import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  Clock,
  Award,
  AlertTriangle,
  BarChart3,
  Users,
  Percent,
  ChevronDown,
  ChevronUp,
  Info,
  Inbox,
  Lightbulb
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiGrid } from '@/components/dashboard/KpiCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { useFunnelCurrent, useExecutiveKpis, useLeadsCount } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Definições de KPI para tooltips
const salesKpiDefinitions: Record<string, { 
  definition: string; 
  formula: string; 
  period: string; 
  source: string; 
}> = {
  faturamento: {
    definition: 'Soma de todos os valores de negócios marcados como ganhos',
    formula: 'Soma(valor) onde status = "ganho"',
    period: 'Período selecionado (30 dias)',
    source: 'Em validação (dados ausentes no CRM)',
  },
  negocios_ganhos: {
    definition: 'Quantidade de negócios finalizados com status ganho',
    formula: 'Contagem onde status = "ganho"',
    period: 'Período selecionado (30 dias)',
    source: 'Em validação (dados ausentes no CRM)',
  },
  taxa_ganho: {
    definition: 'Percentual de negócios ganhos sobre o total finalizado',
    formula: '(Ganhos ÷ Total finalizados) × 100',
    period: 'Período selecionado (30 dias)',
    source: 'Em validação (dados ausentes no CRM)',
  },
  ticket_medio: {
    definition: 'Valor médio de cada negócio ganho',
    formula: 'Faturamento ÷ Negócios ganhos',
    period: 'Período selecionado (30 dias)',
    source: 'Em validação (dados ausentes no CRM)',
  },
  tempo_medio: {
    definition: 'Média de dias entre criação do lead e fechamento',
    formula: 'Média(data_fechamento - data_criação)',
    period: 'Período selecionado (30 dias)',
    source: 'Em validação (dados ausentes no CRM)',
  },
};

// Componente de diagnóstico quando não há dados de CRM (collapsible e premium)
function CrmDiagnosticCard() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-amber-100/30 dark:hover:bg-amber-500/10 rounded-t-xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/15">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-text-1 text-sm">Qualidade do CRM</h3>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-text-3" />
            ) : (
              <ChevronDown className="w-4 h-4 text-text-3" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="space-y-3 text-sm text-text-2">
              <p className="font-medium">Para habilitar métricas de Vendas:</p>
              <ul className="space-y-2 text-text-3">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Preencher o campo <span className="font-medium text-text-2">valor</span> nos leads/negócios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Atualizar o <span className="font-medium text-text-2">status</span> (ganho/perdido) ao finalizar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Registrar a <span className="font-medium text-text-2">data de fechamento</span></span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-500/15">
              <p className="text-xs text-text-3 leading-relaxed">
                <span className="font-medium">Nota:</span> Os dados serão exibidos automaticamente quando a integração 
                com o CRM incluir informações de valor e status.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// Componente de KPI placeholder com tooltip explicativo
function PlaceholderKpiCard({ 
  title, 
  icon,
  kpiKey,
}: { 
  title: string; 
  icon: React.ReactNode;
  kpiKey: keyof typeof salesKpiDefinitions;
}) {
  const definition = salesKpiDefinitions[kpiKey];
  
  return (
    <div className="rounded-xl border border-border bg-card p-5 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-text-3">{icon}</span>
          <span className="text-sm font-medium text-text-2">{title}</span>
        </div>
        {definition && (
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button 
                type="button"
                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-full hover:bg-muted/50"
                aria-label="Informações sobre o indicador"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="bottom" 
              align="end"
              className="max-w-xs p-3 space-y-2 z-[9999]"
              sideOffset={4}
            >
              <p className="font-semibold text-xs text-foreground">{title}</p>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-muted-foreground font-medium">Definição: </span>
                  <span className="text-foreground">{definition.definition}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Cálculo: </span>
                  <span className="text-foreground">{definition.formula}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Período: </span>
                  <span className="text-foreground">{definition.period}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Fonte: </span>
                  <span className="text-foreground">{definition.source}</span>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      <div className="flex flex-col items-center justify-center py-2">
        <span className="text-4xl font-bold tracking-tight text-text-3/60">—</span>
        <Badge variant="outline" className="mt-3 text-[10px] px-2 py-0.5 bg-muted/30 border-border text-text-3">
          Em validação
        </Badge>
      </div>
    </div>
  );
}

// Componente de empty state elegante para tabela
function EmptyResultsState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-text-3/60" />
      </div>
      <h4 className="text-sm font-medium text-text-2 mb-1">Sem dados de vendas</h4>
      <p className="text-xs text-text-3 max-w-[240px] leading-relaxed">
        Preencha valor e status no CRM. Os dados aparecerão automaticamente após sincronização.
      </p>
    </div>
  );
}

// Header da seção com indicação de moeda
function SalesIndicatorsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-text-1">Indicadores de Vendas</h2>
      <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-normal text-text-3 border-border">
        Moeda: R$
      </Badge>
    </div>
  );
}

export default function VendasPage() {
  const { filters } = useGlobalFilters();
  const orgId = filters.orgId;
  
  // Usar o funil existente como base para o funil de vendas
  const { data: funnel, isLoading: funnelLoading } = useFunnelCurrent(orgId);
  const { data: kpis, isLoading: kpisLoading } = useExecutiveKpis(orgId);
  const { data: leadsCount } = useLeadsCount();

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Selecione uma organização</h2>
        <p className="text-sm">Use o filtro acima para selecionar uma org e visualizar os dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Vendas"
        description="Acompanhamento de receita e performance comercial"
      />

      {/* Diagnóstico de CRM */}
      <CrmDiagnosticCard />

      {/* KPIs Principais - Placeholders */}
      <section className="space-y-4">
        <SalesIndicatorsHeader />
        <KpiGrid columns={5}>
          <PlaceholderKpiCard
            title="Faturamento Total"
            icon={<DollarSign className="w-5 h-5" />}
            kpiKey="faturamento"
          />
          <PlaceholderKpiCard
            title="Negócios Ganhos"
            icon={<Award className="w-5 h-5" />}
            kpiKey="negocios_ganhos"
          />
          <PlaceholderKpiCard
            title="Taxa de Ganho"
            icon={<Percent className="w-5 h-5" />}
            kpiKey="taxa_ganho"
          />
          <PlaceholderKpiCard
            title="Ticket Médio"
            icon={<TrendingUp className="w-5 h-5" />}
            kpiKey="ticket_medio"
          />
          <PlaceholderKpiCard
            title="Tempo Médio (dias)"
            icon={<Clock className="w-5 h-5" />}
            kpiKey="tempo_medio"
          />
        </KpiGrid>
      </section>

      {/* Funil e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Funil de Vendas"
          subtitle="Distribuição atual por etapa do pipeline"
          chartKey="funil_vendas"
          isLoading={funnelLoading}
          isEmpty={!funnel?.length}
        >
          {funnel && funnel.length > 0 ? (
            <FunnelChart data={funnel} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-text-3">
              <BarChart3 className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm">Dados do funil não disponíveis</p>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Insights de Vendas"
          subtitle="Análise do funil e conversões"
          isLoading={kpisLoading}
          className="h-[320px] overflow-hidden"
        >
          <div className="h-[240px] overflow-y-auto scrollbar-thin pr-2">
            <InsightsPanel 
              insight={null} 
              orgId={orgId} 
              scope="vendas"
              kpis={kpis}
              funnel={funnel?.map(f => ({ stage_name: f.stage_name, leads: f.leads, stage_order: f.stage_order }))}
              totalLeads={leadsCount || 0}
            />
          </div>
        </ChartCard>
      </div>

      {/* Nota informativa - sutil e premium */}
      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] dark:bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-text-2 leading-relaxed">
              <span className="font-medium text-text-1">Dica:</span> Para ativar os relatórios de vendas, 
              configure os campos de valor monetário e status (ganho/perdido) no seu CRM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
