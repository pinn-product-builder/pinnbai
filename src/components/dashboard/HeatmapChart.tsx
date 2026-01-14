import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapData {
  dow: number;
  hour: number;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapData[];
  className?: string;
}

const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Cores quentes: do frio (azul) ao quente (vermelho/laranja)
const heatColors = [
  { bg: 'bg-slate-800/30', border: 'border-slate-700/20', label: '0' },
  { bg: 'bg-emerald-500/30', border: 'border-emerald-500/40', label: 'Baixo' },
  { bg: 'bg-yellow-500/50', border: 'border-yellow-500/50', label: 'Médio' },
  { bg: 'bg-orange-500/70', border: 'border-orange-500/60', label: 'Alto' },
  { bg: 'bg-red-500/90', border: 'border-red-500/70', label: 'Máximo' },
];

export function HeatmapChart({ data, className }: HeatmapChartProps) {
  // Create a 7x24 matrix
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  
  data.forEach(({ dow, hour, value }) => {
    if (dow >= 0 && dow < 7 && hour >= 0 && hour < 24) {
      matrix[dow][hour] = value;
    }
  });

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const totalMessages = data.reduce((sum, d) => sum + d.value, 0);

  const getIntensityIndex = (value: number): number => {
    if (value === 0) return 0;
    const ratio = value / maxValue;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const getPercentage = (value: number): string => {
    if (totalMessages === 0) return '0%';
    return ((value / totalMessages) * 100).toFixed(1) + '%';
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="inline-block min-w-full">
        {/* Hour labels */}
        <div className="flex mb-2 pl-12 pr-2">
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
            <div 
              key={hour} 
              className={cn(
                "flex-1 text-center text-[9px] font-medium",
                hour % 3 === 0 ? "text-muted-foreground" : "text-muted-foreground/40"
              )}
            >
              {hour % 3 === 0 ? `${String(hour).padStart(2, '0')}` : ''}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {matrix.map((row, dow) => (
            <div key={dow} className="flex items-center gap-1">
              <span className="w-10 text-[11px] font-medium text-muted-foreground text-right pr-2">
                {dayLabels[dow]}
              </span>
              <div className="flex gap-0.5 flex-1">
                {row.map((value, hour) => {
                  const intensityIndex = getIntensityIndex(value);
                  const color = heatColors[intensityIndex];
                  
                  return (
                    <Tooltip key={`${dow}-${hour}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex-1 h-5 rounded-sm cursor-pointer transition-all duration-200 border",
                            "hover:scale-110 hover:z-10 hover:shadow-lg",
                            color.bg,
                            color.border
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="bg-popover border border-border shadow-xl p-3 min-w-[140px]"
                      >
                        <div className="space-y-1.5">
                          <p className="font-semibold text-foreground text-sm">
                            {value.toLocaleString('pt-BR')} mensagens
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{dayLabels[dow]}, {String(hour).padStart(2, '0')}:00</span>
                            <span className="font-medium text-primary">{getPercentage(value)}</span>
                          </div>
                          <div className="pt-1 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                              <div className={cn("w-2.5 h-2.5 rounded-sm", color.bg, color.border)} />
                              <span className="text-[10px] text-muted-foreground">
                                Intensidade: {color.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Legend */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="font-medium">Intensidade:</span>
            <div className="flex gap-1 ml-1">
              {heatColors.map((color, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "w-4 h-4 rounded-sm cursor-help border transition-transform hover:scale-125",
                        color.bg,
                        color.border
                      )} 
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">{color.label}</p>
                    <p className="text-muted-foreground">
                      {i === 0 ? 'Sem atividade' : 
                       i === 1 ? '1-25% do máximo' :
                       i === 2 ? '25-50% do máximo' :
                       i === 3 ? '50-75% do máximo' :
                       '75-100% do máximo'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground">
            <span className="font-medium">{totalMessages.toLocaleString('pt-BR')}</span> mensagens no período
          </div>
        </div>
      </div>
    </div>
  );
}
