/**
 * Configurações e constantes centralizadas da aplicação
 * Facilita manutenção e alterações futuras
 */

// ===== SUPABASE CONFIG =====
export const SUPABASE_CONFIG = {
  url: 'https://mpbrjezmxmrdhgtvldvi.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnJqZXpteG1yZGhndHZsZHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDE4NTksImV4cCI6MjA4MzcwMTg1OX0.r44nrSjkEQbp-YpbUmOAACWJhZoXwJJO6NWty0PPlVU',
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
} as const;

// ===== DEFAULT VALUES =====
export const DEFAULT_ORG_ID = '073605bb-b60f-4928-b5b9-5fa149f35941';
export const DEFAULT_PERIOD = '30d' as const;

// ===== PERIOD CONFIGURATION =====
export const PERIOD_DAYS: Record<string, number> = {
  '7d': 7,
  '14d': 14,
  '30d': 30,
  '60d': 60,
  '90d': 90,
} as const;

export const PERIOD_OPTIONS = [
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: '30d', label: '30 dias' },
  { value: '60d', label: '60 dias' },
  { value: '90d', label: '90 dias' },
  { value: 'custom', label: 'Personalizado' },
] as const;

// ===== DATE RANGES =====
export const DEFAULT_DAILY_RANGE_DAYS = 60; // Para gráficos diários
export const DEFAULT_HEATMAP_RANGE_DAYS = 30; // Para heatmaps

// ===== QUERY LIMITS =====
export const QUERY_LIMITS = {
  MEETINGS_UPCOMING: 50,
  CALLS_LAST: 50,
  INSIGHTS_HISTORY: 20,
  INGESTION_RUNS: 20,
  TOP_ADS: 10,
} as const;

// ===== EXCLUDED PATTERNS =====
// Padrões para excluir reuniões (usado em MonthlyMeetingsPanel)
export const EXCLUDED_MEETING_PATTERNS = [
  'recesso',
  'ph553479@gmail.com',
  'passisventura@gmail.com',
  '=passisventura@gmail.com',
  'pht544939@gmail.com',
  'pedro@outlook.com',
  'pedro@ponto.com',
  'roberto arruda',
] as const;

// ===== ROUTES =====
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: {
    EXECUTIVO: '/dash/executivo',
    CONVERSAS: '/dash/conversas',
    TRAFEGO: '/dash/trafego',
    VAPI: '/dash/ligacoes',
    VENDAS: '/dash/vendas',
    ADMIN: '/dash/admin',
    CONFIG: '/dash/config',
  },
} as const;

// ===== RPC FUNCTIONS =====
export const RPC_FUNCTIONS = {
  GET_USER_ROLE: 'get_user_role',
} as const;

// ===== EDGE FUNCTIONS =====
export const EDGE_FUNCTIONS = {
  GENERATE_INSIGHTS: 'generate-insights',
  SMART_PROCESSOR: 'smart-processor',
} as const;

// ===== REFRESH INTERVALS =====
export const REFRESH_INTERVALS = {
  VIEW_MODE_DASHBOARD: 60, // segundos
} as const;

// ===== KEYBOARD SHORTCUTS =====
export const KEYBOARD_SHORTCUTS = {
  VIEW_MODE: ['F11', 'Ctrl+Shift+V'],
  EXIT_VIEW_MODE: 'Escape',
} as const;
