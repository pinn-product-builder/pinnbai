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
  'novo': '🆕 Novo Lead',
  'entrada': '📥 Entrada',
  'reuniao_agendada': '📅 Reunião Agendada',
  'desmarque': '❌ Desmarque',
  'qualificado': '✅ Qualificado',
  'proposta': '📋 Proposta Enviada',
  'negociacao': '🤝 Em Negociação',
  'fechado': '🎉 Fechado/Ganho',
  'perdido': '💔 Perdido',
  'follow_up': '🔄 Follow-up',
  'remarketing': '📢 Remarketing',
};

// Cores únicas para cada estágio
const stageColors: Record<string, string> = {
  'novo': 'from-blue-500 to-blue-600',
  'entrada': 'from-cyan-500 to-cyan-600',
  'reuniao_agendada': 'from-emerald-500 to-emerald-600',
  'desmarque': 'from-red-400 to-red-500',
  'qualificado': 'from-green-500 to-green-600',
  'proposta': 'from-violet-500 to-violet-600',
  'negociacao': 'from-amber-500 to-amber-600',
  'fechado': 'from-lime-500 to-lime-600',
  'perdido': 'from-gray-400 to-gray-500',
  'follow_up': 'from-orange-500 to-orange-600',
  'remarketing': 'from-pink-500 to-pink-600',
};

// Cores de fallback por índice
const indexColors = [
  'from-blue-500 to-blue-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-violet-600',
  'from-amber-500 to-amber-600',
  'from-cyan-500 to-cyan-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-lime-500 to-lime-600',
];

export function FunnelChart({ data, isLoading, onStageClick }: FunnelChartProps) {
  const maxLeads = Math.max(...data.map(s => s.leads), 1);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 flex-1" style={{ maxWidth: `${100 - i * 15}%` }} />
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

  // Formatar nome do estágio
  const formatStageName = (stageName: string): string => {
    const key = stageName.toLowerCase().replace(/\s+/g, '_');
    if (stageNameMap[key]) return stageNameMap[key];
    
    // Capitalizar primeira letra de cada palavra
    return stageName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Obter cor do estágio
  const getStageColor = (stageName: string, index: number): string => {
    const key = stageName.toLowerCase().replace(/\s+/g, '_');
    if (stageColors[key]) return stageColors[key];
    return indexColors[index % indexColors.length];
  };

  return (
    <div className="space-y-3">
      {data.map((stage, index) => {
        const percentage = (stage.leads / maxLeads) * 100;
        const gradientClass = getStageColor(stage.stage_name, index);
        const displayName = formatStageName(stage.stage_name);

        return (
          <Tooltip key={stage.stage_key || index}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onStageClick?.(stage)}
                className="w-full group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <div 
                      className={cn(
                        "h-12 rounded-xl bg-gradient-to-r transition-all duration-300",
                        "group-hover:shadow-lg group-hover:scale-[1.02]",
                        gradientClass
                      )}
                      style={{ width: `${Math.max(percentage, 8)}%` }}
                    >
                      <div className="absolute inset-0 flex items-center px-4">
                        <span className="text-sm font-semibold text-white truncate drop-shadow-md">
                          {displayName}
                        </span>
                      </div>
                      {/* Glow effect */}
                      <div 
                        className={cn(
                          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity",
                          "shadow-[0_0_25px_-5px] shadow-current"
                        )}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-lg font-bold text-foreground">
                      {stage.leads.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">leads</span>
                  </div>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {((stage.leads / maxLeads) * 100).toFixed(1)}% do total
                </p>
                <p className="text-sm font-bold text-primary">
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
