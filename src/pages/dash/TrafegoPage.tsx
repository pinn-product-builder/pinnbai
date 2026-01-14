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

  const { data: kpis7d, isLoading: kpis7dLoading } = useTrafegoKpis(orgId, '7d');
  const { data: kpis30d, isLoading: kpis30dLoading } = useTrafegoKpis(orgId, '30d');
  const { data: daily, isLoading: dailyLoading } = useTrafegoDaily(orgId);
  const { data: topAds, isLoading: topAdsLoading } = useTopAds(orgId);
  const { data: insights, isLoading: insightsLoading } = useInsights(orgId, 'trafego');

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

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Tráfego Pago"
        description="Performance de investimento em mídia"
      />

      {/* KPIs 7d */}
      <Section title="Últimos 7 Dias">
        <KpiGrid columns={4}>
          <KpiCard
            title="Investimento"
            value={(kpis7d as any)?.spend_total_7d || 0}
            kpiKey="spend_total_7d"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Leads"
            value={(kpis7d as any)?.leads_7d || 0}
            kpiKey="leads_7d"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Entradas"
            value={(kpis7d as any)?.entradas_7d || 0}
            kpiKey="entradas_7d"
            icon={<ArrowDownToLine className="w-5 h-5" />}
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Taxa de Entrada"
            value={(kpis7d as any)?.taxa_entrada_7d || 0}
            kpiKey="taxa_entrada_7d"
            icon={<Percent className="w-5 h-5" />}
            format="percent"
            isLoading={kpis7dLoading}
          />
        </KpiGrid>
        <KpiGrid columns={4} className="mt-4">
          <KpiCard
            title="CPL"
            value={(kpis7d as any)?.cpl_7d || 0}
            kpiKey="cpl_7d"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={(kpis7d as any)?.meetings_booked_7d || 0}
            kpiKey="meetings_booked_7d"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Reuniões Realizadas"
            value={(kpis7d as any)?.meetings_done_7d || 0}
            kpiKey="meetings_done_7d"
            icon={<CalendarCheck2 className="w-5 h-5" />}
            variant="success"
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Custo/Reunião"
            value={(kpis7d as any)?.cp_meeting_booked_7d || 0}
            kpiKey="cp_meeting_booked_7d"
            format="currency"
            isLoading={kpis7dLoading}
          />
        </KpiGrid>
      </Section>

      {/* KPIs 30d */}
      <Section title="Últimos 30 Dias">
        <KpiGrid columns={4}>
          <KpiCard
            title="Investimento"
            value={(kpis30d as any)?.spend_total_30d || 0}
            kpiKey="spend_total_30d"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
            isLoading={kpis30dLoading}
          />
          <KpiCard
            title="Leads"
            value={(kpis30d as any)?.leads_30d || 0}
            kpiKey="leads_30d"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            isLoading={kpis30dLoading}
          />
          <KpiCard
            title="Entradas"
            value={(kpis30d as any)?.entradas_30d || 0}
            kpiKey="entradas_30d"
            icon={<ArrowDownToLine className="w-5 h-5" />}
            isLoading={kpis30dLoading}
          />
          <KpiCard
            title="Taxa de Entrada"
            value={(kpis30d as any)?.taxa_entrada_30d || 0}
            kpiKey="taxa_entrada_30d"
            icon={<Percent className="w-5 h-5" />}
            format="percent"
            isLoading={kpis30dLoading}
          />
        </KpiGrid>
        <KpiGrid columns={4} className="mt-4">
          <KpiCard
            title="CPL"
            value={(kpis30d as any)?.cpl_30d || 0}
            kpiKey="cpl_30d"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            isLoading={kpis30dLoading}
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={(kpis30d as any)?.meetings_booked_30d || 0}
            kpiKey="meetings_booked_30d"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
            isLoading={kpis30dLoading}
          />
          <KpiCard
            title="Reuniões Realizadas"
            value={(kpis30d as any)?.meetings_done_30d || 0}
            kpiKey="meetings_done_30d"
            icon={<CalendarCheck2 className="w-5 h-5" />}
            variant="success"
            isLoading={kpis30dLoading}
          />
          <KpiCard
            title="Custo/Reunião"
            value={(kpis30d as any)?.cp_meeting_booked_30d || 0}
            kpiKey="cp_meeting_booked_30d"
            format="currency"
            isLoading={kpis30dLoading}
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
          title="Insights IA"
          subtitle="Análises automáticas de tráfego pago"
          isLoading={insightsLoading}
        >
          <InsightsPanel insight={insights || null} orgId={orgId} scope="trafego" />
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