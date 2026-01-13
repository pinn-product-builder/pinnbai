import React from 'react';
import { 
  Settings, 
  Target, 
  CheckCircle2, 
  AlertTriangle,
  Database,
  Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { KpiCard, KpiGrid } from '@/components/dashboard/KpiCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import {
  useMappingCoverage,
  useUnmappedCandidates,
  useIngestionRuns,
} from '@/hooks/useDashboardData';
import type { MappingCoverage, UnmappedCandidate, IngestionRun } from '@/types/dashboard';

function CoverageCard({ data, isLoading }: { data: MappingCoverage[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <CheckCircle2 className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm">Sem dados de cobertura</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{item.source}</span>
            <span className="text-muted-foreground">
              {item.mapped}/{item.total} ({(item.coverage_pct * 100).toFixed(1)}%)
            </span>
          </div>
          <Progress 
            value={item.coverage_pct * 100} 
            className="h-2"
          />
        </div>
      ))}
    </div>
  );
}

function UnmappedTable({ data, isLoading }: { data: UnmappedCandidate[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/10">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <CheckCircle2 className="w-10 h-10 mb-2 opacity-50 text-success" />
        <p className="text-sm">Nenhum candidato não mapeado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Fonte</th>
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Pipeline</th>
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Status</th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Hits</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={index}
              className="border-b border-border/10 hover:bg-muted/5 transition-colors"
            >
              <td className="py-3 px-2 text-sm">{item.source}</td>
              <td className="py-3 px-2 text-sm text-muted-foreground">{item.raw_pipeline}</td>
              <td className="py-3 px-2 text-sm text-muted-foreground">{item.raw_status}</td>
              <td className="py-3 px-2 text-sm text-right font-medium text-warning">
                {item.hits.toLocaleString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IngestionTable({ data, isLoading }: { data: IngestionRun[]; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/10">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <Database className="w-10 h-10 mb-2 opacity-50" />
        <p className="text-sm">Nenhum log de ingestão</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      'success': { label: 'Sucesso', variant: 'default' },
      'running': { label: 'Executando', variant: 'secondary' },
      'failed': { label: 'Falhou', variant: 'destructive' },
    };
    const { label, variant } = statusMap[status.toLowerCase()] || { label: status, variant: 'secondary' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/30">
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Início</th>
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Status</th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-2">Linhas</th>
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">Erro</th>
          </tr>
        </thead>
        <tbody>
          {data.map((run, index) => (
            <tr 
              key={index}
              className="border-b border-border/10 hover:bg-muted/5 transition-colors"
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  {format(parseISO(run.started_at), "dd/MM HH:mm", { locale: ptBR })}
                </div>
              </td>
              <td className="py-3 px-2">{getStatusBadge(run.status)}</td>
              <td className="py-3 px-2 text-sm text-right font-medium">
                {run.rows_ingested.toLocaleString('pt-BR')}
              </td>
              <td className="py-3 px-2 text-sm text-destructive truncate max-w-32">
                {run.error || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const { filters } = useGlobalFilters();
  const orgId = filters.orgId;

  const { data: coverage, isLoading: coverageLoading } = useMappingCoverage(orgId);
  const { data: unmapped, isLoading: unmappedLoading } = useUnmappedCandidates(orgId);
  const { data: ingestions, isLoading: ingestionsLoading, error: ingestionsError } = useIngestionRuns(orgId);

  if (!orgId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
        <Target className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold mb-2">Selecione uma organização</h2>
        <p className="text-sm">Use o filtro acima para selecionar uma org e visualizar os dados</p>
      </div>
    );
  }

  // Calculate summary stats
  const totalMapped = coverage?.reduce((sum, c) => sum + c.mapped, 0) || 0;
  const totalTotal = coverage?.reduce((sum, c) => sum + c.total, 0) || 0;
  const overallCoverage = totalTotal > 0 ? (totalMapped / totalTotal) : 0;
  const totalUnmapped = unmapped?.length || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Administração"
        description="Governança de dados e mapeamentos"
      />

      {/* KPIs */}
      <Section title="Visão Geral">
        <KpiGrid columns={3}>
          <KpiCard
            title="Cobertura de Mapeamento"
            value={overallCoverage}
            icon={<CheckCircle2 className="w-5 h-5" />}
            format="percent"
            variant={overallCoverage > 0.8 ? 'success' : overallCoverage > 0.5 ? 'warning' : 'destructive'}
            isLoading={coverageLoading}
          />
          <KpiCard
            title="Total Mapeados"
            value={totalMapped}
            icon={<Database className="w-5 h-5" />}
            variant="primary"
            isLoading={coverageLoading}
          />
          <KpiCard
            title="Candidatos Não Mapeados"
            value={totalUnmapped}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant={totalUnmapped > 0 ? 'warning' : 'success'}
            isLoading={unmappedLoading}
          />
        </KpiGrid>
      </Section>

      {/* Coverage and Unmapped */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Cobertura por Fonte"
          subtitle="Percentual de mapeamento por fonte de dados"
          isLoading={coverageLoading}
          isEmpty={!coverage?.length}
        >
          <CoverageCard data={coverage || []} />
        </ChartCard>

        <ChartCard
          title="Candidatos Não Mapeados"
          subtitle="Pipelines/Status que precisam de mapeamento"
          isLoading={unmappedLoading}
          isEmpty={!unmapped?.length}
        >
          <div className="max-h-[300px] overflow-y-auto">
            <UnmappedTable data={unmapped || []} />
          </div>
        </ChartCard>
      </div>

      {/* Ingestion Logs */}
      {!ingestionsError && (
        <ChartCard
          title="Logs de Ingestão"
          subtitle="Histórico de execuções de ingestão de dados"
          isLoading={ingestionsLoading}
          isEmpty={!ingestions?.length}
        >
          <div className="max-h-[300px] overflow-y-auto">
            <IngestionTable data={ingestions || []} />
          </div>
        </ChartCard>
      )}
    </div>
  );
}
