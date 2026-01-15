// DEPLOY v6.0 - 2026-01-15T11:50:00Z - COMPLETE REBUILD
// CRITICAL: Using title+description format, NOT text format
// This version includes enhanced logging for debugging
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_VERSION = "6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DailyData {
  day: string;
  leads_new?: number;
  msg_in?: number;
  meetings_scheduled?: number;
  spend?: number;
}

interface FunnelData {
  stage_name: string;
  leads_total: number;
  stage_rank: number;
}

interface InsightItem {
  title: string;
  description: string;
}

interface AlertItem {
  title: string;
  description: string;
  severity: string;
}

interface InsightResult {
  insights: InsightItem[];
  alerts: AlertItem[];
  recommendations: InsightItem[];
}

async function generateInsightsWithAI(
  kpis: any,
  dailyData: DailyData[],
  funnelData: FunnelData[]
): Promise<InsightResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured, using fallback");
    return generateFallbackInsights(kpis, dailyData, funnelData);
  }

  // Build context for AI
  const kpisContext = kpis ? `
KPIs dos últimos 30 dias:
- Leads totais: ${kpis.leads_total_30d || 0}
- Mensagens recebidas: ${kpis.msg_in_30d || 0}
- Reuniões agendadas: ${kpis.meetings_scheduled_30d || 0}
- Reuniões canceladas: ${kpis.meetings_cancelled_30d || 0}
- Investimento: R$ ${(kpis.spend_30d || 0).toFixed(2)}
- CPL (Custo por Lead): R$ ${(kpis.cpl_30d || 0).toFixed(2)}
- Custo por Reunião: R$ ${(kpis.cpm_meeting_30d || 0).toFixed(2)}
- Taxa Lead→Reunião: ${((kpis.conv_lead_to_meeting_30d || 0) * 100).toFixed(1)}%
` : "KPIs não disponíveis";

  // Last 7 days summary
  const last7Days = dailyData.slice(-7);
  const dailyContext = last7Days.length > 0 ? `
Últimos 7 dias:
${last7Days.map(d => `- ${d.day}: ${d.leads_new || 0} leads, ${d.msg_in || 0} msgs, ${d.meetings_scheduled || 0} reuniões`).join("\n")}
` : "Dados diários não disponíveis";

  // Funnel context
  const funnelContext = funnelData.length > 0 ? `
Funil atual (leads por etapa):
${funnelData.sort((a, b) => a.stage_rank - b.stage_rank).map(f => `- ${f.stage_name}: ${f.leads_total} leads`).join("\n")}
Total no funil: ${funnelData.reduce((sum, f) => sum + (f.leads_total || 0), 0)} leads
` : "Dados do funil não disponíveis";

  const systemPrompt = `Você é um analista de dados especialista em marketing digital e vendas B2B para clínicas de estética e saúde no Brasil.

Sua tarefa é analisar os dados do dashboard e fornecer insights acionáveis, alertas e recomendações.

REGRAS:
1. Seja direto e objetivo
2. Use linguagem de negócios, não técnica
3. Foque em métricas que impactam receita
4. Considere benchmarks do mercado (CPL ideal: R$30-60, Taxa conversão: 10-20%)
5. Priorize insights que requerem ação imediata

FORMATO DE RESPOSTA (JSON válido):
{
  "insights": [{"title": "Título curto do insight", "description": "Explicação detalhada do insight"}],
  "alerts": [{"title": "Título do alerta", "description": "Detalhes do problema", "severity": "warning ou danger"}],
  "recommendations": [{"title": "Título da recomendação", "description": "Ação específica recomendada"}]
}

IMPORTANTE: Cada item DEVE ter "title" (curto, 3-5 palavras) e "description" (explicação completa).
NÃO use o campo "text", use SEMPRE "title" e "description".

Gere 2-3 insights, 1-2 alertas (se houver problemas), e 2-3 recomendações práticas.`;

  const userPrompt = `Analise os dados abaixo e gere insights, alertas e recomendações:

${kpisContext}

${dailyContext}

${funnelContext}

Responda APENAS com JSON válido. Lembre-se: cada item deve ter "title" e "description", NÃO "text".`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        console.error("Rate limit exceeded");
      } else if (response.status === 402) {
        console.error("Payment required - credits exhausted");
      }
      
      return generateFallbackInsights(kpis, dailyData, funnelData);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response");
      return generateFallbackInsights(kpis, dailyData, funnelData);
    }

    // Parse JSON response - handle markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    }
    if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    
    const parsed = JSON.parse(jsonContent.trim());
    
    // Transform old format to new format if needed
    const transformItem = (item: any): InsightItem => {
      if (item.title && item.description) {
        return { title: item.title, description: item.description };
      }
      if (item.text) {
        // Extract first sentence as title
        const text = item.text;
        const firstPeriod = text.indexOf('.');
        if (firstPeriod > 0 && firstPeriod < 60) {
          return {
            title: text.substring(0, firstPeriod),
            description: text.substring(firstPeriod + 1).trim() || text
          };
        }
        return {
          title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          description: text
        };
      }
      return { title: "Insight", description: String(item) };
    };

    const transformAlert = (item: any): AlertItem => {
      const base = transformItem(item);
      return { ...base, severity: item.severity || "warning" };
    };
    
    return {
      insights: (parsed.insights || []).map(transformItem),
      alerts: (parsed.alerts || []).map(transformAlert),
      recommendations: (parsed.recommendations || []).map(transformItem),
    };
  } catch (error) {
    console.error("Error calling AI:", error);
    return generateFallbackInsights(kpis, dailyData, funnelData);
  }
}

// Fallback rule-based insights when AI is unavailable
function generateFallbackInsights(
  kpis: any,
  dailyData: DailyData[],
  funnelData: FunnelData[]
): InsightResult {
  const insights: InsightItem[] = [];
  const alerts: AlertItem[] = [];
  const recommendations: InsightItem[] = [];

  if (kpis) {
    if (kpis.cpl_30d && kpis.cpl_30d > 100) {
      alerts.push({
        title: "CPL Elevado",
        description: `CPL de R$ ${kpis.cpl_30d.toFixed(2)} está acima do ideal. Considere otimizar campanhas para reduzir custo por lead.`,
        severity: kpis.cpl_30d > 150 ? "danger" : "warning",
      });
    }

    const convRate = kpis.conv_lead_to_meeting_30d || 0;
    if (convRate < 0.05) {
      alerts.push({
        title: "Baixa Conversão",
        description: `Taxa de conversão Lead→Reunião de ${(convRate * 100).toFixed(1)}% está abaixo da meta de 10%. Revise o processo de qualificação.`,
        severity: "warning",
      });
    } else if (convRate > 0.15) {
      insights.push({
        title: "Excelente Conversão",
        description: `Taxa de conversão de ${(convRate * 100).toFixed(1)}% está acima do benchmark de mercado. Continue com a estratégia atual.`,
      });
    }
  }

  if (funnelData && funnelData.length > 0) {
    const totalLeads = funnelData.reduce((sum, f) => sum + (f.leads_total || 0), 0);
    insights.push({
      title: "Funil Ativo",
      description: `${totalLeads} leads ativos distribuídos em ${funnelData.length} etapas do funil. Monitore a progressão entre etapas.`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Monitoramento Contínuo",
      description: "Continue monitorando as métricas diariamente para identificar tendências e oportunidades de otimização.",
    });
  }

  return { insights, alerts, recommendations };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { org_id, scope = "executive" } = await req.json();

    if (!org_id) {
      return new Response(
        JSON.stringify({ error: "org_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[v${FUNCTION_VERSION}] Generating AI insights for org_id: ${org_id}, scope: ${scope}`);

    // Fetch KPIs
    const { data: kpis, error: kpisError } = await supabase
      .from("vw_dashboard_kpis_30d_v3")
      .select("*")
      .eq("org_id", org_id)
      .maybeSingle();

    if (kpisError) console.error("Error fetching KPIs:", kpisError);

    // Fetch daily data
    const { data: dailyData, error: dailyError } = await supabase
      .from("vw_dashboard_daily_60d_v3")
      .select("*")
      .eq("org_id", org_id)
      .order("day", { ascending: true });

    if (dailyError) console.error("Error fetching daily data:", dailyError);

    // Fetch funnel data
    const { data: funnelData, error: funnelError } = await supabase
      .from("vw_funnel_current_v3")
      .select("*")
      .eq("org_id", org_id);

    if (funnelError) console.error("Error fetching funnel data:", funnelError);

    // Generate AI insights
    const result = await generateInsightsWithAI(
      kpis,
      dailyData || [],
      funnelData || []
    );

    console.log(`[v${FUNCTION_VERSION}] Generated AI insights with title/description format:`, JSON.stringify(result));

    // Calculate period dates
    const now = new Date();
    const periodEnd = now.toISOString().split("T")[0];
    const periodStart = new Date(now.setDate(now.getDate() - 30))
      .toISOString()
      .split("T")[0];

    // Store insights in database
    const { error: insertError } = await supabase.from("ai_insights").insert({
      org_id,
      scope,
      period_start: periodStart,
      period_end: periodEnd,
      payload: result,
    });

    if (insertError) {
      console.error("Error storing insights:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store insights", details: insertError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights: result,
        period: { start: periodStart, end: periodEnd },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-insights:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
