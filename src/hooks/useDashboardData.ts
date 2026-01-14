import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import {
  DEFAULT_DAILY_RANGE_DAYS,
  QUERY_LIMITS,
} from '@/lib/config';
import {
  SUPABASE_VIEWS,
  SUPABASE_TABLES,
  SUPABASE_RPC,
  SUPABASE_EDGE_FUNCTIONS,
} from '@/lib/supabaseViews';
import {
  getPeriodDays,
  getDateRange,
  getPreviousPeriodRange,
  getCutoffDate,
  getTodayString,
  calculatePercentageChange,
} from '@/lib/dateHelpers';
import {
  calculateCPL,
  calculateCostPerMeeting,
  calculateConversionRate,
  calculateTaxaEntrada,
  calculateTaxaAtendimento,
  aggregateFunnelData,
  aggregateCallsData,
  aggregateByDay,
} from '@/lib/calculations';
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
      const days = getPeriodDays(period);
      const { dateStr } = getCutoffDate(days);
      
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.TRAFEGO)
        .select('data,custo')
        .eq('org_id', orgId)
        .gte('data', dateStr);
      
      if (error) throw error;
      
      const result = aggregateByDay(data || [], 'data', 'custo');
      return { total: result.total, byDay: result.byDay };
    },
    enabled: !!orgId,
  });
}

// Hook para contar total de leads da tabela leads_v2
export function useLeadsCount() {
  return useQuery({
    queryKey: ['leads-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from(SUPABASE_TABLES.LEADS_V2)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Erro ao contar leads_v2:', error);
        return 0;
      }
      
      return count || 0;
    },
  });
}

// Org options
export function useOrgOptions() {
  return useQuery({
    queryKey: ['org-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.DASHBOARD_KPIS_30D)
        .select('org_id');
      
      if (error) throw error;
      
      const uniqueOrgs = [...new Set(data?.map(d => d.org_id) || [])];
      return uniqueOrgs.filter(Boolean);
    },
  });
}

// Executive hooks - Com suporte a período customizado e comparação
export function useExecutiveKpis(orgId: string, period: '7d' | '14d' | '30d' | '60d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['executive-kpis', orgId, period],
    queryFn: async () => {
      const days = getPeriodDays(period);
      const currentRange = getDateRange(period, days);
      const previousRange = getPreviousPeriodRange(period, days);
      
      // Buscar dados da view para ambos os períodos
      const [funnelResult, kpisResult] = await Promise.all([
        supabase
          .from(SUPABASE_VIEWS.AFONSINA_CUSTOS_FUNIL_DIA)
          .select('dia,custo_total,leads_total,entrada_total,reuniao_agendada_total,reuniao_realizada_total')
          .gte('dia', previousRange.startStr),
        // Buscar msg_in_30d da view de KPIs
        supabase
          .from(SUPABASE_VIEWS.DASHBOARD_KPIS_30D)
          .select('msg_in_30d,meetings_cancelled_30d')
          .eq('org_id', orgId)
          .maybeSingle()
      ]);
      
      if (funnelResult.error) throw funnelResult.error;
      const data = funnelResult.data;
      const kpisData = kpisResult.data;
      
      // Separar dados
      const currentData = (data || []).filter(row => row.dia >= currentRange.startStr);
      const previousData = (data || []).filter(row => 
        row.dia >= previousRange.startStr && row.dia <= previousRange.endStr
      );
      
      // Agregar usando função utilitária
      const current = aggregateFunnelData(currentData);
      const previous = aggregateFunnelData(previousData);
      
      // Calcular métricas derivadas usando funções utilitárias
      const cpl = calculateCPL(current.spend, current.leads);
      const cpm_meeting = calculateCostPerMeeting(current.spend, current.meetings_scheduled);
      const conv_lead_to_meeting = calculateConversionRate(current.meetings_scheduled, current.leads);
      
      const prevCpl = calculateCPL(previous.spend, previous.leads);
      const prevCpmMeeting = calculateCostPerMeeting(previous.spend, previous.meetings_scheduled);
      const prevConvLeadToMeeting = calculateConversionRate(previous.meetings_scheduled, previous.leads);
      
      // Calcular variações usando função utilitária
      const changes = {
        leads: calculatePercentageChange(current.leads, previous.leads),
        spend: calculatePercentageChange(current.spend, previous.spend),
        meetings_scheduled: calculatePercentageChange(current.meetings_scheduled, previous.meetings_scheduled),
        meetings_done: calculatePercentageChange(current.meetings_done, previous.meetings_done),
        cpl: calculatePercentageChange(cpl, prevCpl),
        cpm_meeting: calculatePercentageChange(cpm_meeting, prevCpmMeeting),
        conv_lead_to_meeting: calculatePercentageChange(conv_lead_to_meeting, prevConvLeadToMeeting),
      };
      
      const periodLabel = `vs ${days}d anteriores`;
      
      return {
        org_id: orgId,
        leads_total_30d: current.leads,
        msg_in_30d: kpisData?.msg_in_30d || 0,
        meetings_scheduled_30d: current.meetings_scheduled,
        meetings_done: current.meetings_done,
        meetings_cancelled_30d: kpisData?.meetings_cancelled_30d || 0,
        spend_30d: current.spend,
        cpl_30d: cpl,
        cpm_meeting_30d: cpm_meeting,
        conv_lead_to_meeting_30d: conv_lead_to_meeting,
        conv_lead_to_msg_30d: 0,
        // Comparação
        changes,
        periodLabel,
        periodDays: days,
      } as ExecutiveKpis & { changes: typeof changes; periodLabel: string; periodDays: number; meetings_done: number };
    },
    enabled: !!orgId,
  });
}

export function useExecutiveDaily(orgId: string) {
  return useQuery({
    queryKey: ['executive-daily', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.DASHBOARD_DAILY_60D)
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
        .from(SUPABASE_VIEWS.FUNNEL_CURRENT)
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
      const today = getTodayString();
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.CALENDAR_EVENTS_CURRENT)
        .select('*')
        .eq('org_id', orgId)
        .neq('status', 'cancelled')
        .not('meeting_url', 'is', null)
        .gte('start_at', today)
        .order('start_at', { ascending: true })
        .limit(QUERY_LIMITS.MEETINGS_UPCOMING);
      
      if (error) throw error;
      return (data || []) as Meeting[];
    },
    enabled: !!orgId,
  });
}

// Conversations hooks - Usando vw_dashboard_kpis_30d_v3 como fonte principal
export function useConversationsKpis(orgId: string) {
  return useQuery({
    queryKey: ['conversations-kpis', orgId],
    queryFn: async () => {
      // Usar a mesma view da tela executiva que tem os dados corretos
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.DASHBOARD_KPIS_30D)
        .select('*')
        .eq('org_id', orgId)
        .maybeSingle();
      
      if (error) throw error;
      
      // Retornar todos os dados disponíveis
      return data as {
        org_id: string;
        leads_total_30d: number;
        msg_in_30d: number;
        meetings_scheduled_30d: number;
        meetings_cancelled_30d: number;
        meetings_total_30d: number;
        spend_30d: number;
        cpl_30d: number;
        cpm_meeting_30d: number;
        conv_lead_to_msg_30d: number;
        conv_lead_to_meeting_30d: number;
        conv_msg_to_meeting_30d: number;
      } | null;
    },
    enabled: !!orgId,
  });
}

export function useConversationsDaily(orgId: string) {
  return useQuery({
    queryKey: ['conversations-daily', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.KOMMO_MSG_IN_DAILY_60D)
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
        .from(SUPABASE_VIEWS.KOMMO_MSG_IN_BY_HOUR_7D)
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
        .from(SUPABASE_VIEWS.KOMMO_MSG_IN_HEATMAP_30D)
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

// Traffic hooks - Usa view vw_afonsina_custos_funil_dia para KPIs
// Suporta períodos customizados: 7d, 14d, 30d, 60d, 90d
export function useTrafegoKpis(orgId: string, period: '7d' | '14d' | '30d' | '60d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['trafego-kpis', orgId, period],
    queryFn: async () => {
      const daysToInclude = getPeriodDays(period);
      const currentRange = getDateRange(period, daysToInclude);
      const previousRange = getPreviousPeriodRange(period, daysToInclude);
      
      // Buscar dados de custo, entradas e reuniões da view original
      const { data: funnelData, error: funnelError } = await supabase
        .from(SUPABASE_VIEWS.AFONSINA_CUSTOS_FUNIL_DIA)
        .select('dia,custo_total,entrada_total,reuniao_agendada_total,reuniao_realizada_total')
          .gte('dia', previousRange.startStr);
      
      if (funnelError) throw funnelError;
      
      // Buscar leads da tabela leads_v2 normalizada (com kommo_lead_id para identificar entradas)
      const [leadsCurrentResult, leadsPreviousResult] = await Promise.all([
        supabase
          .from(SUPABASE_TABLES.LEADS_V2)
          .select('id, created_at, kommo_lead_id')
          .eq('org_id', orgId)
          .gte('created_at', currentRange.startStr),
        supabase
          .from(SUPABASE_TABLES.LEADS_V2)
          .select('id, created_at, kommo_lead_id')
          .eq('org_id', orgId)
          .gte('created_at', previousRange.startStr)
          .lt('created_at', currentRange.startStr)
      ]);
      
      // Contar leads e entradas (entrada = tem kommo_lead_id, significa que entrou no chat)
      const currentLeads = leadsCurrentResult.data?.length || 0;
      const currentEntradas = leadsCurrentResult.data?.filter(l => l.kommo_lead_id !== null).length || 0;
      const previousLeads = leadsPreviousResult.data?.length || 0;
      const previousEntradas = leadsPreviousResult.data?.filter(l => l.kommo_lead_id !== null).length || 0;
      
      // Separar dados do período atual e anterior para custos e reuniões
      const currentFunnel = (funnelData || []).filter(row => row.dia >= currentRange.startStr);
      const previousFunnel = (funnelData || []).filter(row => 
        row.dia >= previousRange.startStr && row.dia <= previousRange.endStr
      );
      
      // Agregar usando função utilitária
      const currentAgg = aggregateFunnelData(currentFunnel);
      const previousAgg = aggregateFunnelData(previousFunnel);
      
      // Calcular métricas derivadas usando funções utilitárias
      const cpl = calculateCPL(currentAgg.spend, currentLeads);
      const cpMeeting = calculateCostPerMeeting(currentAgg.spend, currentAgg.meetings_scheduled);
      const taxaEntrada = calculateTaxaEntrada(currentEntradas, currentLeads);
      
      const prevCpl = calculateCPL(previousAgg.spend, previousLeads);
      const prevCpMeeting = calculateCostPerMeeting(previousAgg.spend, previousAgg.meetings_scheduled);
      const prevTaxaEntrada = calculateTaxaEntrada(previousEntradas, previousLeads);
      
      // Calcular variações usando função utilitária
      const changes = {
        spend: calculatePercentageChange(currentAgg.spend, previousAgg.spend),
        leads: calculatePercentageChange(currentLeads, previousLeads),
        entradas: calculatePercentageChange(currentEntradas, previousEntradas),
        cpl: calculatePercentageChange(cpl, prevCpl),
        meetings_booked: calculatePercentageChange(currentAgg.meetings_scheduled, previousAgg.meetings_scheduled),
        meetings_done: calculatePercentageChange(currentAgg.meetings_done, previousAgg.meetings_done),
        cp_meeting: calculatePercentageChange(cpMeeting, prevCpMeeting),
        taxa_entrada: calculatePercentageChange(taxaEntrada, prevTaxaEntrada),
      };
      
      const periodLabel = `vs ${daysToInclude}d anteriores`;
      
      // Retornar valores com nomes genéricos para funcionar com qualquer período
      return {
        spend_total: currentAgg.spend,
        leads: currentLeads,
        entradas: currentEntradas,
        cpl: cpl,
        meetings_booked: currentAgg.meetings_scheduled,
        meetings_done: currentAgg.meetings_done,
        cp_meeting_booked: cpMeeting,
        taxa_entrada: taxaEntrada,
        changes,
        periodLabel,
        periodDays: daysToInclude,
      };
    },
    enabled: !!orgId,
  });
}

// Traffic daily hook - Usa view vw_afonsina_custos_funil_dia
export function useTrafegoDaily(orgId: string) {
  return useQuery({
    queryKey: ['trafego-daily', orgId],
    queryFn: async () => {
      const { dateStr } = getCutoffDate(DEFAULT_DAILY_RANGE_DAYS);
      
      // Nota: coluna é entrada_total (singular), não entradas_total
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.AFONSINA_CUSTOS_FUNIL_DIA)
        .select('dia,custo_total,leads_total,entrada_total,reuniao_agendada_total,reuniao_realizada_total,cpl,custo_por_reuniao_agendada,taxa_entrada')
        .gte('dia', dateStr)
        .order('dia', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(row => ({
        org_id: orgId,
        day: row.dia,
        spend_total: Number(row.custo_total) || 0,
        leads: Number(row.leads_total) || 0,
        entradas: Number(row.entrada_total) || 0,
        meetings_booked: Number(row.reuniao_agendada_total) || 0,
        meetings_done: Number(row.reuniao_realizada_total) || 0,
        cpl: Number(row.cpl) || 0,
        cp_meeting_booked: Number(row.custo_por_reuniao_agendada) || 0,
        taxa_entrada: Number(row.taxa_entrada) || 0,
      })) as TrafficDaily[];
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
        .from(SUPABASE_TABLES.TRAFEGO)
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
          spend_total: Number(spend_total) || 0,
        }))
        .sort((a, b) => b.spend_total - a.spend_total)
        .slice(0, QUERY_LIMITS.TOP_ADS);
      
      return topAds as TopAd[];
    },
    enabled: !!orgId,
  });
}

// VAPI hooks - usando tabela v3_calls_daily_v3
// Suporta períodos customizados: 7d, 14d, 30d, 60d, 90d com comparação
export function useCallsKpis(orgId: string, period: '7d' | '14d' | '30d' | '60d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['calls-kpis', orgId, period],
    queryFn: async () => {
      const days = getPeriodDays(period);
      const currentRange = getDateRange(period, days);
      const previousRange = getPreviousPeriodRange(period, days);
      
      // Buscar dados da tabela v3_calls_daily_v3
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.CALLS_DAILY_V3)
        .select('day,calls_done,calls_answered,total_minutes,avg_minutes,total_spent_usd')
        .gte('day', previousRange.startStr)
        .order('day', { ascending: true });
      
      if (error) throw error;
      
      // Separar dados do período atual e anterior
      const currentData = (data || []).filter(row => row.day >= currentRange.startStr);
      const previousData = (data || []).filter(row => 
        row.day >= previousRange.startStr && row.day <= previousRange.endStr
      );
      
      // Agregar usando função utilitária
      const current = aggregateCallsData(currentData);
      const previous = aggregateCallsData(previousData);
      
      // Calcular métricas derivadas usando funções utilitárias
      const taxaAtendimento = calculateTaxaAtendimento(current.calls_answered, current.calls_done);
      const avgMinutes = current.calls_answered > 0 ? current.total_minutes / current.calls_answered : 0;
      const costPerCall = calculateCostPerMeeting(current.total_spent, current.calls_done);
      
      const prevTaxaAtendimento = calculateTaxaAtendimento(previous.calls_answered, previous.calls_done);
      const prevAvgMinutes = previous.calls_answered > 0 ? previous.total_minutes / previous.calls_answered : 0;
      const prevCostPerCall = calculateCostPerMeeting(previous.total_spent, previous.calls_done);
      
      // Calcular variações usando função utilitária
      const changes = {
        calls_done: calculatePercentageChange(current.calls_done, previous.calls_done),
        calls_answered: calculatePercentageChange(current.calls_answered, previous.calls_answered),
        total_minutes: calculatePercentageChange(current.total_minutes, previous.total_minutes),
        total_spent: calculatePercentageChange(current.total_spent, previous.total_spent),
        taxa_atendimento: calculatePercentageChange(taxaAtendimento, prevTaxaAtendimento),
        avg_minutes: calculatePercentageChange(avgMinutes, prevAvgMinutes),
        cost_per_call: calculatePercentageChange(costPerCall, prevCostPerCall),
      };
      
      const periodLabel = `vs ${days}d anteriores`;
      
      return {
        calls_done: current.calls_done,
        calls_answered: current.calls_answered,
        total_minutes: current.total_minutes,
        total_spent: current.total_spent,
        taxa_atendimento: taxaAtendimento,
        avg_minutes: avgMinutes,
        cost_per_call: costPerCall,
        changes,
        periodLabel,
        periodDays: days,
      };
    },
    enabled: !!orgId,
  });
}

export function useCallsDaily(orgId: string) {
  return useQuery({
    queryKey: ['calls-daily', orgId],
    queryFn: async () => {
      const { dateStr } = getCutoffDate(DEFAULT_DAILY_RANGE_DAYS);
      
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.CALLS_DAILY_V3)
        .select('day,calls_done,calls_answered,total_minutes,avg_minutes,total_spent_usd')
        .gte('day', dateStr)
        .order('day', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(row => ({
        day: row.day,
        calls_done: Number(row.calls_done) || 0,
        calls_answered: Number(row.calls_answered) || 0,
        total_minutes: Number(row.total_minutes) || 0,
        avg_minutes: Number(row.avg_minutes) || 0,
        total_spent_usd: Number(row.total_spent_usd) || 0,
      }));
    },
    enabled: !!orgId,
  });
}

// Hook para buscar motivos de finalização das ligações
export function useCallsEndedReasons(orgId: string, period: '7d' | '14d' | '30d' | '60d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['calls-ended-reasons', orgId, period],
    queryFn: async () => {
      const days = getPeriodDays(period);
      const { dateStr } = getCutoffDate(days);
      
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.CALLS_ENDED_REASON_DAILY)
        .select('ended_reason,calls_done')
        .gte('day_brt', dateStr);
      
      if (error) throw error;
      
      // Agregar por motivo de finalização
      const aggregated: Record<string, number> = {};
      (data || []).forEach(row => {
        const reason = row.ended_reason || 'unknown';
        aggregated[reason] = (aggregated[reason] || 0) + (Number(row.calls_done) || 0);
      });
      
      // Converter para array e ordenar por quantidade decrescente
      const result = Object.entries(aggregated)
        .map(([reason, count]) => ({
          reason,
          count,
        }))
        .sort((a, b) => b.count - a.count);
      
      return result;
    },
    enabled: !!orgId,
  });
}

// Hook para buscar tendência diária dos motivos de finalização
export function useCallsEndedReasonsTrend(orgId: string, period: '7d' | '14d' | '30d' | '60d' | '90d' = '30d') {
  return useQuery({
    queryKey: ['calls-ended-reasons-trend', orgId, period],
    queryFn: async () => {
      const days = getPeriodDays(period);
      const { dateStr } = getCutoffDate(days);
      
      const { data, error } = await supabase
        .from(SUPABASE_VIEWS.CALLS_ENDED_REASON_DAILY)
        .select('day_brt,ended_reason,calls_done')
        .gte('day_brt', dateStr)
        .order('day_brt', { ascending: true });
      
      if (error) throw error;
      
      // Identificar os top 5 motivos mais frequentes
      const reasonTotals: Record<string, number> = {};
      (data || []).forEach(row => {
        const reason = row.ended_reason || 'unknown';
        reasonTotals[reason] = (reasonTotals[reason] || 0) + (Number(row.calls_done) || 0);
      });
      
      const topReasons = Object.entries(reasonTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reason]) => reason);
      
      // Agrupar por dia, com cada motivo como coluna
      const byDay: Record<string, Record<string, number>> = {};
      
      (data || []).forEach(row => {
        const day = row.day_brt?.split('T')[0] || row.day_brt;
        const reason = row.ended_reason || 'unknown';
        const count = Number(row.calls_done) || 0;
        
        if (!byDay[day]) {
          byDay[day] = {};
          topReasons.forEach(r => byDay[day][r] = 0);
          byDay[day]['outros'] = 0;
        }
        
        if (topReasons.includes(reason)) {
          byDay[day][reason] = (byDay[day][reason] || 0) + count;
        } else {
          byDay[day]['outros'] = (byDay[day]['outros'] || 0) + count;
        }
      });
      
      // Converter para array
      const result = Object.entries(byDay)
        .map(([day, reasons]) => ({
          day,
          ...reasons,
        }))
        .sort((a, b) => a.day.localeCompare(b.day));
      
      return {
        data: result,
        topReasons: [...topReasons, 'outros'],
      };
    },
    enabled: !!orgId,
  });
}

export function useCallsLast50(orgId: string) {
  return useQuery({
    queryKey: ['calls-last-50', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(SUPABASE_TABLES.VAPI_CALLS)
        .select('*')
        .limit(QUERY_LIMITS.CALLS_LAST);
      
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
        .from(SUPABASE_VIEWS.FUNNEL_MAPPING_COVERAGE)
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
        .from(SUPABASE_VIEWS.FUNNEL_UNMAPPED_CANDIDATES)
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
        .from(SUPABASE_TABLES.INGESTION_RUNS)
        .select('*')
        .eq('org_id', orgId)
        .order('started_at', { ascending: false })
        .limit(QUERY_LIMITS.INGESTION_RUNS);
      
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
        .from(SUPABASE_TABLES.AI_INSIGHTS)
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
          .from(SUPABASE_TABLES.AI_INSIGHTS)
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
        .from(SUPABASE_TABLES.AI_INSIGHTS)
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
    const { data, error } = await supabase.functions.invoke(SUPABASE_EDGE_FUNCTIONS.GENERATE_INSIGHTS, {
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
    const { data, error } = await supabase.functions.invoke(SUPABASE_EDGE_FUNCTIONS.SMART_PROCESSOR, {
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
        .from(SUPABASE_TABLES.KPI_DICTIONARY)
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
