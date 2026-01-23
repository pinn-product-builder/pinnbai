/**
 * Edge Function: Consultar dados do schema isolado do workspace
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueryDataRequest {
  workspaceSlug: string;
  datasetName: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      workspaceSlug, 
      datasetName,
      limit = 100,
      offset = 0,
      orderBy,
      orderDir = 'asc',
      filters,
    }: QueryDataRequest = await req.json();

    if (!workspaceSlug || !datasetName) {
      return new Response(
        JSON.stringify({ error: 'workspaceSlug e datasetName são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schemaName = `ws_${workspaceSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const tableName = datasetName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Query using RPC for security (no raw SQL injection)
    const { data, error } = await supabase.rpc('query_dataset', {
      p_schema_name: schemaName,
      p_table_name: tableName,
      p_limit: limit,
      p_offset: offset,
      p_order_by: orderBy || null,
      p_order_dir: orderDir,
      p_filters: filters ? JSON.stringify(filters) : null,
    });

    if (error) {
      console.error('Error querying data:', error);
      throw error;
    }

    // Get count
    const { data: countData } = await supabase.rpc('count_dataset_rows', {
      p_schema_name: schemaName,
      p_table_name: tableName,
      p_filters: filters ? JSON.stringify(filters) : null,
    });

    return new Response(
      JSON.stringify({ 
        rows: data || [],
        count: countData || 0,
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
