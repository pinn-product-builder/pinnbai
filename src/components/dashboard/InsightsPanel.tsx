import React from 'react';
import { AlertTriangle, AlertCircle, Info, Lightbulb, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from '@/types/dashboard';

interface InsightsPanelProps {
  insight: AIInsight | null;
  isLoading?: boolean;
}

export function InsightsPanel({ insight, isLoading }: InsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!insight?.payload) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Lightbulb className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhum insight disponível</p>
        <p className="text-xs mt-1">Os insights serão exibidos aqui quando disponíveis</p>
      </div>
    );
  }

  const { alerts, recommendations, anomalies } = insight.payload;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-destructive/30 bg-destructive/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            Alertas
          </h4>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border",
                  getAlertStyle(alert.type)
                )}
              >
                {getAlertIcon(alert.type)}
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-3 h-3" />
            Recomendações
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-success/30 bg-success/5"
              >
                <Lightbulb className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {anomalies && anomalies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-3 h-3" />
            Anomalias
          </h4>
          <div className="space-y-2">
            {anomalies.map((anomaly, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5"
              >
                <TrendingDown className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-sm">{anomaly}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
