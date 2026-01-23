/**
 * Edge Function: Listar datasets do workspace
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ListDatasetsRequest {
  workspaceSlug: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { workspaceSlug }: ListDatasetsRequest = await req.json();

    if (!workspaceSlug) {
      return new Response(
        JSON.stringify({ error: 'workspaceSlug é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schemaName = `ws_${workspaceSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Query metadata table for datasets
    const { data, error } = await supabase.rpc('list_schema_datasets', {
      p_schema_name: schemaName,
    });

    if (error) {
      console.error('Error listing datasets:', error);
      // If schema doesn't exist, return empty array
      if (error.message?.includes('does not exist')) {
        return new Response(
          JSON.stringify({ datasets: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        datasets: data || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
