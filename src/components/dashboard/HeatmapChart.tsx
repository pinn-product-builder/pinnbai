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

export function HeatmapChart({ data, className }: HeatmapChartProps) {
  // Create a 7x24 matrix
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  
  data.forEach(({ dow, hour, value }) => {
    if (dow >= 0 && dow < 7 && hour >= 0 && hour < 24) {
      matrix[dow][hour] = value;
    }
  });

  const maxValue = Math.max(...data.map(d => d.value), 1);

  const getIntensity = (value: number) => {
    const ratio = value / maxValue;
    if (ratio === 0) return 'bg-muted/20';
    if (ratio < 0.25) return 'bg-primary/20';
    if (ratio < 0.5) return 'bg-primary/40';
    if (ratio < 0.75) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="inline-block min-w-full">
        {/* Hour labels */}
        <div className="flex mb-1 pl-12">
          {[0, 6, 12, 18, 23].map((hour) => (
            <div 
              key={hour} 
              className="text-[10px] text-muted-foreground"
              style={{ 
                position: 'relative', 
                left: `${(hour / 24) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {String(hour).padStart(2, '0')}h
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-0.5">
          {matrix.map((row, dow) => (
            <div key={dow} className="flex items-center gap-0.5">
              <span className="w-10 text-[10px] text-muted-foreground text-right pr-2">
                {dayLabels[dow]}
              </span>
              <div className="flex gap-0.5 flex-1">
                {row.map((value, hour) => (
                  <Tooltip key={`${dow}-${hour}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "flex-1 h-4 rounded-sm cursor-pointer transition-all duration-150",
                          "hover:ring-1 hover:ring-primary/50",
                          getIntensity(value)
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{value.toLocaleString('pt-BR')} mensagens</p>
                      <p className="text-muted-foreground">
                        {dayLabels[dow]} às {String(hour).padStart(2, '0')}h
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-muted-foreground">
          <span>Menos</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-muted/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary/80" />
          </div>
          <span>Mais</span>
        </div>
      </div>
    </div>
  );
}
