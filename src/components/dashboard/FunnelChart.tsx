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

// Mapeamento de nomes bonitos para cada estágio
const stageNameMap: Record<string, string> = {
  'novo': 'Novo Lead',
  'entrada': 'Entrada',
  'reuniao_agendada': 'Reunião Agendada',
  'desmarque': 'Desmarque',
  'qualificado': 'Qualificado',
  'proposta': 'Proposta Enviada',
  'negociacao': 'Em Negociação',
  'fechado': 'Fechado/Ganho',
  'perdido': 'Perdido',
  'follow_up': 'Follow-up',
  'remarketing': 'Remarketing',
};

// Cores HSL para usar nos estilos inline (baseadas no design system)
const stageColorStyles: Record<string, { bg: string; glow: string }> = {
  'novo': { 
    bg: 'linear-gradient(135deg, hsl(27 100% 50%), hsl(40 100% 65%))',
    glow: 'hsl(27 100% 50% / 0.35)'
  },
  'entrada': { 
    bg: 'linear-gradient(135deg, hsl(40 100% 65%), hsl(45 96% 55%))',
    glow: 'hsl(40 100% 65% / 0.35)'
  },
  'reuniao_agendada': { 
    bg: 'linear-gradient(135deg, hsl(155 65% 40%), hsl(155 65% 35%))',
    glow: 'hsl(155 65% 40% / 0.35)'
  },
  'desmarque': { 
    bg: 'linear-gradient(135deg, hsl(4 72% 50%), hsl(4 72% 45%))',
    glow: 'hsl(4 72% 50% / 0.35)'
  },
  'qualificado': { 
    bg: 'linear-gradient(135deg, hsl(142 71% 45%), hsl(142 71% 40%))',
    glow: 'hsl(142 71% 45% / 0.35)'
  },
  'proposta': { 
    bg: 'linear-gradient(135deg, hsl(270 60% 50%), hsl(270 60% 45%))',
    glow: 'hsl(270 60% 50% / 0.35)'
  },
  'negociacao': { 
    bg: 'linear-gradient(135deg, hsl(40 75% 48%), hsl(40 75% 43%))',
    glow: 'hsl(40 75% 48% / 0.35)'
  },
  'fechado': { 
    bg: 'linear-gradient(135deg, hsl(84 70% 45%), hsl(84 70% 40%))',
    glow: 'hsl(84 70% 45% / 0.35)'
  },
  'perdido': { 
    bg: 'linear-gradient(135deg, hsl(0 0% 45%), hsl(0 0% 40%))',
    glow: 'hsl(0 0% 45% / 0.35)'
  },
  'follow_up': { 
    bg: 'linear-gradient(135deg, hsl(27 100% 50%), hsl(27 100% 45%))',
    glow: 'hsl(27 100% 50% / 0.35)'
  },
  'remarketing': { 
    bg: 'linear-gradient(135deg, hsl(330 70% 50%), hsl(330 70% 45%))',
    glow: 'hsl(330 70% 50% / 0.35)'
  },
};

// Cores de fallback por índice (usando tons quentes do Pinn)
const indexColorStyles = [
  { bg: 'linear-gradient(135deg, hsl(27 100% 50%), hsl(40 100% 65%))', glow: 'hsl(27 100% 50% / 0.35)' },
  { bg: 'linear-gradient(135deg, hsl(40 100% 65%), hsl(45 96% 55%))', glow: 'hsl(40 100% 65% / 0.35)' },
  { bg: 'linear-gradient(135deg, hsl(45 96% 55%), hsl(45 96% 50%))', glow: 'hsl(45 96% 55% / 0.35)' },
  { bg: 'linear-gradient(135deg, hsl(155 65% 40%), hsl(155 65% 35%))', glow: 'hsl(155 65% 40% / 0.35)' },
  { bg: 'linear-gradient(135deg, hsl(142 71% 45%), hsl(142 71% 40%))', glow: 'hsl(142 71% 45% / 0.35)' },
  { bg: 'linear-gradient(135deg, hsl(200 80% 50%), hsl(200 80% 45%))', glow: 'hsl(200 80% 50% / 0.35)' },
  { bg: 'linear-gradient(135deg, hsl(270 60% 50%), hsl(270 60% 45%))', glow: 'hsl(270 60% 50% / 0.35)' },
  { bg: 'linear-gradient(135deg, hsl(330 70% 50%), hsl(330 70% 45%))', glow: 'hsl(330 70% 50% / 0.35)' },
];

export function FunnelChart({ data, isLoading, onStageClick }: FunnelChartProps) {
  const maxLeads = Math.max(...data.map(s => s.leads), 1);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 rounded-lg flex-1" style={{ maxWidth: `${100 - i * 18}%` }} />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm">Sem dados do funil</p>
      </div>
    );
  }

  // Formatar nome do estágio
  const formatStageName = (stageName: string): string => {
    const key = stageName.toLowerCase().replace(/\s+/g, '_');
    if (stageNameMap[key]) return stageNameMap[key];
    
    return stageName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Obter estilo de cor do estágio
  const getStageColorStyle = (stageName: string, index: number) => {
    const key = stageName.toLowerCase().replace(/\s+/g, '_');
    if (stageColorStyles[key]) return stageColorStyles[key];
    return indexColorStyles[index % indexColorStyles.length];
  };

  return (
    <div className="space-y-3">
      {data.map((stage, index) => {
        const percentage = (stage.leads / maxLeads) * 100;
        const colorStyle = getStageColorStyle(stage.stage_name, index);
        const displayName = formatStageName(stage.stage_name);

        return (
          <Tooltip key={stage.stage_key || index}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onStageClick?.(stage)}
                className="w-full group focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  {/* Stage name on the left */}
                  <div className="w-28 text-left flex-shrink-0">
                    <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors truncate block">
                      {displayName}
                    </span>
                  </div>
                  
                  {/* Bar container */}
                  <div className="flex-1 relative h-9">
                    {/* Background track */}
                    <div className="absolute inset-0 rounded-lg bg-muted/30" />
                    
                    {/* Filled bar */}
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out",
                        "group-hover:brightness-110"
                      )}
                      style={{ 
                        width: `${Math.max(percentage, 5)}%`,
                        background: colorStyle.bg,
                        boxShadow: `0 0 20px -4px ${colorStyle.glow}`,
                      }}
                    >
                      {/* Inner highlight */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/20 to-transparent opacity-60" />
                    </div>
                  </div>
                  
                  {/* Value on the right */}
                  <div className="w-16 text-right flex-shrink-0">
                    <span className="text-base font-bold text-foreground tabular-nums">
                      {stage.leads.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="pinn-tooltip">
              <div className="text-center">
                <p className="font-semibold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {((stage.leads / maxLeads) * 100).toFixed(1)}% do maior estágio
                </p>
                <p className="text-sm font-bold text-primary mt-1">
                  {stage.leads.toLocaleString('pt-BR')} leads
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}