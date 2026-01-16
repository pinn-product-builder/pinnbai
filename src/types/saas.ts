/**
 * Tipos do MicroSaaS Pinn
 */

// ===== ROLES =====
export type UserRole = 'super_admin' | 'org_admin' | 'editor' | 'viewer' | 'client_afonsina';

// ===== ORGANIZATIONS =====
export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  settings?: OrganizationSettings;
}

export interface OrganizationSettings {
  timezone: string;
  currency: string;
  logoUrl?: string;
}

// ===== USERS =====
export interface SaasUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  orgId?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserOrganization {
  userId: string;
  orgId: string;
  role: UserRole;
  joinedAt: string;
}

// ===== DATA SOURCES =====
export type DataSourceType = 'upload' | 'supabase' | 'postgres' | 'mysql';

export interface DataSource {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  type: DataSourceType;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  config: DataSourceConfig;
  tables?: string[];
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface DataSourceConfig {
  // Upload
  fileName?: string;
  fileType?: 'csv' | 'xlsx';
  delimiter?: string;
  sheet?: string;
  
  // Database connections
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  ssl?: boolean;
  
  // Supabase
  projectUrl?: string;
  schema?: string;
}

// ===== DATA SETS =====
export type SemanticRole = 'dimension' | 'metric' | 'date' | 'id' | 'ignore';
export type DataType = 'string' | 'int' | 'float' | 'date' | 'datetime' | 'boolean';

export interface FormatConfig {
  type: 'currency' | 'percentage' | 'number' | 'date';
  currency?: string;
  decimals?: number;
  dateFormat?: string;
}

export interface DataSet {
  id: string;
  orgId: string;
  sourceId: string;
  sourceName?: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'error';
  objectName: string; // table, view, or file name
  columns: DataSetColumn[];
  metrics: DataSetMetric[];
  primaryKeyColumn?: string;
  dateColumn?: string;
  stageColumn?: string;
  timezone: string;
  lastRefreshAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSetColumn {
  name: string;
  dataType: 'string' | 'int' | 'float' | 'date' | 'datetime' | 'boolean';
  semanticRole: 'dimension' | 'metric' | 'date' | 'id' | 'ignore';
  format?: ColumnFormat;
  displayName?: string;
}

export interface ColumnFormat {
  type: 'currency' | 'percentage' | 'number' | 'date';
  currency?: string;
  decimals?: number;
  dateFormat?: string;
}

export interface DataSetMetric {
  id: string;
  name: string;
  displayName: string;
  formula: string;
  aggregation: 'sum' | 'avg' | 'count' | 'count_distinct' | 'custom';
  format?: ColumnFormat;
  description?: string;
}

// ===== DASHBOARDS =====
export interface Dashboard {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  status: 'draft' | 'published';
  widgets: DashboardWidget[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type WidgetType = 'kpi' | 'line' | 'bar' | 'funnel' | 'table' | 'list';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  dataSetId: string;
  config: WidgetConfig;
  layout: WidgetLayout;
}

export interface WidgetConfig {
  metric?: string;
  dimension?: string;
  dateColumn?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'distinct';
  format?: ColumnFormat;
  filters?: WidgetFilter[];
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface WidgetFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
  value: any;
}

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ===== PIPELINES =====
export interface PipelineRun {
  id: string;
  orgId: string;
  type: 'sync' | 'refresh' | 'transform';
  status: 'running' | 'success' | 'error' | 'pending';
  sourceId?: string;
  dataSetId?: string;
  startedAt: string;
  finishedAt?: string;
  logs?: string;
  errorMessage?: string;
  recordsProcessed?: number;
}

// ===== TEMPLATES =====
export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'executivo' | 'vendas' | 'trafego' | 'operacoes' | 'custom';
  previewImageUrl?: string;
  widgets: Omit<DashboardWidget, 'dataSetId'>[];
  requiredMetrics: string[];
  createdAt: string;
}

// ===== AUTH SESSION =====
export interface SaasSession {
  user: SaasUser;
  orgId?: string;
  isAdmin: boolean;
  isAfonsina: boolean;
}
