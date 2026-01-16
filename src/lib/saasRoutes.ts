/**
 * Configurações de Rotas do MicroSaaS
 */

export const SAAS_ROUTES = {
  // Auth
  LOGIN: '/login',
  
  // Dashboard Afonsina (legado - intocado)
  AFONSINA: {
    EXECUTIVO: '/dash/executivo',
    CONVERSAS: '/dash/conversas',
    TRAFEGO: '/dash/trafego',
    LIGACOES: '/dash/ligacoes',
    VENDAS: '/dash/vendas',
  },
  
  // Admin
  ADMIN: {
    VISAO_GERAL: '/admin/visao-geral',
    WORKSPACES: '/admin/workspaces',
    WORKSPACE_DETAIL: '/admin/workspaces/:orgId',
    DASHBOARDS: '/admin/dashboards',
    USUARIOS: '/admin/usuarios',
    TEMPLATES: '/admin/templates',
    PIPELINES: '/admin/pipelines',
  },
  
  // App (clientes genéricos)
  APP: {
    DASHBOARDS: '/app/dashboards',
    DASHBOARD_DETAIL: '/app/dashboards/:id',
    DATA_SOURCES: '/app/data-sources',
    DATA_SOURCE_DETAIL: '/app/data-sources/:id',
    DATA_SETS: '/app/data-sets',
    DATA_SET_DETAIL: '/app/data-sets/:id',
    PIPELINES: '/app/pipelines',
    TEMPLATES: '/app/templates',
    USUARIOS: '/app/usuarios',
    CONFIGURACOES: '/app/configuracoes',
  },
} as const;
