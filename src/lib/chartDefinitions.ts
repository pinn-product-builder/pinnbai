/**
 * Definições e explicações para gráficos do dashboard
 * Similar ao kpiDefinitions.ts, mas para gráficos
 */

export interface ChartDefinition {
  title: string;
  description: string;
  axisX: string;
  axisY: string;
  period: string;
  source: string;
  interpretation?: string;
}

export const chartDefinitions: Record<string, ChartDefinition> = {
  // === CONVERSAS ===
  'mensagens_diarias': {
    title: 'Mensagens Diárias',
    description: 'Volume de mensagens recebidas por dia nos últimos 60 dias',
    axisX: 'Data (dias)',
    axisY: 'Quantidade de mensagens',
    period: 'Últimos 60 dias',
    source: 'vw_kommo_msg_in_daily_60d_v3',
    interpretation: 'Identifique picos de engajamento e dias com maior volume de interações',
  },
  'distribuicao_hora': {
    title: 'Distribuição por Hora',
    description: 'Mostra em quais horários do dia você recebe mais mensagens',
    axisX: 'Hora do dia (0-23h)',
    axisY: 'Total de mensagens',
    period: 'Últimos 7 dias',
    source: 'vw_kommo_msg_in_by_hour_7d_v3',
    interpretation: 'Use para otimizar horários de atendimento e campanhas',
  },
  'tendencia_conversao': {
    title: 'Tendência de Conversão',
    description: 'Mostra a taxa de mensagens por lead ao longo do tempo',
    axisX: 'Data (dias)',
    axisY: 'Taxa de conversão (%) / Quantidade de mensagens',
    period: 'Últimos 60 dias',
    source: 'vw_kommo_msg_in_daily_60d_v3',
    interpretation: 'A linha tracejada é a média. Acima = bom engajamento',
  },
  'mapa_calor': {
    title: 'Mapa de Calor',
    description: 'Visualização de mensagens por dia da semana e hora do dia',
    axisX: 'Hora do dia (0-23h)',
    axisY: 'Dia da semana',
    period: 'Últimos 30 dias',
    source: 'vw_kommo_msg_in_heatmap_30d_v3',
    interpretation: 'Cores mais intensas = maior volume de mensagens. Identifique padrões de comportamento',
  },
  'metricas_diarias': {
    title: 'Métricas Diárias Detalhadas',
    description: 'Tabela com métricas detalhadas dos últimos dias',
    axisX: 'Data',
    axisY: 'Valores',
    period: 'Últimos 15 dias',
    source: 'vw_kommo_msg_in_daily_60d_v3',
    interpretation: 'Acompanhe a evolução dia a dia das suas métricas',
  },
  
  // === LIGAÇÕES ===
  'ligacoes_diarias': {
    title: 'Ligações Diárias',
    description: 'Volume de ligações realizadas e atendidas por dia',
    axisX: 'Data (dias)',
    axisY: 'Quantidade de ligações',
    period: 'Últimos 60 dias',
    source: 'v3_calls_daily_v3',
    interpretation: 'Compare realizadas vs atendidas para avaliar efetividade',
  },
  'custo_acumulado': {
    title: 'Custo Acumulado',
    description: 'Evolução do custo de ligações ao longo do tempo',
    axisX: 'Data (dias)',
    axisY: 'Custo em USD',
    period: 'Últimos 60 dias',
    source: 'v3_calls_daily_v3',
    interpretation: 'Área verde = custo acumulado. Área laranja = custo diário',
  },
  'motivos_finalizacao': {
    title: 'Motivos de Finalização',
    description: 'Distribuição das ligações por motivo de encerramento',
    axisX: 'Quantidade',
    axisY: 'Motivo',
    period: 'Período selecionado',
    source: 'v3_calls_ended_reason_daily',
    interpretation: 'Identifique problemas recorrentes como "não atendeu" ou "correio de voz"',
  },
  'tendencia_motivos': {
    title: 'Tendência de Motivos',
    description: 'Evolução dos motivos de finalização ao longo do tempo',
    axisX: 'Data (dias)',
    axisY: 'Quantidade de ligações',
    period: 'Últimos 30 dias',
    source: 'v3_calls_ended_reason_daily',
    interpretation: 'Áreas empilhadas mostram a composição diária dos motivos',
  },
  'tabela_ligacoes_diarias': {
    title: 'Dados Diários de Ligações',
    description: 'Tabela com detalhamento diário de ligações',
    axisX: 'Data',
    axisY: 'Métricas',
    period: 'Últimos 60 dias',
    source: 'v3_calls_daily_v3',
    interpretation: 'Visualize taxa de atendimento e custo por dia',
  },
  
  // === EXECUTIVO ===
  'funil_vendas': {
    title: 'Funil de Vendas',
    description: 'Quantidade de leads em cada etapa do funil',
    axisX: 'Etapa',
    axisY: 'Quantidade de leads',
    period: 'Estado atual',
    source: 'vw_funnel_current_v3',
    interpretation: 'Identifique gargalos onde leads estão parados',
  },
  'tendencia_diaria': {
    title: 'Tendência Diária',
    description: 'Evolução de leads, mensagens e reuniões ao longo do tempo',
    axisX: 'Data (dias)',
    axisY: 'Quantidade',
    period: 'Últimos 60 dias',
    source: 'vw_dashboard_daily_60d_v3',
    interpretation: 'Acompanhe a saúde geral do funil',
  },
  
  // === TRÁFEGO ===
  'custo_funil': {
    title: 'Custo por Etapa do Funil',
    description: 'Investimento em mídia por etapa do funil de vendas',
    axisX: 'Etapa',
    axisY: 'Custo (R$)',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
    interpretation: 'Avalie o custo-benefício de cada etapa',
  },
};

export function getChartDefinition(key: string): ChartDefinition | undefined {
  return chartDefinitions[key];
}
