import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

interface ConversationTrendData {
  day: string;
  msg_in_total: number;
  leads_with_msg_in: number;
  conversion_rate?: number;
}

interface ConversationTrendChartProps {
  data: ConversationTrendData[];
  height?: number;
  className?: string;
}

export function ConversationTrendChart({ data, height = 300, className }: ConversationTrendChartProps) {
  // Calcular taxa de conversão (mensagens por lead)
  const chartData = data.map(d => {
    const conversionRate = d.leads_with_msg_in > 0 
      ? (d.msg_in_total / d.leads_with_msg_in) 
      : 0;
    return {
      ...d,
      day: new Date(d.day + 'T00:00:00').toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      conversion_rate: Number(conversionRate.toFixed(2)),
    };
  });

  // Calcular média de conversão
  const avgConversion = chartData.length > 0
    ? chartData.reduce((sum, d) => sum + d.conversion_rate, 0) / chartData.length
    : 0;

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--muted-foreground) / 0.2)" 
            vertical={false}
          />
          <XAxis 
            dataKey="day" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            yAxisId="left"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            formatter={(value: number, name: string) => {
              if (name === 'Taxa de Conversão') {
                return [`${value.toFixed(2)} msg/lead`, name];
              }
              return [value, name];
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>
                {value}
              </span>
            )}
          />
          <ReferenceLine 
            y={avgConversion} 
            yAxisId="left"
            stroke="hsl(var(--warning))" 
            strokeDasharray="5 5"
            label={{ 
              value: `Média: ${avgConversion.toFixed(2)}`, 
              fill: 'hsl(var(--warning))',
              fontSize: 10,
              position: 'right'
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="conversion_rate"
            name="Taxa de Conversão"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="msg_in_total"
            name="Mensagens"
            stroke="hsl(var(--success))"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
            activeDot={{ r: 3, fill: 'hsl(var(--success))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
