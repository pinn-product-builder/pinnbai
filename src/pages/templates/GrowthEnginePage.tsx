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
  TrendingUp,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';

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
            value={0}
            kpiKey="novos_usuarios"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="Taxa de Ativação"
            value={0}
            kpiKey="taxa_ativacao"
            icon={<Zap className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="Retenção D7"
            value={0}
            kpiKey="retencao_d7"
            icon={<RefreshCw className="w-5 h-5" />}
            format="percent"
          />
          <KpiCard
            title="NPS"
            value={0}
            kpiKey="nps"
            icon={<Star className="w-5 h-5" />}
            variant="warning"
          />
          <KpiCard
            title="CAC"
            value={0}
            kpiKey="cac"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
          />
          <KpiCard
            title="Viral Coef."
            value={0}
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
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Activity className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Conecte dados para visualizar cohorts</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Funil AARRR"
          subtitle="Aquisição → Ativação → Retenção → Referência → Receita"
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Target className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Conecte dados para visualizar funil</p>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Aquisição por Canal"
          subtitle="Novos usuários por fonte"
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-xs">Sem dados</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Custo por Canal"
          subtitle="Investimento por fonte"
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-xs">Sem dados</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Referências"
          subtitle="Distribuição por fonte"
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <PieChart className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-xs">Sem dados</p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
