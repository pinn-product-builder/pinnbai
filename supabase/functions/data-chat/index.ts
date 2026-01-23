import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface DataChatRequest {
  messages: ChatMessage[];
  workspaceSlug: string;
  datasetName: string;
  action?: "chat" | "report";
  reportType?: "summary" | "detailed" | "insights" | "executive";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is missing");
      return new Response(
        JSON.stringify({ error: "Configuração de IA não encontrada. Contate o suporte." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { 
      messages, 
      workspaceSlug, 
      datasetName, 
      action = "chat",
      reportType = "summary" 
    }: DataChatRequest = await req.json();

    console.log("data-chat request:", { workspaceSlug, datasetName, action, reportType, messageCount: messages?.length });

    // Build data context
    let dataContext = "";
    let stats: Record<string, any> = {};
    let columns: string[] = [];
    let dataRows: any[] = [];
    let rowCount = 0;

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const schemaName = `ws_${workspaceSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const tableName = datasetName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        console.log("Fetching data from:", { schemaName, tableName });

        // Try to fetch sample data
        const { data: sampleData, error: sampleError } = await supabase.rpc('query_dataset', {
          p_schema_name: schemaName,
          p_table_name: tableName,
          p_limit: 100,
          p_offset: 0,
          p_order_by: null,
          p_order_dir: 'asc',
          p_filters: null,
        });

        if (sampleError) {
          console.log("RPC query_dataset error:", sampleError.message);
        } else if (sampleData) {
          dataRows = Array.isArray(sampleData) ? sampleData : [];
          console.log("Fetched rows:", dataRows.length);
        }

        // Try to get row count
        const { data: countData, error: countError } = await supabase.rpc('count_dataset_rows', {
          p_schema_name: schemaName,
          p_table_name: tableName,
          p_filters: null,
        });

        if (!countError && countData) {
          rowCount = countData;
        }
      }
    } catch (e) {
      console.log("Could not fetch dataset data:", e);
    }

    // Calculate statistics if we have data
    if (dataRows.length > 0) {
      columns = Object.keys(dataRows[0]);
      
      for (const col of columns) {
        const values = dataRows.map((row: any) => row[col]).filter(v => v != null);
        const numericValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v))).map(Number);
        
        if (numericValues.length > 0) {
          const sum = numericValues.reduce((a, b) => a + b, 0);
          const avg = sum / numericValues.length;
          const min = Math.min(...numericValues);
          const max = Math.max(...numericValues);
          stats[col] = { type: 'numeric', sum, avg: avg.toFixed(2), min, max, count: numericValues.length };
        } else {
          const uniqueValues = [...new Set(values)];
          stats[col] = { type: 'categorical', uniqueCount: uniqueValues.length, sample: uniqueValues.slice(0, 5) };
        }
      }

      dataContext = `
## CONTEXTO DOS DADOS

**Dataset**: ${datasetName}
**Total de Registros**: ${rowCount || dataRows.length}
**Colunas**: ${columns.join(', ')}

### ESTATÍSTICAS POR COLUNA:
${JSON.stringify(stats, null, 2)}

### AMOSTRA DOS DADOS (primeiras ${Math.min(10, dataRows.length)} linhas):
${JSON.stringify(dataRows.slice(0, 10), null, 2)}
`;
    } else {
      dataContext = `
## CONTEXTO
Dataset: ${datasetName}
Workspace: ${workspaceSlug}

Nota: Não foi possível carregar os dados diretamente. Posso ajudar com perguntas gerais sobre análise de dados e melhores práticas.
`;
    }

    // Build system prompt based on action
    let systemPrompt = "";
    
    if (action === "report") {
      const reportPrompts: Record<string, string> = {
        summary: `Você é um analista de dados especializado em gerar RELATÓRIOS EXECUTIVOS concisos.
Gere um relatório resumido com:
1. **Visão Geral**: Descrição do dataset e principais métricas
2. **Destaques**: 3-5 principais insights
3. **Métricas-Chave**: Os números mais importantes
4. **Recomendações**: 2-3 ações sugeridas

Use markdown formatado. Seja direto e profissional.`,

        detailed: `Você é um analista de dados especializado em gerar RELATÓRIOS DETALHADOS.
Gere um relatório completo com:
1. **Sumário Executivo**: Visão geral em 2-3 parágrafos
2. **Análise de Métricas**: Cada métrica numérica com análise
3. **Distribuições**: Análise das variáveis categóricas
4. **Correlações**: Relações identificadas entre variáveis
5. **Anomalias**: Outliers ou padrões incomuns
6. **Tendências**: Padrões temporais se houver datas
7. **Conclusões e Recomendações**: Ações sugeridas baseadas nos dados

Use markdown bem formatado com tabelas quando apropriado.`,

        insights: `Você é um cientista de dados focado em DESCOBERTA DE INSIGHTS.
Analise profundamente os dados e identifique:
1. **Insights Ocultos**: Padrões não óbvios
2. **Oportunidades**: Áreas de melhoria potencial
3. **Riscos**: Possíveis problemas identificados
4. **Segmentações**: Grupos naturais nos dados
5. **Correlações Inesperadas**: Relações surpreendentes

Priorize insights acionáveis. Use emojis para destacar tipos de insights.`,

        executive: `Você é um consultor estratégico gerando um RELATÓRIO PARA C-LEVEL.
Formato: Máximo 1 página. Foco em decisões de negócio.

Estrutura:
## 📊 Snapshot dos Dados
[3 métricas principais em destaque]

## 🎯 Status Atual
[Situação em 2 frases]

## ⚡ Ações Prioritárias
[3 ações rankeadas por impacto]

## 🔮 Próximos Passos
[O que monitorar]

Linguagem executiva, números em destaque.`
      };

      systemPrompt = reportPrompts[reportType] || reportPrompts.summary;
    } else {
      systemPrompt = `Você é um Analista de Dados IA especializado chamado "Pinn Analytics AI".
Você tem acesso aos dados do dataset "${datasetName}".

CAPACIDADES:
- Responder perguntas sobre os dados
- Identificar padrões e tendências
- Sugerir insights e recomendações
- Comparar métricas
- Explicar correlações
- Identificar anomalias

ESTILO:
- Seja preciso e baseado em dados
- Use números específicos quando possível
- Sugira visualizações quando relevante
- Seja proativo em oferecer insights relacionados
- Use emojis moderadamente para clareza visual

Responda sempre em português do Brasil. Quando não souber algo específico, seja honesto e sugira como obter a informação.`;
    }

    // Prepare messages for AI
    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt + "\n\n" + dataContext },
      ...messages
    ];

    console.log("Calling Lovable AI Gateway with", aiMessages.length, "messages");

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    console.log("AI Gateway response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos para continuar." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error: any) {
    console.error("data-chat error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});