/**
 * Componentes de Gráficos de Demonstração
 * Gráficos com dados mock para visualização em templates
 */

import React from 'react';
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
} from 'recharts';
import { cn } from '@/lib/utils';

// Cores do Design System Pinn
const demoColors = {
  primary: 'hsl(27, 100%, 50%)',
  secondary: 'hsl(40, 100%, 65%)',
  success: 'hsl(155, 65%, 40%)',
  warning: 'hsl(40, 75%, 48%)',
  destructive: 'hsl(4, 72%, 50%)',
  purple: 'hsl(280, 65%, 55%)',
  cyan: 'hsl(190, 85%, 45%)',
  muted: 'hsl(220, 10%, 40%)',
};

const colorArray = [
  demoColors.primary,
  demoColors.secondary,
  demoColors.success,
  demoColors.warning,
  demoColors.cyan,
  demoColors.purple,
];

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="px-3 py-2 rounded-lg text-sm shadow-lg border bg-bg-0 border-border">
      <p className="text-xs text-text-3 mb-1">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-2">{entry.name}:</span>
          <span className="font-medium text-text-1">{entry.value?.toLocaleString('pt-BR')}</span>
        </div>
      ))}
    </div>
  );
};

// ===== LINHA DEMO =====
interface DemoLineChartProps {
  height?: number;
  lines?: number;
  showLabels?: boolean;
}

export function DemoLineChart({ height = 200, lines = 2, showLabels = true }: DemoLineChartProps) {
  const data = Array.from({ length: 12 }, (_, i) => ({
    name: `${i + 1}`,
    value1: Math.floor(Math.random() * 100) + 50,
    value2: Math.floor(Math.random() * 80) + 30,
    value3: Math.floor(Math.random() * 60) + 20,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="value1" 
          name="Série A"
          stroke={demoColors.primary} 
          strokeWidth={2}
          dot={false}
        />
        {lines >= 2 && (
          <Line 
            type="monotone" 
            dataKey="value2" 
            name="Série B"
            stroke={demoColors.success} 
            strokeWidth={2}
            dot={false}
          />
        )}
        {lines >= 3 && (
          <Line 
            type="monotone" 
            dataKey="value3" 
            name="Série C"
            stroke={demoColors.warning} 
            strokeWidth={2}
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ===== ÁREA DEMO =====
interface DemoAreaChartProps {
  height?: number;
  stacked?: boolean;
}

export function DemoAreaChart({ height = 200, stacked = false }: DemoAreaChartProps) {
  const data = Array.from({ length: 12 }, (_, i) => ({
    name: `Mês ${i + 1}`,
    value1: Math.floor(Math.random() * 5000) + 2000,
    value2: Math.floor(Math.random() * 3000) + 1000,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="demoGradient1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={demoColors.primary} stopOpacity={0.4} />
            <stop offset="100%" stopColor={demoColors.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="demoGradient2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={demoColors.success} stopOpacity={0.4} />
            <stop offset="100%" stopColor={demoColors.success} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="value1" 
          name="MRR"
          stroke={demoColors.primary} 
          fill="url(#demoGradient1)"
          strokeWidth={2}
          stackId={stacked ? "1" : undefined}
        />
        <Area 
          type="monotone" 
          dataKey="value2" 
          name="Expansão"
          stroke={demoColors.success} 
          fill="url(#demoGradient2)"
          strokeWidth={2}
          stackId={stacked ? "1" : undefined}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ===== BARRAS DEMO =====
interface DemoBarChartProps {
  height?: number;
  horizontal?: boolean;
  bars?: number;
}

export function DemoBarChart({ height = 200, horizontal = false, bars = 5 }: DemoBarChartProps) {
  const data = Array.from({ length: bars }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart 
        data={data} 
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 10, right: 10, left: horizontal ? 60 : 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        {horizontal ? (
          <>
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="value" 
          name="Valor"
          fill={demoColors.primary} 
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ===== PIE/DONUT DEMO =====
interface DemoPieChartProps {
  height?: number;
  donut?: boolean;
}

export function DemoPieChart({ height = 200, donut = true }: DemoPieChartProps) {
  const data = [
    { name: 'Segmento A', value: 35 },
    { name: 'Segmento B', value: 25 },
    { name: 'Segmento C', value: 20 },
    { name: 'Segmento D', value: 15 },
    { name: 'Outros', value: 5 },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donut ? 40 : 0}
          outerRadius={70}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colorArray[index % colorArray.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value) => <span className="text-xs text-text-2">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ===== FUNIL DEMO =====
interface DemoFunnelChartProps {
  stages?: number;
}

export function DemoFunnelChart({ stages = 5 }: DemoFunnelChartProps) {
  const stageNames = ['Visitantes', 'Leads', 'Qualificados', 'Propostas', 'Clientes'];
  const baseValue = 1000;
  
  const data = stageNames.slice(0, stages).map((name, i) => ({
    name,
    value: Math.floor(baseValue * Math.pow(0.6, i)),
  }));

  return (
    <div className="space-y-3 py-2">
      {data.map((stage, index) => {
        const maxValue = data[0].value;
        const percentage = (stage.value / maxValue) * 100;
        
        return (
          <div key={index} className="flex items-center gap-4">
            <div className="w-24 text-right flex-shrink-0">
              <span className="text-sm font-medium text-text-2">{stage.name}</span>
            </div>
            <div className="flex-1 relative h-8">
              <div className="absolute inset-0 rounded-lg bg-muted/30" />
              <div 
                className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                style={{ 
                  width: `${Math.max(percentage, 5)}%`,
                  background: `linear-gradient(90deg, ${colorArray[index % colorArray.length]}, ${colorArray[(index + 1) % colorArray.length]})`,
                }}
              />
            </div>
            <div className="w-16 text-right flex-shrink-0">
              <span className="text-sm font-bold text-text-1 tabular-nums">
                {stage.value.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== HEATMAP DEMO =====
interface DemoHeatmapProps {
  rows?: number;
  cols?: number;
}

export function DemoHeatmap({ rows = 7, cols = 12 }: DemoHeatmapProps) {
  const rowLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].slice(0, rows);
  const colLabels = Array.from({ length: cols }, (_, i) => `${i + 1}`);
  
  const data = rowLabels.map(row => 
    colLabels.map(col => ({
      row,
      col,
      value: Math.random(),
    }))
  ).flat();

  const getColor = (value: number) => {
    if (value < 0.2) return 'bg-pinn-orange-500/10';
    if (value < 0.4) return 'bg-pinn-orange-500/25';
    if (value < 0.6) return 'bg-pinn-orange-500/40';
    if (value < 0.8) return 'bg-pinn-orange-500/60';
    return 'bg-pinn-orange-500/80';
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        <div className="w-8" />
        {colLabels.map(col => (
          <div key={col} className="flex-1 text-center text-[10px] text-text-3">{col}</div>
        ))}
      </div>
      {rowLabels.map((row, rowIndex) => (
        <div key={row} className="flex gap-1 items-center">
          <div className="w-8 text-[10px] text-text-3 text-right pr-1">{row}</div>
          {colLabels.map((col, colIndex) => {
            const cellData = data.find(d => d.row === row && d.col === col);
            return (
              <div 
                key={col}
                className={cn(
                  "flex-1 h-5 rounded-sm transition-colors",
                  getColor(cellData?.value || 0)
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
