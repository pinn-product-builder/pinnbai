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
  Zap,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  Wallet
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { 
  DemoLineChart, 
  DemoAreaChart, 
  DemoBarChart, 
  DemoPieChart, 
  DemoFunnelChart,
  DemoHeatmap 
} from '@/components/charts/DemoCharts';

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
          className="lg:col-span-2"
        >
          <DemoAreaChart height={280} stacked />
        </ChartCard>

        <ChartCard
          title="Funil de Conversão"
          subtitle="Trial → Paid → Retained"
        >
          <DemoFunnelChart stages={4} />
        </ChartCard>
      </div>

      {/* Row 3 - Growth */}
      <Section title="Growth & Aquisição">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Aquisição Semanal"
            subtitle="Novos signups por semana"
          >
            <DemoLineChart height={200} lines={1} />
          </ChartCard>

          <ChartCard
            title="Canais de Aquisição"
            subtitle="Origem dos usuários"
          >
            <DemoBarChart height={200} bars={5} />
          </ChartCard>

          <ChartCard
            title="Mapa de Retenção"
            subtitle="Cohort retention heatmap"
          >
            <DemoHeatmap rows={5} cols={8} />
          </ChartCard>
        </div>
      </Section>

      {/* Row 4 - Produto */}
      <Section title="Métricas de Produto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Features Mais Usadas"
            subtitle="Uso por funcionalidade"
          >
            <DemoBarChart height={200} bars={6} horizontal />
          </ChartCard>

          <ChartCard
            title="Engajamento Diário"
            subtitle="DAU ao longo do tempo"
          >
            <DemoLineChart height={200} lines={2} />
          </ChartCard>

          <ChartCard
            title="Health Score"
            subtitle="Por segmento de cliente"
          >
            <DemoPieChart height={200} donut />
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
          >
            <DemoAreaChart height={220} />
          </ChartCard>

          <ChartCard
            title="Unit Economics por Cohort"
            subtitle="LTV, CAC, Payback por coorte"
          >
            <DemoBarChart height={220} bars={6} />
          </ChartCard>
        </div>
      </Section>
    </div>
  );
}
