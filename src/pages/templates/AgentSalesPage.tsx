/**
 * Pinn Agent Sales - Nível 1 (Básico)
 * Dashboard simples e completo para acompanhamento de vendas
 */

import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Target
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';

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
            value={0}
            kpiKey="total_vendas"
            icon={<ShoppingCart className="w-5 h-5" />}
            variant="primary"
          />
          <KpiCard
            title="Receita Total"
            value={0}
            kpiKey="receita_total"
            icon={<DollarSign className="w-5 h-5" />}
            format="currency"
            variant="success"
          />
          <KpiCard
            title="Ticket Médio"
            value={0}
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
        isEmpty={true}
      >
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Target className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">Conecte uma fonte de dados para visualizar</p>
        </div>
      </ChartCard>
    </div>
  );
}
