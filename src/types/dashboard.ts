// Executive Views
export interface ExecutiveKpis {
  org_id: string;
  leads_total_30d: number;
  msg_in_30d: number;
  meetings_scheduled_30d: number;
  meetings_cancelled_30d: number;
  spend_30d: number;
  cpl_30d: number;
  cpm_meeting_30d: number;
  conv_lead_to_meeting_30d: number;
  conv_lead_to_msg_30d: number;
}

export interface ExecutiveDaily {
  org_id: string;
  day: string;
  leads_new: number;
  msg_in: number;
  spend: number;
  meetings_scheduled: number;
}

export interface FunnelStage {
  org_id: string;
  stage_key: string;
  stage_name: string;
  stage_order: number;
  stage_group: string;
  leads: number;
}

export interface Meeting {
  org_id: string;
  start_at: string;
  end_at: string;
  status: string;
  summary: string;
  description: string;
  meeting_url: string;
  html_link: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
}

// Conversations Views
export interface ConversationKpis7d {
  org_id: string;
  msg_in_7d: number;
  leads_7d: number;
}

export interface ConversationKpis30d {
  org_id: string;
  msg_in_30d: number;
  leads_30d: number;
}

export interface ConversationDaily {
  org_id: string;
  day: string;
  msg_in_total: number;
  leads_with_msg_in: number;
}

export interface ConversationByHour {
  org_id: string;
  hour: number;
  msg_in_total: number;
}

export interface ConversationHeatmap {
  org_id: string;
  dow: number;
  hour: number;
  msg_in_total: number;
}

// Traffic Views - Usando vw_afonsina_custos_funil_dia
export interface TrafficKpis7d {
  org_id: string;
  spend_total_7d: number;
  leads_7d: number;
  entradas_7d: number;
  cpl_7d: number;
  meetings_booked_7d: number;
  meetings_done_7d: number;
  cp_meeting_booked_7d: number;
  taxa_entrada_7d: number;
}

export interface TrafficKpis30d {
  org_id: string;
  spend_total_30d: number;
  leads_30d: number;
  entradas_30d: number;
  cpl_30d: number;
  meetings_booked_30d: number;
  meetings_done_30d: number;
  cp_meeting_booked_30d: number;
  taxa_entrada_30d: number;
}

export interface TrafficDaily {
  org_id: string;
  day: string;
  spend_total: number;
  leads: number;
  entradas: number;
  cpl: number;
  meetings_booked: number;
  meetings_done: number;
  cp_meeting_booked: number;
  taxa_entrada: number;
}

export interface TopAd {
  org_id: string;
  ad_name: string;
  spend_total: number;
}

// VAPI Views
export interface CallsKpis7d {
  org_id: string;
  calls_total_7d: number;
}

export interface CallsKpis30d {
  org_id: string;
  calls_total_30d: number;
}

export interface CallsDaily {
  org_id: string;
  day: string;
  calls_total: number;
}

export interface CallEvent {
  org_id: string;
  event_ts: string;
  event_type: string;
  actor: string;
  lead_id: string;
  payload: Record<string, unknown>;
}

// Admin Views
export interface MappingCoverage {
  org_id: string;
  source: string;
  mapped: number;
  total: number;
  coverage_pct: number;
}

export interface UnmappedCandidate {
  org_id: string;
  source: string;
  raw_pipeline: string;
  raw_status: string;
  hits: number;
}

export interface IngestionRun {
  org_id: string;
  started_at: string;
  finished_at: string;
  status: string;
  rows_ingested: number;
  error: string | null;
}

// AI Insights
export interface AIInsight {
  org_id: string;
  scope: string;
  payload: {
    alerts?: Array<{
      type: 'critical' | 'warning' | 'info';
      message: string;
    }>;
    recommendations?: string[];
    anomalies?: string[];
    summary?: string;
    text?: string;
    insights?: string[];
    [key: string]: unknown;
  } | string;
  created_at: string;
}

// KPI Dictionary
export interface KpiDefinition {
  kpi_key: string;
  title: string;
  definition: string;
  formula: string;
  example: string;
  notes: string;
}

// Filter types
export type PeriodFilter = '7d' | '14d' | '30d' | '60d' | '90d' | 'custom';

export interface GlobalFilters {
  orgId: string;
  period: PeriodFilter;
  startDate?: string;
  endDate?: string;
  comparePrevious: boolean;
  source?: string;
}
