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

// Pinn Design System Colors (Orange Theme)
export const chartColors = {
  primary: 'hsl(27, 100%, 50%)',        // --pinn-orange-500
  secondary: 'hsl(40, 100%, 65%)',      // --pinn-gold-500
  success: 'hsl(155, 65%, 40%)',        // --success
  warning: 'hsl(40, 75%, 48%)',         // --warning
  destructive: 'hsl(4, 72%, 50%)',      // --destructive
  purple: 'hsl(280, 65%, 55%)',
  pink: 'hsl(340, 70%, 55%)',
  orange: 'hsl(25, 90%, 50%)',
  cyan: 'hsl(190, 85%, 45%)',
  lime: 'hsl(84, 75%, 40%)',
  rose: 'hsl(350, 85%, 55%)',
};

// Detect if we're in light mode
const isDarkMode = () => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark');
  }
  return true;
};

// Grid and axis styling - theme aware
const getAxisProps = () => {
  const dark = isDarkMode();
  return {
    stroke: dark ? 'hsl(27, 100%, 50% / 0.22)' : 'hsl(30, 20%, 80%)',
    fontSize: 11,
    tickLine: false,
    axisLine: false,
    tick: { fill: dark ? 'hsl(35, 30%, 95% / 0.55)' : 'hsl(20, 20%, 40%)' }
  };
};

const getGridColor = () => {
  const dark = isDarkMode();
  return dark ? 'rgba(246, 241, 234, 0.06)' : 'rgba(0, 0, 0, 0.08)';
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const dark = isDarkMode();

  return (
    <div 
      className="px-3 py-2 rounded-lg text-sm shadow-lg border"
      style={{
        background: dark ? 'hsl(20, 60%, 8%)' : 'hsl(0, 0%, 100%)',
        borderColor: dark ? 'hsl(27, 100%, 50% / 0.3)' : 'hsl(30, 20%, 85%)',
        color: dark ? 'hsl(35, 30%, 95%)' : 'hsl(20, 25%, 15%)',
      }}
    >
      <p className="text-xs opacity-60 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: entry.color }} 
          />
          <span className="opacity-70">{entry.name}:</span>
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

  const axisProps = getAxisProps();
  const gridColor = getGridColor();
  const dark = isDarkMode();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((line) => (
            <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors[line.color]} stopOpacity={dark ? 0.3 : 0.4} />
              <stop offset="100%" stopColor={chartColors[line.color]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="dayLabel" {...axisProps} />
        <YAxis {...axisProps} />
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
  const axisProps = getAxisProps();
  const gridColor = getGridColor();
  const dark = isDarkMode();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={chartColors[color]} stopOpacity={dark ? 0.8 : 0.9} />
            <stop offset="100%" stopColor={chartColors[color]} stopOpacity={dark ? 0.4 : 0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
        <XAxis type="number" {...axisProps} tickFormatter={formatValue} />
        <YAxis 
          type="category" 
          dataKey="name" 
          {...axisProps} 
          width={150}
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

  const axisProps = getAxisProps();
  const gridColor = getGridColor();
  const dark = isDarkMode();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="hourBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors[color]} stopOpacity={dark ? 0.8 : 0.9} />
            <stop offset="100%" stopColor={chartColors[color]} stopOpacity={dark ? 0.3 : 0.4} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="hourLabel" {...axisProps} interval={2} />
        <YAxis {...axisProps} />
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

  const axisProps = getAxisProps();
  const gridColor = getGridColor();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradient-accumulated" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.success} stopOpacity={0.4} />
            <stop offset="100%" stopColor={chartColors.success} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradient-daily" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis dataKey="dayLabel" {...axisProps} />
        <YAxis {...axisProps} tickFormatter={(v) => `${valuePrefix}${v}`} />
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
            stroke={chartColors.primary}
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
  chartColors.primary,      // Pinn orange
  chartColors.secondary,    // Pinn gold
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

  const axisProps = getAxisProps();
  const gridColor = getGridColor();

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
        <XAxis dataKey="dayLabel" {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <CustomTooltip active={active} payload={payload} label={label} />
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