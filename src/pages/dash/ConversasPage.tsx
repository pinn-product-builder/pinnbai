import React from 'react';
import { MessageSquare, Users, Target, Percent, CalendarCheck, TrendingUp, Table as TableIcon } from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart, HourlyChart } from '@/components/dashboard/Charts';
import { HeatmapChart } from '@/components/dashboard/HeatmapChart';
import { ConversationTrendChart } from '@/components/dashboard/ConversationTrendChart';
import { ConversationTable } from '@/components/dashboard/ConversationTable';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import {
  useConversationsKpis,
  useConversationsDaily,
  useConversationsByHour,
  useConversationsHeatmap,
  useInsights,
} from '@/hooks/useDashboardData';

export default function ConversasPage() {
  const { filters } = useGlobalFilters();
  const orgId = filters.orgId;

  const { data: kpis, isLoading: kpisLoading } = useConversationsKpis(orgId);
  const { data: daily, isLoading: dailyLoading } = useConversationsDaily(orgId);
  const { data: byHour, isLoading: byHourLoading } = useConversationsByHour(orgId);
  const { data: heatmap, isLoading: heatmapLoading } = useConversationsHeatmap(orgId);
  const { data: insights, isLoading: insightsLoading } = useInsights(orgId, 'conversas');

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
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Conversas"
        description="Análise de mensagens e engajamento"
      />

      {/* KPIs de Mensagens */}
      <Section title="Indicadores de Mensagens (30d)">
        <KpiGrid columns={4}>
          <KpiCard
            title="Mensagens Recebidas"
            value={kpis?.msg_in_30d || 0}
            kpiKey="msg_in_30d"
            icon={<MessageSquare className="w-5 h-5" />}
            variant="primary"
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Leads Ativos"
            value={kpis?.leads_total_30d || 0}
            kpiKey="leads_total_30d"
            icon={<Users className="w-5 h-5" />}
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={kpis?.meetings_scheduled_30d || 0}
            kpiKey="meetings_scheduled_30d"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Total Reuniões"
            value={kpis?.meetings_total_30d || 0}
            kpiKey="meetings_total_30d"
            icon={<CalendarCheck className="w-5 h-5" />}
            isLoading={kpisLoading}
          />
        </KpiGrid>

        <KpiGrid columns={4}>
          <KpiCard
            title="Mensagens por Lead"
            value={kpis?.conv_lead_to_msg_30d || 0}
            kpiKey="conv_lead_to_msg_30d"
            icon={<Percent className="w-5 h-5" />}
            format="percent"
            variant="success"
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Conv. Lead → Reunião"
            value={kpis?.conv_lead_to_meeting_30d || 0}
            kpiKey="conv_lead_to_meeting_30d"
            icon={<Percent className="w-5 h-5" />}
            format="percent"
            variant="success"
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Conv. Mensagem → Reunião"
            value={kpis?.conv_msg_to_meeting_30d || 0}
            kpiKey="conv_msg_to_meeting_30d"
            icon={<TrendingUp className="w-5 h-5" />}
            format="percent"
            isLoading={kpisLoading}
          />
          <KpiCard
            title="Custo por Reunião"
            value={kpis?.cpm_meeting_30d || 0}
            kpiKey="cpm_meeting_30d"
            format="currency"
            isLoading={kpisLoading}
          />
        </KpiGrid>
      </Section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Mensagens Diárias (60d)"
          subtitle="Volume de mensagens recebidas por dia"
          chartKey="mensagens_diarias"
          isLoading={dailyLoading}
          isEmpty={!daily?.length}
        >
          <DailyChart
            data={(daily || []).map(d => ({
              day: d.day,
              msg_in_total: d.msg_in_total,
              leads_with_msg_in: d.leads_with_msg_in,
            }))}
            lines={[
              { key: 'msg_in_total', name: 'Mensagens', color: 'primary' },
              { key: 'leads_with_msg_in', name: 'Leads', color: 'success', type: 'line' },
            ]}
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Distribuição por Hora (7d)"
          subtitle="Horários de maior engajamento"
          chartKey="distribuicao_hora"
          isLoading={byHourLoading}
          isEmpty={!byHour?.length}
        >
          <HourlyChart
            data={(byHour || []).map(h => ({
              hour: h.hour,
              value: h.msg_in_total,
            }))}
            color="primary"
            height={280}
          />
        </ChartCard>
      </div>

      {/* Tendência e Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Tendência de Conversão (60d)"
          subtitle="Taxa de mensagens por lead ao longo do tempo"
          chartKey="tendencia_conversao"
          isLoading={dailyLoading}
          isEmpty={!daily?.length}
        >
          <ConversationTrendChart
            data={(daily || []).map(d => ({
              day: d.day,
              msg_in_total: d.msg_in_total,
              leads_with_msg_in: d.leads_with_msg_in,
            }))}
            height={280}
          />
        </ChartCard>

        <ChartCard
          title="Mapa de Calor (30d)"
          subtitle="Mensagens por dia da semana e hora"
          chartKey="mapa_calor"
          isLoading={heatmapLoading}
          isEmpty={!heatmap?.length}
        >
          <HeatmapChart
            data={(heatmap || []).map(h => ({
              dow: h.dow,
              hour: h.hour,
              value: h.msg_in_total,
            }))}
          />
        </ChartCard>
      </div>

      {/* Tabela e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Métricas Diárias Detalhadas"
          subtitle="Últimos 15 dias com indicadores de tendência"
          chartKey="metricas_diarias"
          isLoading={dailyLoading}
          isEmpty={!daily?.length}
        >
          <ConversationTable
            data={(daily || []).map(d => ({
              day: d.day,
              msg_in_total: d.msg_in_total,
              leads_with_msg_in: d.leads_with_msg_in,
            }))}
          />
        </ChartCard>

        <ChartCard
          title="Insights IA"
          subtitle="Análises automáticas de conversas"
          isLoading={insightsLoading}
        >
          <InsightsPanel insight={insights || null} orgId={orgId} scope="conversas" />
        </ChartCard>
      </div>
    </div>
  );
}
