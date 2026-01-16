/**
 * Pinn Growth Engine - Nível 3 (Avançado)
 * Motor de crescimento com métricas AARRR
 */

import { 
  Users, 
  Zap, 
  RefreshCw, 
  Star,
  DollarSign, 
  TrendingUp
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DemoLineChart, DemoBarChart, DemoPieChart, DemoAreaChart } from '@/components/charts/DemoCharts';

export default function GrowthEnginePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Pinn Growth Engine"
        description="Motor de crescimento AARRR - Nível 3 (Avançado)"
      />

      {/* KPIs - 6 indicadores AARRR */}
      <Section title="Métricas de Crescimento (AARRR)">
        <KpiGrid columns={6}>
          <KpiCard
            title="Novos Usuários"
            value={2847}
            kpiKey="novos_usuarios"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="Taxa de Ativação"
            value={34.5}
            kpiKey="taxa_ativacao"
            icon={<Zap className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="Retenção D7"
            value={28.3}
            kpiKey="retencao_d7"
            icon={<RefreshCw className="w-5 h-5" />}
            format="percent"
          />
          <KpiCard
            title="NPS"
            value={67}
            kpiKey="nps"
            icon={<Star className="w-5 h-5" />}
            variant="warning"
          />
          <KpiCard
            title="CAC"
            value={127.45}
            kpiKey="cac"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
          />
          <KpiCard
            title="Viral Coef."
            value={1.24}
            kpiKey="viral_coefficient"
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </KpiGrid>
      </Section>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Cohort de Retenção"
          subtitle="Retenção por semana de aquisição"
        >
          <DemoAreaChart height={250} stacked />
        </ChartCard>

        <ChartCard
          title="Funil AARRR"
          subtitle="Aquisição → Ativação → Retenção → Referência → Receita"
        >
          <DemoLineChart height={250} lines={3} />
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Aquisição por Canal"
          subtitle="Novos usuários por fonte"
        >
          <DemoBarChart height={200} bars={5} />
        </ChartCard>

        <ChartCard
          title="Custo por Canal"
          subtitle="Investimento por fonte"
        >
          <DemoBarChart height={200} bars={5} horizontal />
        </ChartCard>

        <ChartCard
          title="Referências"
          subtitle="Distribuição por fonte"
        >
          <DemoPieChart height={200} />
        </ChartCard>
      </div>
    </div>
  );
}
