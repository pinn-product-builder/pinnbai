import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Lightbulb, TrendingDown, RefreshCw, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateInsights } from '@/hooks/useDashboardData';
import { useQueryClient } from '@tanstack/react-query';
import type { AIInsight } from '@/types/dashboard';

interface InsightsPanelProps {
  insight: AIInsight | null;
  isLoading?: boolean;
  orgId?: string;
  scope?: string;
}

export function InsightsPanel({ insight, isLoading, orgId, scope }: InsightsPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    if (!orgId || !scope) {
      toast({
        title: 'Erro',
        description: 'Organização ou escopo não definido',
        variant: 'destructive',
      });
      return;
    }

    setIsRefreshing(true);
    try {
      // Tentar gerar novos insights via edge function
      const result = await generateInsights(orgId, scope, 30);
      
      if (result.success) {
        // Aguardar um pouco para a edge function gravar os dados
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: '✨ Insights Atualizados!',
          description: 'Novos insights foram gerados com IA',
        });
      } else {
        toast({
          title: 'Dados Recarregados',
          description: result.error || 'Os insights existentes foram recarregados',
        });
      }
      
      // Invalidar cache para recarregar os dados
      await queryClient.invalidateQueries({ queryKey: ['insights', orgId, scope] });
      await queryClient.invalidateQueries({ queryKey: ['insights-history', orgId] });
      
      // Forçar refetch
      await queryClient.refetchQueries({ queryKey: ['insights', orgId, scope] });
    } catch (err: any) {
      // Em caso de erro, ainda tentar recarregar os dados existentes
      await queryClient.invalidateQueries({ queryKey: ['insights', orgId, scope] });
      await queryClient.refetchQueries({ queryKey: ['insights', orgId, scope] });
      toast({
        title: 'Dados Recarregados',
        description: 'Os insights existentes foram recarregados',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/20 animate-pulse" />
        ))}
      </div>
    );
  }

  // Parse payload
  let parsedPayload: Record<string, unknown> = {};
  if (insight?.payload) {
    if (typeof insight.payload === 'string') {
      try {
        parsedPayload = JSON.parse(insight.payload);
      } catch {
        parsedPayload = { text: insight.payload };
      }
    } else {
      parsedPayload = insight.payload as Record<string, unknown>;
    }
  }

  const alerts = parsedPayload.alerts as Array<{ type?: string; text?: string; message?: string }> | undefined;
  const recommendations = parsedPayload.recommendations as Array<{ text: string } | string> | undefined;
  const anomalies = parsedPayload.anomalies as Array<{ text: string } | string> | undefined;
  const summary = parsedPayload.summary as string | undefined;
  const text = parsedPayload.text as string | undefined;
  const insightsData = parsedPayload.insights as Array<{ text: string } | string> | undefined;

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

  const hasContent = text || summary || (alerts?.length) || (recommendations?.length) || (anomalies?.length) || (insightsData?.length);

  return (
    <div className="space-y-4 relative">
      {/* Header com botão de atualizar */}
      <div className="flex items-center justify-between gap-2 relative z-20">
        {insight?.created_at && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Atualizado em {formatDate(insight.created_at)}</span>
          </div>
        )}
        {orgId && scope && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isRefreshing || isLoading}
            className={cn(
              "h-8 text-xs gap-1.5 transition-all duration-300 relative z-30 cursor-pointer pointer-events-auto",
              isRefreshing && "bg-primary/10 border-primary/30"
            )}
            style={{ pointerEvents: 'auto' }}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gerando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atualizar Insights</span>
              </>
            )}
          </Button>
        )}
      </div>

      {!hasContent ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Lightbulb className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">Nenhum insight disponível</p>
          {orgId && scope && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={isRefreshing || isLoading}
              className="mt-3 gap-1.5 relative z-30 cursor-pointer pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerar Insights com IA</span>
                </>
              )}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Texto ou summary */}
          {(text || summary) && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm whitespace-pre-wrap">{text || summary}</div>
            </div>
          )}

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

          {/* Insights array */}
          {insightsData && insightsData.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-3 h-3" />
                Insights
              </h4>
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
        </div>
      )}
    </div>
  );
}