// Gerador de Insights Local - Baseado nos dados reais do dashboard
// Funciona independente da edge function

interface InsightItem {
  title: string;
  description: string;
  current_value?: string;
  comparison?: string;
  impact?: string;
  recommendation?: string;
}

interface AlertItem {
  type: 'warning' | 'danger' | 'success';
  title: string;
  description: string;
  metric_value?: string;
  benchmark?: string;
  action?: string;
}

interface RecommendationItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expected_impact?: string;
  effort?: string;
  steps?: string[];
}

interface DashboardKpis {
  leads_total_30d?: number;
  msg_in_30d?: number;
  meetings_scheduled_30d?: number;
  meetings_done?: number;
  meetings_cancelled_30d?: number;
  spend_30d?: number;
  cpl_30d?: number;
  cpm_meeting_30d?: number;
  conv_lead_to_meeting_30d?: number;
  changes?: {
    leads?: number;
    spend?: number;
    meetings_scheduled?: number;
    meetings_done?: number;
    cpl?: number;
    cpm_meeting?: number;
    conv_lead_to_meeting?: number;
  };
}

interface FunnelStage {
  stage_name: string;
  leads: number;
  stage_order: number;
}

export interface GeneratedInsights {
  summary: string;
  insights: InsightItem[];
  alerts: AlertItem[];
  recommendations: RecommendationItem[];
  anomalies: any[];
}

export function generateLocalInsights(
  kpis: DashboardKpis | null,
  funnel: FunnelStage[] | null,
  totalLeads: number = 0
): GeneratedInsights {
  const insights: InsightItem[] = [];
  const alerts: AlertItem[] = [];
  const recommendations: RecommendationItem[] = [];
  let summaryParts: string[] = [];

  if (!kpis) {
    return {
      summary: "Aguardando dados para análise...",
      insights: [],
      alerts: [],
      recommendations: [{
        priority: 'medium',
        title: 'Configure a Organização',
        description: 'Selecione uma organização no filtro para visualizar insights personalizados.',
      }],
      anomalies: [],
    };
  }

  // ===== ANÁLISE DE CPL =====
  const cpl = kpis.cpl_30d || 0;
  const cplChange = kpis.changes?.cpl;
  
  if (cpl > 0) {
    if (cpl <= 40) {
      insights.push({
        title: 'CPL Excelente',
        description: `Custo por Lead de R$ ${cpl.toFixed(2)} está dentro da faixa ideal do mercado (R$ 30-60).`,
        current_value: `R$ ${cpl.toFixed(2)}`,
        comparison: 'Benchmark: R$ 30-60',
        impact: 'Alto ROI nas campanhas',
      });
      summaryParts.push('CPL otimizado');
    } else if (cpl <= 80) {
      insights.push({
        title: 'CPL Aceitável',
        description: `CPL de R$ ${cpl.toFixed(2)} está ligeiramente acima do ideal. Há espaço para otimização.`,
        current_value: `R$ ${cpl.toFixed(2)}`,
        comparison: 'Ideal: R$ 30-60',
      });
    } else if (cpl <= 120) {
      alerts.push({
        type: 'warning',
        title: 'CPL Elevado',
        description: `CPL de R$ ${cpl.toFixed(2)} está acima do benchmark. Considere revisar a segmentação das campanhas.`,
        metric_value: `R$ ${cpl.toFixed(2)}`,
        benchmark: 'R$ 30-60',
        action: 'Revisar público-alvo e criativos das campanhas',
      });
      summaryParts.push('atenção ao CPL');
    } else {
      alerts.push({
        type: 'danger',
        title: 'CPL Crítico',
        description: `CPL de R$ ${cpl.toFixed(2)} está muito alto. Ação urgente necessária para evitar desperdício de orçamento.`,
        metric_value: `R$ ${cpl.toFixed(2)}`,
        benchmark: 'R$ 30-60',
        action: 'Pausar campanhas de baixo desempenho e realocar orçamento',
      });
      summaryParts.push('CPL crítico requer ação');
    }

    if (cplChange !== undefined && Math.abs(cplChange) > 15) {
      if (cplChange < -15) {
        insights.push({
          title: 'CPL em Queda',
          description: `O CPL reduziu ${Math.abs(cplChange).toFixed(1)}% em relação ao período anterior. As otimizações estão funcionando!`,
          current_value: `${cplChange.toFixed(1)}%`,
          impact: 'Mais leads pelo mesmo investimento',
        });
      } else if (cplChange > 20) {
        alerts.push({
          type: 'warning',
          title: 'CPL Subindo',
          description: `Aumento de ${cplChange.toFixed(1)}% no CPL. Investigue as causas antes que impacte o orçamento.`,
          metric_value: `+${cplChange.toFixed(1)}%`,
          action: 'Analisar mudanças recentes nas campanhas',
        });
      }
    }
  }

  // ===== ANÁLISE DE CONVERSÃO =====
  const convRate = kpis.conv_lead_to_meeting_30d || 0;
  const convChange = kpis.changes?.conv_lead_to_meeting;

  if (convRate > 0) {
    const convPercent = (convRate * 100).toFixed(1);
    
    if (convRate >= 0.20) {
      insights.push({
        title: 'Taxa de Conversão Excelente',
        description: `${convPercent}% dos leads estão agendando reuniões - resultado excepcional que indica ótima qualificação.`,
        current_value: `${convPercent}%`,
        comparison: 'Benchmark: 10-20%',
        impact: 'Alta eficiência comercial',
        recommendation: 'Documente o processo atual para replicar em outras campanhas',
      });
      summaryParts.push('conversão acima da média');
    } else if (convRate >= 0.10) {
      insights.push({
        title: 'Conversão Saudável',
        description: `Taxa de ${convPercent}% está dentro do esperado para o mercado de clínicas.`,
        current_value: `${convPercent}%`,
        comparison: 'Benchmark: 10-20%',
      });
    } else if (convRate >= 0.05) {
      recommendations.push({
        priority: 'high',
        title: 'Melhorar Qualificação de Leads',
        description: `Taxa de ${convPercent}% está abaixo do ideal. Revise o processo de qualificação.`,
        expected_impact: 'Aumento de 50-100% nas reuniões',
        effort: 'Médio',
        steps: [
          'Revisar script de abordagem',
          'Implementar qualificação BANT',
          'Reduzir tempo de resposta aos leads',
        ],
      });
    } else {
      alerts.push({
        type: 'danger',
        title: 'Conversão Crítica',
        description: `Apenas ${convPercent}% dos leads agendam reuniões. Há um problema sério no funil de vendas.`,
        metric_value: `${convPercent}%`,
        benchmark: '10-20%',
        action: 'Revisar urgentemente a qualidade dos leads e processo de atendimento',
      });
      summaryParts.push('conversão requer atenção urgente');
    }
  }

  // ===== ANÁLISE DE REUNIÕES =====
  const meetingsScheduled = kpis.meetings_scheduled_30d || 0;
  const meetingsDone = kpis.meetings_done || 0;
  const meetingsCancelled = kpis.meetings_cancelled_30d || 0;

  if (meetingsScheduled > 0) {
    const cancelRate = meetingsCancelled / meetingsScheduled;
    const showRate = meetingsDone / meetingsScheduled;

    if (cancelRate > 0.30) {
      alerts.push({
        type: 'danger',
        title: 'Alto Índice de Cancelamentos',
        description: `${(cancelRate * 100).toFixed(0)}% das reuniões foram canceladas. Isso impacta diretamente a receita.`,
        metric_value: `${meetingsCancelled} canceladas`,
        benchmark: 'Ideal: < 15%',
        action: 'Implementar confirmação 24h antes e lembretes automatizados',
      });
      recommendations.push({
        priority: 'high',
        title: 'Reduzir Cancelamentos',
        description: 'Implemente estratégias para reduzir no-shows e cancelamentos de última hora.',
        expected_impact: 'Recuperar 30-50% das reuniões perdidas',
        effort: 'Baixo',
        steps: [
          'Enviar confirmação por WhatsApp 24h antes',
          'Criar senso de urgência no agendamento',
          'Oferecer reagendamento fácil',
        ],
      });
    } else if (cancelRate > 0.15) {
      alerts.push({
        type: 'warning',
        title: 'Cancelamentos Acima do Ideal',
        description: `${(cancelRate * 100).toFixed(0)}% de cancelamentos está acima do benchmark de 15%.`,
        metric_value: `${meetingsCancelled} de ${meetingsScheduled}`,
        action: 'Revisar processo de confirmação',
      });
    }

    if (showRate >= 0.75) {
      insights.push({
        title: 'Alta Taxa de Comparecimento',
        description: `${(showRate * 100).toFixed(0)}% das reuniões agendadas foram realizadas - excelente engajamento!`,
        current_value: `${meetingsDone} de ${meetingsScheduled}`,
        impact: 'Máximo aproveitamento do pipeline',
      });
    }
  }

  // ===== ANÁLISE DO FUNIL =====
  if (funnel && funnel.length > 0) {
    const totalInFunnel = funnel.reduce((sum, s) => sum + (s.leads || 0), 0);
    const firstStage = funnel.find(s => s.stage_order === 1 || s.stage_order === 0);
    const lastStage = funnel[funnel.length - 1];

    insights.push({
      title: 'Pipeline Ativo',
      description: `${totalInFunnel} leads distribuídos em ${funnel.length} etapas do funil. ${firstStage?.stage_name || 'Entrada'} com ${firstStage?.leads || 0} leads.`,
      current_value: `${totalInFunnel} leads`,
      recommendation: 'Monitore a progressão entre etapas semanalmente',
    });

    // Detectar gargalos
    const sortedFunnel = [...funnel].sort((a, b) => a.stage_order - b.stage_order);
    for (let i = 0; i < sortedFunnel.length - 1; i++) {
      const current = sortedFunnel[i];
      const next = sortedFunnel[i + 1];
      if (current.leads > 0 && next.leads > 0) {
        const dropRate = 1 - (next.leads / current.leads);
        if (dropRate > 0.7 && current.leads > 5) {
          recommendations.push({
            priority: 'medium',
            title: `Gargalo: ${current.stage_name}`,
            description: `${(dropRate * 100).toFixed(0)}% dos leads não avançam de "${current.stage_name}" para "${next.stage_name}".`,
            expected_impact: 'Aumentar conversão do funil',
            steps: [
              `Revisar critérios de passagem para ${next.stage_name}`,
              'Analisar objeções mais comuns nessa etapa',
            ],
          });
          break; // Só mostrar o primeiro gargalo
        }
      }
    }
  }

  // ===== ANÁLISE DE INVESTIMENTO =====
  const spend = kpis.spend_30d || 0;
  const spendChange = kpis.changes?.spend;
  const leads = kpis.leads_total_30d || 0;

  if (spend > 0 && leads > 0) {
    const roi = meetingsScheduled > 0 ? (meetingsScheduled / spend) * 1000 : 0;
    
    if (roi > 0) {
      insights.push({
        title: 'Eficiência do Investimento',
        description: `Para cada R$ 1.000 investidos, ${roi.toFixed(1)} reuniões são agendadas.`,
        current_value: `R$ ${spend.toFixed(0)} → ${meetingsScheduled} reuniões`,
      });
    }

    if (spendChange !== undefined && spendChange > 30) {
      recommendations.push({
        priority: 'medium',
        title: 'Aumento de Investimento',
        description: `Investimento aumentou ${spendChange.toFixed(0)}%. Monitore se os resultados acompanham proporcionalmente.`,
        expected_impact: 'Otimizar alocação de budget',
      });
    }
  }

  // ===== RECOMENDAÇÕES GERAIS =====
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'low',
      title: 'Continue Monitorando',
      description: 'Os indicadores estão estáveis. Continue acompanhando as métricas diariamente para identificar oportunidades.',
      effort: 'Baixo',
    });
  }

  // ===== GERAR SUMMARY =====
  let summary = '';
  if (summaryParts.length > 0) {
    summary = `Destaques: ${summaryParts.join(', ')}.`;
  } else if (alerts.length > 0) {
    summary = `Atenção: ${alerts.length} ponto(s) requer(em) análise.`;
  } else if (insights.length > 0) {
    summary = `Performance estável com ${insights.length} insight(s) positivo(s).`;
  } else {
    summary = 'Dados insuficientes para análise completa.';
  }

  // Adicionar contexto numérico ao summary
  if (leads > 0 || meetingsScheduled > 0) {
    summary += ` Período: ${leads} leads, ${meetingsScheduled} reuniões agendadas, R$ ${spend.toFixed(0)} investidos.`;
  }

  return {
    summary,
    insights,
    alerts,
    recommendations,
    anomalies: [],
  };
}
