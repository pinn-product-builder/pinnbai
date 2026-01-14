/**
 * Utilitários para manipulação de datas e períodos
 * Centraliza lógica de cálculos de datas
 */

import type { PeriodFilter } from '@/types/dashboard';
import { PERIOD_DAYS } from './config';

// ===== GET PERIOD DAYS =====
export function getPeriodDays(period: PeriodFilter): number {
  return PERIOD_DAYS[period] || 30;
}

// ===== GET DATE RANGE =====
export interface DateRange {
  start: Date;
  end: Date;
  startStr: string; // ISO string (YYYY-MM-DD)
  endStr: string;   // ISO string (YYYY-MM-DD)
}

/**
 * Calcula o range de datas para um período
 */
export function getDateRange(period: PeriodFilter, days?: number): DateRange {
  const daysToUse = days || getPeriodDays(period);
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysToUse);
  
  return {
    start,
    end,
    startStr: start.toISOString().split('T')[0],
    endStr: end.toISOString().split('T')[0],
  };
}

// ===== GET PREVIOUS PERIOD RANGE =====
/**
 * Calcula o range de datas do período anterior (para comparação)
 */
export function getPreviousPeriodRange(period: PeriodFilter, days?: number): DateRange {
  const daysToUse = days || getPeriodDays(period);
  const currentRange = getDateRange(period, daysToUse);
  
  // Período anterior termina 1 dia antes do início do período atual
  const previousEnd = new Date(currentRange.start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  
  // Período anterior começa 'daysToUse' dias antes do fim anterior
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - daysToUse + 1);
  
  return {
    start: previousStart,
    end: previousEnd,
    startStr: previousStart.toISOString().split('T')[0],
    endStr: previousEnd.toISOString().split('T')[0],
  };
}

// ===== GET CUTOFF DATE =====
/**
 * Retorna a data de corte (cutoff) para um número de dias atrás
 */
export function getCutoffDate(daysAgo: number): { date: Date; dateStr: string } {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return {
    date,
    dateStr: date.toISOString().split('T')[0],
  };
}

// ===== GET MONTH RANGE =====
/**
 * Retorna o range de datas do mês atual
 */
export function getCurrentMonthRange(): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start,
    end,
    startStr: start.toISOString().split('T')[0],
    endStr: end.toISOString().split('T')[0],
  };
}

// ===== GET TODAY STRING =====
/**
 * Retorna a data de hoje no formato ISO (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// ===== IS DATE IN RANGE =====
/**
 * Verifica se uma data está dentro de um range
 */
export function isDateInRange(date: Date | string, start: Date | string, end: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const startObj = typeof start === 'string' ? new Date(start) : start;
  const endObj = typeof end === 'string' ? new Date(end) : end;
  
  return dateObj >= startObj && dateObj <= endObj;
}

// ===== CALCULATE PERCENTAGE CHANGE =====
/**
 * Calcula a variação percentual entre dois valores
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ===== GET DAY OF WEEK NAME =====
/**
 * Retorna o nome do dia da semana em português
 */
export function getDayOfWeekName(dayOfWeek: number): string {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dayOfWeek] || '';
}

// ===== GET MONTH NAME =====
/**
 * Retorna o nome do mês em português
 */
export function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month] || '';
}
