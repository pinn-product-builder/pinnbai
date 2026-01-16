/**
 * Pinn Revenue OS - Nível 2 (Intermediário)
 * Dashboard de Vendas e Receita - Baseado no Afonsina
 * Interface Premium Dark Warm
 */

import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  MessageSquare,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CalendarX,
  Percent,
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { 
  DemoLineChart, 
  DemoAreaChart, 
  DemoBarChart, 
  DemoFunnelChart,
  DemoSparkline,
} from '@/components/charts/DemoCharts';
import { Badge } from '@/components/ui/badge';

export default function RevenueOSPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Badge de Demo */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Pinn Revenue OS"
          description="Dashboard de Vendas e Receita - Nível 2 (Intermediário)"
        />
        <Badge 
          variant="outline" 
          className="bg-pinn-orange-500/10 border-pinn-orange-500/30 text-pinn-orange-500"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Demo
        </Badge>
      </div>

      {/* Row 1 - KPIs Principais */}
      <Section title="Indicadores Principais" icon={<Target className="w-4 h-4" />}>
        <KpiGrid columns={5}>
          <KpiCard
            title="Total de Leads"
            value={3842}
            kpiKey="leads_total"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            trend={{ value: 15.3, isPositive: true, label: 'vs mês anterior' }}
          />
          <KpiCard
            title="Mensagens"
            value={12847}
            kpiKey="msg_in_30d"
            icon={<MessageSquare className="w-5 h-5" />}
            trend={{ value: 8.7, isPositive: true, label: 'engajamento' }}
          />
          <KpiCard
            title="Reuniões Agendadas"
            value={287}
            kpiKey="meetings_scheduled_30d"
            icon={<Calendar className="w-5 h-5" />}
            variant="success"
            trend={{ value: 22.4, isPositive: true, label: 'crescimento' }}
          />
          <KpiCard
            title="Reuniões Realizadas"
            value={198}
            kpiKey="meetings_done"
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
            trend={{ value: 18.9, isPositive: true, label: 'completadas' }}
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
            trend={{ value: 8.3, isPositive: true, label: 'otimização' }}
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

      {/* Row 2 - Gráficos Principais (Layout Afonsina) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Evolução Diária (60d)"
          subtitle="Leads, mensagens, reuniões e investimento"
        >
          <DemoLineChart height={320} lines={3} showTrend />
        </ChartCard>

        <ChartCard
          title="Pipeline de Conversão"
          subtitle="Funil atual por etapa"
        >
          <DemoFunnelChart stages={5} showConversion />
        </ChartCard>
      </div>

      {/* Row 3 - Canais e Performance */}
      <Section title="Canais de Aquisição" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Performance por Canal"
            subtitle="Leads por origem"
          >
            <DemoBarChart height={280} bars={6} showComparison />
          </ChartCard>

          <ChartCard
            title="Tendência de Receita"
            subtitle="MRR e receita acumulada"
          >
            <DemoAreaChart height={280} stacked />
          </ChartCard>
        </div>
      </Section>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat 
          label="Taxa de Conversão" 
          value="12.8%" 
          trend={2.3} 
          sparkTrend="up" 
        />
        <QuickStat 
          label="Ticket Médio" 
          value="R$ 2.450" 
          trend={5.7} 
          sparkTrend="up" 
        />
        <QuickStat 
          label="Ciclo de Vendas" 
          value="18 dias" 
          trend={-12.4} 
          sparkTrend="down" 
        />
        <QuickStat 
          label="Win Rate" 
          value="34.5%" 
          trend={4.2} 
          sparkTrend="up" 
        />
      </div>
    </div>
  );
}

// Componente auxiliar para Quick Stats
function QuickStat({ 
  label, 
  value, 
  trend, 
  sparkTrend 
}: { 
  label: string; 
  value: string | number; 
  trend: number;
  sparkTrend: 'up' | 'down' | 'flat';
}) {
  const isPositive = trend > 0;
  
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-3">{label}</span>
        <span className={`text-xs flex items-center gap-0.5 ${
          sparkTrend === 'up' ? 'text-success' : 
          sparkTrend === 'down' ? 'text-destructive' : 
          'text-muted-foreground'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
      <div className="text-xl font-bold text-text-1 mb-2">{value}</div>
      <DemoSparkline trend={sparkTrend} />
    </div>
  );
}