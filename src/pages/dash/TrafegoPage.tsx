import React from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  CalendarCheck,
  Target,
  ArrowDownToLine,
  CalendarCheck2,
  Percent
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart, BarChartHorizontal } from '@/components/dashboard/Charts';
import { CorrelationChart } from '@/components/dashboard/CorrelationChart';
import { TrafficTable } from '@/components/dashboard/TrafficTable';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import {
  useTrafegoKpis,
  useTrafegoDaily,
  useTopAds,
  useInsights,
} from '@/hooks/useDashboardData';


export default function TrafegoPage() {
  const { filters } = useGlobalFilters();
  const orgId = filters.orgId;
  
  // Mapear período global para o hook (excluir 'custom')
  const periodMap: Record<string, '7d' | '14d' | '30d' | '60d' | '90d'> = {
    '7d': '7d',
    '14d': '14d',
    '30d': '30d',
    '60d': '60d',
    '90d': '90d',
    'custom': '30d',
  };
  const period = periodMap[filters.period] || '30d';

  const { data: kpis, isLoading: kpisLoading } = useTrafegoKpis(orgId, period);
  const { data: daily, isLoading: dailyLoading } = useTrafegoDaily(orgId);
  const { data: topAds, isLoading: topAdsLoading } = useTopAds(orgId);
  const { data: insights, isLoading: insightsLoading } = useInsights(orgId, 'trafego');

  // Preparar KPIs para insights
  const trafficKpis = kpis ? {
    spend_total: (kpis as any)?.spend_total,
    leads: (kpis as any)?.leads,
    entradas: (kpis as any)?.entradas,
    taxa_entrada: (kpis as any)?.taxa_entrada,
    cpl: (kpis as any)?.cpl,
    meetings_booked: (kpis as any)?.meetings_booked,
    meetings_done: (kpis as any)?.meetings_done,
    cp_meeting_booked: (kpis as any)?.cp_meeting_booked,
    changes: (kpis as any)?.changes,
  } : null;

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Selecione uma organização</h2>
        <p className="text-sm">Use o filtro acima para selecionar uma org e visualizar os dados</p>
      </div>
    );
  }

  // Preparar dados para o gráfico de correlação
  const correlationData = (daily || []).map(d => ({
    day: new Date(d.day + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    spend: d.spend_total,
    leads: d.leads,
    entradas: d.entradas,
    meetings_booked: d.meetings_booked,
  }));

  // Helper para criar objeto trend
  const makeTrend = (change: number | undefined, label: string) => {
    if (change === undefined || isNaN(change)) return undefined;
    return {
      value: change,
      isPositive: change >= 0,
      label,
    };
  };

  // Extrair changes e periodLabel dos KPIs
  const changes = (kpis as any)?.changes;
  const periodLabel = (kpis as any)?.periodLabel || `vs ${period} anteriores`;

  // Mapear número de dias para exibição
  const periodDays: Record<string, number> = {
    '7d': 7, '14d': 14, '30d': 30, '60d': 60, '90d': 90
  };
  const days = periodDays[period] || 30;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Tráfego Pago"
        description={`Performance de investimento em mídia - últimos ${days} dias`}
      />

      {/* KPIs do período selecionado */}
      <Section title={`Últimos ${days} Dias`}>
        <KpiGrid columns={4}>
          <KpiCard
            title="Investimento"
            value={(kpis as any)?.spend_total || 0}
            kpiKey="spend_total_30d"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.spend, periodLabel)}
          />
          <KpiCard
            title="Leads"
            value={(kpis as any)?.leads || 0}
            kpiKey="leads_30d"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.leads, periodLabel)}
          />
          <KpiCard
            title="Entradas"
            value={(kpis as any)?.entradas || 0}
            kpiKey="entradas_30d"
            icon={<ArrowDownToLine className="w-5 h-5" />}
            isLoading={kpisLoading}
            trend={makeTrend(changes?.entradas, periodLabel)}
          />
          <KpiCard
            title="Taxa de Entrada"
            value={(kpis as any)?.taxa_entrada || 0}
            kpiKey="taxa_entrada_30d"
            icon={<Percent className="w-5 h-5" />}
            format="percent"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.taxa_entrada, periodLabel)}
          />
        </KpiGrid>
        <KpiGrid columns={4} className="mt-4">
          <KpiCard
            title="CPL"
            value={(kpis as any)?.cpl || 0}
            kpiKey="cpl_30d"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.cpl, periodLabel)}
            invertTrend
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={(kpis as any)?.meetings_booked || 0}
            kpiKey="meetings_booked_30d"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.meetings_booked, periodLabel)}
          />
          <KpiCard
            title="Reuniões Realizadas"
            value={(kpis as any)?.meetings_done || 0}
            kpiKey="meetings_done_30d"
            icon={<CalendarCheck2 className="w-5 h-5" />}
            variant="success"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.meetings_done, periodLabel)}
          />
          <KpiCard
            title="Custo/Reunião"
            value={(kpis as any)?.cp_meeting_booked || 0}
            kpiKey="cp_meeting_booked_30d"
            format="currency"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.cp_meeting, periodLabel)}
            invertTrend
          />
        </KpiGrid>
      </Section>

      {/* Charts Row 1 - Performance diária e correlação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Performance Diária"
          subtitle="Leads, entradas e reuniões por dia"
          isLoading={dailyLoading}
          isEmpty={!daily?.length}
        >
          <DailyChart
            data={(daily || []).map(d => ({
              day: d.day,
              spend_total: d.spend_total,
              leads: d.leads,
              entradas: d.entradas,
              meetings_booked: d.meetings_booked,
            }))}
            lines={[
              { key: 'leads', name: 'Leads', color: 'primary' },
              { key: 'entradas', name: 'Entradas', color: 'warning' },
              { key: 'meetings_booked', name: 'Reuniões', color: 'success' },
            ]}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="Eficiência do Investimento"
          subtitle="Análise de correlação entre gasto e resultados"
          isLoading={dailyLoading}
          isEmpty={!daily?.length}
        >
          <CorrelationChart
            data={correlationData}
            height={320}
          />
        </ChartCard>
      </div>

      {/* Charts Row 2 - Top ads e insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Top 10 Anúncios"
          subtitle="Anúncios com maior investimento"
          isLoading={topAdsLoading}
          isEmpty={!topAds?.length}
        >
          <BarChartHorizontal
            data={(topAds || []).slice(0, 10).map(ad => ({
              name: ad.ad_name?.length > 30 ? `${ad.ad_name.slice(0, 30)}...` : ad.ad_name,
              value: ad.spend_total,
            }))}
            color="warning"
            height={320}
            formatValue={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
          />
        </ChartCard>

        <ChartCard
          title="Insights de Tráfego"
          subtitle="Análise de performance de mídia paga"
          isLoading={insightsLoading || kpisLoading}
          className="h-[420px] overflow-hidden"
        >
          <div className="h-[320px] overflow-y-auto scrollbar-thin pr-2">
            <InsightsPanel 
              insight={insights || null} 
              orgId={orgId} 
              scope="trafego"
              kpis={trafficKpis as any}
            />
          </div>
        </ChartCard>
      </div>

      {/* Tabela detalhada */}
      <ChartCard
        title="Métricas Diárias Detalhadas"
        subtitle="Últimos 20 dias com indicadores de tendência"
        isLoading={dailyLoading}
        isEmpty={!daily?.length}
      >
        <TrafficTable data={daily || []} />
      </ChartCard>
    </div>
  );
}