/**
 * Pinn Revenue OS - Nível 2 (Intermediário)
 * Sistema operacional de receita - Similar ao dashboard Afonsina
 */

import { 
  Users, 
  MessageSquare, 
  CalendarCheck, 
  CalendarX, 
  DollarSign, 
  TrendingUp,
  Percent,
  CheckCircle
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DemoLineChart, DemoFunnelChart } from '@/components/charts/DemoCharts';

export default function RevenueOSPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Pinn Revenue OS"
        description="Sistema operacional de receita - Nível 2 (Intermediário)"
      />

      {/* KPIs - 2 rows como Afonsina */}
      <Section title="Indicadores Principais">
        <KpiGrid columns={5}>
          <KpiCard
            title="Total de Leads"
            value={3842}
            kpiKey="leads_total"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="Mensagens"
            value={12847}
            kpiKey="msg_in_30d"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={287}
            kpiKey="meetings_scheduled_30d"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
          />
          <KpiCard
            title="Reuniões Realizadas"
            value={198}
            kpiKey="meetings_done"
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
          />
          <KpiCard
            title="Reuniões Canceladas"
            value={42}
            kpiKey="meetings_cancelled_30d"
            icon={<CalendarX className="w-5 h-5" />}
            variant="destructive"
          />
        </KpiGrid>

        <KpiGrid columns={4}>
          <KpiCard
            title="Investimento"
            value={45320}
            kpiKey="spend_30d"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
          />
          <KpiCard
            title="CPL"
            value={11.79}
            kpiKey="cpl_30d"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
          />
          <KpiCard
            title="Custo por Reunião"
            value={157.98}
            kpiKey="cpm_meeting_30d"
            format="currency"
          />
          <KpiCard
            title="Conv. Lead → Reunião"
            value={7.47}
            kpiKey="conv_lead_to_meeting_30d"
            icon={<Percent className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
        </KpiGrid>
      </Section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Evolução Diária"
          subtitle="Leads, mensagens, reuniões e investimento"
        >
          <DemoLineChart height={280} lines={3} />
        </ChartCard>

        <ChartCard
          title="Pipeline de Conversão"
          subtitle="Funil atual por etapa"
        >
          <DemoFunnelChart stages={5} />
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Próximas Reuniões"
          subtitle="Reuniões agendadas"
          className="h-[320px]"
        >
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Conecte um dataset para ver reuniões</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Insights IA"
          subtitle="Análises baseadas nos dados"
          className="h-[320px]"
        >
          <div className="p-4 space-y-3">
            <div className="p-3 rounded-lg bg-pinn-orange-500/10 border border-pinn-orange-500/20">
              <p className="text-sm text-text-2">📈 <strong>Taxa de conversão</strong> está 15% acima da média do setor</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-text-2">✅ <strong>Custo por reunião</strong> reduziu 8% este mês</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-sm text-text-2">⚠️ <strong>Meta de leads</strong> precisa de 12% mais para atingir</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
