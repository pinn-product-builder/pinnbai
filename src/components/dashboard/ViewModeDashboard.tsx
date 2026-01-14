import React, { useEffect, useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  CalendarCheck, 
  DollarSign, 
  Phone, 
  PhoneCall,
  TrendingUp,
  Target,
  Timer,
  Percent,
  RefreshCw,
  Sparkles,
  X,
  Monitor
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { KpiCard, KpiGrid } from './KpiCard';
import { DailyChart } from './Charts';
import { FunnelChart } from './FunnelChart';
import { ChartCard, Section } from './ChartCard';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { Button } from '@/components/ui/button';
import { useSidebarContext } from './DashboardLayout';
import {
  useExecutiveKpis,
  useExecutiveDaily,
  useFunnelCurrent,
  useCallsKpis,
  useCallsDaily,
  useTrafegoKpis,
  useTrafegoDaily,
} from '@/hooks/useDashboardData';

interface ViewModeDashboardProps {
  refreshInterval?: number; // em segundos
}

export function ViewModeDashboard({ refreshInterval = 60 }: ViewModeDashboardProps) {
  const { filters } = useGlobalFilters();
  const { setViewMode } = useSidebarContext();
  const orgId = filters.orgId;
  const period = filters.period === 'custom' ? '30d' : filters.period;
  
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [nextRefreshIn, setNextRefreshIn] = useState(refreshInterval);

  // Hooks de dados
  const { data: execKpis, isLoading: execLoading, refetch: refetchExec } = useExecutiveKpis(orgId, period);
  const { data: execDaily, refetch: refetchExecDaily } = useExecutiveDaily(orgId);
  const { data: funnel, refetch: refetchFunnel } = useFunnelCurrent(orgId);
  const { data: callsKpis, isLoading: callsLoading, refetch: refetchCalls } = useCallsKpis(orgId, period);
  const { data: callsDaily, refetch: refetchCallsDaily } = useCallsDaily(orgId);
  const { data: trafegoKpis, isLoading: trafegoLoading, refetch: refetchTrafego } = useTrafegoKpis(orgId, period);
  const { data: trafegoDaily, refetch: refetchTrafegoDaily } = useTrafegoDaily(orgId);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setNextRefreshIn(prev => {
        if (prev <= 1) {
          // Refetch all data
          refetchExec();
          refetchExecDaily();
          refetchFunnel();
          refetchCalls();
          refetchCallsDaily();
          refetchTrafego();
          refetchTrafegoDaily();
          setLastRefresh(new Date());
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshInterval, refetchExec, refetchExecDaily, refetchFunnel, refetchCalls, refetchCallsDaily, refetchTrafego, refetchTrafegoDaily]);

  const isLoading = execLoading || callsLoading || trafegoLoading;

  // Helper para criar objeto trend
  const makeTrend = (change: number | undefined, label: string) => {
    if (change === undefined || isNaN(change)) return undefined;
    return {
      value: change,
      isPositive: change >= 0,
      label,
    };
  };

  const periodLabel = (execKpis as any)?.periodLabel || `vs ${period} anteriores`;

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-muted-foreground">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Selecione uma organização</h2>
        <p className="text-sm">Configure os filtros antes de entrar no modo apresentação</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com status de refresh e botão sair */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Dashboard Consolidado
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão unificada de Performance, Ligações e Tráfego
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Última atualização</p>
            <p className="font-medium">{format(lastRefresh, "HH:mm:ss", { locale: ptBR })}</p>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-primary/10 border border-primary/30"
          )}>
            <RefreshCw className={cn("w-4 h-4 text-primary", nextRefreshIn <= 5 && "animate-spin")} />
            <span className="text-sm font-medium text-primary">
              {nextRefreshIn}s
            </span>
          </div>
          {/* Botão Sair do Modo View */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(false)}
            className="gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* KPIs Consolidados - Linha 1: Executivo */}
      <Section title="📊 Performance Geral" description="Indicadores executivos principais">
        <KpiGrid columns={4}>
          <KpiCard
            title="Leads"
            value={execKpis?.leads_total_30d || 0}
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            isLoading={execLoading}
            trend={makeTrend((execKpis as any)?.changes?.leads, periodLabel)}
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={execKpis?.meetings_scheduled_30d || 0}
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
            isLoading={execLoading}
            trend={makeTrend((execKpis as any)?.changes?.meetings_scheduled, periodLabel)}
          />
          <KpiCard
            title="Investimento"
            value={execKpis?.spend_30d || 0}
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
            isLoading={execLoading}
            trend={makeTrend((execKpis as any)?.changes?.spend, periodLabel)}
          />
          <KpiCard
            title="CPL"
            value={execKpis?.cpl_30d || 0}
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            isLoading={execLoading}
            trend={makeTrend((execKpis as any)?.changes?.cpl, periodLabel)}
            invertTrend
          />
        </KpiGrid>
      </Section>

      {/* KPIs Consolidados - Linha 2: VAPI e Tráfego */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="📞 Ligações VAPI" description="Métricas de chamadas de voz">
          <KpiGrid columns={2}>
            <KpiCard
              title="Ligações Realizadas"
              value={callsKpis?.calls_done || 0}
              icon={<PhoneCall className="w-5 h-5" />}
              variant="primary"
              isLoading={callsLoading}
              trend={makeTrend((callsKpis as any)?.changes?.calls_done, periodLabel)}
            />
            <KpiCard
              title="Taxa Atendimento"
              value={callsKpis?.taxa_atendimento || 0}
              icon={<Percent className="w-5 h-5" />}
              format="percent"
              variant="success"
              isLoading={callsLoading}
              trend={makeTrend((callsKpis as any)?.changes?.taxa_atendimento, periodLabel)}
            />
            <KpiCard
              title="Tempo Médio (min)"
              value={Number((callsKpis?.avg_minutes || 0).toFixed(2))}
              icon={<Timer className="w-5 h-5" />}
              format="number"
              isLoading={callsLoading}
            />
            <KpiCard
              title="Custo Total (USD)"
              value={callsKpis?.total_spent || 0}
              icon={<DollarSign className="w-5 h-5" />}
              format="currency"
              variant="warning"
              isLoading={callsLoading}
            />
          </KpiGrid>
        </Section>

        <Section title="🎯 Tráfego Pago" description="Métricas de aquisição">
          <KpiGrid columns={2}>
            <KpiCard
              title="Investimento"
              value={trafegoKpis?.spend_total || 0}
              icon={<DollarSign className="w-5 h-5" />}
              format="currency"
              variant="warning"
              isLoading={trafegoLoading}
              trend={makeTrend((trafegoKpis as any)?.changes?.spend, periodLabel)}
            />
            <KpiCard
              title="Leads Gerados"
              value={trafegoKpis?.leads || 0}
              icon={<Users className="w-5 h-5" />}
              variant="primary"
              isLoading={trafegoLoading}
              trend={makeTrend((trafegoKpis as any)?.changes?.leads, periodLabel)}
            />
            <KpiCard
              title="CPL"
              value={trafegoKpis?.cpl || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              format="currency"
              isLoading={trafegoLoading}
              trend={makeTrend((trafegoKpis as any)?.changes?.cpl, periodLabel)}
              invertTrend
            />
            <KpiCard
              title="Reuniões Agendadas"
              value={trafegoKpis?.meetings_booked || 0}
              icon={<CalendarCheck className="w-5 h-5" />}
              variant="success"
              isLoading={trafegoLoading}
              trend={makeTrend((trafegoKpis as any)?.changes?.meetings_booked, periodLabel)}
            />
          </KpiGrid>
        </Section>
      </div>

      {/* Gráficos Consolidados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolução Executiva */}
        <ChartCard
          title="Evolução Leads & Reuniões"
          subtitle="Últimos 60 dias"
          isEmpty={!execDaily?.length}
        >
          <DailyChart
            data={execDaily || []}
            lines={[
              { key: 'leads_new', name: 'Leads', color: 'primary' },
              { key: 'meetings_scheduled', name: 'Reuniões', color: 'success' },
            ]}
            height={220}
          />
        </ChartCard>

        {/* Evolução Ligações */}
        <ChartCard
          title="Evolução Ligações"
          subtitle="Chamadas e atendimentos"
          isEmpty={!callsDaily?.length}
        >
          <DailyChart
            data={callsDaily || []}
            lines={[
              { key: 'calls_done', name: 'Realizadas', color: 'primary' },
              { key: 'calls_answered', name: 'Atendidas', color: 'success' },
            ]}
            height={220}
          />
        </ChartCard>

        {/* Evolução Tráfego */}
        <ChartCard
          title="Evolução Investimento"
          subtitle="Custo e leads gerados"
          isEmpty={!trafegoDaily?.length}
        >
          <DailyChart
            data={trafegoDaily || []}
            lines={[
              { key: 'spend_total', name: 'Investimento', color: 'warning' },
              { key: 'leads', name: 'Leads', color: 'primary' },
            ]}
            height={220}
          />
        </ChartCard>
      </div>

      {/* Funil de Conversão */}
      <ChartCard
        title="Pipeline de Conversão"
        subtitle="Funil atual por etapa"
        isEmpty={!funnel?.length}
      >
        <FunnelChart
          data={funnel || []}
          onStageClick={() => {}}
        />
      </ChartCard>
    </div>
  );
}