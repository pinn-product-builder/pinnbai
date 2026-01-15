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
    const systemPrompt = `Você é um analista de marketing digital sênior especializado em tráfego pago e funil de vendas. 
Analise os dados fornecidos e gere insights DETALHADOS e ACIONÁVEIS.

FORMATO DE RESPOSTA (JSON):
{
  "alerts": [
    {
      "type": "warning" | "danger" | "success",
      "title": "Título curto do alerta",
      "description": "Descrição detalhada com números específicos",
      "metric_value": "valor da métrica",
      "benchmark": "referência de mercado",
      "action": "Ação específica recomendada"
    }
  ],
  "insights": [
    {
      "title": "Título do insight",
      "description": "Análise detalhada com contexto de mercado",
      "current_value": "valor atual",
      "comparison": "comparação com período anterior ou benchmark",
      "impact": "impacto estimado no negócio",
      "recommendation": "recomendação específica"
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": "Título da recomendação",
      "description": "Descrição detalhada",
      "expected_impact": "Impacto esperado com números",
      "effort": "Baixo" | "Médio" | "Alto",
      "steps": ["Passo 1", "Passo 2", "Passo 3"]
    }
  ],
  "anomalies": [
    {
      "title": "Anomalia detectada",
      "description": "Descrição com dados específicos",
      "possible_causes": ["Causa 1", "Causa 2"],
      "investigation_steps": ["Passo 1", "Passo 2"]
    }
  ],
  "summary": "Resumo executivo em 2-3 frases"
}

BENCHMARKS DE REFERÊNCIA (Mercado imobiliário/serviços):
- CPL bom: R$ 15-30
- CPL aceitável: R$ 30-50
- CPL alto: > R$ 50
- Taxa de entrada: 40-60% é bom
- Taxa de agendamento: 10-20% é bom
- Taxa de realização de reuniões: 60-80% é bom

Seja específico com números, porcentagens e valores monetários. 
Sempre compare com benchmarks de mercado.
Sugira ações concretas e mensuráveis.`;

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
