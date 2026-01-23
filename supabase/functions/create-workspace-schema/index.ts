/**
 * Edge Function: Criar schema isolado para novo workspace
 * 
 * Cada workspace tem seu próprio schema PostgreSQL com tabelas isoladas:
 * - ws_<slug>.imported_data
 * - ws_<slug>.dashboards
 * - ws_<slug>.datasets
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSchemaRequest {
  workspaceId: string;
  workspaceSlug: string;
  workspaceName: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for schema creation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { workspaceId, workspaceSlug, workspaceName }: CreateSchemaRequest = await req.json();

    if (!workspaceId || !workspaceSlug) {
      return new Response(
        JSON.stringify({ error: 'workspaceId e workspaceSlug são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize slug for schema name (only alphanumeric and underscore)
    const schemaName = `ws_${workspaceSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Create schema and tables using RPC
    const { error: schemaError } = await supabase.rpc('create_workspace_schema', {
      p_schema_name: schemaName,
      p_workspace_id: workspaceId,
      p_workspace_name: workspaceName,
    });

    if (schemaError) {
      console.error('Error creating schema:', schemaError);
      
      // If schema already exists, that's OK
      if (schemaError.message?.includes('already exists')) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            schemaName, 
            message: 'Schema já existe' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw schemaError;
    }

    // Register workspace in public.workspaces table
    const { error: registerError } = await supabase
      .from('workspaces')
      .upsert({
        id: workspaceId,
        name: workspaceName,
        slug: workspaceSlug,
        schema_name: schemaName,
        status: 'active',
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (registerError) {
      console.error('Error registering workspace:', registerError);
      // Don't fail - schema was created successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        schemaName,
        message: `Schema ${schemaName} criado com sucesso`
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
