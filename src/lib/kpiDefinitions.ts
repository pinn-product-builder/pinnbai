/**
 * Definições locais de KPIs para fallback
 * Usado quando o dicionário do banco não está disponível
 */

export interface KpiDefinition {
  title: string;
  definition: string;
  formula?: string;
}

export const LOCAL_KPI_DEFINITIONS: Record<string, KpiDefinition> = {
  // ===== TRÁFEGO 7D =====
  spend_total_7d: {
    title: 'Investimento (7d)',
    definition: 'Total investido em anúncios nos últimos 7 dias.',
    formula: 'Σ custo_total (7 dias)',
  },
  leads_7d: {
    title: 'Leads (7d)',
    definition: 'Número de leads gerados nos últimos 7 dias.',
  },
  entradas_7d: {
    title: 'Entradas (7d)',
    definition: 'Leads que entraram no funil de vendas nos últimos 7 dias.',
  },
  taxa_entrada_7d: {
    title: 'Taxa de Entrada (7d)',
    definition: 'Percentual de leads que entraram no funil.',
    formula: '(entradas / leads) × 100',
  },
  cpl_7d: {
    title: 'CPL (7d)',
    definition: 'Custo por Lead médio nos últimos 7 dias.',
    formula: 'investimento / leads',
  },
  meetings_booked_7d: {
    title: 'Reuniões Agendadas (7d)',
    definition: 'Total de reuniões marcadas nos últimos 7 dias.',
  },
  meetings_done_7d: {
    title: 'Reuniões Realizadas (7d)',
    definition: 'Total de reuniões que efetivamente aconteceram.',
  },
  cp_meeting_booked_7d: {
    title: 'Custo/Reunião (7d)',
    definition: 'Custo médio para agendar uma reunião.',
    formula: 'investimento / reuniões_agendadas',
  },

  // ===== TRÁFEGO 30D =====
  spend_total_30d: {
    title: 'Investimento (30d)',
    definition: 'Total investido em anúncios nos últimos 30 dias.',
    formula: 'Σ custo_total (30 dias)',
  },
  leads_30d: {
    title: 'Leads (30d)',
    definition: 'Número de leads gerados nos últimos 30 dias.',
  },
  entradas_30d: {
    title: 'Entradas (30d)',
    definition: 'Leads que entraram no funil de vendas nos últimos 30 dias.',
  },
  taxa_entrada_30d: {
    title: 'Taxa de Entrada (30d)',
    definition: 'Percentual de leads que entraram no funil.',
    formula: '(entradas / leads) × 100',
  },
  cpl_30d: {
    title: 'CPL (30d)',
    definition: 'Custo por Lead médio nos últimos 30 dias.',
    formula: 'investimento / leads',
  },
  meetings_booked_30d: {
    title: 'Reuniões Agendadas (30d)',
    definition: 'Total de reuniões marcadas nos últimos 30 dias.',
  },
  meetings_done_30d: {
    title: 'Reuniões Realizadas (30d)',
    definition: 'Total de reuniões que efetivamente aconteceram.',
  },
  cp_meeting_booked_30d: {
    title: 'Custo/Reunião (30d)',
    definition: 'Custo médio para agendar uma reunião.',
    formula: 'investimento / reuniões_agendadas',
  },

  // ===== CONVERSAS =====
  msg_in_7d: {
    title: 'Mensagens Recebidas (7d)',
    definition: 'Total de mensagens recebidas nos últimos 7 dias.',
  },
  msg_in_30d: {
    title: 'Mensagens Recebidas (30d)',
    definition: 'Total de mensagens recebidas nos últimos 30 dias.',
  },
  conv_lead_to_msg_30d: {
    title: 'Mensagens por Lead (30d)',
    definition: 'Média de mensagens recebidas por lead nos últimos 30 dias. Valores acima de 100% indicam que, em média, cada lead enviou mais de uma mensagem.',
    formula: '(total_mensagens / total_leads) × 100',
  },
  conv_lead_to_meeting_30d: {
    title: 'Conv. Lead → Reunião (30d)',
    definition: 'Percentual de leads que agendaram pelo menos uma reunião nos últimos 30 dias.',
    formula: '(leads_com_reunião / total_leads) × 100',
  },
  conv_msg_to_meeting_30d: {
    title: 'Conv. Mensagem → Reunião (30d)',
    definition: 'Percentual de leads que enviaram mensagem e posteriormente agendaram reunião.',
    formula: '(reuniões_agendadas / leads_com_mensagem) × 100',
  },

  // ===== EXECUTIVO =====
  spend_30d: {
    title: 'Investimento Total',
    definition: 'Total investido em mídia paga no período.',
  },
  leads_total_30d: {
    title: 'Total de Leads',
    definition: 'Quantidade total de leads captados no período.',
  },
  meetings_scheduled_30d: {
    title: 'Reuniões Agendadas',
    definition: 'Total de reuniões marcadas no período.',
  },
  meetings_cancelled_30d: {
    title: 'Reuniões Canceladas',
    definition: 'Total de reuniões canceladas no período.',
  },
  exec_meetings_done: {
    title: 'Reuniões Realizadas',
    definition: 'Total de reuniões que foram efetivamente realizadas.',
  },
  exec_cpl_30d: {
    title: 'CPL (30d)',
    definition: 'Custo por Lead médio nos últimos 30 dias.',
    formula: 'investimento / leads',
  },
  cpm_meeting_30d: {
    title: 'Custo por Reunião (30d)',
    definition: 'Custo médio para agendar uma reunião nos últimos 30 dias.',
    formula: 'investimento / reuniões_agendadas',
  },
  exec_conv_lead_to_meeting_30d: {
    title: 'Conversão Lead → Reunião (30d)',
    definition: 'Percentual de leads que agendaram reunião nos últimos 30 dias.',
    formula: '(reuniões_agendadas / leads) × 100',
  },
};
