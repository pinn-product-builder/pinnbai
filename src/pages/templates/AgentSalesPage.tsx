/**
 * Pinn Agent Sales - Nível 1 (Básico)
 * Dashboard simples para SDR/BDR
 * Interface Premium Dark Warm
 */

import { 
  Users, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { 
  DemoLineChart, 
  DemoFunnelChart,
  DemoSparkline,
} from '@/components/charts/DemoCharts';
import { Badge } from '@/components/ui/badge';

export default function AgentSalesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header com Badge de Demo */}
      <div className="flex items-start justify-between">
        <PageHeader
          title="Pinn Agent Sales"
          description="Dashboard para SDR/BDR - Nível 1 (Básico)"
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
      <Section title="Métricas do Dia" icon={<Target className="w-4 h-4" />}>
        <KpiGrid columns={4}>
          <KpiCard
            title="Total de Vendas"
            value={1247}
            kpiKey="total_vendas"
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="primary"
            trend={{ value: 8.5, isPositive: true, label: 'hoje' }}
          />
          <KpiCard
            title="Receita Total"
            value={89450}
            kpiKey="receita_total"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="success"
            trend={{ value: 12.3, isPositive: true, label: 'vs ontem' }}
          />
          <KpiCard
            title="Ticket Médio"
            value={71.73}
            kpiKey="ticket_medio"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            trend={{ value: 5.2, isPositive: true, label: 'crescimento' }}
          />
          <KpiCard
            title="Conversões"
            value={156}
            kpiKey="conversoes"
            icon={<CheckCircle className="w-5 h-5" />}
            variant="success"
            trend={{ value: 14.3, isPositive: true, label: 'fechamentos' }}
          />
        </KpiGrid>
      </Section>

      {/* Row 2 - Gráficos Simples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Evolução de Vendas"
          subtitle="Acompanhamento diário"
        >
          <DemoLineChart height={280} lines={2} />
        </ChartCard>

        <ChartCard
          title="Funil de Vendas"
          subtitle="Status atual"
        >
          <DemoFunnelChart stages={4} showConversion />
        </ChartCard>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat 
          label="Taxa de Resposta" 
          value="45.2%" 
          trend={5.1} 
          sparkTrend="up" 
        />
        <QuickStat 
          label="Tempo Médio Resp." 
          value="2.4h" 
          trend={-18.5} 
          sparkTrend="down" 
        />
        <QuickStat 
          label="Follow-ups Pendentes" 
          value={23} 
          trend={-8.0} 
          sparkTrend="down" 
        />
        <QuickStat 
          label="Meta do Dia" 
          value="67%" 
          trend={12.0} 
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