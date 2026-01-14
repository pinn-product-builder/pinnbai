import React, { ReactNode, useState, useEffect } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
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
  conv_lead_to_msg_30d: {
    title: 'Mensagens por Lead (30d)',
    definition: 'Média de mensagens recebidas por lead nos últimos 30 dias. Valores acima de 100% indicam que, em média, cada lead enviou mais de uma mensagem.',
    formula: '(total_mensagens / total_leads) × 100'
  },
  conv_lead_to_meeting_30d: {
    title: 'Conv. Lead → Reunião (30d)',
    definition: 'Percentual de leads que agendaram pelo menos uma reunião nos últimos 30 dias.',
    formula: '(leads_com_reunião / total_leads) × 100'
  },
  conv_msg_to_meeting_30d: {
    title: 'Conv. Mensagem → Reunião (30d)',
    definition: 'Percentual de leads que enviaram mensagem e posteriormente agendaram reunião.',
    formula: '(reuniões_agendadas / leads_com_mensagem) × 100'
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
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string; // ex: "vs semana anterior"
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  format?: 'number' | 'currency' | 'percent';
  isLoading?: boolean;
  /** Indica se valores menores são melhores (ex: CPL, Custo/Reunião) */
  invertTrend?: boolean;
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
  invertTrend = false,
}: KpiCardProps) {
  const { data: dictionary } = useKpiDictionary();
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Trigger animation when loading completes
  useEffect(() => {
    if (!isLoading && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isLoading, hasAnimated]);
  
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
        // Multiplica por 100 para converter proporção decimal em porcentagem
        // Suporta valores > 100% (ex: mensagens por lead)
        const percentValue = value * 100;
        return `${percentValue.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('pt-BR').format(value);
    }
  }, [value, format]);

  const variantStyles = {
    default: {
      glow: '',
      icon: 'text-text-3',
      value: 'text-text-1',
      accent: '',
    },
    primary: {
      glow: 'glow-primary',
      icon: 'text-pinn-orange-500',
      value: 'text-pinn-orange-500',
      accent: 'kpi-accent',
    },
    success: {
      glow: 'glow-success',
      icon: 'text-success',
      value: 'text-success',
      accent: '',
    },
    warning: {
      glow: 'glow-warning',
      icon: 'text-warning',
      value: 'text-warning',
      accent: '',
    },
    destructive: {
      glow: 'glow-destructive',
      icon: 'text-destructive',
      value: 'text-destructive',
      accent: '',
    },
  };

  const styles = variantStyles[variant];

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
  
  // Determina se a tendência é positiva considerando invertTrend
  const isTrendPositive = trend 
    ? (invertTrend ? !trend.isPositive : trend.isPositive)
    : undefined;

  return (
    <div 
      className={cn(
        "glass-card-glow p-5 transition-all duration-200 hover:scale-[1.01]",
        styles.glow,
        styles.accent,
        hasAnimated && "animate-scale-in"
      )}
      style={{
        animationDuration: '0.4s',
        animationFillMode: 'both',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className={cn("w-5 h-5", styles.icon)}>{icon}</span>}
          <span className="text-sm font-medium text-text-2">{title}</span>
        </div>
        
        {hasTooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-text-3 hover:text-text-2 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs pinn-tooltip">
              {definition ? (
                <div className="space-y-1">
                  <p className="font-medium text-text-1">{definition.title}</p>
                  <p className="text-xs text-text-2">{definition.definition}</p>
                  {definition.formula && (
                    <p className="text-xs font-mono text-pinn-orange-500 bg-pinn-orange-500/10 px-2 py-1 rounded mt-1">
                      {definition.formula}
                    </p>
                  )}
                </div>
              ) : description ? (
                <p className="text-xs text-text-2">{description}</p>
              ) : null}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className={cn(
          "text-2xl font-bold tracking-tight",
          styles.value
        )}>
          {formattedValue}
        </span>

        {/* Trend badges ocultados */}
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