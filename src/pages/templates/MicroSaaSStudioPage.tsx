/**
 * Pinn MicroSaaS Studio - Nível 5 (Expert)
 * Dashboard completo para MicroSaaS - Visão 360° do negócio
 */

import { 
  DollarSign, 
  Users, 
  TrendingDown, 
  TrendingUp,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  Wallet,
  LineChart,
  Gauge
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';

export default function MicroSaaSStudioPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Pinn MicroSaaS Studio"
        description="Visão 360° do negócio - Nível 5 (Expert)"
      />

      {/* Row 1 - KPIs Principais de Receita */}
      <Section title="Métricas de Receita">
        <KpiGrid columns={6}>
          <KpiCard
            title="MRR"
            value={0}
            kpiKey="mrr"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="primary"
          />
          <KpiCard
            title="Usuários Ativos"
            value={0}
            kpiKey="mau"
            icon={<Users className="w-5 h-5" />}
          />
          <KpiCard
            title="Churn"
            value={0}
            kpiKey="churn"
            icon={<TrendingDown className="w-5 h-5" />}
            format="percent"
            variant="destructive"
          />
          <KpiCard
            title="NRR"
            value={0}
            kpiKey="nrr"
            icon={<TrendingUp className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="CAC"
            value={0}
            kpiKey="cac"
            icon={<Wallet className="w-5 h-5" />}
            format="currency"
          />
          <KpiCard
            title="LTV:CAC"
            value={0}
            kpiKey="ltv_cac_ratio"
            icon={<Target className="w-5 h-5" />}
            variant="warning"
          />
        </KpiGrid>
      </Section>

      {/* Row 2 - Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Evolução MRR & Cohorts"
          subtitle="Receita recorrente mensal"
          isEmpty={true}
          className="lg:col-span-2"
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <LineChart className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Conecte dados para visualizar MRR</p>
          </div>
        </ChartCard>

        <ChartCard
          title="Funil de Conversão"
          subtitle="Trial → Paid → Retained"
          isEmpty={true}
        >
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Target className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">Funil vazio</p>
          </div>
        </ChartCard>
      </div>

      {/* Row 3 - Growth */}
      <Section title="Growth & Aquisição">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Aquisição Semanal"
            subtitle="Novos signups por semana"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Activity className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados</p>
            </div>
          </ChartCard>

          <ChartCard
            title="Canais de Aquisição"
            subtitle="Origem dos usuários"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados</p>
            </div>
          </ChartCard>

          <ChartCard
            title="Mapa de Retenção"
            subtitle="Cohort retention heatmap"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Gauge className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados</p>
            </div>
          </ChartCard>
        </div>
      </Section>

      {/* Row 4 - Produto */}
      <Section title="Métricas de Produto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Features Mais Usadas"
            subtitle="Uso por funcionalidade"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Zap className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados</p>
            </div>
          </ChartCard>

          <ChartCard
            title="Engajamento Diário"
            subtitle="DAU ao longo do tempo"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Activity className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados</p>
            </div>
          </ChartCard>

          <ChartCard
            title="Health Score"
            subtitle="Por segmento de cliente"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <PieChart className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados</p>
            </div>
          </ChartCard>
        </div>
      </Section>

      {/* Row 5 - Customer Success KPIs */}
      <Section title="Customer Success">
        <KpiGrid columns={6}>
          <KpiCard
            title="CSAT"
            value={0}
            kpiKey="csat"
            icon={<Star className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="NPS"
            value={0}
            kpiKey="nps"
            icon={<Star className="w-5 h-5" />}
            variant="warning"
          />
          <KpiCard
            title="Tickets Abertos"
            value={0}
            kpiKey="tickets_abertos"
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <KpiCard
            title="Tempo Resposta"
            value={0}
            kpiKey="tempo_resposta"
            icon={<Clock className="w-5 h-5" />}
          />
          <KpiCard
            title="Resolução 1º Contato"
            value={0}
            kpiKey="fcr"
            icon={<CheckCircle className="w-5 h-5" />}
            format="percent"
            variant="success"
          />
          <KpiCard
            title="Expansão MRR"
            value={0}
            kpiKey="expansion_mrr"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
            variant="primary"
          />
        </KpiGrid>
      </Section>

      {/* Row 6 - Financeiro */}
      <Section title="Financeiro">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Runway & Burn Rate"
            subtitle="Projeção de caixa"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Wallet className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados financeiros</p>
            </div>
          </ChartCard>

          <ChartCard
            title="Unit Economics por Cohort"
            subtitle="LTV, CAC, Payback por coorte"
            isEmpty={true}
          >
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Sem dados</p>
            </div>
          </ChartCard>
        </div>
      </Section>
    </div>
  );
}
