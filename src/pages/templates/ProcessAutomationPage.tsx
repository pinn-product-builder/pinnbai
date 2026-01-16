/**
 * Pinn Process Automation - Nível 4 (Muito Avançado)
 * Dashboard de automação de processos com métricas de eficiência
 */

import { 
  Activity, 
  Zap, 
  Clock, 
  CheckCircle,
  AlertTriangle, 
  DollarSign
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { 
  DemoLineChart, 
  DemoBarChart, 
  DemoHeatmap, 
  DemoFunnelChart 
} from '@/components/charts/DemoCharts';

export default function ProcessAutomationPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Pinn Process Automation"
        description="Automação de processos - Nível 4 (Muito Avançado)"
      />

      {/* KPIs - 6 indicadores operacionais */}
      <Section title="Indicadores Operacionais">
        <KpiGrid columns={6}>
          <KpiCard
            title="Processos Ativos"
            value={0}
            kpiKey="processos_ativos"
            icon={<Activity className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="Taxa de Automação"
            value={0}
            kpiKey="taxa_automacao"
            icon={<Zap className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="Tempo Médio"
            value={0}
            kpiKey="tempo_medio"
            icon={<Clock className="w-5 h-5" />}
          />
          <KpiCard
            title="SLA Cumprido"
            value={0}
            kpiKey="sla_cumprido"
            icon={<CheckCircle className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="Erros"
            value={0}
            kpiKey="erros"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="destructive"
          />
          <KpiCard
            title="Economia Gerada"
            value={0}
            kpiKey="economia"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="warning"
          />
        </KpiGrid>
      </Section>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Volume de Processamento"
          subtitle="Processos executados por dia"
          className="lg:col-span-2"
        >
          <DemoLineChart height={250} lines={2} />
        </ChartCard>

        <ChartCard
          title="Gargalos por Etapa"
          subtitle="Tempo de espera por fase"
        >
          <DemoBarChart height={250} bars={4} horizontal />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Mapa de Calor - Horários"
          subtitle="Distribuição de processos por hora/dia"
        >
          <DemoHeatmap rows={7} cols={12} />
        </ChartCard>

        <ChartCard
          title="Performance por Equipe"
          subtitle="Produtividade por time"
        >
          <DemoBarChart height={200} bars={6} />
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Tendência de Erros"
          subtitle="Evolução de falhas ao longo do tempo"
        >
          <DemoLineChart height={200} lines={1} />
        </ChartCard>

        <ChartCard
          title="Pipeline de Processos"
          subtitle="Status atual do fluxo"
        >
          <DemoFunnelChart stages={4} />
        </ChartCard>
      </div>
    </div>
  );
}
