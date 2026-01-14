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
  // ===== EXECUTIVO =====
  leads_total: {
    title: 'Total de Leads',
    definition: 'Quantidade total de leads cadastrados no sistema. Representa todos os contatos captados através das campanhas de marketing.',
  },
  msg_in_30d: {
    title: 'Mensagens Recebidas (30d)',
    definition: 'Total de mensagens recebidas de leads nos últimos 30 dias via WhatsApp ou outros canais de comunicação.',
  },
  meetings_scheduled_30d: {
    title: 'Reuniões Agendadas (30d)',
    definition: 'Número de reuniões que foram marcadas no calendário nos últimos 30 dias, independentemente se já aconteceram ou não.',
  },
  meetings_done: {
    title: 'Reuniões Realizadas',
    definition: 'Total de reuniões que efetivamente aconteceram. Apenas reuniões onde o lead compareceu são contabilizadas.',
  },
  meetings_cancelled_30d: {
    title: 'Reuniões Canceladas (30d)',
    definition: 'Número de reuniões que foram canceladas nos últimos 30 dias. Inclui cancelamentos pelo lead ou pela empresa.',
  },
  spend_30d: {
    title: 'Investimento (30d)',
    definition: 'Valor total investido em anúncios pagos (Meta Ads, Google Ads, etc.) nos últimos 30 dias.',
    formula: 'Σ custo_anuncios (30 dias)',
  },
  cpl_30d: {
    title: 'CPL - Custo por Lead (30d)',
    definition: 'Custo médio para adquirir cada lead. Quanto menor, mais eficiente é a campanha de aquisição.',
    formula: 'Investimento Total ÷ Número de Leads',
  },
  cpm_meeting_30d: {
    title: 'Custo por Reunião (30d)',
    definition: 'Custo médio para conseguir agendar uma reunião. Indica a eficiência do funil de conversão.',
    formula: 'Investimento Total ÷ Reuniões Agendadas',
  },
  conv_lead_to_meeting_30d: {
    title: 'Conversão Lead → Reunião (30d)',
    definition: 'Percentual de leads que agendaram pelo menos uma reunião. Mede a qualidade dos leads e eficácia do follow-up.',
    formula: '(Reuniões Agendadas ÷ Total de Leads) × 100',
  },

  // ===== TRÁFEGO =====
  spend_total_30d: {
    title: 'Investimento Total (30d)',
    definition: 'Soma de todos os valores investidos em campanhas de tráfego pago nos últimos 30 dias.',
    formula: 'Σ custo_diario (30 dias)',
  },
  leads_30d: {
    title: 'Leads Captados (30d)',
    definition: 'Número de novos leads gerados através das campanhas de anúncios nos últimos 30 dias.',
  },
  entradas_30d: {
    title: 'Entradas no Funil (30d)',
    definition: 'Leads que avançaram para a primeira etapa do funil de vendas. Indica engajamento inicial após captação.',
  },
  taxa_entrada_30d: {
    title: 'Taxa de Entrada (30d)',
    definition: 'Percentual de leads que entram efetivamente no funil de vendas após serem captados.',
    formula: '(Entradas ÷ Total de Leads) × 100',
  },
  meetings_booked_30d: {
    title: 'Reuniões Agendadas (30d)',
    definition: 'Total de reuniões marcadas no período, vindas das campanhas de tráfego.',
  },
  meetings_done_30d: {
    title: 'Reuniões Realizadas (30d)',
    definition: 'Reuniões que efetivamente aconteceram nos últimos 30 dias. Leads compareceram no horário agendado.',
  },
  cp_meeting_booked_30d: {
    title: 'Custo por Reunião Agendada (30d)',
    definition: 'Quanto custa, em média, para conseguir agendar uma reunião através das campanhas de tráfego.',
    formula: 'Investimento ÷ Reuniões Agendadas',
  },

  // ===== TRÁFEGO 7D =====
  spend_total_7d: {
    title: 'Investimento (7d)',
    definition: 'Total investido em anúncios nos últimos 7 dias. Útil para análise de curto prazo.',
    formula: 'Σ custo_total (7 dias)',
  },
  leads_7d: {
    title: 'Leads (7d)',
    definition: 'Número de leads gerados nos últimos 7 dias através das campanhas ativas.',
  },
  entradas_7d: {
    title: 'Entradas (7d)',
    definition: 'Leads que entraram no funil de vendas nos últimos 7 dias.',
  },
  taxa_entrada_7d: {
    title: 'Taxa de Entrada (7d)',
    definition: 'Percentual de leads que entraram no funil na última semana.',
    formula: '(Entradas ÷ Leads) × 100',
  },
  cpl_7d: {
    title: 'CPL (7d)',
    definition: 'Custo por Lead médio nos últimos 7 dias.',
    formula: 'Investimento ÷ Leads',
  },
  meetings_booked_7d: {
    title: 'Reuniões Agendadas (7d)',
    definition: 'Total de reuniões marcadas nos últimos 7 dias.',
  },
  meetings_done_7d: {
    title: 'Reuniões Realizadas (7d)',
    definition: 'Total de reuniões que efetivamente aconteceram na última semana.',
  },
  cp_meeting_booked_7d: {
    title: 'Custo/Reunião (7d)',
    definition: 'Custo médio para agendar uma reunião na última semana.',
    formula: 'Investimento ÷ Reuniões Agendadas',
  },

  // ===== CONVERSAS =====
  leads_total_30d: {
    title: 'Leads Ativos (30d)',
    definition: 'Total de leads com alguma atividade ou interação nos últimos 30 dias.',
  },
  meetings_total_30d: {
    title: 'Total de Reuniões (30d)',
    definition: 'Soma de todas as reuniões (agendadas, realizadas e canceladas) dos últimos 30 dias.',
  },
  conv_lead_to_msg_30d: {
    title: 'Mensagens por Lead (30d)',
    definition: 'Proporção de mensagens recebidas por lead. Valores acima de 100% indicam múltiplas mensagens por lead.',
    formula: '(Total de Mensagens ÷ Total de Leads) × 100',
  },
  conv_msg_to_meeting_30d: {
    title: 'Conversão Mensagem → Reunião (30d)',
    definition: 'Percentual de leads que enviaram mensagem e posteriormente agendaram reunião. Mede eficácia do atendimento.',
    formula: '(Reuniões ÷ Leads com Mensagem) × 100',
  },

  // ===== VAPI - LIGAÇÕES =====
  calls_done: {
    title: 'Ligações Realizadas',
    definition: 'Total de chamadas telefônicas iniciadas pelo sistema de IA no período selecionado.',
  },
  calls_answered: {
    title: 'Ligações Atendidas',
    definition: 'Número de chamadas que foram efetivamente atendidas pelo destinatário.',
  },
  taxa_atendimento: {
    title: 'Taxa de Atendimento',
    definition: 'Percentual de ligações que foram atendidas sobre o total de ligações realizadas.',
    formula: '(Ligações Atendidas ÷ Ligações Realizadas) × 100',
  },
  avg_minutes: {
    title: 'Tempo Médio (min)',
    definition: 'Duração média das ligações atendidas em minutos. Indica profundidade das conversas.',
    formula: 'Tempo Total ÷ Ligações Atendidas',
  },
  total_minutes: {
    title: 'Tempo Total (min)',
    definition: 'Somatório do tempo de todas as ligações atendidas no período.',
    formula: 'Σ duração_ligacao (período)',
  },
  total_spent: {
    title: 'Custo Total',
    definition: 'Custo total das ligações convertido de USD para BRL. Considera taxa de câmbio atual.',
    formula: 'Custo USD × Taxa de Câmbio',
  },
  cost_per_call: {
    title: 'Custo por Ligação',
    definition: 'Custo médio de cada ligação realizada, já convertido para Real.',
    formula: 'Custo Total ÷ Ligações Realizadas',
  },

  // ===== ADMIN =====
  mapping_coverage: {
    title: 'Cobertura de Mapeamento',
    definition: 'Percentual de campos/dados que estão corretamente mapeados no sistema.',
    formula: '(Campos Mapeados ÷ Total de Campos) × 100',
  },
  total_mapped: {
    title: 'Total Mapeados',
    definition: 'Quantidade de registros ou campos que possuem mapeamento definido no sistema.',
  },
  total_unmapped: {
    title: 'Candidatos Não Mapeados',
    definition: 'Registros identificados que ainda não possuem mapeamento. Requer atenção para configuração.',
  },

  // ===== EXECUTIVO LEGACY =====
  exec_meetings_done: {
    title: 'Reuniões Realizadas',
    definition: 'Total de reuniões que foram efetivamente realizadas no período selecionado.',
  },
  exec_cpl_30d: {
    title: 'CPL (30d)',
    definition: 'Custo por Lead médio nos últimos 30 dias.',
    formula: 'Investimento ÷ Leads',
  },
  exec_conv_lead_to_meeting_30d: {
    title: 'Conversão Lead → Reunião (30d)',
    definition: 'Percentual de leads que agendaram reunião nos últimos 30 dias.',
    formula: '(Reuniões Agendadas ÷ Leads) × 100',
  },
};
