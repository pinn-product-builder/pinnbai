import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  Clock,
  Award,
  AlertTriangle,
  BarChart3,
  Users,
  Percent
} from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { useFunnelCurrent } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';

// Componente de diagnóstico quando não há dados de CRM
function CrmDiagnosticCard() {
  return (
    <div className="glass-card p-6 border-warning/30">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-warning/15">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text-1 mb-2">Qualidade do CRM</h3>
          <div className="space-y-3 text-sm text-text-2">
            <p>Para habilitar métricas de Vendas, é necessário:</p>
            <ul className="list-disc list-inside space-y-1 text-text-3">
              <li>Preencher o campo <strong>valor</strong> nos leads/negócios</li>
              <li>Atualizar o <strong>status</strong> (ganho/perdido) ao finalizar negociações</li>
              <li>Registrar a <strong>data de fechamento</strong> das vendas</li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-bg-2 border border-border">
              <p className="text-xs text-text-3">
                <strong>Nota:</strong> Atualmente não há view de vendas configurada no banco de dados. 
                Os dados serão exibidos quando a integração com o CRM incluir informações de valor e status.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de KPI placeholder
function PlaceholderKpiCard({ 
  title, 
  icon, 
  tooltip 
}: { 
  title: string; 
  icon: React.ReactNode; 
  tooltip?: string;
}) {
  return (
    <div className="glass-card p-5 relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 text-text-3">{icon}</span>
          <span className="text-sm font-medium text-text-2">{title}</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-text-3">—</span>
      </div>
      {tooltip && (
        <p className="text-xs text-text-3 mt-2 opacity-70">{tooltip}</p>
      )}
    </div>
  );
}

// Tabela placeholder de últimos resultados
function PlaceholderResultsTable() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left text-xs font-medium text-text-3 py-3 px-2">Data</th>
              <th className="text-left text-xs font-medium text-text-3 py-3 px-2">Lead</th>
              <th className="text-left text-xs font-medium text-text-3 py-3 px-2">Status</th>
              <th className="text-right text-xs font-medium text-text-3 py-3 px-2">Valor</th>
              <th className="text-left text-xs font-medium text-text-3 py-3 px-2">Etapa</th>
              <th className="text-left text-xs font-medium text-text-3 py-3 px-2">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-border/10">
                <td className="py-3 px-2 text-sm text-text-3">—</td>
                <td className="py-3 px-2 text-sm text-text-3">—</td>
                <td className="py-3 px-2 text-sm text-text-3">—</td>
                <td className="py-3 px-2 text-sm text-text-3 text-right">—</td>
                <td className="py-3 px-2 text-sm text-text-3">—</td>
                <td className="py-3 px-2 text-sm text-text-3">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-text-3 text-center py-4">
        Dados de vendas não disponíveis. Preencha os campos de valor e status no CRM.
      </p>
    </div>
  );
}

export default function VendasPage() {
  const { filters } = useGlobalFilters();
  const orgId = filters.orgId;
  
  // Usar o funil existente como base para o funil de vendas
  const { data: funnel, isLoading: funnelLoading } = useFunnelCurrent(orgId);

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Selecione uma organização</h2>
        <p className="text-sm">Use o filtro acima para selecionar uma org e visualizar os dados</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Vendas"
        description="Acompanhamento de receita e performance comercial"
      />

      {/* Diagnóstico de CRM */}
      <CrmDiagnosticCard />

      {/* KPIs Principais - Placeholders */}
      <Section title="Indicadores de Vendas">
        <KpiGrid columns={5}>
          <PlaceholderKpiCard
            title="Faturamento Total"
            icon={<DollarSign className="w-5 h-5" />}
            tooltip="Em validação - aguardando dados de valor no CRM"
          />
          <PlaceholderKpiCard
            title="Negócios Ganhos"
            icon={<Award className="w-5 h-5" />}
            tooltip="Em validação - aguardando status ganho/perdido"
          />
          <PlaceholderKpiCard
            title="Taxa de Ganho"
            icon={<Percent className="w-5 h-5" />}
            tooltip="Em validação - (Ganhos ÷ Total) × 100"
          />
          <PlaceholderKpiCard
            title="Ticket Médio"
            icon={<TrendingUp className="w-5 h-5" />}
            tooltip="Em validação - Faturamento ÷ Negócios"
          />
          <PlaceholderKpiCard
            title="Tempo Médio (dias)"
            icon={<Clock className="w-5 h-5" />}
            tooltip="Em validação - Média de dias até fechamento"
          />
        </KpiGrid>
      </Section>

      {/* Funil e Tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Funil de Vendas"
          subtitle="Distribuição atual por etapa do pipeline"
          isLoading={funnelLoading}
          isEmpty={!funnel?.length}
        >
          {funnel && funnel.length > 0 ? (
            <FunnelChart data={funnel} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-text-3">
              <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Dados do funil não disponíveis</p>
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Últimos Resultados"
          subtitle="Negociações recentes"
        >
          <PlaceholderResultsTable />
        </ChartCard>
      </div>

      {/* Nota informativa */}
      <div className="glass-card p-4 border-info/30 bg-info/5">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-info" />
          <p className="text-sm text-text-2">
            <strong>Dica:</strong> Para ativar os relatórios de vendas, configure os campos de valor monetário 
            e status (ganho/perdido) no seu CRM. Os dados serão sincronizados automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}