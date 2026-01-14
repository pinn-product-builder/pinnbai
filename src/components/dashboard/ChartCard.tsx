import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { InboxIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
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
  axisHint,
  children,
  action,
  isLoading,
  isEmpty,
  className,
}: ChartCardProps) {
  return (
    <div className={cn("glass-card p-6 relative overflow-hidden", className)}>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <h3 className="text-lg font-semibold text-text-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-text-3 mt-1">{subtitle}</p>
          )}
          {axisHint && (
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
