/**
 * Pinn Agent Sales - Nível 1 (Básico)
 * Dashboard simples e completo para acompanhamento de vendas
 */

import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { DemoLineChart } from '@/components/charts/DemoCharts';

export default function AgentSalesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Pinn Agent Sales"
        description="Dashboard de vendas - Nível 1 (Básico)"
      />

      {/* KPIs - 3 indicadores principais */}
      <Section title="Indicadores Principais">
        <KpiGrid columns={3}>
          <KpiCard
            title="Total de Vendas"
            value={1247}
            kpiKey="total_vendas"
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="Receita Total"
            value={89450}
            kpiKey="receita_total"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="success"
          />
          <KpiCard
            title="Ticket Médio"
            value={71.73}
            kpiKey="ticket_medio"
            icon={<TrendingUp className="w-5 h-5" />}
            format="currency"
          />
        </KpiGrid>
      </Section>

      {/* Gráfico único */}
      <ChartCard
        title="Evolução de Vendas"
        subtitle="Acompanhamento diário de vendas"
      >
        <DemoLineChart height={280} lines={1} />
      </ChartCard>
    </div>
  );
}
