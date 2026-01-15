// Edge function for generating AI insights with detailed analysis
// Version 2.0 - Enhanced prompts with market benchmarks
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.68.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { org_id, scope, metrics } = await req.json();

    if (!org_id) {
      return new Response(
        JSON.stringify({ error: "org_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current metrics data if not provided
    let metricsData = metrics;
    
    if (!metricsData) {
      // Fetch from views based on scope
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: dailyData } = await supabase
        .from("vw_afonsina_custos_funil_dia")
        .select("*")
        .gte("dia", thirtyDaysAgo.toISOString().split("T")[0])
        .order("dia", { ascending: true });

      metricsData = dailyData || [];
    }

    // Calculate aggregated metrics
    const totalInvestimento = metricsData.reduce((sum: number, d: any) => sum + (d.custo_total || 0), 0);
    const totalLeads = metricsData.reduce((sum: number, d: any) => sum + (d.leads_total || 0), 0);
    const totalEntradas = metricsData.reduce((sum: number, d: any) => sum + (d.entrada_total || 0), 0);
    const totalReunioes = metricsData.reduce((sum: number, d: any) => sum + (d.reuniao_agendada_total || 0), 0);
    const totalRealizadas = metricsData.reduce((sum: number, d: any) => sum + (d.reuniao_realizada_total || 0), 0);
    
    const cpl = totalLeads > 0 ? totalInvestimento / totalLeads : 0;
    const taxaConversao = totalLeads > 0 ? (totalReunioes / totalLeads) * 100 : 0;
    const taxaRealizacao = totalReunioes > 0 ? (totalRealizadas / totalReunioes) * 100 : 0;
    const taxaEntrada = totalLeads > 0 ? (totalEntradas / totalLeads) * 100 : 0;

    // Calculate week-over-week comparison
    const midPoint = Math.floor(metricsData.length / 2);
    const firstHalf = metricsData.slice(0, midPoint);
    const secondHalf = metricsData.slice(midPoint);
    
    const firstHalfLeads = firstHalf.reduce((sum: number, d: any) => sum + (d.leads_total || 0), 0);
    const secondHalfLeads = secondHalf.reduce((sum: number, d: any) => sum + (d.leads_total || 0), 0);
    const leadsTrend = firstHalfLeads > 0 ? ((secondHalfLeads - firstHalfLeads) / firstHalfLeads) * 100 : 0;

    const firstHalfCost = firstHalf.reduce((sum: number, d: any) => sum + (d.custo_total || 0), 0);
    const secondHalfCost = secondHalf.reduce((sum: number, d: any) => sum + (d.custo_total || 0), 0);
    const costTrend = firstHalfCost > 0 ? ((secondHalfCost - firstHalfCost) / firstHalfCost) * 100 : 0;

    // Build the analysis prompt
    const systemPrompt = `Você é um consultor estratégico sênior de marketing digital especializado em tráfego pago e funil de vendas para o mercado imobiliário brasileiro. 

Você deve analisar os dados fornecidos e gerar insights MUITO DETALHADOS, ESPECÍFICOS E ACIONÁVEIS.

## REGRAS IMPORTANTES:
1. Cada insight deve ter um TÍTULO CLARO e DESCRITIVO (não genérico como "Insight 1")
2. A descrição deve ser EXPLICATIVA com contexto de mercado e números específicos
3. Use linguagem direta e profissional, evite jargões técnicos desnecessários
4. Compare SEMPRE com benchmarks do mercado imobiliário
5. Forneça AÇÕES CONCRETAS que o usuário pode executar

## FORMATO DE RESPOSTA (JSON):
{
  "summary": "Resumo executivo em 3-4 frases destacando os pontos mais críticos",
  "alerts": [
    {
      "type": "warning" | "danger" | "success",
      "title": "Título descritivo do alerta (ex: 'CPL acima do benchmark de mercado')",
      "description": "Explicação detalhada do problema ou situação com números concretos",
      "metric_value": "R$ XX,XX ou XX%",
      "benchmark": "Referência de mercado para comparação",
      "action": "Ação específica e imediata recomendada"
    }
  ],
  "insights": [
    {
      "title": "Título descritivo do insight (ex: 'Taxa de conversão acima da média do setor')",
      "description": "Análise detalhada explicando o contexto, causas prováveis e significado para o negócio",
      "current_value": "Valor atual da métrica",
      "comparison": "Comparação com período anterior ou benchmark do mercado",
      "impact": "Impacto estimado no negócio em termos de receita ou economia",
      "recommendation": "Recomendação específica baseada neste insight"
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": "Título da ação recomendada (ex: 'Otimizar segmentação de público para reduzir CPL')",
      "description": "Descrição detalhada do que fazer e por que",
      "expected_impact": "Estimativa de melhoria esperada com números (ex: 'Redução de 15-20% no CPL')",
      "effort": "Baixo" | "Médio" | "Alto",
      "steps": ["Passo 1 detalhado", "Passo 2 detalhado", "Passo 3 detalhado"]
    }
  ],
  "anomalies": [
    {
      "title": "Descrição da anomalia detectada",
      "description": "Detalhes sobre o que foi identificado como fora do padrão",
      "possible_causes": ["Causa provável 1", "Causa provável 2"],
      "investigation_steps": ["Como investigar 1", "Como investigar 2"]
    }
  ]
}

## BENCHMARKS DE REFERÊNCIA (Mercado imobiliário brasileiro):
- CPL excelente: < R$ 15
- CPL bom: R$ 15-30
- CPL aceitável: R$ 30-50
- CPL alto/preocupante: R$ 50-80
- CPL crítico: > R$ 80
- Taxa de entrada no funil: 40-60% é considerado bom
- Taxa de agendamento (Lead → Reunião): 10-20% é bom, >25% é excelente
- Taxa de realização de reuniões: 60-80% é bom, >80% é excelente
- Custo por reunião realizada: R$ 150-300 é aceitável

## EXEMPLOS DE BONS TÍTULOS DE INSIGHTS:
- "Taxa de conversão de 46% supera benchmark em 130%"
- "CPL de R$ 25 está 20% abaixo da média do setor"
- "Queda de 15% no volume de leads na última quinzena"
- "Taxa de comparecimento abaixo do esperado impacta ROI"

IMPORTANTE: Seja específico, use números reais dos dados fornecidos, e sempre contextualize com o mercado imobiliário brasileiro.`;

    const userPrompt = `Analise os seguintes dados dos últimos 30 dias:

MÉTRICAS AGREGADAS:
- Investimento Total: R$ ${totalInvestimento.toFixed(2)}
- Total de Leads: ${totalLeads}
- Total de Entradas: ${totalEntradas}
- Reuniões Agendadas: ${totalReunioes}
- Reuniões Realizadas: ${totalRealizadas}

INDICADORES CALCULADOS:
- CPL (Custo por Lead): R$ ${cpl.toFixed(2)}
- Taxa de Entrada: ${taxaEntrada.toFixed(1)}%
- Taxa de Conversão (Lead → Reunião): ${taxaConversao.toFixed(1)}%
- Taxa de Realização: ${taxaRealizacao.toFixed(1)}%

TENDÊNCIAS (comparando primeira e segunda metade do período):
- Variação de Leads: ${leadsTrend > 0 ? "+" : ""}${leadsTrend.toFixed(1)}%
- Variação de Investimento: ${costTrend > 0 ? "+" : ""}${costTrend.toFixed(1)}%

ESCOPO DA ANÁLISE: ${scope || "geral"}

Gere uma análise detalhada com insights acionáveis, considerando benchmarks de mercado e tendências.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("Resposta vazia da OpenAI");
    }

    const parsedResponse = JSON.parse(aiResponse);

    // Save insights to database
    const { error: insertError } = await supabase.from("ai_insights").insert({
      org_id,
      scope: scope || "executivo",
      payload: parsedResponse,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error saving insights:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights: parsedResponse,
        metrics_summary: {
          investimento: totalInvestimento,
          leads: totalLeads,
          cpl,
          taxa_conversao: taxaConversao,
          taxa_realizacao: taxaRealizacao,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating insights:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro ao gerar insights";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
