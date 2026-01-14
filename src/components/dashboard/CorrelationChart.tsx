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
  ZAxis,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface CorrelationData {
  day: string;
  spend: number;
  leads: number;
  entradas?: number;
  meetings_booked?: number;
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
  
  // Calcular CPL médio
  const totalSpend = filteredData.reduce((s, d) => s + d.spend, 0);
  const totalLeads = filteredData.reduce((s, d) => s + d.leads, 0);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  
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
    if (absR >= 0.7) return { label: 'Forte', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (absR >= 0.4) return { label: 'Moderada', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    if (absR >= 0.2) return { label: 'Fraca', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'Muito fraca', color: 'text-muted-foreground', bg: 'bg-muted' };
  };
  
  const correlationInfo = getCorrelationLabel(correlation);

  if (filteredData.length < 3) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        Dados insuficientes para análise de correlação
      </div>
    );
  }

  // Enriquecer dados com tamanho do ponto baseado em entradas
  const enrichedData = filteredData.map(d => ({
    ...d,
    size: Math.max(50, (d.entradas || 0) * 20 + 50),
    cpl: d.leads > 0 ? d.spend / d.leads : 0,
  }));

  return (
    <div className={cn("space-y-3", className)}>
      {/* Cards de métricas */}
      <div className="grid grid-cols-3 gap-2 px-2">
        <div className={cn("rounded-lg p-2 text-center", correlationInfo.bg)}>
          <div className={cn("text-lg font-bold", correlationInfo.color)}>
            {(correlation * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-muted-foreground">
            Correlação ({correlationInfo.label})
          </div>
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-center">
          <div className="text-lg font-bold text-primary">
            {formatCurrency(avgCpl)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            CPL Médio
          </div>
        </div>
        <div className="rounded-lg bg-muted p-2 text-center">
          <div className="text-lg font-bold text-foreground">
            {filteredData.length}
          </div>
          <div className="text-[10px] text-muted-foreground">
            Dias analisados
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height - 80}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
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
            label={{ 
              value: 'Investimento Diário (R$)', 
              position: 'insideBottom',
              offset: -10,
              style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' }
            }}
          />
          
          <YAxis 
            type="number" 
            dataKey="leads" 
            name="Leads"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            label={{ 
              value: 'Leads Gerados', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10,
              style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))', textAnchor: 'middle' }
            }}
          />
          
          <ZAxis type="number" dataKey="size" range={[50, 200]} />
          
          {/* Linhas de referência para médias */}
          <ReferenceLine 
            x={avgSpend} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5"
            strokeOpacity={0.6}
            label={{ 
              value: 'Média', 
              position: 'top', 
              style: { fontSize: 9, fill: 'hsl(var(--primary))' } 
            }}
          />
          <ReferenceLine 
            y={avgLeads} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5"
            strokeOpacity={0.6}
          />
          
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
                    <p className="font-medium text-foreground mb-2">{d.day}</p>
                    <div className="space-y-1">
                      <p className="text-warning flex justify-between gap-4">
                        <span>Investimento:</span>
                        <span className="font-medium">{formatCurrency(d.spend)}</span>
                      </p>
                      <p className="text-primary flex justify-between gap-4">
                        <span>Leads:</span>
                        <span className="font-medium">{d.leads}</span>
                      </p>
                      {d.entradas > 0 && (
                        <p className="text-secondary-foreground flex justify-between gap-4">
                          <span>Entradas:</span>
                          <span className="font-medium">{d.entradas}</span>
                        </p>
                      )}
                      {d.cpl > 0 && (
                        <p className="text-muted-foreground flex justify-between gap-4 pt-1 border-t">
                          <span>CPL do dia:</span>
                          <span className="font-medium">{formatCurrency(d.cpl)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Scatter 
            name="Dias" 
            data={enrichedData} 
            fill="hsl(var(--primary))"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Legenda */}
      <div className="text-[10px] text-muted-foreground text-center px-2">
        Cada ponto = 1 dia • Tamanho do ponto = nº de entradas • Linhas tracejadas = médias
      </div>
    </div>
  );
}