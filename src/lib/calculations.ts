/**
 * Utilitários para cálculos de métricas e KPIs
 * Centraliza lógica de cálculos reutilizáveis
 */

import { calculatePercentageChange } from './dateHelpers';

// ===== CALCULATE CPL (Custo por Lead) =====
export function calculateCPL(spend: number, leads: number): number {
  return leads > 0 ? spend / leads : 0;
}

// ===== CALCULATE COST PER MEETING =====
export function calculateCostPerMeeting(spend: number, meetings: number): number {
  return meetings > 0 ? spend / meetings : 0;
}

// ===== CALCULATE CONVERSION RATE =====
export function calculateConversionRate(converted: number, total: number): number {
  return total > 0 ? converted / total : 0;
}

// ===== CALCULATE CONVERSION RATE PERCENT =====
export function calculateConversionRatePercent(converted: number, total: number): number {
  return calculateConversionRate(converted, total) * 100;
}

// ===== CALCULATE TAXA ENTRADA =====
export function calculateTaxaEntrada(entradas: number, leads: number): number {
  return calculateConversionRatePercent(entradas, leads);
}

// ===== CALCULATE TAXA ATENDIMENTO =====
export function calculateTaxaAtendimento(answered: number, total: number): number {
  return calculateConversionRatePercent(answered, total);
}

// ===== CALCULATE AVERAGE =====
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

// ===== CALCULATE SUM =====
export function calculateSum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

// ===== CALCULATE GROWTH RATE =====
export function calculateGrowthRate(current: number, previous: number): number {
  return calculatePercentageChange(current, previous);
}

// ===== AGGREGATE BY DAY =====
export interface AggregateByDayResult {
  byDay: Record<string, number>;
  total: number;
}

export function aggregateByDay<T extends { [key: string]: any }>(
  data: T[],
  dateKey: keyof T,
  valueKey: keyof T
): AggregateByDayResult {
  const byDay: Record<string, number> = {};
  let total = 0;
  
  data.forEach((row) => {
    const day = String(row[dateKey]);
    const value = Number(row[valueKey]) || 0;
    byDay[day] = (byDay[day] || 0) + value;
    total += value;
  });
  
  return { byDay, total };
}

// ===== AGGREGATE FUNNEL DATA =====
export interface FunnelAggregate {
  spend: number;
  leads: number;
  entradas: number;
  meetings_scheduled: number;
  meetings_done: number;
}

export function aggregateFunnelData(data: Array<{
  custo_total?: number | string;
  leads_total?: number | string;
  entrada_total?: number | string;
  reuniao_agendada_total?: number | string;
  reuniao_realizada_total?: number | string;
}>): FunnelAggregate {
  return data.reduce(
    (acc, row) => {
      acc.spend += Number(row.custo_total) || 0;
      acc.leads += Number(row.leads_total) || 0;
      acc.entradas += Number(row.entrada_total) || 0;
      acc.meetings_scheduled += Number(row.reuniao_agendada_total) || 0;
      acc.meetings_done += Number(row.reuniao_realizada_total) || 0;
      return acc;
    },
    {
      spend: 0,
      leads: 0,
      entradas: 0,
      meetings_scheduled: 0,
      meetings_done: 0,
    }
  );
}

// ===== AGGREGATE CALLS DATA =====
export interface CallsAggregate {
  calls_done: number;
  calls_answered: number;
  total_minutes: number;
  total_spent: number;
}

export function aggregateCallsData(data: Array<{
  calls_done?: number | string;
  calls_answered?: number | string;
  total_minutes?: number | string;
  total_spent_usd?: number | string;
}>): CallsAggregate {
  return data.reduce(
    (acc, row) => {
      acc.calls_done += Number(row.calls_done) || 0;
      acc.calls_answered += Number(row.calls_answered) || 0;
      acc.total_minutes += Number(row.total_minutes) || 0;
      acc.total_spent += Number(row.total_spent_usd) || 0;
      return acc;
    },
    {
      calls_done: 0,
      calls_answered: 0,
      total_minutes: 0,
      total_spent: 0,
    }
  );
}

// ===== CALCULATE METRICS FROM AGGREGATE =====
export interface CalculatedMetrics {
  cpl: number;
  cpm_meeting: number;
  conv_lead_to_meeting: number;
  taxa_entrada: number;
}

export function calculateMetricsFromFunnel(aggregate: FunnelAggregate): CalculatedMetrics {
  return {
    cpl: calculateCPL(aggregate.spend, aggregate.leads),
    cpm_meeting: calculateCostPerMeeting(aggregate.spend, aggregate.meetings_scheduled),
    conv_lead_to_meeting: calculateConversionRate(aggregate.meetings_scheduled, aggregate.leads),
    taxa_entrada: calculateTaxaEntrada(aggregate.entradas, aggregate.leads),
  };
}
