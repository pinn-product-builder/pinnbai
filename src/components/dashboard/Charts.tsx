import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const chartColors = {
  primary: 'hsl(187, 85%, 53%)',
  success: 'hsl(152, 69%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 72%, 51%)',
  purple: 'hsl(280, 65%, 60%)',
  pink: 'hsl(340, 75%, 55%)',
};

const commonAxisProps = {
  stroke: 'hsl(222, 30%, 30%)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-card p-3 border border-border/50 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }} 
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value?.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  );
};

interface DailyChartProps {
  data: any[];
  lines: Array<{
    key: string;
    name: string;
    color: keyof typeof chartColors;
    type?: 'line' | 'area';
  }>;
  height?: number;
}

export function DailyChart({ data, lines, height = 300 }: DailyChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dayLabel: format(parseISO(d.day), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((line) => (
            <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors[line.color]} stopOpacity={0.3} />
              <stop offset="100%" stopColor={chartColors[line.color]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 14%)" vertical={false} />
        <XAxis dataKey="dayLabel" {...commonAxisProps} />
        <YAxis {...commonAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
        />
        {lines.map((line) => 
          line.type === 'line' ? (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={chartColors[line.color]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ) : (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={chartColors[line.color]}
              strokeWidth={2}
              fill={`url(#gradient-${line.key})`}
            />
          )
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarChartHorizontalProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: keyof typeof chartColors;
  height?: number;
  formatValue?: (value: number) => string;
}

export function BarChartHorizontal({ 
  data, 
  color = 'primary', 
  height = 300,
  formatValue = (v) => v.toLocaleString('pt-BR'),
}: BarChartHorizontalProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={chartColors[color]} stopOpacity={0.8} />
            <stop offset="100%" stopColor={chartColors[color]} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 14%)" horizontal={false} />
        <XAxis type="number" {...commonAxisProps} tickFormatter={formatValue} />
        <YAxis 
          type="category" 
          dataKey="name" 
          {...commonAxisProps} 
          width={150}
          tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          fill="url(#barGradient)" 
          radius={[0, 4, 4, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface HourlyChartProps {
  data: Array<{
    hour: number;
    value: number;
  }>;
  color?: keyof typeof chartColors;
  height?: number;
}

export function HourlyChart({ data, color = 'primary', height = 200 }: HourlyChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    hourLabel: `${String(d.hour).padStart(2, '0')}h`,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="hourBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors[color]} stopOpacity={0.8} />
            <stop offset="100%" stopColor={chartColors[color]} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 14%)" vertical={false} />
        <XAxis dataKey="hourLabel" {...commonAxisProps} interval={2} />
        <YAxis {...commonAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          name="Mensagens"
          fill="url(#hourBarGradient)" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
