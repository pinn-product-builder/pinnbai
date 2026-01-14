/**
 * Barrel export para facilitar importações
 * Exemplo: import { formatCurrency, DEFAULT_ORG_ID } from '@/lib'
 */

// Configurações
export * from './config';

// Utilitários
export * from './utils';
export * from './format';
export * from './dateHelpers';
export * from './calculations';

// Definições
export * from './kpiDefinitions';
export * from './supabaseViews';

// Cliente Supabase
export { supabase, default as supabaseClient } from './supabaseClient';
