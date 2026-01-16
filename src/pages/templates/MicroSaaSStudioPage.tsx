/**
 * Pinn MicroSaaS Studio - Nível 5 (Expert)
 * Dashboard completo para MicroSaaS - Visão 360° do negócio
 * Interface Afonsina Premium
 */

import { 
  DollarSign, 
  Users, 
  TrendingDown, 
  TrendingUp,
  Target,
  Zap,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  Wallet,
  Activity,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { 
  DemoLineChart, 
  DemoAreaChart, 
  DemoBarChart, 
  DemoPieChart, 
  DemoFunnelChart,
  DemoHeatmap,
  DemoSparkline,
} from '@/components/charts/DemoCharts';
import { Badge } from '@/components/ui/badge';

export default function MicroSaaSStudioPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Badge de Demo */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Pinn MicroSaaS Studio"
          description="Visão 360° do negócio - Nível 5 (Expert)"
        />
        <Badge 
          variant="outline" 
          className="bg-pinn-orange-500/10 border-pinn-orange-500/30 text-pinn-orange-500"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Demo
        </Badge>
      </div>

      {/* Row 1 - KPIs Principais de Receita */}
      <Section title="Métricas de Receita" icon={<DollarSign className="w-4 h-4" />}>
        <KpiGrid columns={6}>
          <KpiCard
            title="MRR"
            value={47850}
            kpiKey="mrr"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="primary"
            trend={{ value: 12.4, direction: 'up', label: 'vs mês anterior' }}
          />
          <KpiCard
            title="Usuários Ativos"
            value={3247}
            kpiKey="mau"
            icon={<Users className="w-5 h-5" />}
            trend={{ value: 8.2, direction: 'up', label: 'vs mês anterior' }}
          />
          <KpiCard
            title="Churn"
            value={2.3}
            kpiKey="churn"
            icon={<TrendingDown className="w-5 h-5" />}
            format="percent"
            variant="destructive"
            trend={{ value: 0.5, direction: 'down', label: 'melhoria' }}
          />
          <KpiCard
            title="NRR"
            value={115}
            kpiKey="nrr"
            icon={<TrendingUp className="w-5 h-5" />}
            format="percent"
            variant="success"
            trend={{ value: 3.1, direction: 'up', label: 'crescimento' }}
          />
          <KpiCard
            title="CAC"
            value={89.50}
            kpiKey="cac"
            icon={<Wallet className="w-5 h-5" />}
            format="currency"
            trend={{ value: 5.2, direction: 'down', label: 'otimização' }}
          />
          <KpiCard
            title="LTV:CAC"
            value={4.2}
            kpiKey="ltv_cac_ratio"
            icon={<Target className="w-5 h-5" />}
            variant="warning"
            description="Razão saudável acima de 3:1"
          />
        </KpiGrid>
      </Section>

      {/* Row 2 - Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Evolução MRR & Cohorts"
          subtitle="Receita recorrente mensal com expansão"
          className="lg:col-span-2"
        >
          <DemoAreaChart height={300} stacked showGoal />
        </ChartCard>

        <ChartCard
          title="Funil de Conversão"
          subtitle="Trial → Paid → Retained"
        >
          <DemoFunnelChart stages={5} showConversion />
        </ChartCard>
      </div>

      {/* Row 3 - Growth */}
      <Section title="Growth & Aquisição" icon={<TrendingUp className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Tendência de Leads"
            subtitle="Novos signups por semana"
          >
            <DemoLineChart height={220} lines={2} showTrend />
          </ChartCard>

          <ChartCard
            title="Canais de Aquisição"
            subtitle="Comparativo com mês anterior"
          >
            <DemoBarChart height={220} bars={6} showComparison />
          </ChartCard>

          <ChartCard
            title="Mapa de Retenção"
            subtitle="Cohort retention heatmap"
          >
            <DemoHeatmap rows={7} cols={8} showLegend />
          </ChartCard>
        </div>
      </Section>

      {/* Row 4 - Produto */}
      <Section title="Métricas de Produto" icon={<Activity className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Features Mais Usadas"
            subtitle="Uso por funcionalidade"
          >
            <DemoBarChart height={220} bars={6} horizontal />
          </ChartCard>

          <ChartCard
            title="Engajamento Diário"
            subtitle="DAU/MAU e sessões"
          >
            <DemoLineChart height={220} lines={3} />
          </ChartCard>

          <ChartCard
            title="Distribuição de Planos"
            subtitle="Por segmento de cliente"
          >
            <DemoPieChart height={220} donut showLabels />
          </ChartCard>
        </div>
      </Section>

      {/* Row 5 - Customer Success KPIs */}
      <Section title="Customer Success" icon={<Star className="w-4 h-4" />}>
        <KpiGrid columns={6}>
          <KpiCard
            title="CSAT"
            value={92.4}
            kpiKey="csat"
            icon={<Star className="w-5 h-5" />}
            format="percent"
            variant="success"
            trend={{ value: 2.1, direction: 'up', label: 'satisfação' }}
          />
          <KpiCard
            title="NPS"
            value={72}
            kpiKey="nps"
            icon={<Star className="w-5 h-5" />}
            variant="warning"
            description="Promotores - Detratores"
          />
          <KpiCard
            title="Tickets Abertos"
            value={47}
            kpiKey="tickets_abertos"
            icon={<MessageSquare className="w-5 h-5" />}
            trend={{ value: 12, direction: 'down', label: 'redução' }}
          />
          <KpiCard
            title="Tempo Resposta"
            value={2.4}
            kpiKey="tempo_resposta"
            icon={<Clock className="w-5 h-5" />}
            description="Horas média"
          />
          <KpiCard
            title="FCR"
            value={68.5}
            kpiKey="fcr"
            icon={<CheckCircle className="w-5 h-5" />}
            format="percent"
            variant="success"
            description="Resolução 1º Contato"
          />
          <KpiCard
            title="Expansão MRR"
            value={8450}
            kpiKey="expansion_mrr"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            variant="primary"
            trend={{ value: 18.5, direction: 'up', label: 'upsell' }}
          />
        </KpiGrid>
      </Section>

      {/* Row 6 - Financeiro */}
      <Section title="Financeiro" icon={<BarChart3 className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Runway & Burn Rate"
            subtitle="Projeção de caixa mensal"
          >
            <DemoAreaChart height={240} />
          </ChartCard>

          <ChartCard
            title="Unit Economics por Cohort"
            subtitle="LTV, CAC, Payback por coorte"
          >
            <DemoBarChart height={240} bars={6} showComparison />
          </ChartCard>
        </div>
      </Section>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat 
          label="Trial Signups" 
          value={847} 
          trend={12.3} 
          sparkTrend="up" 
        />
        <QuickStat 
          label="Conversão Trial" 
          value="24.5%" 
          trend={3.2} 
          sparkTrend="up" 
        />
        <QuickStat 
          label="Tempo p/ Valor" 
          value="3.2 dias" 
          trend={-8.5} 
          sparkTrend="down" 
        />
        <QuickStat 
          label="Ativação D1" 
          value="67.8%" 
          trend={5.1} 
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