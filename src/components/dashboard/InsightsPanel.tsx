import React from 'react';
import { AlertTriangle, AlertCircle, Info, Lightbulb, TrendingDown, FileText } from 'lucide-react';
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

  // Parse payload - pode ser string JSON ou objeto
  let parsedPayload: Record<string, unknown>;
  if (typeof insight.payload === 'string') {
    try {
      parsedPayload = JSON.parse(insight.payload);
    } catch {
      // Se não for JSON válido, exibe como texto
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm whitespace-pre-wrap">{insight.payload}</div>
          </div>
        </div>
      );
    }
  } else {
    parsedPayload = insight.payload as Record<string, unknown>;
  }

  const alerts = parsedPayload.alerts as Array<{ type?: string; text?: string; message?: string }> | undefined;
  const recommendations = parsedPayload.recommendations as Array<{ text: string } | string> | undefined;
  const anomalies = parsedPayload.anomalies as Array<{ text: string } | string> | undefined;
  const summary = parsedPayload.summary as string | undefined;
  const text = parsedPayload.text as string | undefined;
  const insightsData = parsedPayload.insights as Array<{ text: string } | string> | undefined;

  // Helper para extrair texto de item (pode ser string ou { text: string })
  const getItemText = (item: { text: string } | string): string => {
    return typeof item === 'string' ? item : item.text;
  };

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

  // Se tiver texto ou summary simples, exibe diretamente
  if (text || summary) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm whitespace-pre-wrap">{text || summary}</div>
        </div>
      </div>
    );
  }

  // Se tiver array de insights genéricos
  if (insightsData && insightsData.length > 0) {
    return (
      <div className="space-y-2">
        {insightsData.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5"
          >
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm">{getItemText(item)}</p>
          </div>
        ))}
        
        {/* Recommendations inline */}
        {recommendations && recommendations.length > 0 && recommendations.map((rec, i) => (
          <div
            key={`rec-${i}`}
            className="flex items-start gap-3 p-3 rounded-lg border border-success/30 bg-success/5"
          >
            <Lightbulb className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
            <p className="text-sm">{getItemText(rec)}</p>
          </div>
        ))}
      </div>
    );
  }

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
                  getAlertStyle(alert.type || 'info')
                )}
              >
                {getAlertIcon(alert.type || 'info')}
                <p className="text-sm">{alert.text || alert.message}</p>
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
                <p className="text-sm">{getItemText(rec)}</p>
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
                <p className="text-sm">{getItemText(anomaly)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: se não tiver nenhum campo conhecido, mostra o JSON */}
      {!alerts?.length && !recommendations?.length && !anomalies?.length && !insightsData?.length && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-muted/30 bg-muted/5">
          <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <pre className="text-sm whitespace-pre-wrap overflow-auto">
            {JSON.stringify(parsedPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
