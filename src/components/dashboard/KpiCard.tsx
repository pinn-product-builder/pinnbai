import React, { ReactNode, useState, useEffect } from 'react';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useKpiDictionary } from '@/hooks/useDashboardData';
import { LOCAL_KPI_DEFINITIONS } from '@/lib/kpiDefinitions';
import { formatKpiValue } from '@/lib/format';

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
    return formatKpiValue(value, format);
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
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button className="text-text-3 hover:text-text-2 hover:text-pinn-orange-500 transition-colors">
                <Info className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              align="start"
              sideOffset={12}
              className="max-w-[300px] z-[9999] p-4 rounded-xl shadow-2xl"
              style={{
                background: 'hsl(20 80% 8%)',
                border: '1px solid hsl(27 100% 50% / 0.3)',
                boxShadow: '0 20px 40px -10px hsl(20 100% 2% / 0.8), 0 0 0 1px hsl(27 100% 50% / 0.1)',
              }}
            >
              {definition ? (
                <div className="space-y-2.5">
                  <p className="font-semibold text-sm" style={{ color: 'hsl(35 30% 95%)' }}>
                    {definition.title}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'hsl(35 30% 95% / 0.75)' }}>
                    {definition.definition}
                  </p>
                  {definition.formula && (
                    <div 
                      className="text-xs font-mono px-2.5 py-2 rounded-lg mt-2"
                      style={{
                        color: 'hsl(27 100% 55%)',
                        background: 'hsl(27 100% 50% / 0.12)',
                        border: '1px solid hsl(27 100% 50% / 0.25)',
                      }}
                    >
                      {definition.formula}
                    </div>
                  )}
                </div>
              ) : description ? (
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(35 30% 95% / 0.75)' }}>
                  {description}
                </p>
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