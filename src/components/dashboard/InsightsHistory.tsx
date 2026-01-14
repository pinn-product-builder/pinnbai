import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Clock, Tag, Lightbulb, AlertTriangle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { AIInsight } from '@/types/dashboard';

interface InsightsHistoryProps {
  insights: AIInsight[];
  isLoading?: boolean;
  className?: string;
}

export function InsightsHistory({ insights, isLoading, className }: InsightsHistoryProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getScopeLabel = (scope: string) => {
    const labels: Record<string, string> = {
      executive: 'Executivo',
      executivo: 'Executivo',
      conversas: 'Conversas',
      conversations: 'Conversas',
      trafego: 'Tráfego',
      traffic: 'Tráfego',
      vapi: 'VAPI',
      calls: 'Ligações',
    };
    return labels[scope] || scope;
  };

  const getScopeColor = (scope: string) => {
    if (scope.includes('execut')) return 'bg-primary/10 text-primary';
    if (scope.includes('convers')) return 'bg-blue-500/10 text-blue-500';
    if (scope.includes('traf') || scope.includes('traffic')) return 'bg-green-500/10 text-green-500';
    if (scope.includes('vapi') || scope.includes('call')) return 'bg-purple-500/10 text-purple-500';
    return 'bg-muted text-muted-foreground';
  };

  const parsePayload = (payload: unknown): Record<string, unknown> => {
    if (typeof payload === 'string') {
      try {
        return JSON.parse(payload);
      } catch {
        return { text: payload };
      }
    }
    return (payload as Record<string, unknown>) || {};
  };

  const getInsightPreview = (payload: unknown): string => {
    const parsed = parsePayload(payload);
    if (parsed.summary) return String(parsed.summary).substring(0, 100) + '...';
    if (parsed.text) return String(parsed.text).substring(0, 100) + '...';
    if (parsed.alerts && Array.isArray(parsed.alerts) && parsed.alerts.length > 0) {
      const first = parsed.alerts[0];
      return (first.text || first.message || '').substring(0, 100) + '...';
    }
    if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
      const first = parsed.recommendations[0];
      return (typeof first === 'string' ? first : first.text || '').substring(0, 100) + '...';
    }
    return 'Clique para ver detalhes';
  };

  const renderPayloadContent = (payload: unknown) => {
    const parsed = parsePayload(payload);
    const alerts = parsed.alerts as Array<{ type?: string; text?: string; message?: string }> | undefined;
    const recommendations = parsed.recommendations as Array<{ text: string } | string> | undefined;
    const anomalies = parsed.anomalies as Array<{ text: string } | string> | undefined;
    const summary = parsed.summary as string | undefined;
    const text = parsed.text as string | undefined;
    const insightsData = parsed.insights as Array<{ text: string } | string> | undefined;

    const getItemText = (item: { text: string } | string): string => {
      return typeof item === 'string' ? item : item.text;
    };

    return (
      <div className="space-y-3 pt-3 border-t border-border/50">
        {(text || summary) && (
          <div className="flex items-start gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">{text || summary}</p>
          </div>
        )}

        {alerts && alerts.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Alertas ({alerts.length})
            </h5>
            {alerts.slice(0, 3).map((alert, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-4">• {alert.text || alert.message}</p>
            ))}
            {alerts.length > 3 && (
              <p className="text-xs text-muted-foreground pl-4">... e mais {alerts.length - 3}</p>
            )}
          </div>
        )}

        {insightsData && insightsData.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Insights ({insightsData.length})
            </h5>
            {insightsData.slice(0, 3).map((item, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-4">• {getItemText(item)}</p>
            ))}
            {insightsData.length > 3 && (
              <p className="text-xs text-muted-foreground pl-4">... e mais {insightsData.length - 3}</p>
            )}
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Recomendações ({recommendations.length})
            </h5>
            {recommendations.slice(0, 3).map((rec, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-4">• {getItemText(rec)}</p>
            ))}
            {recommendations.length > 3 && (
              <p className="text-xs text-muted-foreground pl-4">... e mais {recommendations.length - 3}</p>
            )}
          </div>
        )}

        {anomalies && anomalies.length > 0 && (
          <div className="space-y-1">
            <h5 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingDown className="w-3 h-3" /> Anomalias ({anomalies.length})
            </h5>
            {anomalies.slice(0, 3).map((anomaly, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-4">• {getItemText(anomaly)}</p>
            ))}
            {anomalies.length > 3 && (
              <p className="text-xs text-muted-foreground pl-4">... e mais {anomalies.length - 3}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <History className="w-10 h-10 mb-3 opacity-50" />
        <p className="text-sm">Nenhum histórico de insights</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[400px]", className)}>
      <div className="space-y-2 pr-4">
        {insights.map((insight, index) => (
          <Collapsible
            key={index}
            open={expandedIndex === index}
            onOpenChange={(open) => setExpandedIndex(open ? index : null)}
          >
            <div className="rounded-lg border border-border/50 bg-card/50 p-3 hover:bg-card/80 transition-colors">
              <CollapsibleTrigger asChild>
                <button className="w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          getScopeColor(insight.scope)
                        )}>
                          {getScopeLabel(insight.scope)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(insight.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {getInsightPreview(insight.payload)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {expandedIndex === index ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {renderPayloadContent(insight.payload)}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </ScrollArea>
  );
}
