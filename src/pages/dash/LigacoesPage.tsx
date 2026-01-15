import React, { useMemo } from 'react';
import { Phone, Target, Clock, PhoneCall, Timer, DollarSign, Percent, TrendingUp, Calendar, PhoneOff } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart, AccumulatedChart, StackedTrendChart } from '@/components/dashboard/Charts';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import {
  useCallsKpis,
  useCallsDaily,
  useCallsLast50,
  useCallsEndedReasons,
  useCallsEndedReasonsTrend,
  useInsights,
} from '@/hooks/useDashboardData';

import type { CallEvent } from '@/types/dashboard';

// Taxa de câmbio USD → BRL (pode ser atualizada conforme necessário)
const USD_TO_BRL = 5.80;

// Interface para dados diários de ligações
interface DailyCallData {
  day: string;
  calls_done: number;
  calls_answered: number;
  total_minutes: number;
  avg_minutes: number;
  total_spent_usd: number;
}

// Mapeamento de motivos de finalização para português
const endedReasonLabels: Record<string, string> = {
  'customer-ended-call': 'Cliente encerrou',
  'voicemail': 'Correio de voz',
  'silence-timed-out': 'Timeout por silêncio',
  'exceeded-max-duration': 'Excedeu duração máx.',
  'assistant-ended-call': 'Assistente encerrou',
  'call.in-progress.error.assistant-did-not-respond': 'Assistente não respondeu',
  'pipeline-error-openai-llm-failed': 'Erro OpenAI',
  'dial-no-answer': 'Não atendeu',
  'dial-busy': 'Ocupado',
  'unknown': 'Desconhecido',
};

// Cores para cada motivo
const reasonColors: Record<string, string> = {
  'customer-ended-call': 'from-emerald-500 to-emerald-600',
  'voicemail': 'from-amber-500 to-amber-600',
  'silence-timed-out': 'from-orange-500 to-orange-600',
  'exceeded-max-duration': 'from-red-400 to-red-500',
  'assistant-ended-call': 'from-blue-500 to-blue-600',
  'call.in-progress.error.assistant-did-not-respond': 'from-rose-500 to-rose-600',
  'pipeline-error-openai-llm-failed': 'from-red-600 to-red-700',
  'dial-no-answer': 'from-gray-500 to-gray-600',
  'dial-busy': 'from-yellow-500 to-yellow-600',
  'unknown': 'from-slate-400 to-slate-500',
};

const indexColors = [
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-orange-500 to-orange-600',
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-pink-500 to-pink-600',
  'from-cyan-500 to-cyan-600',
  'from-lime-500 to-lime-600',
];

function CallsTable({ calls, isLoading }: { calls: CallEvent[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/10">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (!calls.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Phone className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhuma ligação registrada</p>
      </div>
    );
  }

  const getEventBadge = (eventType: string) => {
    const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'call_started': { label: 'Iniciada', variant: 'default' },
      'call_ended': { label: 'Finalizada', variant: 'secondary' },
      'call_failed': { label: 'Falhou', variant: 'destructive' },
      'voicemail': { label: 'Correio de voz', variant: 'outline' },
    };
    const { label, variant } = typeMap[eventType.toLowerCase()] || { label: eventType, variant: 'outline' as const };
    return <Badge variant={variant} className="text-xs">{label}</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Data/Hora</th>
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Tipo</th>
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Ator</th>
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Lead</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call, index) => (
            <tr 
              key={index} 
              className="border-b border-border/10 hover:bg-muted/5 transition-colors"
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {format(parseISO(call.event_ts), "dd/MM HH:mm", { locale: ptBR })}
                </div>
              </td>
              <td className="py-3 px-2">
                {getEventBadge(call.event_type)}
              </td>
              <td className="py-3 px-2 text-sm text-muted-foreground">
                {call.actor || '-'}
              </td>
              <td className="py-3 px-2 text-sm font-mono text-xs text-muted-foreground">
                {call.lead_id || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Tabela de dados diários
function DailyCallsTable({ data, isLoading }: { data: DailyCallData[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/10">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Calendar className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhum dado diário disponível</p>
      </div>
    );
  }

  // Ordenar por data decrescente (mais recente primeiro)
  const sortedData = [...data].sort((a, b) => b.day.localeCompare(a.day));

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Data</th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Realizadas</th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Atendidas</th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Tempo (min)</th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Média (min)</th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Custo (BRL)</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const taxaAtend = row.calls_done > 0 ? ((row.calls_answered / row.calls_done) * 100).toFixed(1) : '0.0';
            return (
              <tr 
                key={index} 
                className="border-b border-border/10 hover:bg-muted/5 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {format(parseISO(row.day), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm font-medium">{row.calls_done.toLocaleString('pt-BR')}</span>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium text-success">{row.calls_answered.toLocaleString('pt-BR')}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {taxaAtend}%
                    </Badge>
                  </div>
                </td>
                <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                  {row.total_minutes.toFixed(1)}
                </td>
                <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                  {row.avg_minutes.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-sm font-medium text-primary">
                    {(row.total_spent_usd * USD_TO_BRL).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Componente de funil de motivos de finalização
interface EndedReasonData {
  reason: string;
  count: number;
}

function EndedReasonsFunnel({ data, isLoading }: { data: EndedReasonData[]; isLoading?: boolean }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 flex-1" style={{ maxWidth: `${100 - i * 12}%` }} />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <PhoneOff className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhum dado de motivos disponível</p>
      </div>
    );
  }

  const getReasonLabel = (reason: string): string => {
    return endedReasonLabels[reason] || reason.replace(/-/g, ' ').replace(/\./g, ' ');
  };

  const getReasonColor = (reason: string, index: number): string => {
    return reasonColors[reason] || indexColors[index % indexColors.length];
  };

  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const percentage = (item.count / maxCount) * 100;
        const percentOfTotal = ((item.count / total) * 100).toFixed(1);
        const gradientClass = getReasonColor(item.reason, index);
        const displayName = getReasonLabel(item.reason);

        return (
          <Tooltip key={item.reason}>
            <TooltipTrigger asChild>
              <div className="w-full group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <div 
                      className={cn(
                        "h-9 rounded-lg bg-gradient-to-r transition-all duration-300",
                        "group-hover:shadow-lg group-hover:scale-[1.01]",
                        gradientClass
                      )}
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-medium text-white truncate drop-shadow-sm">
                          {displayName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 text-right flex items-center justify-end gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {item.count.toLocaleString('pt-BR')}
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {percentOfTotal}%
                    </Badge>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {percentOfTotal}% do total de finalizações
                </p>
                <p className="text-sm font-bold text-primary">
                  {item.count.toLocaleString('pt-BR')} ligações
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

// Helper para formatar trend
function makeTrend(value: number | undefined, periodLabel: string) {
  if (value === undefined || isNaN(value)) return undefined;
  return {
    value: Math.abs(value),
    isPositive: value >= 0,
    label: periodLabel,
  };
}

export default function VapiPage() {
  const { filters } = useGlobalFilters();
  const orgId = filters.orgId;
  const period = filters.period === 'custom' ? '30d' : filters.period;

  const { data: kpis, isLoading: kpisLoading } = useCallsKpis(orgId, period);
  const { data: daily, isLoading: dailyLoading } = useCallsDaily(orgId);
  const { data: calls, isLoading: callsLoading } = useCallsLast50(orgId);
  const { data: endedReasons, isLoading: endedReasonsLoading } = useCallsEndedReasons(orgId, period);
  const { data: endedReasonsTrend, isLoading: endedReasonsTrendLoading } = useCallsEndedReasonsTrend(orgId, period);
  const { data: insights, isLoading: insightsLoading } = useInsights(orgId, 'vapi');

  // Preparar KPIs para insights de ligações
  const callsKpisForInsights = kpis ? {
    calls_done: kpis.calls_done,
    calls_answered: kpis.calls_answered,
    taxa_atendimento: kpis.taxa_atendimento,
    total_minutes: kpis.total_minutes,
    avg_minutes: kpis.avg_minutes,
    total_spent_usd: kpis.total_spent,
    changes: kpis.changes,
  } : null;

  // Calcular dados de custo acumulado
  const accumulatedCostData = useMemo(() => {
    if (!daily?.length) return [];
    
    let accumulated = 0;
    return daily.map(d => {
      accumulated += d.total_spent_usd;
      return {
        day: d.day,
        daily: d.total_spent_usd,
        accumulated,
      };
    });
  }, [daily]);

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Selecione uma organização</h2>
        <p className="text-sm">Use o filtro acima para selecionar uma org e visualizar os dados</p>
      </div>
    );
  }

  const periodLabel = kpis?.periodLabel || `vs ${period} anteriores`;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Ligações"
        description="Monitoramento de chamadas telefônicas e eventos de voz"
      />

      {/* KPIs */}
      <Section title="Indicadores de Ligações">
        <KpiGrid columns={4}>
          <KpiCard
            title="Ligações Realizadas"
            value={kpis?.calls_done || 0}
            kpiKey="calls_done"
            icon={<PhoneCall className="w-5 h-5" />}
            variant="primary"
            isLoading={kpisLoading}
            trend={makeTrend(kpis?.changes?.calls_done, periodLabel)}
            description="Total de ligações realizadas no período selecionado"
          />
          <KpiCard
            title="Ligações Atendidas"
            value={kpis?.calls_answered || 0}
            kpiKey="calls_answered"
            icon={<Phone className="w-5 h-5" />}
            variant="success"
            isLoading={kpisLoading}
            trend={makeTrend(kpis?.changes?.calls_answered, periodLabel)}
            description="Total de ligações que foram atendidas"
          />
          <KpiCard
            title="Taxa de Atendimento"
            value={kpis?.taxa_atendimento || 0}
            format="percent"
            kpiKey="taxa_atendimento"
            icon={<Percent className="w-5 h-5" />}
            variant="primary"
            isLoading={kpisLoading}
            trend={makeTrend(kpis?.changes?.taxa_atendimento, periodLabel)}
            description="Percentual de ligações atendidas sobre realizadas"
          />
          <KpiCard
            title="Tempo Médio (min)"
            value={Number((kpis?.avg_minutes || 0).toFixed(2))}
            format="number"
            kpiKey="avg_minutes"
            icon={<Timer className="w-5 h-5" />}
            variant="warning"
            isLoading={kpisLoading}
            trend={makeTrend(kpis?.changes?.avg_minutes, periodLabel)}
            description="Duração média das ligações atendidas em minutos"
          />
        </KpiGrid>
        
        <div className="mt-4">
          <KpiGrid columns={3}>
            <KpiCard
              title="Tempo Total (min)"
              value={Number((kpis?.total_minutes || 0).toFixed(1))}
              format="number"
              kpiKey="total_minutes"
              icon={<Clock className="w-5 h-5" />}
              variant="default"
              isLoading={kpisLoading}
              trend={makeTrend(kpis?.changes?.total_minutes, periodLabel)}
              description="Somatório do tempo de todas as ligações atendidas"
            />
            <KpiCard
              title="Custo Total"
              value={(kpis?.total_spent || 0) * USD_TO_BRL}
              format="currency"
              kpiKey="total_spent"
              icon={<DollarSign className="w-5 h-5" />}
              variant="primary"
              isLoading={kpisLoading}
              trend={makeTrend(kpis?.changes?.total_spent, periodLabel)}
              description="Custo total das ligações convertido para BRL (taxa: R$ 5,80/USD)"
            />
            <KpiCard
              title="Custo por Ligação"
              value={(kpis?.cost_per_call || 0) * USD_TO_BRL}
              format="currency"
              kpiKey="cost_per_call"
              icon={<TrendingUp className="w-5 h-5" />}
              variant="success"
              isLoading={kpisLoading}
              trend={makeTrend(kpis?.changes?.cost_per_call, periodLabel)}
              description="Custo médio por ligação realizada (BRL)"
            />
          </KpiGrid>
        </div>
      </Section>

      {/* Chart */}
      <ChartCard
        title="Ligações Diárias"
        subtitle="Volume de ligações por dia (realizadas vs atendidas) e custo"
        chartKey="ligacoes_diarias"
        isLoading={dailyLoading}
        isEmpty={!daily?.length}
      >
        <DailyChart
          data={(daily || []).map(d => ({
            day: d.day,
            calls_done: d.calls_done,
            calls_answered: d.calls_answered,
            total_minutes: d.total_minutes,
          }))}
          lines={[
            { key: 'calls_done', name: 'Realizadas', color: 'primary' },
            { key: 'calls_answered', name: 'Atendidas', color: 'success' },
            { key: 'total_minutes', name: 'Minutos', color: 'warning' },
          ]}
          height={280}
        />
      </ChartCard>

      {/* Accumulated Cost Chart */}
      <ChartCard
        title="Custo Acumulado"
        subtitle="Evolução do custo total ao longo do tempo"
        chartKey="custo_acumulado"
        isLoading={dailyLoading}
        isEmpty={!accumulatedCostData?.length}
      >
        <AccumulatedChart
          data={accumulatedCostData}
          height={280}
          valuePrefix="$"
        />
      </ChartCard>

      {/* Tendência de Motivos de Finalização */}
      <ChartCard
        title="Tendência de Motivos de Finalização"
        subtitle="Evolução dos motivos de encerramento ao longo do tempo"
        chartKey="tendencia_motivos"
        isLoading={endedReasonsTrendLoading}
        isEmpty={!endedReasonsTrend?.data?.length}
      >
        <StackedTrendChart
          data={endedReasonsTrend?.data || []}
          keys={endedReasonsTrend?.topReasons || []}
          labels={endedReasonLabels}
          height={300}
        />
      </ChartCard>

      {/* Daily Data Table */}
      <ChartCard
        title="Dados Diários de Ligações"
        subtitle="Detalhamento por dia com quantidade, tempo e custo"
        chartKey="tabela_ligacoes_diarias"
        isLoading={dailyLoading}
        isEmpty={!daily?.length}
      >
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <DailyCallsTable data={daily || []} />
        </div>
      </ChartCard>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Motivos de Finalização - Funil */}
        <ChartCard
          title="Motivos de Finalização"
          subtitle="Por que as ligações foram encerradas"
          chartKey="motivos_finalizacao"
          isLoading={endedReasonsLoading}
          isEmpty={!endedReasons?.length}
        >
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <EndedReasonsFunnel data={endedReasons || []} />
          </div>
        </ChartCard>

        <ChartCard
          title="Últimas 50 Ligações"
          subtitle="Eventos de chamada mais recentes"
          isLoading={callsLoading}
          isEmpty={!calls?.length}
        >
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <CallsTable calls={calls || []} />
          </div>
        </ChartCard>

        <ChartCard
          title="Insights de Ligações"
          subtitle="Análise de performance do agente de voz"
          isLoading={insightsLoading || kpisLoading}
          className="h-[420px] overflow-hidden"
        >
          <div className="h-[320px] overflow-y-auto scrollbar-thin pr-2">
            <InsightsPanel 
              insight={insights || null} 
              orgId={orgId} 
              scope="vapi"
              kpis={callsKpisForInsights as any}
            />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
