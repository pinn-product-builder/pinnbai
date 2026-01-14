import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';
import { cn } from '@/lib/utils';

interface CorrelationData {
  day: string;
  spend: number;
  leads: number;
}

interface CorrelationChartProps {
  data: CorrelationData[];
  height?: number;
  className?: string;
}

export function CorrelationChart({ data, height = 300, className }: CorrelationChartProps) {
  // Filtrar apenas dias com dados
  const filteredData = data.filter(d => d.spend > 0 || d.leads > 0);
  
  // Calcular médias
  const avgSpend = filteredData.reduce((s, d) => s + d.spend, 0) / (filteredData.length || 1);
  const avgLeads = filteredData.reduce((s, d) => s + d.leads, 0) / (filteredData.length || 1);
  
  // Calcular correlação
  const calculateCorrelation = () => {
    if (filteredData.length < 3) return 0;
    
    const n = filteredData.length;
    const sumX = filteredData.reduce((s, d) => s + d.spend, 0);
    const sumY = filteredData.reduce((s, d) => s + d.leads, 0);
    const sumXY = filteredData.reduce((s, d) => s + d.spend * d.leads, 0);
    const sumX2 = filteredData.reduce((s, d) => s + d.spend * d.spend, 0);
    const sumY2 = filteredData.reduce((s, d) => s + d.leads * d.leads, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };
  
  const correlation = calculateCorrelation();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCorrelationLabel = (r: number) => {
    const absR = Math.abs(r);
    if (absR >= 0.7) return { label: 'Forte', color: 'text-emerald-500' };
    if (absR >= 0.4) return { label: 'Moderada', color: 'text-yellow-500' };
    if (absR >= 0.2) return { label: 'Fraca', color: 'text-orange-500' };
    return { label: 'Muito fraca', color: 'text-muted-foreground' };
  };
  
  const correlationInfo = getCorrelationLabel(correlation);

  if (filteredData.length < 3) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        Dados insuficientes para análise de correlação
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Indicador de correlação */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Correlação:</span>
          <span className={cn("text-sm font-bold", correlationInfo.color)}>
            {(correlation * 100).toFixed(0)}%
          </span>
          <span className={cn("text-xs", correlationInfo.color)}>
            ({correlationInfo.label})
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {filteredData.length} pontos analisados
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.4}
          />
          
          <XAxis 
            type="number" 
            dataKey="spend" 
            name="Investimento"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `R$${v}`}
          >
            <Label 
              value="Investimento (R$)" 
              offset={-15} 
              position="insideBottom" 
              style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
          </XAxis>
          
          <YAxis 
            type="number" 
            dataKey="leads" 
            name="Leads"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          >
            <Label 
              value="Leads" 
              angle={-90} 
              position="insideLeft" 
              style={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', textAnchor: 'middle' }}
            />
          </YAxis>
          
          {/* Linhas de referência para médias */}
          <ReferenceLine 
            x={avgSpend} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5"
            strokeOpacity={0.5}
          />
          <ReferenceLine 
            y={avgLeads} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5"
            strokeOpacity={0.5}
          />
          
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-medium text-foreground mb-1">{data.day}</p>
                    <p className="text-warning">Investimento: {formatCurrency(data.spend)}</p>
                    <p className="text-primary">Leads: {data.leads}</p>
                    {data.leads > 0 && (
                      <p className="text-muted-foreground mt-1">
                        CPL: {formatCurrency(data.spend / data.leads)}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Scatter 
            name="Dias" 
            data={filteredData} 
            fill="hsl(var(--primary))"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legenda */}
      <div className="text-[10px] text-muted-foreground text-center">
        Cada ponto representa um dia • Linhas tracejadas = médias
      </div>
    </div>
  );
}