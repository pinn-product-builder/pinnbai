/**
 * Pinn Growth Engine - Nível 3 (Avançado)
 * Dashboard de Growth Marketing
 * Interface Premium Dark Warm
 */

import { 
  TrendingUp, 
  Users, 
  Target,
  Zap,
  BarChart3,
  Activity,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  Star,
  DollarSign,
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

export default function GrowthEnginePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Badge de Demo */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Pinn Growth Engine"
          description="Motor de crescimento AARRR - Nível 3 (Avançado)"
        />
        <Badge 
          variant="outline" 
          className="bg-pinn-orange-500/10 border-pinn-orange-500/30 text-pinn-orange-500"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Demo
        </Badge>
      </div>

      {/* Row 1 - KPIs AARRR */}
      <Section title="Métricas de Crescimento (AARRR)" icon={<Users className="w-4 h-4" />}>
        <KpiGrid columns={6}>
          <KpiCard
            title="Novos Usuários"
            value={2847}
            kpiKey="novos_usuarios"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
            trend={{ value: 18.5, isPositive: true, label: 'vs mês anterior' }}
          />
          <KpiCard
            title="Taxa de Ativação"
            value={34.5}
            kpiKey="taxa_ativacao"
            icon={<Zap className="w-5 h-5" />}
            format="percent"
            variant="success"
            trend={{ value: 4.2, isPositive: true, label: 'melhoria' }}
          />
          <KpiCard
            title="Retenção D7"
            value={28.3}
            kpiKey="retencao_d7"
            icon={<RefreshCw className="w-5 h-5" />}
            format="percent"
            trend={{ value: 2.1, isPositive: true, label: 'crescimento' }}
          />
          <KpiCard
            title="NPS"
            value={67}
            kpiKey="nps"
            icon={<Star className="w-5 h-5" />}
            variant="warning"
            description="Promotores - Detratores"
          />
          <KpiCard
            title="CAC"
            value={127.45}
            kpiKey="cac"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            trend={{ value: 8.3, isPositive: true, label: 'otimização' }}
          />
          <KpiCard
            title="Viral Coef."
            value={1.24}
            kpiKey="viral_coefficient"
            icon={<TrendingUp className="w-5 h-5" />}
            variant="success"
            description="Acima de 1 = viral"
          />
        </KpiGrid>
      </Section>

      {/* Row 2 - Funil e Tendências */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Funil AARRR"
          subtitle="Aquisição → Ativação → Retenção"
          className="lg:col-span-1"
        >
          <DemoFunnelChart stages={5} showConversion />
        </ChartCard>

        <ChartCard
          title="Cohort de Retenção"
          subtitle="Retenção por semana de aquisição"
          className="lg:col-span-2"
        >
          <DemoAreaChart height={300} stacked showGoal />
        </ChartCard>
      </div>

      {/* Row 3 - Canais e Performance */}
      <Section title="Performance de Canais" icon={<BarChart3 className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Aquisição por Canal"
            subtitle="Novos usuários por fonte"
          >
            <DemoBarChart height={240} bars={6} showComparison />
          </ChartCard>

          <ChartCard
            title="Referências"
            subtitle="Distribuição por fonte"
          >
            <DemoPieChart height={240} donut showLabels />
          </ChartCard>

          <ChartCard
            title="Engajamento por Hora"
            subtitle="Mapa de calor semanal"
          >
            <DemoHeatmap rows={7} cols={8} showLegend />
          </ChartCard>
        </div>
      </Section>

      {/* Row 4 - Experimentos */}
      <Section title="Experimentos & Otimização" icon={<Activity className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Performance de Campanhas"
            subtitle="CTR e conversão por campanha"
          >
            <DemoLineChart height={260} lines={3} showTrend />
          </ChartCard>

          <ChartCard
            title="Custo por Canal"
            subtitle="Investimento por fonte"
          >
            <DemoBarChart height={260} bars={5} horizontal />
          </ChartCard>
        </div>
      </Section>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat 
          label="CTR Médio" 
          value="2.8%" 
          trend={0.4} 
          sparkTrend="up" 
        />
        <QuickStat 
          label="CPC Médio" 
          value="R$ 1.45" 
          trend={-12.5} 
          sparkTrend="down" 
        />
        <QuickStat 
          label="Bounce Rate" 
          value="42.3%" 
          trend={-5.2} 
          sparkTrend="down" 
        />
        <QuickStat 
          label="Tempo no Site" 
          value="3m 24s" 
          trend={8.7} 
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