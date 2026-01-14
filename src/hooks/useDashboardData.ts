import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import type {
  ExecutiveKpis,
  ExecutiveDaily,
  FunnelStage,
  Meeting,
  ConversationKpis7d,
  ConversationKpis30d,
  ConversationDaily,
  ConversationByHour,
  ConversationHeatmap,
  TrafficKpis7d,
  TrafficKpis30d,
  TrafficDaily,
  TopAd,
  CallsKpis7d,
  CallsKpis30d,
  CallsDaily,
  CallEvent,
  MappingCoverage,
  UnmappedCandidate,
  IngestionRun,
  AIInsight,
  KpiDefinition,
} from '@/types/dashboard';

// ===== HOOK COMPARTILHADO DE INVESTIMENTO =====
// Fonte única de verdade para cálculo de investimento (tabela trafego)
export function useInvestimento(orgId: string, period: '7d' | '30d' | '60d' = '30d') {
  return useQuery({
    queryKey: ['investimento', orgId, period],
    queryFn: async () => {
      const daysMap = { '7d': 7, '30d': 30, '60d': 60 };
      const days = daysMap[period];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('trafego')
        .select('data,custo')
        .eq('org_id', orgId)
        .gte('data', cutoffStr);
      
      if (error) throw error;
      
      // Agregar por dia
      const byDay: Record<string, number> = {};
      let total = 0;
      
      (data || []).forEach(row => {
        const day = row.data;
        const custo = Number(row.custo) || 0;
        byDay[day] = (byDay[day] || 0) + custo;
        total += custo;
      });
      
      return { total, byDay };
    },
    enabled: !!orgId,
  });
}

// Org options
export function useOrgOptions() {
  return useQuery({
    queryKey: ['org-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_kpis_30d_v3')
        .select('org_id');
      
      if (error) throw error;
      
      const uniqueOrgs = [...new Set(data?.map(d => d.org_id) || [])];
      return uniqueOrgs.filter(Boolean);
    },
  });
}

// Executive hooks - Integrado com investimento real
export function useExecutiveKpis(orgId: string) {
  return useQuery({
    queryKey: ['executive-kpis', orgId],
    queryFn: async () => {
      // Buscar KPIs da view
      const { data: kpiData, error: kpiError } = await supabase
        .from('vw_dashboard_kpis_30d_v3')
        .select('*')
        .eq('org_id', orgId)
        .maybeSingle();
      
      if (kpiError) throw kpiError;
      
      // Buscar investimento real da tabela trafego (30d)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      
      const { data: trafegoData, error: trafegoError } = await supabase
        .from('trafego')
        .select('custo')
        .eq('org_id', orgId)
        .gte('data', cutoffStr);
      
      if (trafegoError) throw trafegoError;
      
      // Calcular investimento real
      const spend_30d = (trafegoData || []).reduce((sum, row) => sum + (Number(row.custo) || 0), 0);
      const leads = kpiData?.leads_total_30d || 0;
      const meetings = kpiData?.meetings_scheduled_30d || 0;
      
      // Recalcular CPL e custo por reunião com investimento real
      const cpl_30d = leads > 0 ? spend_30d / leads : 0;
      const cpm_meeting_30d = meetings > 0 ? spend_30d / meetings : 0;
      
      return {
        ...kpiData,
        spend_30d,
        cpl_30d,
        cpm_meeting_30d,
      } as ExecutiveKpis;
    },
    enabled: !!orgId,
  });
}

export function useExecutiveDaily(orgId: string) {
  return useQuery({
    queryKey: ['executive-daily', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_daily_60d_v3')
        .select('day,leads_new,msg_in,spend,meetings_scheduled')
        .eq('org_id', orgId)
        .order('day', { ascending: true });
      
      if (error) throw error;
      return (data || []) as ExecutiveDaily[];
    },
    enabled: !!orgId,
  });
}

export function useFunnelCurrent(orgId: string) {
  return useQuery({
    queryKey: ['funnel-current', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_funnel_current_v3')
        .select('stage_rank,stage_name,leads_total')
        .order('stage_rank', { ascending: true });
      
      if (error) throw error;
      
      // Mapear para o formato esperado
      return (data || []).map(row => ({
        org_id: orgId,
        stage_key: row.stage_name?.toLowerCase().replace(/\s+/g, '_') || '',
        stage_name: row.stage_name || '',
        stage_order: row.stage_rank || 0,
        stage_group: 'pipeline',
        leads: row.leads_total || 0,
      })) as FunnelStage[];
    },
    enabled: !!orgId,
  });
}

export function useMeetingsUpcoming(orgId: string) {
  return useQuery({
    queryKey: ['meetings-upcoming', orgId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('vw_calendar_events_current_v3')
        .select('*')
        .eq('org_id', orgId)
        .neq('status', 'cancelled')
        .not('meeting_url', 'is', null)
        .gte('start_at', today)
        .order('start_at', { ascending: true })
        .limit(50);
      
      if (error) throw error;
      return (data || []) as Meeting[];
    },
    enabled: !!orgId,
  });
}

// Conversations hooks
export function useConversationsKpis(orgId: string, period: '7d' | '30d') {
  return useQuery({
    queryKey: ['conversations-kpis', orgId, period],
    queryFn: async () => {
      const view = period === '7d' ? 'vw_agente_kpis_7d' : 'vw_agente_kpis_30d';
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .eq('org_id', orgId)
        .maybeSingle();
      
      if (error) throw error;
      return data as (ConversationKpis7d | ConversationKpis30d) | null;
    },
    enabled: !!orgId,
  });
}

export function useConversationsDaily(orgId: string) {
  return useQuery({
    queryKey: ['conversations-daily', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_kommo_msg_in_daily_60d_v3')
        .select('*')
        .eq('org_id', orgId)
        .order('day', { ascending: true });
      
      if (error) throw error;
      return (data || []) as ConversationDaily[];
    },
    enabled: !!orgId,
  });
}

export function useConversationsByHour(orgId: string) {
  return useQuery({
    queryKey: ['conversations-by-hour', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_kommo_msg_in_by_hour_7d_v3')
        .select('hour,msg_in_total')
        .eq('org_id', orgId)
        .order('hour', { ascending: true });
      
      if (error) throw error;
      
      // Mapear para o formato esperado
      return (data || []).map(row => ({
        hour: row.hour,
        msg_in_total: row.msg_in_total || 0,
      })) as ConversationByHour[];
    },
    enabled: !!orgId,
  });
}

export function useConversationsHeatmap(orgId: string) {
  return useQuery({
    queryKey: ['conversations-heatmap', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_kommo_msg_in_heatmap_30d_v3')
        .select('dow,hour,msg_in_total')
        .eq('org_id', orgId);
      
      if (error) throw error;
      
      // Mapear para o formato esperado pelo HeatmapChart
      return (data || []).map(row => ({
        dow: row.dow,
        hour: row.hour,
        msg_in_total: row.msg_in_total || 0,
      })) as ConversationHeatmap[];
    },
    enabled: !!orgId,
  });
}

// Traffic hooks - Calcula KPIs diretamente da tabela trafego e view
export function useTrafegoKpis(orgId: string, period: '7d' | '30d') {
  return useQuery({
    queryKey: ['trafego-kpis', orgId, period],
    queryFn: async () => {
      // Calcular a data de corte baseado no período
      const daysToInclude = period === '7d' ? 7 : 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      
      // Buscar investimento diretamente da tabela trafego (fonte primária de gastos)
      const { data: trafegoData, error: trafegoError } = await supabase
        .from('trafego')
        .select('data,custo')
        .eq('org_id', orgId)
        .gte('data', cutoffStr);
      
      if (trafegoError) throw trafegoError;
      
      // Buscar leads e reuniões da view (que tem esses dados agregados)
      const { data: viewData, error: viewError } = await supabase
        .from('vw_trafego_daily_30d')
        .select('day,leads,meetings_booked')
        .eq('org_id', orgId)
        .gte('day', cutoffStr);
      
      if (viewError) throw viewError;
      
      // Somar investimento da tabela trafego
      const spend_total = (trafegoData || []).reduce((sum, row) => {
        return sum + (Number(row.custo) || 0);
      }, 0);
      
      // Somar leads e reuniões da view
      const viewTotals = (viewData || []).reduce((acc, row) => {
        acc.leads += Number(row.leads) || 0;
        acc.meetings_booked += Number(row.meetings_booked) || 0;
        return acc;
      }, { leads: 0, meetings_booked: 0 });
      
      // Calcular CPL e Custo por Reunião
      const cpl = viewTotals.leads > 0 ? spend_total / viewTotals.leads : 0;
      const cpMeeting = viewTotals.meetings_booked > 0 ? spend_total / viewTotals.meetings_booked : 0;
      
      if (period === '7d') {
        return {
          spend_total_7d: spend_total,
          leads_7d: viewTotals.leads,
          cpl_7d: cpl,
          meetings_booked_7d: viewTotals.meetings_booked,
          cp_meeting_booked_7d: cpMeeting,
        } as TrafficKpis7d;
      } else {
        return {
          spend_total_30d: spend_total,
          leads_30d: viewTotals.leads,
          cpl_30d: cpl,
          meetings_booked_30d: viewTotals.meetings_booked,
          cp_meeting_booked_30d: cpMeeting,
        } as TrafficKpis30d;
      }
    },
    enabled: !!orgId,
  });
}

export function useTrafegoDaily(orgId: string) {
  return useQuery({
    queryKey: ['trafego-daily', orgId],
    queryFn: async () => {
      // Buscar dados da tabela trafego (fonte primária de gastos) nos últimos 30 dias
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      
      const { data: trafegoData, error: trafegoError } = await supabase
        .from('trafego')
        .select('data,custo')
        .eq('org_id', orgId)
        .gte('data', cutoffStr)
        .order('data', { ascending: true });
      
      if (trafegoError) throw trafegoError;
      
      // Buscar dados da view para leads e reuniões
      const { data: viewData, error: viewError } = await supabase
        .from('vw_trafego_daily_30d')
        .select('day,leads,meetings_booked')
        .eq('org_id', orgId)
        .order('day', { ascending: true });
      
      if (viewError) throw viewError;
      
      // Agregar gastos por dia da tabela trafego
      const spendByDay: Record<string, number> = {};
      (trafegoData || []).forEach(row => {
        const day = row.data;
        if (!spendByDay[day]) {
          spendByDay[day] = 0;
        }
        spendByDay[day] += Number(row.custo) || 0;
      });
      
      // Criar mapa de dados da view
      const viewByDay: Record<string, { leads: number; meetings_booked: number }> = {};
      (viewData || []).forEach(row => {
        viewByDay[row.day] = {
          leads: Number(row.leads) || 0,
          meetings_booked: Number(row.meetings_booked) || 0,
        };
      });
      
      // Combinar todos os dias únicos
      const allDays = [...new Set([...Object.keys(spendByDay), ...Object.keys(viewByDay)])].sort();
      
      // Mapear para o formato esperado
      return allDays.map(day => {
        const spend = spendByDay[day] || 0;
        const view = viewByDay[day] || { leads: 0, meetings_booked: 0 };
        const cpl = view.leads > 0 ? spend / view.leads : 0;
        const cpMeeting = view.meetings_booked > 0 ? spend / view.meetings_booked : 0;
        
        return {
          org_id: orgId,
          day,
          spend_total: spend,
          leads: view.leads,
          cpl,
          meetings_booked: view.meetings_booked,
          cp_meeting_booked: cpMeeting,
        };
      }) as TrafficDaily[];
    },
    enabled: !!orgId,
  });
}

export function useTopAds(orgId: string) {
  return useQuery({
    queryKey: ['top-ads', orgId],
    queryFn: async () => {
      // Buscar dados da tabela trafego e agregar por anúncio
      const { data, error } = await supabase
        .from('trafego')
        .select('anuncio,custo')
        .eq('org_id', orgId);
      
      if (error) throw error;
      
      // Agregar por nome do anúncio
      const adTotals = (data || []).reduce((acc, row) => {
        const adName = row.anuncio || 'Sem nome';
        if (!acc[adName]) {
          acc[adName] = 0;
        }
        acc[adName] += Number(row.custo) || 0;
        return acc;
      }, {} as Record<string, number>);
      
      // Converter para array e ordenar
      const topAds = Object.entries(adTotals)
        .map(([ad_name, spend_total]) => ({
          org_id: orgId,
          ad_name,
          spend_total,
        }))
        .sort((a, b) => b.spend_total - a.spend_total)
        .slice(0, 10);
      
      return topAds as TopAd[];
    },
    enabled: !!orgId,
  });
}

// VAPI hooks - usando tabela vapi_calls diretamente
export function useCallsKpis(orgId: string, period: '7d' | '30d') {
  return useQuery({
    queryKey: ['calls-kpis', orgId, period],
    queryFn: async () => {
      // Buscar total de ligações (sem filtro de data por enquanto para debug)
      const { count, error } = await supabase
        .from('vapi_calls')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      
      return {
        [`calls_total_${period}`]: count || 0,
      };
    },
    enabled: !!orgId,
  });
}

export function useCallsDaily(orgId: string) {
  return useQuery({
    queryKey: ['calls-daily', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v3_calls_by_assistant_daily_v3')
        .select('day, calls_done, calls_answered, total_minutes')
        .order('day', { ascending: true });
      
      if (error) throw error;
      
      // Agregar por dia (pode ter múltiplos assistentes)
      const aggregated = (data || []).reduce((acc, row) => {
        const existing = acc.find(a => a.day === row.day);
        if (existing) {
          existing.calls_done += row.calls_done || 0;
          existing.calls_answered += row.calls_answered || 0;
          existing.total_minutes += row.total_minutes || 0;
        } else {
          acc.push({
            day: row.day,
            calls_done: row.calls_done || 0,
            calls_answered: row.calls_answered || 0,
            total_minutes: row.total_minutes || 0,
          });
        }
        return acc;
      }, [] as Array<{ day: string; calls_done: number; calls_answered: number; total_minutes: number }>);
      
      return aggregated;
    },
    enabled: !!orgId,
  });
}

export function useCallsLast50(orgId: string) {
  return useQuery({
    queryKey: ['calls-last-50', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vapi_calls')
        .select('*')
        .limit(50);
      
      if (error) throw error;
      
      // Mapear para o formato esperado
      return (data || []).map((call: any) => ({
        org_id: call.org_id || '',
        event_ts: call.started_at || call.created_at || new Date().toISOString(),
        event_type: call.ended_reason || call.status || 'call',
        actor: call.assistant_id?.slice(0, 8) || 'assistant',
        lead_id: call.customer_number || '',
        payload: {
          direction: call.direction,
          duration_seconds: call.duration_seconds,
          cost: call.cost,
        },
      })) as CallEvent[];
    },
    enabled: !!orgId,
  });
}

// Admin hooks
export function useMappingCoverage(orgId: string) {
  return useQuery({
    queryKey: ['mapping-coverage', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_funnel_mapping_coverage')
        .select('*')
        .eq('org_id', orgId);
      
      if (error) throw error;
      return (data || []) as MappingCoverage[];
    },
    enabled: !!orgId,
  });
}

export function useUnmappedCandidates(orgId: string) {
  return useQuery({
    queryKey: ['unmapped-candidates', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_funnel_unmapped_candidates')
        .select('*')
        .eq('org_id', orgId)
        .order('hits', { ascending: false });
      
      if (error) throw error;
      return (data || []) as UnmappedCandidate[];
    },
    enabled: !!orgId,
  });
}

export function useIngestionRuns(orgId: string) {
  return useQuery({
    queryKey: ['ingestion-runs', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingestion_runs')
        .select('*')
        .eq('org_id', orgId)
        .order('started_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as IngestionRun[];
    },
    enabled: !!orgId,
  });
}

// Insights - busca por scope exato ou qualquer insight disponível
export function useInsights(orgId: string, scope: string) {
  return useQuery({
    queryKey: ['insights', orgId, scope],
    queryFn: async () => {
      // Mapear scopes possíveis (inglês/português)
      const scopeVariants = [scope];
      if (scope === 'executive') scopeVariants.push('executivo');
      if (scope === 'executivo') scopeVariants.push('executive');
      if (scope === 'conversas') scopeVariants.push('conversations');
      if (scope === 'trafego') scopeVariants.push('traffic');
      if (scope === 'vapi') scopeVariants.push('calls');
      
      // Tentar buscar pelo scope específico primeiro
      let { data, error } = await supabase
        .from('ai_insights')
        .select('payload,created_at,scope')
        .eq('org_id', orgId)
        .in('scope', scopeVariants)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // Se não encontrar pelo scope específico, buscar qualquer insight da org
      if (!data) {
        const { data: anyData, error: anyError } = await supabase
          .from('ai_insights')
          .select('payload,created_at,scope')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (anyError) throw anyError;
        data = anyData;
      }
      
      if (data) {
        return {
          org_id: orgId,
          scope: data.scope || scope,
          payload: data.payload,
          created_at: data.created_at,
        } as AIInsight;
      }
      
      return null;
    },
    enabled: !!orgId,
  });
}

// Histórico de insights - todos os insights da org
export function useInsightsHistory(orgId: string, scope?: string, limit: number = 20) {
  return useQuery({
    queryKey: ['insights-history', orgId, scope, limit],
    queryFn: async () => {
      let query = supabase
        .from('ai_insights')
        .select('payload,created_at,scope')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      // Se scope específico, filtrar por variantes
      if (scope) {
        const scopeVariants = [scope];
        if (scope === 'executive') scopeVariants.push('executivo');
        if (scope === 'executivo') scopeVariants.push('executive');
        if (scope === 'conversas') scopeVariants.push('conversations');
        if (scope === 'trafego') scopeVariants.push('traffic');
        if (scope === 'vapi') scopeVariants.push('calls');
        query = query.in('scope', scopeVariants);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        org_id: orgId,
        scope: item.scope,
        payload: item.payload,
        created_at: item.created_at,
      })) as AIInsight[];
    },
    enabled: !!orgId,
  });
}

// Função para gerar insights via edge function
export async function generateInsights(orgId: string, scope: string, windowDays: number = 30) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-insights', {
      body: { org_id: orgId, scope, window_days: windowDays },
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    // Se a função não existir, retorna erro específico
    if (err?.message?.includes('not found') || err?.status === 404) {
      return { success: false, error: 'Função não disponível' };
    }
    return { success: false, error: err?.message || 'Erro ao gerar insights' };
  }
}

// Função para testar ingestão via smart-processor
export async function testIngestion(ingestKey: string) {
  try {
    const { data, error } = await supabase.functions.invoke('smart-processor', {
      body: { ping: true },
      headers: {
        'x-ingest-key': ingestKey,
      },
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    if (err?.message?.includes('not found') || err?.status === 404) {
      return { success: false, error: 'Função não disponível' };
    }
    return { success: false, error: err?.message || 'Erro ao testar ingestão' };
  }
}

// KPI Dictionary
export function useKpiDictionary() {
  return useQuery({
    queryKey: ['kpi-dictionary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_dictionary')
        .select('*');
      
      if (error) throw error;
      
      const dictionary: Record<string, KpiDefinition> = {};
      (data || []).forEach((item: KpiDefinition) => {
        dictionary[item.kpi_key] = item;
      });
      return dictionary;
    },
  });
}
