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

// Pinn Design System Colors
export const chartColors = {
  primary: 'hsl(187, 87%, 40%)',      // --pinn-cyan-500
  secondary: 'hsl(220, 87%, 57%)',    // --pinn-blue-500
  success: 'hsl(160, 65%, 36%)',      // --success
  warning: 'hsl(38, 75%, 44%)',       // --warning
  destructive: 'hsl(4, 72%, 50%)',    // --destructive
  purple: 'hsl(280, 65%, 55%)',
  pink: 'hsl(340, 70%, 55%)',
  orange: 'hsl(25, 90%, 50%)',
  cyan: 'hsl(190, 85%, 45%)',
  lime: 'hsl(84, 75%, 40%)',
  rose: 'hsl(350, 85%, 55%)',
};

// Grid and axis styling (Pinn)
const commonAxisProps = {
  stroke: 'hsl(215, 35%, 20%)',       // --border-strong
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tick: { fill: 'hsl(215, 15%, 50%)' } // --text-3
};

const gridColor = 'rgba(255, 255, 255, 0.06)'; // --gridline

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="pinn-tooltip">
      <p className="text-xs text-text-3 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }} 
          />
          <span className="text-text-2">{entry.name}:</span>
          <span className="font-medium text-text-1">{entry.value?.toLocaleString('pt-BR')}</span>
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
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="dayLabel" {...commonAxisProps} />
        <YAxis {...commonAxisProps} />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => <span className="text-xs text-text-3">{value}</span>}
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
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
        <XAxis type="number" {...commonAxisProps} tickFormatter={formatValue} />
        <YAxis 
          type="category" 
          dataKey="name" 
          {...commonAxisProps} 
          width={150}
          tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 11 }}
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
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
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

interface AccumulatedChartProps {
  data: Array<{
    day: string;
    accumulated: number;
    daily?: number;
  }>;
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function AccumulatedChart({ 
  data, 
  height = 280, 
  valuePrefix = '$',
  valueSuffix = '',
}: AccumulatedChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dayLabel: format(parseISO(d.day), 'dd/MM', { locale: ptBR }),
  }));

  const formatValue = (value: number) => {
    return `${valuePrefix}${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${valueSuffix}`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradient-accumulated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.success} stopOpacity={0.4} />
            <stop offset="100%" stopColor={chartColors.success} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradient-daily" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.warning} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColors.warning} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="dayLabel" {...commonAxisProps} />
        <YAxis {...commonAxisProps} tickFormatter={(v) => `${valuePrefix}${v}`} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="pinn-tooltip">
                <p className="text-xs text-text-3 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className="text-text-2">{entry.name}:</span>
                    <span className="font-medium text-text-1">{formatValue(entry.value)}</span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => <span className="text-xs text-text-3">{value}</span>}
        />
        {formattedData[0]?.daily !== undefined && (
          <Area
            type="monotone"
            dataKey="daily"
            name="Custo Diário"
            stroke={chartColors.warning}
            strokeWidth={2}
            fill="url(#gradient-daily)"
          />
        )}
        <Area
          type="monotone"
          dataKey="accumulated"
          name="Custo Acumulado"
          stroke={chartColors.success}
          strokeWidth={2}
          fill="url(#gradient-accumulated)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface StackedTrendChartProps {
  data: any[];
  keys: string[];
  labels: Record<string, string>;
  height?: number;
}

const stackedColors = [
  chartColors.primary,      // Pinn cyan
  chartColors.secondary,    // Pinn blue
  chartColors.success,
  chartColors.warning,
  chartColors.orange,
  chartColors.purple,
  chartColors.pink,
  chartColors.lime,
];

export function StackedTrendChart({ 
  data, 
  keys, 
  labels,
  height = 300,
}: StackedTrendChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    dayLabel: format(parseISO(d.day), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {keys.map((key, index) => (
            <linearGradient key={key} id={`gradient-stacked-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stackedColors[index % stackedColors.length]} stopOpacity={0.6} />
              <stop offset="100%" stopColor={stackedColors[index % stackedColors.length]} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="dayLabel" {...commonAxisProps} />
        <YAxis {...commonAxisProps} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="pinn-tooltip max-w-xs">
                <p className="text-xs text-text-3 mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className="text-text-2 truncate">{labels[entry.dataKey] || entry.dataKey}:</span>
                    <span className="font-medium text-text-1">{entry.value?.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: 20 }}
          formatter={(value) => (
            <span className="text-xs text-text-3">
              {labels[value] || value}
            </span>
          )}
        />
        {keys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stackId="1"
            stroke={stackedColors[index % stackedColors.length]}
            strokeWidth={1}
            fill={`url(#gradient-stacked-${key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
