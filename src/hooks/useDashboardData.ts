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

// Executive hooks
export function useExecutiveKpis(orgId: string) {
  return useQuery({
    queryKey: ['executive-kpis', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_dashboard_kpis_30d_v3')
        .select('*')
        .eq('org_id', orgId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ExecutiveKpis | null;
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
        .select('*')
        .eq('org_id', orgId);
      
      if (error) throw error;
      return (data || []) as ConversationHeatmap[];
    },
    enabled: !!orgId,
  });
}

// Traffic hooks
export function useTrafegoKpis(orgId: string, period: '7d' | '30d') {
  return useQuery({
    queryKey: ['trafego-kpis', orgId, period],
    queryFn: async () => {
      const view = period === '7d' ? 'vw_trafego_kpis_7d' : 'vw_trafego_kpis_30d';
      const { data, error } = await supabase
        .from(view)
        .select('*')
        .eq('org_id', orgId)
        .maybeSingle();
      
      if (error) throw error;
      return data as (TrafficKpis7d | TrafficKpis30d) | null;
    },
    enabled: !!orgId,
  });
}

export function useTrafegoDaily(orgId: string) {
  return useQuery({
    queryKey: ['trafego-daily', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_trafego_daily_30d')
        .select('*')
        .eq('org_id', orgId)
        .order('day', { ascending: true });
      
      if (error) throw error;
      return (data || []) as TrafficDaily[];
    },
    enabled: !!orgId,
  });
}

export function useTopAds(orgId: string) {
  return useQuery({
    queryKey: ['top-ads', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_spend_top_ads_30d_v2')
        .select('*')
        .eq('org_id', orgId)
        .order('spend_total', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as TopAd[];
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

// Insights
export function useInsights(orgId: string, scope: string) {
  return useQuery({
    queryKey: ['insights', orgId, scope],
    queryFn: async () => {
      // Primeiro tenta buscar pelo scope específico
      let { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('org_id', orgId)
        .eq('scope', scope)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      // Fallback: busca qualquer insight da org se não encontrar pelo scope
      if (!data && !error) {
        const fallback = await supabase
          .from('ai_insights')
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        data = fallback.data;
        error = fallback.error;
      }
      
      if (error) throw error;
      return data as AIInsight | null;
    },
    enabled: !!orgId,
  });
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
