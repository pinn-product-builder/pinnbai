import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Lightbulb, 
  TrendingDown, 
  TrendingUp,
  RefreshCw, 
  Clock, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { generateInsights } from '@/hooks/useDashboardData';
import { useQueryClient } from '@tanstack/react-query';
import type { AIInsight } from '@/types/dashboard';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface InsightsPanelProps {
  insight: AIInsight | null;
  isLoading?: boolean;
  orgId?: string;
  scope?: string;
}

// Mapeia insights genéricos para explicações mais detalhadas
function enrichInsightText(text: string, scope?: string): { 
  title: string; 
  explanation: string; 
  action?: string;
  type: 'positive' | 'warning' | 'neutral' | 'action';
} {
  const lowerText = text.toLowerCase();
  
  // Taxa de conversão
  if (lowerText.includes('taxa de conversão') || lowerText.includes('conversion rate')) {
    const match = text.match(/(\d+[.,]\d+)%/);
    const rate = match ? parseFloat(match[1].replace(',', '.')) : null;
    
    if (rate && rate > 40) {
      return {
        title: '🎯 Excelente Taxa de Conversão',
        explanation: `Sua taxa de ${rate.toFixed(1)}% está acima da média do mercado (20-30%). Isso indica que seu funil está bem otimizado e os leads estão qualificados. Continue monitorando para manter esse padrão.`,
        action: 'Documente as práticas atuais para replicar em outras campanhas.',
        type: 'positive'
      };
    } else if (rate && rate > 20) {
      return {
        title: '📊 Taxa de Conversão Saudável',
        explanation: `Sua taxa de ${rate.toFixed(1)}% está dentro da média esperada. Há espaço para otimização, especialmente no meio do funil onde leads podem estar travando.`,
        action: 'Analise os gargalos entre etapas do funil.',
        type: 'neutral'
      };
    } else if (rate) {
      return {
        title: '⚠️ Taxa de Conversão Abaixo do Esperado',
        explanation: `Taxa de ${rate.toFixed(1)}% requer atenção. Verifique a qualidade dos leads na origem e o tempo de resposta do time comercial.`,
        action: 'Revise a segmentação dos anúncios e o script de atendimento.',
        type: 'warning'
      };
    }
  }
  
  // Leads ativos
  if (lowerText.includes('leads ativos') || lowerText.includes('active leads')) {
    const match = text.match(/(\d+)\s*leads?\s*ativos?/i);
    const count = match ? parseInt(match[1]) : null;
    
    return {
      title: '👥 Distribuição de Leads no Funil',
      explanation: count 
        ? `Você tem ${count} leads ativos distribuídos no funil. Uma distribuição saudável indica fluxo constante. Se muitos leads estão concentrados em uma única etapa, pode indicar gargalo.`
        : text,
      action: 'Verifique se há leads parados há mais de 7 dias em alguma etapa.',
      type: 'neutral'
    };
  }
  
  // CPL
  if (lowerText.includes('cpl') || lowerText.includes('custo por lead')) {
    return {
      title: '💰 Análise de Custo por Lead',
      explanation: text + ' O CPL ideal varia por segmento, mas deve ser sustentável em relação ao ticket médio das vendas.',
      action: 'Compare o CPL com o valor médio de venda para calcular o ROI.',
      type: 'neutral'
    };
  }
  
  // Monitoramento
  if (lowerText.includes('monitorando') || lowerText.includes('continue monitorando')) {
    return {
      title: '📈 Acompanhamento Contínuo',
      explanation: 'A análise de tendências requer dados históricos. Continue monitorando diariamente para identificar padrões sazonais, dias da semana com melhor performance e horários de pico.',
      action: 'Configure alertas para variações acima de 20% na média.',
      type: 'action'
    };
  }
  
  // Reuniões
  if (lowerText.includes('reunião') || lowerText.includes('reuniões') || lowerText.includes('meeting')) {
    return {
      title: '📅 Performance de Reuniões',
      explanation: text + ' A taxa de comparecimento (show rate) saudável é acima de 70%. Reuniões agendadas sem confirmação tendem a ter maior no-show.',
      action: 'Implemente lembretes automáticos 24h e 1h antes das reuniões.',
      type: 'neutral'
    };
  }
  
  // Default
  return {
    title: '💡 Insight',
    explanation: text,
    type: 'neutral'
  };
}

function enrichRecommendation(text: string): {
  title: string;
  explanation: string;
  priority: 'high' | 'medium' | 'low';
} {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('urgente') || lowerText.includes('imediato') || lowerText.includes('crítico')) {
    return {
      title: '🚨 Ação Urgente',
      explanation: text,
      priority: 'high'
    };
  }
  
  if (lowerText.includes('otimiz') || lowerText.includes('melhora') || lowerText.includes('aument')) {
    return {
      title: '📈 Oportunidade de Melhoria',
      explanation: text,
      priority: 'medium'
    };
  }
  
  return {
    title: '💡 Sugestão',
    explanation: text,
    priority: 'low'
  };
}

export function InsightsPanel({ insight, isLoading, orgId, scope }: InsightsPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set([0])); // First one expanded by default
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleExpanded = (index: number) => {
    setExpandedInsights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
      const result = await generateInsights(orgId, scope, 30);
      
      if (result.success) {
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
      
      await queryClient.invalidateQueries({ queryKey: ['insights', orgId, scope] });
      await queryClient.invalidateQueries({ queryKey: ['insights-history', orgId] });
      await queryClient.refetchQueries({ queryKey: ['insights', orgId, scope] });
    } catch (err: any) {
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
          <div key={i} className="h-20 rounded-lg bg-muted/20 animate-pulse" />
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

  const getInsightTypeStyles = (type: 'positive' | 'warning' | 'neutral' | 'action') => {
    switch (type) {
      case 'positive':
        return {
          border: 'border-success/40',
          bg: 'bg-success/10',
          icon: <TrendingUp className="w-5 h-5 text-success" />,
          iconBg: 'bg-success/20'
        };
      case 'warning':
        return {
          border: 'border-warning/40',
          bg: 'bg-warning/10',
          icon: <AlertTriangle className="w-5 h-5 text-warning" />,
          iconBg: 'bg-warning/20'
        };
      case 'action':
        return {
          border: 'border-primary/40',
          bg: 'bg-primary/10',
          icon: <Target className="w-5 h-5 text-primary" />,
          iconBg: 'bg-primary/20'
        };
      default:
        return {
          border: 'border-border/60',
          bg: 'bg-muted/30',
          icon: <Lightbulb className="w-5 h-5 text-primary" />,
          iconBg: 'bg-primary/20'
        };
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
    <div className="space-y-5 relative">
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
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground rounded-lg border border-dashed border-border/60 bg-muted/10">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Lightbulb className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-sm font-medium mb-1">Nenhum insight disponível</p>
          <p className="text-xs text-muted-foreground/70 mb-4 text-center max-w-[250px]">
            Gere insights com IA para receber análises detalhadas sobre sua performance
          </p>
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
              className="gap-1.5 relative z-30 cursor-pointer pointer-events-auto"
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
        <div className="space-y-5">
          {/* Texto ou summary como destaque principal */}
          {(text || summary) && (
            <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground mb-2">Resumo da Análise</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{text || summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alerts - mantém estilo original com pequenas melhorias */}
          {alerts && alerts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Alertas ({alerts.length})
              </h4>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border",
                      getAlertStyle(alert.type || 'info')
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type || 'info')}
                    </div>
                    <p className="text-sm leading-relaxed">{alert.text || alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights array - com explicações enriquecidas */}
          {insightsData && insightsData.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5" />
                Insights ({insightsData.length})
              </h4>
              <div className="space-y-3">
                {insightsData.map((item, i) => {
                  const enriched = enrichInsightText(getItemText(item), scope);
                  const styles = getInsightTypeStyles(enriched.type);
                  const isExpanded = expandedInsights.has(i);
                  
                  return (
                    <Collapsible
                      key={i}
                      open={isExpanded}
                      onOpenChange={() => toggleExpanded(i)}
                    >
                      <div
                        className={cn(
                          "rounded-xl border transition-all duration-200",
                          styles.border,
                          styles.bg
                        )}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-xl">
                            <div className={cn("p-2 rounded-lg flex-shrink-0", styles.iconBg)}>
                              {styles.icon}
                            </div>
                            <div className="flex-1 text-left">
                              <h5 className="font-semibold text-sm text-foreground">
                                {enriched.title}
                              </h5>
                              {!isExpanded && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {enriched.explanation.slice(0, 80)}...
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 ml-14">
                            <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                              {enriched.explanation}
                            </p>
                            {enriched.action && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/40">
                                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-primary">Próximo passo:</span>
                                  <p className="text-xs text-foreground/70 mt-0.5">{enriched.action}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations - com prioridade visual */}
          {recommendations && recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Recomendações ({recommendations.length})
              </h4>
              <div className="space-y-2">
                {recommendations.map((rec, i) => {
                  const enriched = enrichRecommendation(getItemText(rec));
                  const priorityStyles = {
                    high: 'border-destructive/40 bg-destructive/10',
                    medium: 'border-warning/40 bg-warning/10',
                    low: 'border-success/40 bg-success/10',
                  };
                  
                  return (
                    <div
                      key={i}
                      className={cn(
                        "p-4 rounded-xl border",
                        priorityStyles[enriched.priority]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-1.5 rounded-lg flex-shrink-0",
                          enriched.priority === 'high' ? 'bg-destructive/20' :
                          enriched.priority === 'medium' ? 'bg-warning/20' : 'bg-success/20'
                        )}>
                          <Zap className={cn(
                            "w-4 h-4",
                            enriched.priority === 'high' ? 'text-destructive' :
                            enriched.priority === 'medium' ? 'text-warning' : 'text-success'
                          )} />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm text-foreground mb-1">
                            {enriched.title}
                          </h5>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {enriched.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Anomalies */}
          {anomalies && anomalies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5" />
                Anomalias Detectadas ({anomalies.length})
              </h4>
              <div className="space-y-2">
                {anomalies.map((anomaly, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-xl border border-warning/40 bg-warning/10"
                  >
                    <div className="p-1.5 rounded-lg bg-warning/20 flex-shrink-0">
                      <TrendingDown className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground/80 leading-relaxed">{getItemText(anomaly)}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Anomalias podem indicar problemas técnicos, mudanças de mercado ou oportunidades não exploradas.
                      </p>
                    </div>
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