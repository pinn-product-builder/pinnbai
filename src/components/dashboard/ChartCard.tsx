import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { InboxIcon, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getChartDefinition, ChartDefinition } from '@/lib/chartDefinitions';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  /** Key do gráfico para buscar definição automática */
  chartKey?: string;
  /** Explicação dos eixos do gráfico: ex: "Eixo X = tempo (dias), Eixo Y = quantidade" */
  axisHint?: string;
  children: ReactNode;
  action?: ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  chartKey,
  axisHint,
  children,
  action,
  isLoading,
  isEmpty,
  className,
}: ChartCardProps) {
  const definition = chartKey ? getChartDefinition(chartKey) : undefined;
  
  return (
    <div className={cn("glass-card p-6 relative overflow-hidden", className)}>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text-1">{title}</h3>
            {definition && (
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <button 
                    type="button"
                    className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors p-1 rounded-full hover:bg-muted/50"
                    aria-label="Informações sobre o gráfico"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  align="start"
                  className="max-w-xs p-4 space-y-2 z-[9999]"
                  sideOffset={8}
                >
                  <p className="font-semibold text-sm text-foreground">{definition.title}</p>
                  <p className="text-xs text-muted-foreground">{definition.description}</p>
                  <div className="pt-2 border-t border-border/50 space-y-1.5 text-xs">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground font-medium">Eixo X:</span>
                      <span className="text-foreground">{definition.axisX}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground font-medium">Eixo Y:</span>
                      <span className="text-foreground">{definition.axisY}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground font-medium">Período:</span>
                      <span className="text-foreground">{definition.period}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground font-medium">Fonte:</span>
                      <span className="text-foreground font-mono text-[10px]">{definition.source}</span>
                    </div>
                  </div>
                  {definition.interpretation && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-primary/90 italic">💡 {definition.interpretation}</p>
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-text-3 mt-1">{subtitle}</p>
          )}
          {axisHint && !definition && (
            <p className="text-xs text-text-3/70 mt-1 italic">{axisHint}</p>
          )}
        </div>
        {action}
      </div>

      <div className="relative z-10 overflow-hidden">
        {isLoading ? (
          <ChartLoadingSkeleton />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function ChartLoadingSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-48">
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t" 
            style={{ height: `${Math.random() * 60 + 40}%` }} 
          />
        ))}
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="pinn-empty">
      <InboxIcon className="w-12 h-12 mb-3" />
      <p className="text-sm">Sem dados disponíveis</p>
    </div>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, icon, children, className }: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-xl font-semibold text-text-1 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {description && (
          <p className="text-sm text-text-3 mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-text-1">{title}</h1>
        {description && (
          <p className="text-text-2 mt-1">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
