import React, { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useKpiDictionary } from '@/hooks/useDashboardData';

interface KpiCardProps {
  title: string;
  value: string | number;
  kpiKey?: string;
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
  icon,
  trend,
  variant = 'default',
  format = 'number',
  isLoading,
}: KpiCardProps) {
  const { data: dictionary } = useKpiDictionary();
  const definition = kpiKey ? dictionary?.[kpiKey] : null;

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
        return `${(value * 100).toFixed(1)}%`;
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
      <div className="glass-card p-5">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-16" />
      </div>
    );
  }

  return (
    <div className={cn("glass-card-glow p-5 transition-all duration-300 hover:scale-[1.02]", glowClass)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className={cn("w-5 h-5", iconColorClass)}>{icon}</span>}
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            {definition ? (
              <div className="space-y-1">
                <p className="font-medium">{definition.title}</p>
                <p className="text-xs text-muted-foreground">{definition.definition}</p>
                {definition.formula && (
                  <p className="text-xs font-mono text-primary">{definition.formula}</p>
                )}
              </div>
            ) : (
              <p className="text-xs">Definição não cadastrada</p>
            )}
          </TooltipContent>
        </Tooltip>
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
