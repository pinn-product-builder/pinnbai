/**
 * Componentes de Gráficos de Demonstração
 * Gráficos com dados mock realistas para visualização em templates
 * Interface nível Afonsina - Design Premium Dark Warm
 */

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ===== DESIGN SYSTEM COLORS =====
const chartColors = {
  primary: 'hsl(27, 100%, 50%)',
  secondary: 'hsl(40, 100%, 65%)',
  success: 'hsl(155, 65%, 40%)',
  warning: 'hsl(40, 75%, 48%)',
  destructive: 'hsl(4, 72%, 50%)',
  purple: 'hsl(280, 65%, 55%)',
  cyan: 'hsl(190, 85%, 45%)',
  muted: 'hsl(220, 10%, 40%)',
};

const colorPalette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.success,
  chartColors.warning,
  chartColors.cyan,
  chartColors.purple,
];

// ===== CUSTOM TOOLTIP COMPONENT =====
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div 
      className="px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md"
      style={{
        background: 'hsl(20 30% 10% / 0.95)',
        borderColor: 'hsl(27 100% 50% / 0.25)',
        boxShadow: '0 20px 40px -10px hsl(20 100% 2% / 0.8)',
      }}
    >
      <p className="text-xs font-medium mb-2" style={{ color: 'hsl(35 30% 70%)' }}>{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <span 
              className="w-2.5 h-2.5 rounded-full shadow-sm" 
              style={{ 
                backgroundColor: entry.color,
                boxShadow: `0 0 6px ${entry.color}40`
              }} 
            />
            <span style={{ color: 'hsl(35 30% 80%)' }}>{entry.name}:</span>
            <span className="font-semibold tabular-nums" style={{ color: 'hsl(35 30% 95%)' }}>
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString('pt-BR')
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== AXIS CONFIGURATION =====
const getAxisConfig = () => ({
  stroke: 'hsl(27, 100%, 50%, 0.2)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tick: { fill: 'hsl(35, 25%, 65%)' },
});

// ===== DATA GENERATORS =====
const generateTrendData = (months: number, baseValue: number, growth: number = 1.08) => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return Array.from({ length: months }, (_, i) => {
    const trend = baseValue * Math.pow(growth, i);
    const variance = trend * (0.9 + Math.random() * 0.2);
    return {
      name: monthNames[i % 12],
      value: Math.round(variance),
    };
  });
};

const generateMultiSeriesData = (months: number, series: { key: string; base: number; growth: number }[]) => {
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return Array.from({ length: months }, (_, i) => {
    const point: Record<string, any> = { name: monthNames[i % 12] };
    series.forEach(s => {
      const trend = s.base * Math.pow(s.growth, i);
      point[s.key] = Math.round(trend * (0.85 + Math.random() * 0.3));
    });
    return point;
  });
};

// ===== LINE CHART =====
interface DemoLineChartProps {
  height?: number;
  lines?: number;
  showLabels?: boolean;
  showTrend?: boolean;
}

export function DemoLineChart({ 
  height = 220, 
  lines = 2, 
  showLabels = true,
  showTrend = false 
}: DemoLineChartProps) {
  const data = useMemo(() => generateMultiSeriesData(12, [
    { key: 'leads', base: 120, growth: 1.06 },
    { key: 'conversoes', base: 45, growth: 1.08 },
    { key: 'ativos', base: 280, growth: 1.04 },
  ]), []);

  const seriesConfig = [
    { key: 'leads', name: 'Leads', color: chartColors.primary },
    { key: 'conversoes', name: 'Conversões', color: chartColors.success },
    { key: 'ativos', name: 'Usuários Ativos', color: chartColors.cyan },
  ];

  const axisConfig = getAxisConfig();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <defs>
          {seriesConfig.slice(0, lines).map((s, i) => (
            <filter key={`glow-${i}`} id={`lineGlow${i}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(35 30% 95% / 0.06)" 
          vertical={false} 
        />
        <XAxis dataKey="name" {...axisConfig} />
        <YAxis {...axisConfig} />
        <Tooltip content={<CustomTooltip />} />
        {showTrend && (
          <ReferenceLine 
            y={data.reduce((acc, d) => acc + d.leads, 0) / data.length} 
            stroke={chartColors.muted} 
            strokeDasharray="5 5"
            strokeOpacity={0.5}
          />
        )}
        {seriesConfig.slice(0, lines).map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ 
              r: 5, 
              fill: s.color, 
              strokeWidth: 2, 
              stroke: 'hsl(20 30% 12%)' 
            }}
            filter={`url(#lineGlow${i})`}
          />
        ))}
        {lines > 1 && (
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs ml-1" style={{ color: 'hsl(35 30% 75%)' }}>{value}</span>
            )}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ===== AREA CHART =====
interface DemoAreaChartProps {
  height?: number;
  stacked?: boolean;
  showGoal?: boolean;
}

export function DemoAreaChart({ height = 240, stacked = false, showGoal = false }: DemoAreaChartProps) {
  const data = useMemo(() => generateMultiSeriesData(12, [
    { key: 'mrr', base: 32000, growth: 1.12 },
    { key: 'expansion', base: 5000, growth: 1.18 },
  ]), []);

  const axisConfig = getAxisConfig();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.5} />
            <stop offset="50%" stopColor={chartColors.primary} stopOpacity={0.15} />
            <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expansionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.success} stopOpacity={0.5} />
            <stop offset="50%" stopColor={chartColors.success} stopOpacity={0.15} />
            <stop offset="100%" stopColor={chartColors.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(35 30% 95% / 0.06)" 
          vertical={false} 
        />
        <XAxis dataKey="name" {...axisConfig} />
        <YAxis 
          {...axisConfig} 
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          content={<CustomTooltip />}
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
        />
        {showGoal && (
          <ReferenceLine 
            y={80000} 
            stroke={chartColors.secondary}
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ 
              value: 'Meta: R$80k', 
              position: 'right',
              fill: chartColors.secondary,
              fontSize: 11,
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="mrr"
          name="MRR"
          stroke={chartColors.primary}
          fill="url(#mrrGradient)"
          strokeWidth={2.5}
          stackId={stacked ? "stack" : undefined}
        />
        <Area
          type="monotone"
          dataKey="expansion"
          name="Expansão"
          stroke={chartColors.success}
          fill="url(#expansionGradient)"
          strokeWidth={2.5}
          stackId={stacked ? "stack" : undefined}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs ml-1" style={{ color: 'hsl(35 30% 75%)' }}>{value}</span>
          )}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ===== BAR CHART =====
interface DemoBarChartProps {
  height?: number;
  horizontal?: boolean;
  bars?: number;
  showComparison?: boolean;
}

export function DemoBarChart({ 
  height = 220, 
  horizontal = false, 
  bars = 6,
  showComparison = false 
}: DemoBarChartProps) {
  const channelNames = ['Orgânico', 'Ads Pagos', 'Referral', 'Social', 'Email', 'Direct', 'Partners'];
  
  const data = useMemo(() => 
    channelNames.slice(0, bars).map((name, i) => ({
      name,
      atual: Math.floor(100 + Math.random() * 200) - i * 15,
      anterior: showComparison ? Math.floor(80 + Math.random() * 150) - i * 10 : undefined,
    })),
  [bars, showComparison]);

  const axisConfig = getAxisConfig();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ 
          top: 16, 
          right: 16, 
          left: horizontal ? 80 : 0, 
          bottom: 0 
        }}
        barGap={showComparison ? 2 : 0}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={1} />
            <stop offset="100%" stopColor={chartColors.secondary} stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="hsl(35 30% 95% / 0.06)"
          horizontal={!horizontal}
          vertical={horizontal}
        />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisConfig} />
            <YAxis type="category" dataKey="name" {...axisConfig} width={75} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" {...axisConfig} />
            <YAxis {...axisConfig} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        {showComparison && (
          <Bar
            dataKey="anterior"
            name="Mês Anterior"
            fill={chartColors.muted}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            opacity={0.5}
          />
        )}
        <Bar
          dataKey="atual"
          name="Atual"
          fill="url(#barGradient)"
          radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
        />
        {showComparison && (
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="rect"
            iconSize={10}
            formatter={(value) => (
              <span className="text-xs ml-1" style={{ color: 'hsl(35 30% 75%)' }}>{value}</span>
            )}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===== PIE/DONUT CHART =====
interface DemoPieChartProps {
  height?: number;
  donut?: boolean;
  showLabels?: boolean;
}

export function DemoPieChart({ height = 220, donut = true, showLabels = true }: DemoPieChartProps) {
  const data = [
    { name: 'Enterprise', value: 42, growth: 12 },
    { name: 'Pro', value: 28, growth: 8 },
    { name: 'Starter', value: 18, growth: -3 },
    { name: 'Free', value: 12, growth: 5 },
  ];

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="flex items-center gap-4" style={{ height }}>
      <ResponsiveContainer width="55%" height="100%">
        <PieChart>
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`pieGradient${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={colorPalette[i]} stopOpacity={1} />
                <stop offset="100%" stopColor={colorPalette[i]} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 50 : 0}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#pieGradient${index})`}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {showLabels && (
        <div className="flex-1 space-y-2.5">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colorPalette[i] }}
                />
                <span className="text-xs truncate" style={{ color: 'hsl(35 30% 75%)' }}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold tabular-nums" style={{ color: 'hsl(35 30% 95%)' }}>
                  {item.value}%
                </span>
                <span className={cn(
                  "text-[10px] flex items-center gap-0.5",
                  item.growth > 0 ? "text-success" : item.growth < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {item.growth > 0 ? <TrendingUp className="w-3 h-3" /> : 
                   item.growth < 0 ? <TrendingDown className="w-3 h-3" /> : 
                   <Minus className="w-3 h-3" />}
                  {Math.abs(item.growth)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== FUNNEL CHART =====
interface DemoFunnelChartProps {
  stages?: number;
  showConversion?: boolean;
}

export function DemoFunnelChart({ stages = 5, showConversion = true }: DemoFunnelChartProps) {
  const stageData = [
    { name: 'Visitantes', value: 12500, icon: '👁️' },
    { name: 'Leads', value: 3200, icon: '📧' },
    { name: 'Qualificados', value: 1450, icon: '✅' },
    { name: 'Propostas', value: 680, icon: '📋' },
    { name: 'Clientes', value: 245, icon: '🤝' },
  ];

  const data = stageData.slice(0, stages);
  const maxValue = data[0].value;

  return (
    <div className="space-y-3 py-2">
      {data.map((stage, index) => {
        const percentage = (stage.value / maxValue) * 100;
        const conversionRate = index > 0 
          ? ((stage.value / data[index - 1].value) * 100).toFixed(1) 
          : '100';

        return (
          <div key={index} className="group">
            <div className="flex items-center gap-4">
              {/* Stage Label */}
              <div className="w-28 flex items-center gap-2 flex-shrink-0">
                <span className="text-base">{stage.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'hsl(35 30% 85%)' }}>
                  {stage.name}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="flex-1 relative h-9 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'hsl(35 30% 95% / 0.05)' }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out group-hover:brightness-110"
                  style={{
                    width: `${Math.max(percentage, 8)}%`,
                    background: `linear-gradient(90deg, ${colorPalette[index]}, ${colorPalette[(index + 1) % colorPalette.length]})`,
                    boxShadow: `0 0 20px ${colorPalette[index]}40`,
                  }}
                />
                {/* Value inside bar */}
                <div className="absolute inset-0 flex items-center px-3">
                  <span 
                    className="text-sm font-bold tabular-nums drop-shadow-md"
                    style={{ color: percentage > 25 ? 'hsl(20 30% 12%)' : 'hsl(35 30% 95%)' }}
                  >
                    {stage.value.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Conversion Rate */}
              {showConversion && (
                <div className="w-16 text-right flex-shrink-0">
                  {index > 0 ? (
                    <span 
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: 'hsl(27 100% 50% / 0.15)',
                        color: 'hsl(27 100% 60%)',
                      }}
                    >
                      {conversionRate}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Total Conversion */}
      {showConversion && data.length > 1 && (
        <div 
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: '1px solid hsl(35 30% 95% / 0.1)' }}
        >
          <span className="text-xs" style={{ color: 'hsl(35 30% 65%)' }}>
            Conversão Total
          </span>
          <span 
            className="text-sm font-bold"
            style={{ color: chartColors.success }}
          >
            {((data[data.length - 1].value / data[0].value) * 100).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ===== HEATMAP =====
interface DemoHeatmapProps {
  rows?: number;
  cols?: number;
  showLegend?: boolean;
}

export function DemoHeatmap({ rows = 7, cols = 12, showLegend = true }: DemoHeatmapProps) {
  const rowLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].slice(0, rows);
  const colLabels = Array.from({ length: cols }, (_, i) => `S${i + 1}`);

  // Generate realistic cohort data (decreasing retention over time)
  const data = useMemo(() => 
    rowLabels.map((row, rowIdx) =>
      colLabels.map((col, colIdx) => {
        // Simulate cohort retention decay
        const baseRetention = 100 - (colIdx * 8) + (Math.random() * 15);
        const value = Math.max(0, Math.min(100, baseRetention - rowIdx * 2));
        return { row, col, value: value / 100 };
      })
    ).flat(),
  [rows, cols]);

  const getColor = (value: number): string => {
    if (value < 0.15) return 'hsl(27 100% 50% / 0.08)';
    if (value < 0.30) return 'hsl(27 100% 50% / 0.20)';
    if (value < 0.45) return 'hsl(27 100% 50% / 0.35)';
    if (value < 0.60) return 'hsl(27 100% 50% / 0.50)';
    if (value < 0.75) return 'hsl(27 100% 50% / 0.65)';
    return 'hsl(27 100% 50% / 0.85)';
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-1">
        <div className="w-10" />
        {colLabels.map((col) => (
          <div 
            key={col} 
            className="flex-1 text-center text-[10px] font-medium"
            style={{ color: 'hsl(35 30% 60%)' }}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Grid */}
      {rowLabels.map((row) => (
        <div key={row} className="flex gap-1 items-center">
          <div 
            className="w-10 text-[11px] font-medium text-right pr-2"
            style={{ color: 'hsl(35 30% 70%)' }}
          >
            {row}
          </div>
          {colLabels.map((col) => {
            const cellData = data.find((d) => d.row === row && d.col === col);
            const value = cellData?.value || 0;
            return (
              <div
                key={col}
                className="flex-1 h-6 rounded-md transition-all duration-200 hover:scale-105 hover:z-10 cursor-pointer flex items-center justify-center"
                style={{ 
                  backgroundColor: getColor(value),
                  boxShadow: value > 0.5 ? `0 0 8px ${chartColors.primary}30` : 'none',
                }}
                title={`${row} × ${col}: ${(value * 100).toFixed(0)}%`}
              >
                {value > 0.3 && (
                  <span 
                    className="text-[9px] font-bold tabular-nums"
                    style={{ color: value > 0.6 ? 'hsl(20 30% 12%)' : 'hsl(35 30% 95%)' }}
                  >
                    {(value * 100).toFixed(0)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      {showLegend && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <span className="text-[10px] mr-2" style={{ color: 'hsl(35 30% 60%)' }}>Retenção:</span>
          {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85].map((v, i) => (
            <div
              key={i}
              className="w-6 h-3 rounded-sm"
              style={{ backgroundColor: getColor(v) }}
            />
          ))}
          <span className="text-[10px] ml-2" style={{ color: 'hsl(35 30% 60%)' }}>0-100%</span>
        </div>
      )}
    </div>
  );
}

// ===== MINI SPARKLINE =====
interface DemoSparklineProps {
  trend?: 'up' | 'down' | 'flat';
  color?: string;
}

export function DemoSparkline({ trend = 'up', color = chartColors.primary }: DemoSparklineProps) {
  const data = useMemo(() => {
    const base = 50;
    const growth = trend === 'up' ? 1.08 : trend === 'down' ? 0.92 : 1;
    return Array.from({ length: 12 }, (_, i) => ({
      value: Math.round(base * Math.pow(growth, i) * (0.85 + Math.random() * 0.3)),
    }));
  }, [trend]);

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#spark-${trend})`}
          strokeWidth={1.5}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ===== GAUGE CHART =====
interface DemoGaugeProps {
  value?: number;
  max?: number;
  label?: string;
}

export function DemoGauge({ value = 72, max = 100, label = 'Score' }: DemoGaugeProps) {
  const percentage = (value / max) * 100;
  const getColor = () => {
    if (percentage >= 70) return chartColors.success;
    if (percentage >= 40) return chartColors.warning;
    return chartColors.destructive;
  };

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Background arc */}
        <div 
          className="absolute inset-0 rounded-t-full"
          style={{ 
            background: 'hsl(35 30% 95% / 0.08)',
            transform: 'rotate(0deg)',
          }}
        />
        {/* Value arc */}
        <div
          className="absolute inset-0 rounded-t-full origin-bottom transition-transform duration-1000"
          style={{
            background: `conic-gradient(from 180deg, ${getColor()} ${percentage * 1.8}deg, transparent ${percentage * 1.8}deg)`,
            clipPath: 'polygon(0 100%, 0 0, 100% 0, 100% 100%)',
          }}
        />
        {/* Center value */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span 
            className="text-2xl font-bold tabular-nums"
            style={{ color: getColor() }}
          >
            {value}
          </span>
        </div>
      </div>
      <span className="text-xs mt-2" style={{ color: 'hsl(35 30% 65%)' }}>{label}</span>
    </div>
  );
}