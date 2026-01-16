/**
 * Pinn Process Automation - Nível 4 (Muito Avançado)
 * Dashboard de Automação e Operações
 * Interface Premium Dark Warm
 */

import { 
  Zap, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Activity,
  Settings,
  BarChart3,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { 
  DemoLineChart, 
  DemoAreaChart, 
  DemoBarChart, 
  DemoPieChart,
  DemoHeatmap,
  DemoFunnelChart,
  DemoSparkline,
} from '@/components/charts/DemoCharts';
import { Badge } from '@/components/ui/badge';

export default function ProcessAutomationPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Badge de Demo */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Pinn Process Automation"
          description="Automação de processos - Nível 4 (Muito Avançado)"
        />
        <Badge 
          variant="outline" 
          className="bg-pinn-orange-500/10 border-pinn-orange-500/30 text-pinn-orange-500"
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Demo
        </Badge>
      </div>

      {/* Row 1 - KPIs de Automação */}
      <Section title="Indicadores Operacionais" icon={<Activity className="w-4 h-4" />}>
        <KpiGrid columns={6}>
          <KpiCard
            title="Processos Ativos"
            value={1847}
            kpiKey="processos_ativos"
            icon={<Activity className="w-5 h-5" />}
            variant="primary"
            trend={{ value: 12, isPositive: true, label: 'novos' }}
          />
          <KpiCard
            title="Taxa de Automação"
            value={78.5}
            kpiKey="taxa_automacao"
            icon={<Zap className="w-5 h-5" />}
            format="percent"
            variant="success"
            trend={{ value: 5.3, isPositive: true, label: 'melhoria' }}
          />
          <KpiCard
            title="Tempo Médio"
            value={4.2}
            kpiKey="tempo_medio"
            icon={<Clock className="w-5 h-5" />}
            description="Segundos por execução"
          />
          <KpiCard
            title="SLA Cumprido"
            value={94.7}
            kpiKey="sla_cumprido"
            icon={<CheckCircle className="w-5 h-5" />}
            format="percent"
            variant="success"
            trend={{ value: 2.1, isPositive: true, label: 'qualidade' }}
          />
          <KpiCard
            title="Erros"
            value={23}
            kpiKey="erros"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="destructive"
            trend={{ value: 15.2, isPositive: true, label: 'redução' }}
          />
          <KpiCard
            title="Economia Gerada"
            value={142500}
            kpiKey="economia"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
          />
        </KpiGrid>
      </Section>

      {/* Row 2 - Performance e Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Volume de Processamento"
          subtitle="Processos executados por dia"
          className="lg:col-span-2"
        >
          <DemoAreaChart height={300} stacked />
        </ChartCard>

        <ChartCard
          title="Pipeline de Processos"
          subtitle="Status atual do fluxo"
        >
          <DemoFunnelChart stages={4} showConversion />
        </ChartCard>
      </div>

      {/* Row 3 - Detalhes de Performance */}
      <Section title="Performance Detalhada" icon={<BarChart3 className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Tendência de Erros"
            subtitle="Evolução de falhas"
          >
            <DemoLineChart height={240} lines={2} showTrend />
          </ChartCard>

          <ChartCard
            title="Gargalos por Etapa"
            subtitle="Tempo de espera por fase"
          >
            <DemoBarChart height={240} bars={6} horizontal />
          </ChartCard>

          <ChartCard
            title="Mapa de Calor - Horários"
            subtitle="Distribuição por hora/dia"
          >
            <DemoHeatmap rows={7} cols={8} showLegend />
          </ChartCard>
        </div>
      </Section>

      {/* Row 4 - Erros e Otimização */}
      <Section title="Eficiência & Economia" icon={<Settings className="w-4 h-4" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Performance por Equipe"
            subtitle="Produtividade por time"
          >
            <DemoBarChart height={260} bars={6} showComparison />
          </ChartCard>

          <ChartCard
            title="Distribuição de Status"
            subtitle="Por tipo de processo"
          >
            <DemoPieChart height={260} donut showLabels />
          </ChartCard>
        </div>
      </Section>

      {/* Row 5 - KPIs de Eficiência */}
      <Section title="Eficiência Operacional" icon={<TrendingUp className="w-4 h-4" />}>
        <KpiGrid columns={4}>
          <KpiCard
            title="Uptime"
            value={99.95}
            kpiKey="uptime"
            icon={<Activity className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="Throughput"
            value={534}
            kpiKey="throughput"
            icon={<Zap className="w-5 h-5" />}
            description="Execuções/min"
          />
          <KpiCard
            title="Custo/Execução"
            value={0.0024}
            kpiKey="cost_per_execution"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            trend={{ value: 12.5, isPositive: true, label: 'economia' }}
          />
          <KpiCard
            title="ROI Automação"
            value={847}
            kpiKey="roi_automation"
            icon={<TrendingUp className="w-5 h-5" />}
            format="percent"
            variant="primary"
          />
        </KpiGrid>
      </Section>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat 
          label="Filas Ativas" 
          value={12} 
          trend={0} 
          sparkTrend="flat" 
        />
        <QuickStat 
          label="Workers Online" 
          value={8} 
          trend={0} 
          sparkTrend="flat" 
        />
        <QuickStat 
          label="Retry Rate" 
          value="1.2%" 
          trend={-0.3} 
          sparkTrend="down" 
        />
        <QuickStat 
          label="P99 Latency" 
          value="450ms" 
          trend={-8.5} 
          sparkTrend="down" 
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
        {trend !== 0 && (
          <span className={`text-xs flex items-center gap-0.5 ${
            sparkTrend === 'up' ? 'text-success' : 
            sparkTrend === 'down' ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-xl font-bold text-text-1 mb-2">{value}</div>
      <DemoSparkline trend={sparkTrend} />
    </div>
  );
}