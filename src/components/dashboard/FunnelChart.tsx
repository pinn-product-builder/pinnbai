import React, { useState, useEffect } from 'react';
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

// Cores HSL para usar nos estilos inline - Paleta mais suave e premium
// Usando tons neutros com variações de intensidade do acento
const stageColorStyles: Record<string, { bg: string; glow: string }> = {
  'novo': { 
    bg: 'linear-gradient(135deg, hsl(27 85% 55%), hsl(27 75% 50%))',
    glow: 'hsl(27 85% 55% / 0.2)'
  },
  'entrada': { 
    bg: 'linear-gradient(135deg, hsl(32 75% 52%), hsl(32 65% 48%))',
    glow: 'hsl(32 75% 52% / 0.2)'
  },
  'reuniao_agendada': { 
    bg: 'linear-gradient(135deg, hsl(38 70% 50%), hsl(38 60% 46%))',
    glow: 'hsl(38 70% 50% / 0.2)'
  },
  'desmarque': { 
    bg: 'linear-gradient(135deg, hsl(220 15% 55%), hsl(220 12% 50%))',
    glow: 'hsl(220 15% 55% / 0.15)'
  },
  'qualificado': { 
    bg: 'linear-gradient(135deg, hsl(160 45% 45%), hsl(160 40% 40%))',
    glow: 'hsl(160 45% 45% / 0.2)'
  },
  'proposta': { 
    bg: 'linear-gradient(135deg, hsl(200 50% 50%), hsl(200 45% 45%))',
    glow: 'hsl(200 50% 50% / 0.2)'
  },
  'negociacao': { 
    bg: 'linear-gradient(135deg, hsl(45 60% 50%), hsl(45 55% 46%))',
    glow: 'hsl(45 60% 50% / 0.2)'
  },
  'fechado': { 
    bg: 'linear-gradient(135deg, hsl(155 50% 42%), hsl(155 45% 38%))',
    glow: 'hsl(155 50% 42% / 0.2)'
  },
  'perdido': { 
    bg: 'linear-gradient(135deg, hsl(220 10% 50%), hsl(220 8% 45%))',
    glow: 'hsl(220 10% 50% / 0.15)'
  },
  'follow_up': { 
    bg: 'linear-gradient(135deg, hsl(27 70% 52%), hsl(27 60% 48%))',
    glow: 'hsl(27 70% 52% / 0.2)'
  },
  'remarketing': { 
    bg: 'linear-gradient(135deg, hsl(280 40% 50%), hsl(280 35% 45%))',
    glow: 'hsl(280 40% 50% / 0.2)'
  },
};

// Cores de fallback por índice - Paleta neutra com variações de intensidade
const indexColorStyles = [
  { bg: 'linear-gradient(135deg, hsl(27 75% 52%), hsl(27 65% 48%))', glow: 'hsl(27 75% 52% / 0.2)' },
  { bg: 'linear-gradient(135deg, hsl(32 65% 50%), hsl(32 55% 46%))', glow: 'hsl(32 65% 50% / 0.2)' },
  { bg: 'linear-gradient(135deg, hsl(38 60% 48%), hsl(38 50% 44%))', glow: 'hsl(38 60% 48% / 0.2)' },
  { bg: 'linear-gradient(135deg, hsl(160 45% 45%), hsl(160 40% 40%))', glow: 'hsl(160 45% 45% / 0.2)' },
  { bg: 'linear-gradient(135deg, hsl(200 45% 48%), hsl(200 40% 44%))', glow: 'hsl(200 45% 48% / 0.2)' },
  { bg: 'linear-gradient(135deg, hsl(220 15% 52%), hsl(220 12% 48%))', glow: 'hsl(220 15% 52% / 0.15)' },
  { bg: 'linear-gradient(135deg, hsl(270 35% 48%), hsl(270 30% 44%))', glow: 'hsl(270 35% 48% / 0.2)' },
  { bg: 'linear-gradient(135deg, hsl(340 40% 50%), hsl(340 35% 46%))', glow: 'hsl(340 40% 50% / 0.2)' },
];

export function FunnelChart({ data, isLoading, onStageClick }: FunnelChartProps) {
  const [mounted, setMounted] = useState(false);
  const maxLeads = Math.max(...data.map(s => s.leads), 1);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

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

        // Staggered animation delay
        const animationDelay = index * 100;

        return (
          <Tooltip key={stage.stage_key || index}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onStageClick?.(stage)}
                className={cn(
                  "w-full group focus:outline-none",
                  "opacity-0 translate-x-[-20px]",
                  mounted && "opacity-100 translate-x-0"
                )}
                style={{
                  transition: `opacity 0.4s ease-out ${animationDelay}ms, transform 0.4s ease-out ${animationDelay}ms`,
                }}
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
                    
                    {/* Filled bar with width animation */}
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-lg",
                        "group-hover:brightness-110"
                      )}
                      style={{ 
                        width: mounted ? `${Math.max(percentage, 5)}%` : '0%',
                        background: colorStyle.bg,
                        boxShadow: `0 0 20px -4px ${colorStyle.glow}`,
                        transition: `width 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay + 150}ms, filter 0.2s ease`,
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