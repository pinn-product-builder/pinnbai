import React, { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useKpiDictionary } from '@/hooks/useDashboardData';

// Definições locais de KPIs para fallback
const LOCAL_KPI_DEFINITIONS: Record<string, { title: string; definition: string; formula?: string }> = {
  // Tráfego 7d
  spend_total_7d: { 
    title: 'Investimento (7d)', 
    definition: 'Total investido em anúncios nos últimos 7 dias.',
    formula: 'Σ custo_total (7 dias)'
  },
  leads_7d: { 
    title: 'Leads (7d)', 
    definition: 'Número de leads gerados nos últimos 7 dias.',
  },
  entradas_7d: { 
    title: 'Entradas (7d)', 
    definition: 'Leads que entraram no funil de vendas nos últimos 7 dias.',
  },
  taxa_entrada_7d: { 
    title: 'Taxa de Entrada (7d)', 
    definition: 'Percentual de leads que entraram no funil.',
    formula: '(entradas / leads) × 100'
  },
  cpl_7d: { 
    title: 'CPL (7d)', 
    definition: 'Custo por Lead médio nos últimos 7 dias.',
    formula: 'investimento / leads'
  },
  meetings_booked_7d: { 
    title: 'Reuniões Agendadas (7d)', 
    definition: 'Total de reuniões marcadas nos últimos 7 dias.',
  },
  meetings_done_7d: { 
    title: 'Reuniões Realizadas (7d)', 
    definition: 'Total de reuniões que efetivamente aconteceram.',
  },
  cp_meeting_booked_7d: { 
    title: 'Custo/Reunião (7d)', 
    definition: 'Custo médio para agendar uma reunião.',
    formula: 'investimento / reuniões_agendadas'
  },
  // Tráfego 30d
  spend_total_30d: { 
    title: 'Investimento (30d)', 
    definition: 'Total investido em anúncios nos últimos 30 dias.',
    formula: 'Σ custo_total (30 dias)'
  },
  leads_30d: { 
    title: 'Leads (30d)', 
    definition: 'Número de leads gerados nos últimos 30 dias.',
  },
  entradas_30d: { 
    title: 'Entradas (30d)', 
    definition: 'Leads que entraram no funil de vendas nos últimos 30 dias.',
  },
  taxa_entrada_30d: { 
    title: 'Taxa de Entrada (30d)', 
    definition: 'Percentual de leads que entraram no funil.',
    formula: '(entradas / leads) × 100'
  },
  cpl_30d: { 
    title: 'CPL (30d)', 
    definition: 'Custo por Lead médio nos últimos 30 dias.',
    formula: 'investimento / leads'
  },
  meetings_booked_30d: { 
    title: 'Reuniões Agendadas (30d)', 
    definition: 'Total de reuniões marcadas nos últimos 30 dias.',
  },
  meetings_done_30d: { 
    title: 'Reuniões Realizadas (30d)', 
    definition: 'Total de reuniões que efetivamente aconteceram.',
  },
  cp_meeting_booked_30d: { 
    title: 'Custo/Reunião (30d)', 
    definition: 'Custo médio para agendar uma reunião.',
    formula: 'investimento / reuniões_agendadas'
  },
  // Conversas
  msg_in_7d: {
    title: 'Mensagens Recebidas (7d)',
    definition: 'Total de mensagens recebidas nos últimos 7 dias.',
  },
  msg_in_30d: {
    title: 'Mensagens Recebidas (30d)',
    definition: 'Total de mensagens recebidas nos últimos 30 dias.',
  },
  // Executivo
  spend_30d: {
    title: 'Investimento Total',
    definition: 'Total investido em mídia paga no período.',
  },
  leads_total_30d: {
    title: 'Total de Leads',
    definition: 'Quantidade total de leads captados no período.',
  },
  meetings_scheduled_30d: {
    title: 'Reuniões Agendadas',
    definition: 'Total de reuniões marcadas no período.',
  },
};

interface KpiCardProps {
  title: string;
  value: string | number;
  kpiKey?: string;
  description?: string; // Nova prop para descrição direta
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  format?: 'number' | 'currency' | 'percent';
  isLoading?: boolean;
}

export function KpiCard({
  title,
  value,
  kpiKey,
  description,
  icon,
  trend,
  variant = 'default',
  format = 'number',
  isLoading,
}: KpiCardProps) {
  const { data: dictionary } = useKpiDictionary();
  
  // Prioridade: dictionary > LOCAL_KPI_DEFINITIONS > description prop
  const definition = kpiKey 
    ? (dictionary?.[kpiKey] || LOCAL_KPI_DEFINITIONS[kpiKey]) 
    : null;

  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 2,
        }).format(value);
      case 'percent':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  }, [value, format]);

  const glowClass = {
    default: '',
    primary: 'glow-primary',
    success: 'glow-success',
    warning: 'glow-warning',
    destructive: 'glow-destructive',
  }[variant];

  const iconColorClass = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  }[variant];

  if (isLoading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-3 w-14" />
      </div>
    );
  }

  const hasTooltip = definition || description;

  return (
    <div className={cn("glass-card-glow p-5 transition-all duration-300 hover:scale-[1.02]", glowClass)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className={cn("w-5 h-5", iconColorClass)}>{icon}</span>}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        
        {hasTooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-popover border border-border shadow-lg">
              {definition ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{definition.title}</p>
                  <p className="text-xs text-muted-foreground">{definition.definition}</p>
                  {definition.formula && (
                    <p className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded mt-1">
                      {definition.formula}
                    </p>
                  )}
                </div>
              ) : description ? (
                <p className="text-xs text-muted-foreground">{description}</p>
              ) : null}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-end justify-between">
        <span className={cn(
          "text-2xl font-bold tracking-tight",
          variant === 'primary' && "text-primary",
          variant === 'success' && "text-success",
          variant === 'warning' && "text-warning",
          variant === 'destructive' && "text-destructive",
        )}>
          {formattedValue}
        </span>

        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive 
              ? "bg-success/10 text-success" 
              : "bg-destructive/10 text-destructive"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
interface KpiGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function KpiGrid({ children, columns = 4, className }: KpiGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  }[columns];

  return (
    <div className={cn("grid gap-4", gridCols, className)}>
      {children}
    </div>
  );
}
