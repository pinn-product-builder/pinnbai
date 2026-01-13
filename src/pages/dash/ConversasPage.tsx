import React from 'react';
import { MessageSquare, Users, Target } from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DailyChart, HourlyChart } from '@/components/dashboard/Charts';
import { HeatmapChart } from '@/components/dashboard/HeatmapChart';
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

  const { data: kpis7d, isLoading: kpis7dLoading } = useConversationsKpis(orgId, '7d');
  const { data: kpis30d, isLoading: kpis30dLoading } = useConversationsKpis(orgId, '30d');
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

      {/* KPIs */}
      <Section title="Indicadores de Mensagens">
        <KpiGrid columns={4}>
          <KpiCard
            title="Mensagens Recebidas (7d)"
            value={(kpis7d as any)?.msg_in_7d || 0}
            kpiKey="msg_in_7d"
            icon={<MessageSquare className="w-5 h-5" />}
            variant="primary"
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Leads com Mensagem (7d)"
            value={(kpis7d as any)?.leads_7d || 0}
            kpiKey="leads_7d"
            icon={<Users className="w-5 h-5" />}
            isLoading={kpis7dLoading}
          />
          <KpiCard
            title="Mensagens Recebidas (30d)"
            value={(kpis30d as any)?.msg_in_30d || 0}
            kpiKey="msg_in_30d"
            icon={<MessageSquare className="w-5 h-5" />}
            variant="success"
            isLoading={kpis30dLoading}
          />
          <KpiCard
            title="Leads com Mensagem (30d)"
            value={(kpis30d as any)?.leads_30d || 0}
            kpiKey="leads_30d"
            icon={<Users className="w-5 h-5" />}
            isLoading={kpis30dLoading}
          />
        </KpiGrid>
      </Section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Mensagens Diárias (60d)"
          subtitle="Volume de mensagens recebidas por dia"
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Mapa de Calor (30d)"
          subtitle="Mensagens por dia da semana e hora"
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

        <ChartCard
          title="Insights IA"
          subtitle="Análises automáticas de conversas"
          isLoading={insightsLoading}
        >
          <InsightsPanel insight={insights || null} />
        </ChartCard>
      </div>
    </div>
  );
}
