/**
 * Edge Function: Inserir dados no schema isolado do workspace
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ColumnDef {
  name: string;
  dataType: string;
}

interface InsertDataRequest {
  workspaceSlug: string;
  datasetId: string;
  datasetName: string;
  columns: ColumnDef[];
  rows: Record<string, any>[];
}

// Map our data types to PostgreSQL types
function mapToPostgresType(dataType: string): string {
  const typeMap: Record<string, string> = {
    'text': 'TEXT',
    'category': 'TEXT',
    'id': 'TEXT',
    'integer': 'BIGINT',
    'number': 'NUMERIC',
    'currency': 'NUMERIC',
    'percent': 'NUMERIC',
    'date': 'DATE',
    'datetime': 'TIMESTAMPTZ',
    'boolean': 'BOOLEAN',
  };
  return typeMap[dataType] || 'TEXT';
}

// Sanitize table name
function sanitizeTableName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 63);
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
      datasetId,
      datasetName, 
      columns, 
      rows 
    }: InsertDataRequest = await req.json();

    if (!workspaceSlug || !datasetName || !columns || !rows) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const schemaName = `ws_${workspaceSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const tableName = sanitizeTableName(datasetName);
    const fullTableName = `${schemaName}.${tableName}`;

    // Create table with columns
    const columnDefs = columns.map(col => {
      const pgType = mapToPostgresType(col.dataType);
      const colName = col.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      return `"${colName}" ${pgType}`;
    }).join(', ');

    // Use RPC to create table and insert data
    const { error: createError } = await supabase.rpc('create_dataset_table', {
      p_schema_name: schemaName,
      p_table_name: tableName,
      p_column_defs: columnDefs,
      p_dataset_id: datasetId,
    });

    if (createError) {
      console.error('Error creating table:', createError);
      // If table exists, try to truncate and re-insert
      if (!createError.message?.includes('already exists')) {
        throw createError;
      }
    }

    // Insert data in batches
    const BATCH_SIZE = 500;
    let insertedCount = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      
      const { error: insertError } = await supabase.rpc('insert_dataset_rows', {
        p_schema_name: schemaName,
        p_table_name: tableName,
        p_rows: JSON.stringify(batch),
      });

      if (insertError) {
        console.error('Error inserting batch:', insertError);
        throw insertError;
      }

      insertedCount += batch.length;
    }

    // Register dataset in metadata table
    await supabase.rpc('register_dataset', {
      p_schema_name: schemaName,
      p_dataset_id: datasetId,
      p_table_name: tableName,
      p_display_name: datasetName,
      p_row_count: rows.length,
      p_columns: JSON.stringify(columns),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        rowCount: insertedCount,
        tableName: fullTableName,
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
