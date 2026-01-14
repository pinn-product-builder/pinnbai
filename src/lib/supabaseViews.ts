/**
 * Configuração centralizada de views e tabelas do Supabase
 * Facilita manutenção e alterações de nomes de views
 */

// ===== VIEWS EXECUTIVAS =====
export const SUPABASE_VIEWS = {
  // Executivo
  DASHBOARD_KPIS_30D: 'vw_dashboard_kpis_30d_v3',
  DASHBOARD_DAILY_60D: 'vw_dashboard_daily_60d_v3',
  FUNNEL_CURRENT: 'vw_funnel_current_v3',
  CALENDAR_EVENTS_CURRENT: 'vw_calendar_events_current_v3',
  
  // Conversas
  KOMMO_MSG_IN_DAILY_60D: 'vw_kommo_msg_in_daily_60d_v3',
  KOMMO_MSG_IN_BY_HOUR_7D: 'vw_kommo_msg_in_by_hour_7d_v3',
  KOMMO_MSG_IN_HEATMAP_30D: 'vw_kommo_msg_in_heatmap_30d_v3',
  
  // Tráfego
  AFONSINA_CUSTOS_FUNIL_DIA: 'vw_afonsina_custos_funil_dia',
  
  // VAPI
  CALLS_DAILY_V3: 'v3_calls_daily_v3',
  CALLS_ENDED_REASON_DAILY: 'v3_calls_ended_reason_daily',
  
  // Admin
  FUNNEL_MAPPING_COVERAGE: 'vw_funnel_mapping_coverage',
  FUNNEL_UNMAPPED_CANDIDATES: 'vw_funnel_unmapped_candidates',
} as const;

// ===== TABELAS =====
export const SUPABASE_TABLES = {
  LEADS_V2: 'leads_v2',
  TRAFEGO: 'trafego',
  VAPI_CALLS: 'vapi_calls',
  AI_INSIGHTS: 'ai_insights',
  KPI_DICTIONARY: 'kpi_dictionary',
  INGESTION_RUNS: 'ingestion_runs',
} as const;

// ===== RPC FUNCTIONS =====
export const SUPABASE_RPC = {
  GET_USER_ROLE: 'get_user_role',
} as const;

// ===== EDGE FUNCTIONS =====
export const SUPABASE_EDGE_FUNCTIONS = {
  GENERATE_INSIGHTS: 'generate-insights',
  SMART_PROCESSOR: 'smart-processor',
} as const;
