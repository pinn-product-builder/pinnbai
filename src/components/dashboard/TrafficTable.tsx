import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrafficDayData {
  day: string;
  spend_total: number;
  leads: number;
  cpl: number;
  meetings_booked: number;
  cp_meeting_booked: number;
}

interface TrafficTableProps {
  data: TrafficDayData[];
  className?: string;
}

export function TrafficTable({ data, className }: TrafficTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      weekday: 'short',
    });
  };

  // Ordenar por data decrescente e pegar últimos 15 dias
  const sortedData = [...data]
    .sort((a, b) => b.day.localeCompare(a.day))
    .slice(0, 15);

  // Calcular médias para comparação
  const avgSpend = data.reduce((s, d) => s + d.spend_total, 0) / (data.length || 1);
  const avgLeads = data.reduce((s, d) => s + d.leads, 0) / (data.length || 1);
  const avgCpl = data.filter(d => d.cpl > 0).reduce((s, d) => s + d.cpl, 0) / (data.filter(d => d.cpl > 0).length || 1);

  const getTrend = (value: number, avg: number, inverted = false) => {
    const diff = ((value - avg) / (avg || 1)) * 100;
    if (Math.abs(diff) < 10) return { icon: Minus, color: 'text-muted-foreground' };
    if (inverted) {
      return diff > 0 
        ? { icon: TrendingUp, color: 'text-destructive' }
        : { icon: TrendingDown, color: 'text-emerald-500' };
    }
    return diff > 0 
      ? { icon: TrendingUp, color: 'text-emerald-500' }
      : { icon: TrendingDown, color: 'text-destructive' };
  };

  if (!sortedData.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead className="text-right">Investimento</TableHead>
            <TableHead className="text-right">Leads</TableHead>
            <TableHead className="text-right">CPL</TableHead>
            <TableHead className="text-right">Reuniões</TableHead>
            <TableHead className="text-right">Custo/Reunião</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => {
            const spendTrend = getTrend(row.spend_total, avgSpend);
            const leadsTrend = getTrend(row.leads, avgLeads);
            const cplTrend = getTrend(row.cpl, avgCpl, true); // CPL menor é melhor
            
            return (
              <TableRow 
                key={row.day}
                className={cn(
                  "transition-colors",
                  index % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                <TableCell className="font-medium text-xs">
                  {formatDate(row.day)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-sm font-medium">
                      {formatCurrency(row.spend_total)}
                    </span>
                    <spendTrend.icon className={cn("w-3 h-3", spendTrend.color)} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-sm font-medium">{row.leads}</span>
                    <leadsTrend.icon className={cn("w-3 h-3", leadsTrend.color)} />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className={cn(
                      "text-sm font-medium",
                      row.cpl > avgCpl * 1.2 ? "text-destructive" : 
                      row.cpl < avgCpl * 0.8 ? "text-emerald-500" : ""
                    )}>
                      {row.cpl > 0 ? formatCurrency(row.cpl) : '-'}
                    </span>
                    {row.cpl > 0 && <cplTrend.icon className={cn("w-3 h-3", cplTrend.color)} />}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                    row.meetings_booked > 0 
                      ? "bg-emerald-500/20 text-emerald-500" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {row.meetings_booked}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {row.cp_meeting_booked > 0 ? formatCurrency(row.cp_meeting_booked) : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Footer com totais */}
      <div className="border-t bg-muted/20 px-4 py-2 flex justify-between text-xs text-muted-foreground">
        <span>Últimos {sortedData.length} dias</span>
        <span>
          Total: {formatCurrency(sortedData.reduce((s, d) => s + d.spend_total, 0))} | 
          {' '}{sortedData.reduce((s, d) => s + d.leads, 0)} leads | 
          {' '}{sortedData.reduce((s, d) => s + d.meetings_booked, 0)} reuniões
        </span>
      </div>
    </div>
  );
}