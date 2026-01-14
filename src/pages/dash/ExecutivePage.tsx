import React from 'react';
import { 
  Users, 
  MessageSquare, 
  CalendarCheck, 
  CalendarX, 
  DollarSign, 
  TrendingUp,
  Target,
  Percent,
  Calendar
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart } from '@/components/dashboard/Charts';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { MeetingsTable } from '@/components/dashboard/MeetingsTable';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { MonthlyMeetingsPanel } from '@/components/dashboard/MonthlyMeetingsPanel';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import {
  useExecutiveKpis,
  useExecutiveDaily,
  useFunnelCurrent,
  useMeetingsUpcoming,
  useInsights,
  useLeadsCount,
} from '@/hooks/useDashboardData';

export default function ExecutivePage() {
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

  const { data: kpis, isLoading: kpisLoading } = useExecutiveKpis(orgId, period);
  const { data: daily, isLoading: dailyLoading } = useExecutiveDaily(orgId);
  const { data: funnel, isLoading: funnelLoading } = useFunnelCurrent(orgId);
  const { data: meetings, isLoading: meetingsLoading } = useMeetingsUpcoming(orgId);
  const { data: insights, isLoading: insightsLoading } = useInsights(orgId, 'executive');
  const { data: leadsCount, isLoading: leadsCountLoading } = useLeadsCount();

  const handleStageClick = (stage: any) => {
    console.log('Stage clicked:', stage);
  };

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Selecione uma organização</h2>
        <p className="text-sm">Use o filtro acima para selecionar uma org e visualizar os dados</p>
      </div>
    );
  }

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
  const periodDays = (kpis as any)?.periodDays || 30;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Visão Executiva"
        description={`Panorama completo de performance dos últimos ${periodDays} dias`}
      />

      {/* KPIs */}
      <Section title="Indicadores Principais">
        <KpiGrid columns={4}>
          <KpiCard
            title="Total de Leads"
            value={leadsCount || 0}
            kpiKey="leads_total"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            isLoading={leadsCountLoading}
          />
          <KpiCard
            title={`Mensagens (${period})`}
            value={kpis?.msg_in_30d || 0}
            kpiKey="msg_in_30d"
            icon={<MessageSquare className="w-5 h-5" />}
            isLoading={kpisLoading}
          />
          <KpiCard
            title={`Reuniões Agendadas (${period})`}
            value={kpis?.meetings_scheduled_30d || 0}
            kpiKey="meetings_scheduled_30d"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.meetings_scheduled, periodLabel)}
          />
          <KpiCard
            title={`Reuniões Canceladas (${period})`}
            value={kpis?.meetings_cancelled_30d || 0}
            kpiKey="meetings_cancelled_30d"
            icon={<CalendarX className="w-5 h-5" />}
            variant="destructive"
            isLoading={kpisLoading}
          />
        </KpiGrid>

        <KpiGrid columns={4}>
          <KpiCard
            title={`Investimento (${period})`}
            value={kpis?.spend_30d || 0}
            kpiKey="spend_30d"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.spend, periodLabel)}
          />
          <KpiCard
            title={`CPL (${period})`}
            value={kpis?.cpl_30d || 0}
            kpiKey="cpl_30d"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.cpl, periodLabel)}
            invertTrend
          />
          <KpiCard
            title={`Custo por Reunião (${period})`}
            value={kpis?.cpm_meeting_30d || 0}
            kpiKey="cpm_meeting_30d"
            format="currency"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.cpm_meeting, periodLabel)}
            invertTrend
          />
          <KpiCard
            title={`Conv. Lead → Reunião (${period})`}
            value={kpis?.conv_lead_to_meeting_30d || 0}
            kpiKey="conv_lead_to_meeting_30d"
            icon={<Percent className="w-5 h-5" />}
            format="percent"
            variant="success"
            isLoading={kpisLoading}
            trend={makeTrend(changes?.conv_lead_to_meeting, periodLabel)}
          />
        </KpiGrid>
      </Section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Evolução Diária (60d)"
          subtitle="Leads, mensagens, reuniões e investimento"
          isLoading={dailyLoading}
          isEmpty={!daily?.length}
        >
          <DailyChart
            data={daily || []}
            lines={[
              { key: 'leads_new', name: 'Novos Leads', color: 'primary' },
              { key: 'msg_in', name: 'Mensagens', color: 'success' },
              { key: 'meetings_scheduled', name: 'Reuniões', color: 'warning' },
              { key: 'spend', name: 'Investimento (R$)', color: 'destructive' },
            ]}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="Pipeline de Conversão"
          subtitle="Funil atual por etapa"
          isLoading={funnelLoading}
          isEmpty={!funnel?.length}
        >
          <FunnelChart
            data={funnel || []}
            onStageClick={handleStageClick}
          />
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Próximas Reuniões"
          subtitle="Reuniões agendadas a partir de hoje"
          isLoading={meetingsLoading}
          isEmpty={!meetings?.length}
        >
          <MeetingsTable meetings={meetings || []} />
        </ChartCard>

        <ChartCard
          title="Insights IA"
          subtitle="Análises e recomendações automáticas"
          isLoading={insightsLoading}
        >
          <InsightsPanel insight={insights || null} orgId={orgId} scope="executive" />
        </ChartCard>
      </div>

      {/* Leads e Reuniões - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Reuniões do Mês"
          subtitle="Controle de comparecimento"
          isLoading={false}
        >
          <MonthlyMeetingsPanel orgId={orgId} compact />
        </ChartCard>

        <ChartCard
          title="Lista de Leads"
          subtitle="Leads recentes"
          isLoading={false}
        >
          <LeadsTable orgId={orgId} compact />
        </ChartCard>
      </div>
    </div>
  );
}