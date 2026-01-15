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
  ArrowRight,
  ListChecks,
  Search
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

// Tipos para os insights detalhados da nova edge function
interface DetailedAlert {
  type: 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  metric_value?: string;
  benchmark?: string;
  action?: string;
}

interface DetailedInsight {
  title: string;
  description: string;
  current_value?: string;
  comparison?: string;
  impact?: string;
  recommendation?: string;
}

interface DetailedRecommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expected_impact?: string;
  effort?: string;
  steps?: string[];
}

interface DetailedAnomaly {
  title: string;
  description: string;
  possible_causes?: string[];
  investigation_steps?: string[];
}

export function InsightsPanel({ insight, isLoading, orgId, scope }: InsightsPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['insight-0', 'rec-0']));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
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
          title: 'Erro',
          description: result.error || 'Erro ao gerar insights',
          variant: 'destructive',
        });
      }
      
      await queryClient.invalidateQueries({ queryKey: ['insights', orgId, scope] });
      await queryClient.invalidateQueries({ queryKey: ['insights-history', orgId] });
      await queryClient.refetchQueries({ queryKey: ['insights', orgId, scope] });
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar insights',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted/20 animate-pulse" />
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

  // Novos campos detalhados da edge function
  // Normalizar formato antigo ({text}) para novo formato ({title, description})
  const normalizeInsights = (items: any[] | undefined): DetailedInsight[] => {
    if (!items) return [];
    return items.map((item) => {
      if (item.title && item.description) return item;
      // Formato antigo com apenas 'text' - extrair título do texto
      const text = item.text || item.description || '';
      // Tentar extrair título do primeiro pedaço até ponto, vírgula ou exclamação
      const match = text.match(/^([^.!?,]{10,60})[.!?,]?/);
      const extractedTitle = match ? match[1].trim() : text.substring(0, 50);
      return {
        title: extractedTitle + (extractedTitle.length >= 50 ? '...' : ''),
        description: text,
        ...item
      };
    });
  };

  const normalizeRecommendations = (items: any[] | undefined): DetailedRecommendation[] => {
    if (!items) return [];
    return items.map((item) => {
      if (item.title && item.description) return item;
      // Formato antigo com apenas 'text' - extrair título do texto
      const text = item.text || item.description || '';
      const match = text.match(/^([^.!?,]{10,60})[.!?,]?/);
      const extractedTitle = match ? match[1].trim() : text.substring(0, 50);
      return {
        priority: item.priority || 'medium',
        title: extractedTitle + (extractedTitle.length >= 50 ? '...' : ''),
        description: text,
        ...item
      };
    });
  };

  const normalizeAlerts = (items: any[] | undefined): DetailedAlert[] => {
    if (!items) return [];
    return items.map((item) => {
      if (item.title && item.description) return item;
      const text = item.text || item.description || '';
      const match = text.match(/^([^.!?,]{10,60})[.!?,]?/);
      const extractedTitle = match ? match[1].trim() : text.substring(0, 50);
      return {
        type: item.type || item.severity || 'warning',
        title: extractedTitle + (extractedTitle.length >= 50 ? '...' : ''),
        description: text,
        ...item
      };
    });
  };

  const normalizeAnomalies = (items: any[] | undefined): DetailedAnomaly[] => {
    if (!items) return [];
    return items.map((item) => {
      if (item.title && item.description) return item;
      const text = item.text || item.description || '';
      const match = text.match(/^([^.!?,]{10,60})[.!?,]?/);
      const extractedTitle = match ? match[1].trim() : text.substring(0, 50);
      return {
        title: extractedTitle + (extractedTitle.length >= 50 ? '...' : ''),
        description: text,
        ...item
      };
    });
  };

  const alerts = normalizeAlerts(parsedPayload.alerts as any[]);
  const insights = normalizeInsights(parsedPayload.insights as any[]);
  const recommendations = normalizeRecommendations(parsedPayload.recommendations as any[]);
  const anomalies = normalizeAnomalies(parsedPayload.anomalies as any[]);
  const summary = parsedPayload.summary as string | undefined;

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

  const hasContent = summary || alerts.length > 0 || recommendations.length > 0 || anomalies.length > 0 || insights.length > 0;

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          border: 'border-destructive/40',
          bg: 'bg-destructive/10',
          icon: <AlertTriangle className="w-5 h-5 text-destructive" />,
          iconBg: 'bg-destructive/20'
        };
      case 'warning':
        return {
          border: 'border-warning/40',
          bg: 'bg-warning/10',
          icon: <AlertCircle className="w-5 h-5 text-warning" />,
          iconBg: 'bg-warning/20'
        };
      case 'success':
        return {
          border: 'border-success/40',
          bg: 'bg-success/10',
          icon: <CheckCircle2 className="w-5 h-5 text-success" />,
          iconBg: 'bg-success/20'
        };
      default:
        return {
          border: 'border-primary/40',
          bg: 'bg-primary/10',
          icon: <Info className="w-5 h-5 text-primary" />,
          iconBg: 'bg-primary/20'
        };
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-destructive/40',
          bg: 'bg-destructive/10',
          badge: 'bg-destructive/20 text-destructive',
          label: 'Alta'
        };
      case 'medium':
        return {
          border: 'border-warning/40',
          bg: 'bg-warning/10',
          badge: 'bg-warning/20 text-warning',
          label: 'Média'
        };
      default:
        return {
          border: 'border-success/40',
          bg: 'bg-success/10',
          badge: 'bg-success/20 text-success',
          label: 'Baixa'
        };
    }
  };

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
                <span>Gerando com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Insights</span>
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
            Gere insights com IA para receber análises detalhadas com métricas, benchmarks e recomendações
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
        <div className="space-y-6">
          {/* Summary - Destaque principal */}
          {summary && (
            <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-foreground mb-2">Resumo Executivo</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{summary}</p>
                </div>
              </div>
            </div>
          )}

          {/* Alerts - Com métricas e benchmarks */}
          {alerts && alerts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Alertas ({alerts.length})
              </h4>
              <div className="space-y-3">
                {alerts.map((alert, i) => {
                  const styles = getAlertStyles(alert.type);
                  const key = `alert-${i}`;
                  const isExpanded = expandedItems.has(key);
                  
                  return (
                    <Collapsible key={i} open={isExpanded} onOpenChange={() => toggleExpanded(key)}>
                      <div className={cn("rounded-xl border transition-all duration-200", styles.border, styles.bg)}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-xl">
                            <div className={cn("p-2 rounded-lg flex-shrink-0", styles.iconBg)}>
                              {styles.icon}
                            </div>
                            <div className="flex-1 text-left">
                              <h5 className="font-semibold text-sm text-foreground">{alert.title}</h5>
                              {!isExpanded && alert.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {alert.description.slice(0, 80)}...
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 ml-14 space-y-3">
                            <p className="text-sm text-foreground/80 leading-relaxed">{alert.description}</p>
                            
                            {(alert.metric_value || alert.benchmark) && (
                              <div className="flex flex-wrap gap-3 text-xs">
                                {alert.metric_value && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/50 border border-border/40">
                                    <Target className="w-3 h-3 text-primary" />
                                    <span className="text-muted-foreground">Valor:</span>
                                    <span className="font-medium text-foreground">{alert.metric_value}</span>
                                  </div>
                                )}
                                {alert.benchmark && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/50 border border-border/40">
                                    <TrendingUp className="w-3 h-3 text-success" />
                                    <span className="text-muted-foreground">Benchmark:</span>
                                    <span className="font-medium text-foreground">{alert.benchmark}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {alert.action && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/40">
                                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-primary">Ação recomendada:</span>
                                  <p className="text-xs text-foreground/70 mt-0.5">{alert.action}</p>
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

          {/* Insights - Com valores e comparações */}
          {insights && insights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5" />
                Insights ({insights.length})
              </h4>
              <div className="space-y-3">
                {insights.map((item, i) => {
                  const key = `insight-${i}`;
                  const isExpanded = expandedItems.has(key);
                  
                  return (
                    <Collapsible key={i} open={isExpanded} onOpenChange={() => toggleExpanded(key)}>
                      <div className="rounded-xl border border-primary/30 bg-primary/5 transition-all duration-200">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-xl">
                            <div className="p-2 rounded-lg bg-primary/20 flex-shrink-0">
                              <Lightbulb className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 text-left">
                              <h5 className="font-semibold text-sm text-foreground">{item.title}</h5>
                              {!isExpanded && item.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {item.description.slice(0, 80)}...
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 ml-14 space-y-3">
                            <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
                            
                            {(item.current_value || item.comparison) && (
                              <div className="flex flex-wrap gap-3 text-xs">
                                {item.current_value && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/50 border border-border/40">
                                    <Target className="w-3 h-3 text-primary" />
                                    <span className="text-muted-foreground">Atual:</span>
                                    <span className="font-medium text-foreground">{item.current_value}</span>
                                  </div>
                                )}
                                {item.comparison && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/50 border border-border/40">
                                    <TrendingUp className="w-3 h-3 text-success" />
                                    <span className="text-muted-foreground">Comparação:</span>
                                    <span className="font-medium text-foreground">{item.comparison}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {item.impact && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                                <Zap className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-warning">Impacto no negócio:</span>
                                  <p className="text-xs text-foreground/70 mt-0.5">{item.impact}</p>
                                </div>
                              </div>
                            )}
                            
                            {item.recommendation && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/40">
                                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-xs font-medium text-primary">Recomendação:</span>
                                  <p className="text-xs text-foreground/70 mt-0.5">{item.recommendation}</p>
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

          {/* Recommendations - Com passos e prioridade */}
          {recommendations && recommendations.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Recomendações ({recommendations.length})
              </h4>
              <div className="space-y-3">
                {recommendations.map((rec, i) => {
                  const styles = getPriorityStyles(rec.priority);
                  const key = `rec-${i}`;
                  const isExpanded = expandedItems.has(key);
                  
                  return (
                    <Collapsible key={i} open={isExpanded} onOpenChange={() => toggleExpanded(key)}>
                      <div className={cn("rounded-xl border transition-all duration-200", styles.border, styles.bg)}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-xl">
                            <div className="flex flex-col items-center gap-1">
                              <div className={cn("p-2 rounded-lg", styles.badge.split(' ')[0])}>
                                <Target className="w-5 h-5" style={{ color: rec.priority === 'high' ? 'var(--destructive)' : rec.priority === 'medium' ? 'var(--warning)' : 'var(--success)' }} />
                              </div>
                              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", styles.badge)}>
                                {styles.label}
                              </span>
                            </div>
                            <div className="flex-1 text-left">
                              <h5 className="font-semibold text-sm text-foreground">{rec.title}</h5>
                              {!isExpanded && rec.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {rec.description.slice(0, 80)}...
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 ml-16 space-y-3">
                            <p className="text-sm text-foreground/80 leading-relaxed">{rec.description}</p>
                            
                            {(rec.expected_impact || rec.effort) && (
                              <div className="flex flex-wrap gap-3 text-xs">
                                {rec.expected_impact && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/50 border border-border/40">
                                    <TrendingUp className="w-3 h-3 text-success" />
                                    <span className="text-muted-foreground">Impacto:</span>
                                    <span className="font-medium text-foreground">{rec.expected_impact}</span>
                                  </div>
                                )}
                                {rec.effort && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/50 border border-border/40">
                                    <Zap className="w-3 h-3 text-warning" />
                                    <span className="text-muted-foreground">Esforço:</span>
                                    <span className="font-medium text-foreground">{rec.effort}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {rec.steps && rec.steps.length > 0 && (
                              <div className="p-3 rounded-lg bg-background/50 border border-border/40">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <ListChecks className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-medium text-primary">Passos para implementar:</span>
                                </div>
                                <ol className="space-y-1.5 ml-1">
                                  {rec.steps.map((step, stepIdx) => (
                                    <li key={stepIdx} className="text-xs text-foreground/70 flex items-start gap-2">
                                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-medium flex items-center justify-center">
                                        {stepIdx + 1}
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
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

          {/* Anomalies - Com causas e investigação */}
          {anomalies && anomalies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5" />
                Anomalias Detectadas ({anomalies.length})
              </h4>
              <div className="space-y-3">
                {anomalies.map((anomaly, i) => {
                  const key = `anomaly-${i}`;
                  const isExpanded = expandedItems.has(key);
                  
                  return (
                    <Collapsible key={i} open={isExpanded} onOpenChange={() => toggleExpanded(key)}>
                      <div className="rounded-xl border border-warning/40 bg-warning/10 transition-all duration-200">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-xl">
                            <div className="p-2 rounded-lg bg-warning/20 flex-shrink-0">
                              <TrendingDown className="w-5 h-5 text-warning" />
                            </div>
                            <div className="flex-1 text-left">
                              <h5 className="font-semibold text-sm text-foreground">{anomaly.title}</h5>
                              {!isExpanded && anomaly.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {anomaly.description.slice(0, 80)}...
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-0 ml-14 space-y-3">
                            <p className="text-sm text-foreground/80 leading-relaxed">{anomaly.description}</p>
                            
                            {anomaly.possible_causes && anomaly.possible_causes.length > 0 && (
                              <div className="p-3 rounded-lg bg-background/50 border border-border/40">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <AlertCircle className="w-4 h-4 text-warning" />
                                  <span className="text-xs font-medium text-warning">Possíveis causas:</span>
                                </div>
                                <ul className="space-y-1 ml-1">
                                  {anomaly.possible_causes.map((cause, idx) => (
                                    <li key={idx} className="text-xs text-foreground/70 flex items-start gap-2">
                                      <span className="text-warning">•</span>
                                      {cause}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {anomaly.investigation_steps && anomaly.investigation_steps.length > 0 && (
                              <div className="p-3 rounded-lg bg-background/50 border border-border/40">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Search className="w-4 h-4 text-primary" />
                                  <span className="text-xs font-medium text-primary">Passos de investigação:</span>
                                </div>
                                <ol className="space-y-1.5 ml-1">
                                  {anomaly.investigation_steps.map((step, stepIdx) => (
                                    <li key={stepIdx} className="text-xs text-foreground/70 flex items-start gap-2">
                                      <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-medium flex items-center justify-center">
                                        {stepIdx + 1}
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
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
        </div>
      )}
    </div>
  );
}
