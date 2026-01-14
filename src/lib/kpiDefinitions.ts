/**
 * Definições locais de KPIs para fallback
 * Usado quando o dicionário do banco não está disponível
 * Inclui: título, definição, fórmula, período e fonte (view)
 */

export interface KpiDefinition {
  title: string;
  definition: string;
  formula?: string;
  period?: string;
  source?: string;
}

export const LOCAL_KPI_DEFINITIONS: Record<string, KpiDefinition> = {
  // ===== EXECUTIVO =====
  leads_total: {
    title: 'Total de Leads',
    definition: 'Quantidade total de leads cadastrados no sistema. Representa todos os contatos captados através das campanhas de marketing.',
    period: 'Desde o início',
    source: 'leads_v2',
  },
  msg_in_30d: {
    title: 'Mensagens Recebidas (30d)',
    definition: 'Total de mensagens recebidas de leads nos últimos 30 dias via WhatsApp ou outros canais de comunicação.',
    period: 'Últimos 30 dias',
    source: 'vw_dashboard_kpis_30d_v3',
  },
  meetings_scheduled_30d: {
    title: 'Reuniões Agendadas (30d)',
    definition: 'Número de reuniões que foram marcadas no calendário nos últimos 30 dias, independentemente se já aconteceram ou não.',
    period: 'Últimos 30 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },
  meetings_done: {
    title: 'Reuniões Realizadas',
    definition: 'Total de reuniões que efetivamente aconteceram. Apenas reuniões onde o lead compareceu são contabilizadas. Se o valor estiver zerado, pode indicar que nenhuma reunião foi marcada como "realizada" no sistema de origem.',
    formula: 'Σ reunião_realizada = true',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  meetings_cancelled_30d: {
    title: 'Reuniões Canceladas (30d)',
    definition: 'Número de reuniões que foram canceladas nos últimos 30 dias. Inclui cancelamentos pelo lead ou pela empresa.',
    period: 'Últimos 30 dias',
    source: 'vw_dashboard_kpis_30d_v3',
  },
  spend_30d: {
    title: 'Investimento (30d)',
    definition: 'Valor total investido em anúncios pagos (Meta Ads, Google Ads, etc.) nos últimos 30 dias.',
    formula: 'Σ custo_total (período)',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  cpl_30d: {
    title: 'CPL - Custo por Lead (30d)',
    definition: 'Custo médio para adquirir cada lead. Quanto menor, mais eficiente é a campanha de aquisição.',
    formula: 'Investimento Total ÷ Número de Leads',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  cpm_meeting_30d: {
    title: 'Custo por Reunião (30d)',
    definition: 'Custo médio para conseguir agendar uma reunião. Indica a eficiência do funil de conversão.',
    formula: 'Investimento Total ÷ Reuniões Agendadas',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  conv_lead_to_meeting_30d: {
    title: 'Conversão Lead → Reunião (30d)',
    definition: 'Percentual de leads que agendaram pelo menos uma reunião. Mede a qualidade dos leads e eficácia do follow-up.',
    formula: '(Reuniões Agendadas ÷ Total de Leads) × 100',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },

  // ===== TRÁFEGO =====
  spend_total_30d: {
    title: 'Investimento Total (30d)',
    definition: 'Soma de todos os valores investidos em campanhas de tráfego pago nos últimos 30 dias.',
    formula: 'Σ custo_total (período)',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  leads_30d: {
    title: 'Leads Captados (30d)',
    definition: 'Número de novos leads gerados através das campanhas de anúncios no período selecionado.',
    period: 'Período selecionado',
    source: 'leads_v2',
  },
  entradas_30d: {
    title: 'Entradas no Funil (30d)',
    definition: 'Leads que avançaram para a primeira etapa do funil de vendas. Indica engajamento inicial após captação.',
    period: 'Período selecionado',
    source: 'leads_v2',
  },
  taxa_entrada_30d: {
    title: 'Taxa de Entrada (30d)',
    definition: 'Percentual de leads que entram efetivamente no funil de vendas após serem captados.',
    formula: '(Entradas ÷ Total de Leads) × 100',
    period: 'Período selecionado',
    source: 'leads_v2',
  },
  meetings_booked_30d: {
    title: 'Reuniões Agendadas (30d)',
    definition: 'Total de reuniões marcadas no período, vindas das campanhas de tráfego.',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  meetings_done_30d: {
    title: 'Reuniões Realizadas (30d)',
    definition: 'Reuniões que efetivamente aconteceram no período. Leads compareceram no horário agendado. Se zerado, pode indicar falta de marcação no sistema de origem.',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  cp_meeting_booked_30d: {
    title: 'Custo por Reunião Agendada (30d)',
    definition: 'Quanto custa, em média, para conseguir agendar uma reunião através das campanhas de tráfego.',
    formula: 'Investimento ÷ Reuniões Agendadas',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },

  // ===== TRÁFEGO 7D =====
  spend_total_7d: {
    title: 'Investimento (7d)',
    definition: 'Total investido em anúncios nos últimos 7 dias. Útil para análise de curto prazo.',
    formula: 'Σ custo_total (7 dias)',
    period: 'Últimos 7 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },
  leads_7d: {
    title: 'Leads (7d)',
    definition: 'Número de leads gerados nos últimos 7 dias através das campanhas ativas.',
    period: 'Últimos 7 dias',
    source: 'leads_v2',
  },
  entradas_7d: {
    title: 'Entradas (7d)',
    definition: 'Leads que entraram no funil de vendas nos últimos 7 dias.',
    period: 'Últimos 7 dias',
    source: 'leads_v2',
  },
  taxa_entrada_7d: {
    title: 'Taxa de Entrada (7d)',
    definition: 'Percentual de leads que entraram no funil na última semana.',
    formula: '(Entradas ÷ Leads) × 100',
    period: 'Últimos 7 dias',
    source: 'leads_v2',
  },
  cpl_7d: {
    title: 'CPL (7d)',
    definition: 'Custo por Lead médio nos últimos 7 dias.',
    formula: 'Investimento ÷ Leads',
    period: 'Últimos 7 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },
  meetings_booked_7d: {
    title: 'Reuniões Agendadas (7d)',
    definition: 'Total de reuniões marcadas nos últimos 7 dias.',
    period: 'Últimos 7 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },
  meetings_done_7d: {
    title: 'Reuniões Realizadas (7d)',
    definition: 'Total de reuniões que efetivamente aconteceram na última semana.',
    period: 'Últimos 7 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },
  cp_meeting_booked_7d: {
    title: 'Custo/Reunião (7d)',
    definition: 'Custo médio para agendar uma reunião na última semana.',
    formula: 'Investimento ÷ Reuniões Agendadas',
    period: 'Últimos 7 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },

  // ===== CONVERSAS =====
  leads_total_30d: {
    title: 'Leads Ativos (30d)',
    definition: 'Total de leads com alguma atividade ou interação nos últimos 30 dias.',
    period: 'Últimos 30 dias',
    source: 'vw_dashboard_kpis_30d_v3',
  },
  meetings_total_30d: {
    title: 'Total de Reuniões (30d)',
    definition: 'Soma de todas as reuniões (agendadas, realizadas e canceladas) dos últimos 30 dias.',
    period: 'Últimos 30 dias',
    source: 'vw_dashboard_kpis_30d_v3',
  },
  conv_lead_to_msg_30d: {
    title: 'Mensagens por Lead (30d)',
    definition: 'Proporção de mensagens recebidas por lead. Valores acima de 100% indicam múltiplas mensagens por lead.',
    formula: '(Total de Mensagens ÷ Total de Leads) × 100',
    period: 'Últimos 30 dias',
    source: 'vw_dashboard_kpis_30d_v3',
  },
  conv_msg_to_meeting_30d: {
    title: 'Conversão Mensagem → Reunião (30d)',
    definition: 'Percentual de leads que enviaram mensagem e posteriormente agendaram reunião. Mede eficácia do atendimento.',
    formula: '(Reuniões ÷ Leads com Mensagem) × 100',
    period: 'Últimos 30 dias',
    source: 'vw_dashboard_kpis_30d_v3',
  },

  // ===== LIGAÇÕES =====
  calls_done: {
    title: 'Ligações Realizadas',
    definition: 'Total de chamadas telefônicas iniciadas pelo sistema de IA no período selecionado.',
    period: 'Período selecionado',
    source: 'v3_calls_daily_v3',
  },
  calls_answered: {
    title: 'Ligações Atendidas',
    definition: 'Número de chamadas que foram efetivamente atendidas pelo destinatário.',
    period: 'Período selecionado',
    source: 'v3_calls_daily_v3',
  },
  taxa_atendimento: {
    title: 'Taxa de Atendimento',
    definition: 'Percentual de ligações que foram atendidas sobre o total de ligações realizadas.',
    formula: '(Ligações Atendidas ÷ Ligações Realizadas) × 100',
    period: 'Período selecionado',
    source: 'v3_calls_daily_v3',
  },
  avg_minutes: {
    title: 'Tempo Médio (min)',
    definition: 'Duração média das ligações atendidas em minutos. Indica profundidade das conversas.',
    formula: 'Tempo Total ÷ Ligações Atendidas',
    period: 'Período selecionado',
    source: 'v3_calls_daily_v3',
  },
  total_minutes: {
    title: 'Tempo Total (min)',
    definition: 'Somatório do tempo de todas as ligações atendidas no período.',
    formula: 'Σ duração_ligacao (período)',
    period: 'Período selecionado',
    source: 'v3_calls_daily_v3',
  },
  total_spent: {
    title: 'Custo Total',
    definition: 'Custo total das ligações convertido de USD para BRL. Considera taxa de câmbio atual.',
    formula: 'Custo USD × Taxa de Câmbio',
    period: 'Período selecionado',
    source: 'v3_calls_daily_v3',
  },
  cost_per_call: {
    title: 'Custo por Ligação',
    definition: 'Custo médio de cada ligação realizada, já convertido para Real.',
    formula: 'Custo Total ÷ Ligações Realizadas',
    period: 'Período selecionado',
    source: 'v3_calls_daily_v3',
  },

  // ===== ADMIN =====
  mapping_coverage: {
    title: 'Cobertura de Mapeamento',
    definition: 'Percentual de campos/dados que estão corretamente mapeados no sistema.',
    formula: '(Campos Mapeados ÷ Total de Campos) × 100',
    period: 'Tempo real',
    source: 'vw_funnel_mapping_coverage',
  },
  total_mapped: {
    title: 'Total Mapeados',
    definition: 'Quantidade de registros ou campos que possuem mapeamento definido no sistema.',
    period: 'Tempo real',
    source: 'vw_funnel_mapping_coverage',
  },
  total_unmapped: {
    title: 'Candidatos Não Mapeados',
    definition: 'Registros identificados que ainda não possuem mapeamento. Requer atenção para configuração.',
    period: 'Tempo real',
    source: 'vw_funnel_unmapped_candidates',
  },

  // ===== EXECUTIVO LEGACY =====
  exec_meetings_done: {
    title: 'Reuniões Realizadas',
    definition: 'Total de reuniões que foram efetivamente realizadas no período selecionado.',
    period: 'Período selecionado',
    source: 'vw_afonsina_custos_funil_dia',
  },
  exec_cpl_30d: {
    title: 'CPL (30d)',
    definition: 'Custo por Lead médio nos últimos 30 dias.',
    formula: 'Investimento ÷ Leads',
    period: 'Últimos 30 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },
  exec_conv_lead_to_meeting_30d: {
    title: 'Conversão Lead → Reunião (30d)',
    definition: 'Percentual de leads que agendaram reunião nos últimos 30 dias.',
    formula: '(Reuniões Agendadas ÷ Leads) × 100',
    period: 'Últimos 30 dias',
    source: 'vw_afonsina_custos_funil_dia',
  },
};