import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import type { FunnelStage } from '@/types/dashboard';

interface FunnelChartProps {
  data: FunnelStage[];
  isLoading?: boolean;
  onStageClick?: (stage: FunnelStage) => void;
}

export function FunnelChart({ data, isLoading, onStageClick }: FunnelChartProps) {
  const maxLeads = Math.max(...data.map(s => s.leads), 1);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 flex-1" style={{ maxWidth: `${100 - i * 15}%` }} />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p>Sem dados do funil</p>
      </div>
    );
  }

  // Group stages by stage_group
  const groupedStages = data.reduce((acc, stage) => {
    const group = stage.stage_group || 'Outros';
    if (!acc[group]) acc[group] = [];
    acc[group].push(stage);
    return acc;
  }, {} as Record<string, FunnelStage[]>);

  const groupColors: Record<string, string> = {
    'Entrada': 'from-primary/80 to-primary/40',
    'Qualificação': 'from-warning/80 to-warning/40',
    'Conversão': 'from-success/80 to-success/40',
    'Outros': 'from-muted to-muted/40',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedStages).map(([groupName, stages]) => (
        <div key={groupName} className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {groupName}
          </h4>
          <div className="space-y-2">
            {stages.map((stage) => {
              const percentage = (stage.leads / maxLeads) * 100;
              const gradientClass = groupColors[groupName] || groupColors['Outros'];

              return (
                <Tooltip key={stage.stage_key}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onStageClick?.(stage)}
                      className="w-full group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                          <div 
                            className={cn(
                              "h-10 rounded-lg bg-gradient-to-r transition-all duration-300",
                              "group-hover:shadow-lg group-hover:scale-[1.01]",
                              gradientClass
                            )}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            <div className="absolute inset-0 flex items-center px-3">
                              <span className="text-sm font-medium text-white truncate drop-shadow">
                                {stage.stage_name}
                              </span>
                            </div>
                            {/* Glow effect */}
                            <div 
                              className={cn(
                                "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                                "shadow-[0_0_20px_-5px] shadow-primary/30"
                              )}
                            />
                          </div>
                        </div>
                        <span className="w-16 text-right text-sm font-semibold text-foreground">
                          {stage.leads.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{stage.stage_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Chave: {stage.stage_key}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Grupo: {stage.stage_group}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {stage.leads.toLocaleString('pt-BR')} leads
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
