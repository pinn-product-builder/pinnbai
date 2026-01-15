// Edge function v4.0 - FIXED: Force title/description format
// Build: 2026-01-15T11:31:00Z - Strict JSON validation
// CRITICAL: Always use title+description, never text field
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.68.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
    const { org_id, scope, metrics } = await req.json();

    console.log("Generate insights called with org_id:", org_id, "scope:", scope);

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
      
      const { data: dailyData, error: fetchError } = await supabase
        .from("vw_afonsina_custos_funil_dia")
        .select("*")
        .gte("dia", thirtyDaysAgo.toISOString().split("T")[0])
        .order("dia", { ascending: true });

      if (fetchError) {
        console.error("Error fetching metrics:", fetchError);
      }

      metricsData = dailyData || [];
    }

    console.log("Metrics data points:", metricsData.length);

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
    const custoReuniao = totalRealizadas > 0 ? totalInvestimento / totalRealizadas : 0;

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

    console.log("Calculated metrics - CPL:", cpl.toFixed(2), "Taxa Conversão:", taxaConversao.toFixed(1));

    // Build the analysis prompt with explicit JSON structure
    const systemPrompt = `Você é um consultor estratégico sênior de marketing digital especializado em tráfego pago e funil de vendas para o mercado imobiliário brasileiro.

VOCÊ DEVE RETORNAR UM JSON VÁLIDO COM A ESTRUTURA EXATA ABAIXO. NÃO USE FORMATO ANTIGO.

## REGRAS CRÍTICAS:
1. Cada item DEVE ter campos "title" e "description" - NUNCA use apenas "text"
2. Os títulos devem ser DESCRITIVOS e ESPECÍFICOS com números (não "Insight 1" ou "Recomendação 1")
3. Use comparações com benchmarks do mercado imobiliário brasileiro
4. Forneça ações concretas e acionáveis

## ESTRUTURA JSON OBRIGATÓRIA:
{
  "summary": "Resumo executivo de 2-3 frases com os pontos principais",
  "alerts": [
    {
      "type": "warning",
      "title": "CPL de R$ X está Y% acima do benchmark",
      "description": "Explicação detalhada...",
      "metric_value": "R$ X",
      "benchmark": "R$ 15-30",
      "action": "Ação específica recomendada"
    }
  ],
  "insights": [
    {
      "title": "Taxa de conversão de X% supera média do mercado em Y%",
      "description": "Análise completa com contexto de mercado...",
      "current_value": "X%",
      "comparison": "Média do mercado: Y%",
      "impact": "Impacto estimado no negócio",
      "recommendation": "Sugestão baseada neste insight"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "title": "Otimizar campanhas para reduzir CPL em 20%",
      "description": "Descrição detalhada da ação...",
      "expected_impact": "Economia estimada de R$ X/mês",
      "effort": "Médio",
      "steps": ["Passo 1", "Passo 2", "Passo 3"]
    }
  ],
  "anomalies": []
}

## BENCHMARKS DO MERCADO IMOBILIÁRIO BRASILEIRO:
- CPL excelente: < R$ 15 | bom: R$ 15-30 | aceitável: R$ 30-50 | alto: R$ 50-80 | crítico: > R$ 80
- Taxa de entrada no funil: bom 40-60%
- Taxa de agendamento (Lead → Reunião): bom 10-20%, excelente >25%
- Taxa de realização de reuniões: bom 60-80%, excelente >80%
- Custo por reunião realizada: aceitável R$ 150-300

## EXEMPLOS DE TÍTULOS CORRETOS:
- "Taxa de conversão de 46% está 130% acima do benchmark de 20%"
- "CPL de R$ 25,80 dentro da faixa ideal de R$ 15-30"
- "Volume de leads caiu 15% na segunda quinzena"
- "Taxa de comparecimento de 65% precisa melhorar para atingir 80%"

IMPORTANTE: NUNCA retorne {"text": "..."} - SEMPRE use {"title": "...", "description": "..."}`;

    const userPrompt = `Analise estes dados dos últimos 30 dias e gere insights detalhados:

📊 MÉTRICAS AGREGADAS:
- Investimento Total: R$ ${totalInvestimento.toFixed(2)}
- Total de Leads: ${totalLeads}
- Total de Entradas: ${totalEntradas}
- Reuniões Agendadas: ${totalReunioes}
- Reuniões Realizadas: ${totalRealizadas}

📈 INDICADORES CALCULADOS:
- CPL (Custo por Lead): R$ ${cpl.toFixed(2)}
- Taxa de Entrada: ${taxaEntrada.toFixed(1)}%
- Taxa de Conversão (Lead → Reunião): ${taxaConversao.toFixed(1)}%
- Taxa de Realização: ${taxaRealizacao.toFixed(1)}%
- Custo por Reunião Realizada: R$ ${custoReuniao.toFixed(2)}

📉 TENDÊNCIAS (primeira vs segunda metade do período):
- Variação de Leads: ${leadsTrend > 0 ? "+" : ""}${leadsTrend.toFixed(1)}%
- Variação de Investimento: ${costTrend > 0 ? "+" : ""}${costTrend.toFixed(1)}%

Escopo: ${scope || "executivo"}

Gere 2-3 insights detalhados, 1-2 recomendações prioritárias, e alertas se houver métricas fora do benchmark.
LEMBRE-SE: Use SEMPRE o formato com "title" e "description", NUNCA apenas "text".`;

    console.log("Calling OpenAI API...");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_completion_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    console.log("OpenAI response received:", aiResponse?.substring(0, 200));

    if (!aiResponse) {
      throw new Error("Resposta vazia da OpenAI");
    }

    const parsedResponse = JSON.parse(aiResponse);

    // Validate the response has the correct structure
    if (parsedResponse.insights) {
      parsedResponse.insights = parsedResponse.insights.map((item: any, idx: number) => {
        if (!item.title || item.title.startsWith("Insight ")) {
          return {
            ...item,
            title: item.title || `Insight sobre ${item.current_value || 'métricas'}`,
            description: item.description || item.text || ''
          };
        }
        return item;
      });
    }

    console.log("Saving insights to database...");

    // Save insights to database
    const { error: insertError } = await supabase.from("ai_insights").insert({
      org_id,
      scope: scope || "executivo",
      payload: parsedResponse,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error saving insights:", insertError);
    } else {
      console.log("Insights saved successfully");
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
          custo_reuniao: custoReuniao,
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
