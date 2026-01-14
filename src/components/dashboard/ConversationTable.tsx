import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationDailyData {
  day: string;
  msg_in_total: number;
  leads_with_msg_in: number;
}

interface ConversationTableProps {
  data: ConversationDailyData[];
  className?: string;
}

export function ConversationTable({ data, className }: ConversationTableProps) {
  // Pegar últimos 15 dias e ordenar do mais recente
  const recentData = [...data]
    .sort((a, b) => new Date(b.day).getTime() - new Date(a.day).getTime())
    .slice(0, 15);

  // Calcular tendência comparando com dia anterior
  const getTrend = (index: number, key: 'msg_in_total' | 'leads_with_msg_in') => {
    if (index >= recentData.length - 1) return 'neutral';
    const current = recentData[index][key];
    const previous = recentData[index + 1][key];
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-destructive" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <p className="text-sm">Sem dados disponíveis</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[400px]", className)}>
      <table className="w-full">
        <thead className="sticky top-0 bg-card z-10">
          <tr className="border-b border-border/30">
            <th className="text-left text-xs font-medium text-muted-foreground py-3 px-3">
              Data
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-3">
              Mensagens
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-3">
              Leads
            </th>
            <th className="text-right text-xs font-medium text-muted-foreground py-3 px-3">
              Msg/Lead
            </th>
          </tr>
        </thead>
        <tbody>
          {recentData.map((row, index) => {
            const msgsPerLead = row.leads_with_msg_in > 0 
              ? (row.msg_in_total / row.leads_with_msg_in).toFixed(2)
              : '0.00';
            
            return (
              <tr 
                key={row.day} 
                className="border-b border-border/10 hover:bg-muted/5 transition-colors"
              >
                <td className="py-3 px-3">
                  <span className="text-sm font-medium">{formatDate(row.day)}</span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium text-primary">
                      {row.msg_in_total.toLocaleString('pt-BR')}
                    </span>
                    <TrendIcon trend={getTrend(index, 'msg_in_total')} />
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-medium text-success">
                      {row.leads_with_msg_in.toLocaleString('pt-BR')}
                    </span>
                    <TrendIcon trend={getTrend(index, 'leads_with_msg_in')} />
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-sm text-muted-foreground">
                    {msgsPerLead}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="border-t border-border/30 bg-muted/5">
          <tr>
            <td className="py-3 px-3">
              <span className="text-sm font-semibold">Total (15d)</span>
            </td>
            <td className="py-3 px-3 text-right">
              <span className="text-sm font-semibold text-primary">
                {recentData.reduce((sum, r) => sum + r.msg_in_total, 0).toLocaleString('pt-BR')}
              </span>
            </td>
            <td className="py-3 px-3 text-right">
              <span className="text-sm font-semibold text-success">
                {recentData.reduce((sum, r) => sum + r.leads_with_msg_in, 0).toLocaleString('pt-BR')}
              </span>
            </td>
            <td className="py-3 px-3 text-right">
              <span className="text-sm font-semibold text-muted-foreground">
                {(() => {
                  const totalMsgs = recentData.reduce((sum, r) => sum + r.msg_in_total, 0);
                  const totalLeads = recentData.reduce((sum, r) => sum + r.leads_with_msg_in, 0);
                  return totalLeads > 0 ? (totalMsgs / totalLeads).toFixed(2) : '0.00';
                })()}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </ScrollArea>
  );
}
