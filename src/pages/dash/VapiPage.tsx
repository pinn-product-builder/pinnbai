import React, { useMemo } from 'react';
import { Phone, Target, Clock, PhoneCall, Timer, DollarSign, Percent, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart, AccumulatedChart } from '@/components/dashboard/Charts';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import {
  useCallsKpis,
  useCallsDaily,
  useCallsLast50,
  useInsights,
} from '@/hooks/useDashboardData';
import type { CallEvent } from '@/types/dashboard';

// Interface para dados diários de ligações
interface DailyCallData {
  day: string;
  calls_done: number;
  calls_answered: number;
  total_minutes: number;
  avg_minutes: number;
  total_spent_usd: number;
}

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
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Custo (USD)</th>
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
                    ${row.total_spent_usd.toFixed(2)}
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
  const { data: insights, isLoading: insightsLoading } = useInsights(orgId, 'vapi');

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
        title="VAPI - Ligações"
        description="Monitoramento de chamadas e eventos de voz"
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
              title="Custo Total (USD)"
              value={kpis?.total_spent || 0}
              format="currency"
              kpiKey="total_spent"
              icon={<DollarSign className="w-5 h-5" />}
              variant="primary"
              isLoading={kpisLoading}
              trend={makeTrend(kpis?.changes?.total_spent, periodLabel)}
              description="Custo total das ligações em dólares"
            />
            <KpiCard
              title="Custo por Ligação"
              value={kpis?.cost_per_call || 0}
              format="currency"
              kpiKey="cost_per_call"
              icon={<TrendingUp className="w-5 h-5" />}
              variant="success"
              isLoading={kpisLoading}
              trend={makeTrend(kpis?.changes?.cost_per_call, periodLabel)}
              description="Custo médio por ligação realizada (USD)"
            />
          </KpiGrid>
        </div>
      </Section>

      {/* Chart */}
      <ChartCard
        title="Ligações Diárias"
        subtitle="Volume de ligações por dia (realizadas vs atendidas) e custo"
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
        isLoading={dailyLoading}
        isEmpty={!accumulatedCostData?.length}
      >
        <AccumulatedChart
          data={accumulatedCostData}
          height={280}
          valuePrefix="$"
        />
      </ChartCard>

      {/* Daily Data Table */}
      <ChartCard
        title="Dados Diários de Ligações"
        subtitle="Detalhamento por dia com quantidade, tempo e custo"
        isLoading={dailyLoading}
        isEmpty={!daily?.length}
      >
        <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <DailyCallsTable data={daily || []} />
        </div>
      </ChartCard>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Últimas 50 Ligações"
          subtitle="Eventos de chamada mais recentes"
          isLoading={callsLoading}
          isEmpty={!calls?.length}
        >
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <CallsTable calls={calls || []} />
          </div>
        </ChartCard>

        <ChartCard
          title="Insights IA"
          subtitle="Análises automáticas de VAPI"
          isLoading={insightsLoading}
        >
          <InsightsPanel insight={insights || null} orgId={orgId} scope="vapi" />
        </ChartCard>
      </div>
    </div>
  );
}
