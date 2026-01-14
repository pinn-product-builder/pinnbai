import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ValidationResult {
  source: string;
  label: string;
  value: number;
  expected?: number;
  status: 'ok' | 'warning' | 'error';
  note?: string;
}

export function useDataValidation(orgId: string) {
  return useQuery({
    queryKey: ['data-validation', orgId],
    queryFn: async () => {
      const results: ValidationResult[] = [];
      
      // 1. Contar leads reais na tabela leads_v2
      const { count: leadsCount } = await supabase
        .from('leads_v2')
        .select('*', { count: 'exact', head: true });
      
      results.push({
        source: 'leads_v2',
        label: 'Total de Leads (tabela real)',
        value: leadsCount || 0,
        status: 'ok',
        note: 'Contagem direta da tabela leads_v2'
      });
      
      // 2. Verificar view do funil
      const { data: funnelData } = await supabase
        .from('vw_funnel_current_v3')
        .select('stage_name, leads_total');
      
      const funnelTotal = funnelData?.reduce((sum, row) => sum + (Number(row.leads_total) || 0), 0) || 0;
      
      results.push({
        source: 'vw_funnel_current_v3',
        label: 'Total no Funil (soma de estágios)',
        value: funnelTotal,
        expected: leadsCount || 0,
        status: funnelTotal === (leadsCount || 0) ? 'ok' : Math.abs(funnelTotal - (leadsCount || 0)) < 5 ? 'warning' : 'error',
        note: funnelData ? `${funnelData.length} estágios` : 'Sem dados'
      });
      
      // 3. Verificar view de custos/funil (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      const { data: custoData } = await supabase
        .from('vw_afonsina_custos_funil_dia')
        .select('dia, custo_total, leads_total, entrada_total, reuniao_agendada_total')
        .gte('dia', startDate);
      
      const custoLeadsTotal = custoData?.reduce((sum, row) => sum + (Number(row.leads_total) || 0), 0) || 0;
      const custoTotal = custoData?.reduce((sum, row) => sum + (Number(row.custo_total) || 0), 0) || 0;
      const reunioesTotal = custoData?.reduce((sum, row) => sum + (Number(row.reuniao_agendada_total) || 0), 0) || 0;
      
      results.push({
        source: 'vw_afonsina_custos_funil_dia',
        label: 'Leads nos últimos 30d (view custos)',
        value: custoLeadsTotal,
        status: 'ok',
        note: `${custoData?.length || 0} dias com dados`
      });
      
      results.push({
        source: 'vw_afonsina_custos_funil_dia',
        label: 'Investimento Total (30d)',
        value: custoTotal,
        status: 'ok',
        note: `R$ ${custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      });
      
      // 4. Verificar KPIs da view principal
      const { data: kpisData } = await supabase
        .from('vw_dashboard_kpis_30d_v3')
        .select('*')
        .eq('org_id', orgId)
        .maybeSingle();
      
      if (kpisData) {
        results.push({
          source: 'vw_dashboard_kpis_30d_v3',
          label: 'Mensagens 30d (view KPIs)',
          value: kpisData.msg_in_30d || 0,
          status: 'ok',
        });
      }
      
      // 5. Verificar reuniões agendadas
      const { count: meetingsCount } = await supabase
        .from('vw_calendar_events_current_v3')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .neq('status', 'cancelled');
      
      results.push({
        source: 'vw_calendar_events_current_v3',
        label: 'Reuniões Ativas',
        value: meetingsCount || 0,
        expected: reunioesTotal,
        status: 'ok',
        note: 'Reuniões não canceladas'
      });
      
      // Calcular CPL real
      const cplReal = custoLeadsTotal > 0 ? custoTotal / custoLeadsTotal : 0;
      results.push({
        source: 'Calculado',
        label: 'CPL Calculado (30d)',
        value: cplReal,
        status: 'ok',
        note: `R$ ${cplReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      });
      
      return results;
    },
    enabled: !!orgId,
  });
}

interface DataValidationPanelProps {
  orgId: string;
}

export function DataValidationPanel({ orgId }: DataValidationPanelProps) {
  const { data: results, isLoading, refetch, isFetching } = useDataValidation(orgId);
  
  const getStatusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };
  
  const getStatusBadge = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <Badge variant="default" className="bg-green-500/20 text-green-700">OK</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500/20 text-yellow-700">Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive">Divergência</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Validação de Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  const hasIssues = results?.some(r => r.status !== 'ok');
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Validação de Dados</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Comparação entre tabelas reais e views calculadas
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {hasIssues && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Foram encontradas divergências. As views podem precisar ser atualizadas.
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          {results?.map((result, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <p className="font-medium text-sm">{result.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Fonte: {result.source}
                    {result.note && ` • ${result.note}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold">
                  {typeof result.value === 'number' && result.value % 1 !== 0 
                    ? result.value.toFixed(2) 
                    : result.value.toLocaleString('pt-BR')}
                </span>
                {result.expected !== undefined && result.expected !== result.value && (
                  <span className="text-xs text-muted-foreground">
                    (esperado: {result.expected.toLocaleString('pt-BR')})
                  </span>
                )}
                {getStatusBadge(result.status)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Se houver divergências significativas, verifique se as views materialized precisam ser refreshed no Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
