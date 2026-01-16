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
  Target,
  Percent,
  CheckCircle
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';

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
            value={0}
            kpiKey="leads_total"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="Mensagens"
            value={0}
            kpiKey="msg_in_30d"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={0}
            kpiKey="meetings_scheduled_30d"
            icon={<CalendarCheck className="w-5 h-5" />}
            variant="success"
          />
          <KpiCard
            title="Reuniões Realizadas"
            value={0}
            kpiKey="meetings_done"
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
          />
          <KpiCard
            title="Reuniões Canceladas"
            value={0}
            kpiKey="meetings_cancelled_30d"
            icon={<CalendarX className="w-5 h-5" />}
            variant="destructive"
          />
        </KpiGrid>

        <KpiGrid columns={4}>
          <KpiCard
            title="Investimento"
            value={0}
            kpiKey="spend_30d"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
          />
          <KpiCard
            title="CPL"
            value={0}
            kpiKey="cpl_30d"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
          />
          <KpiCard
            title="Custo por Reunião"
            value={0}
            kpiKey="cpm_meeting_30d"
            format="currency"
          />
          <KpiCard
            title="Conv. Lead → Reunião"
            value={0}
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
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Target className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Conecte uma fonte de dados para visualizar</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Pipeline de Conversão"
          subtitle="Funil atual por etapa"
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Target className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Conecte uma fonte de dados para visualizar</p>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Próximas Reuniões"
          subtitle="Reuniões agendadas"
          isEmpty={true}
          className="h-[420px]"
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Sem reuniões agendadas</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Insights IA"
          subtitle="Análises baseadas nos dados"
          isEmpty={true}
          className="h-[420px]"
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Target className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Insights serão gerados com dados</p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
