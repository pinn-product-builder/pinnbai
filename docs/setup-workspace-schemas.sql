-- =====================================================
-- SETUP: Schema Isolado por Workspace
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para habilitar
-- a funcionalidade de schemas isolados por workspace.
-- =====================================================

-- 1. Tabela de workspaces (registro central)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  schema_name TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  plan TEXT DEFAULT 'basic',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bucket de storage para imports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-imports', 
  'data-imports', 
  false,
  52428800,
  ARRAY['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de storage
DROP POLICY IF EXISTS "Allow uploads to data-imports" ON storage.objects;
DROP POLICY IF EXISTS "Allow read from data-imports" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete from data-imports" ON storage.objects;

CREATE POLICY "Allow uploads to data-imports"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'data-imports');

CREATE POLICY "Allow read from data-imports"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'data-imports');

CREATE POLICY "Allow delete from data-imports"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'data-imports');

-- 3. Função para criar schema de workspace
CREATE OR REPLACE FUNCTION public.create_workspace_schema(
  p_schema_name TEXT,
  p_workspace_id TEXT,
  p_workspace_name TEXT
) RETURNS VOID AS $$
BEGIN
  -- Criar schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', p_schema_name);
  
  -- Criar tabela de metadados de datasets no schema
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS %I._datasets_metadata (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      display_name TEXT NOT NULL,
      row_count INTEGER DEFAULT 0,
      columns JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  ', p_schema_name);
  
  -- Registrar workspace se não existir
  INSERT INTO public.workspaces (id, name, slug, schema_name, status)
  VALUES (p_workspace_id, p_workspace_name, lower(regexp_replace(p_workspace_name, '[^a-zA-Z0-9]', '', 'g')), p_schema_name, 'active')
  ON CONFLICT (id) DO UPDATE SET schema_name = EXCLUDED.schema_name, updated_at = NOW();
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função para criar tabela de dataset
CREATE OR REPLACE FUNCTION public.create_dataset_table(
  p_schema_name TEXT,
  p_table_name TEXT,
  p_column_defs TEXT,
  p_dataset_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Dropar tabela existente se houver
  EXECUTE format('DROP TABLE IF EXISTS %I.%I', p_schema_name, p_table_name);
  
  -- Criar nova tabela com as colunas definidas
  EXECUTE format('
    CREATE TABLE %I.%I (
      _row_id SERIAL PRIMARY KEY,
      _imported_at TIMESTAMPTZ DEFAULT NOW(),
      %s
    )
  ', p_schema_name, p_table_name, p_column_defs);
  
  -- Criar índice na data de importação
  EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_imported_at ON %I.%I (_imported_at)', 
    p_table_name, p_schema_name, p_table_name);
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função para inserir linhas no dataset
CREATE OR REPLACE FUNCTION public.insert_dataset_rows(
  p_schema_name TEXT,
  p_table_name TEXT,
  p_rows JSONB
) RETURNS INTEGER AS $$
DECLARE
  row_data JSONB;
  columns TEXT[];
  values_list TEXT[];
  col TEXT;
  val TEXT;
  insert_sql TEXT;
  inserted_count INTEGER := 0;
BEGIN
  -- Processar cada linha
  FOR row_data IN SELECT * FROM jsonb_array_elements(p_rows)
  LOOP
    columns := ARRAY[]::TEXT[];
    values_list := ARRAY[]::TEXT[];
    
    -- Extrair colunas e valores
    FOR col, val IN SELECT * FROM jsonb_each_text(row_data)
    LOOP
      columns := array_append(columns, format('%I', lower(regexp_replace(col, '[^a-zA-Z0-9_]', '_', 'g'))));
      values_list := array_append(values_list, format('%L', val));
    END LOOP;
    
    -- Construir e executar INSERT
    IF array_length(columns, 1) > 0 THEN
      insert_sql := format(
        'INSERT INTO %I.%I (%s) VALUES (%s)',
        p_schema_name,
        p_table_name,
        array_to_string(columns, ', '),
        array_to_string(values_list, ', ')
      );
      EXECUTE insert_sql;
      inserted_count := inserted_count + 1;
    END IF;
  END LOOP;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para registrar dataset
CREATE OR REPLACE FUNCTION public.register_dataset(
  p_schema_name TEXT,
  p_dataset_id TEXT,
  p_table_name TEXT,
  p_display_name TEXT,
  p_row_count INTEGER,
  p_columns JSONB
) RETURNS VOID AS $$
BEGIN
  EXECUTE format('
    INSERT INTO %I._datasets_metadata (id, table_name, display_name, row_count, columns)
    VALUES (%L, %L, %L, %s, %L)
    ON CONFLICT (id) DO UPDATE SET
      row_count = EXCLUDED.row_count,
      columns = EXCLUDED.columns,
      updated_at = NOW()
  ', p_schema_name, p_dataset_id, p_table_name, p_display_name, p_row_count, p_columns::TEXT);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para consultar dataset
CREATE OR REPLACE FUNCTION public.query_dataset(
  p_schema_name TEXT,
  p_table_name TEXT,
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_order_by TEXT DEFAULT NULL,
  p_order_dir TEXT DEFAULT 'asc',
  p_filters JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  query_sql TEXT;
  result JSONB;
  order_clause TEXT := '';
  where_clause TEXT := '';
BEGIN
  -- Construir ORDER BY
  IF p_order_by IS NOT NULL THEN
    order_clause := format(' ORDER BY %I %s', p_order_by, 
      CASE WHEN upper(p_order_dir) = 'DESC' THEN 'DESC' ELSE 'ASC' END);
  END IF;
  
  -- Construir WHERE (básico, pode ser expandido)
  -- Por segurança, filtros são limitados
  
  -- Query principal
  query_sql := format(
    'SELECT jsonb_agg(row_to_json(t)) FROM (SELECT * FROM %I.%I %s %s LIMIT %s OFFSET %s) t',
    p_schema_name, p_table_name, where_clause, order_clause, p_limit, p_offset
  );
  
  EXECUTE query_sql INTO result;
  
  RETURN COALESCE(result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para contar linhas
CREATE OR REPLACE FUNCTION public.count_dataset_rows(
  p_schema_name TEXT,
  p_table_name TEXT,
  p_filters JSONB DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  query_sql TEXT;
  result INTEGER;
BEGIN
  query_sql := format('SELECT COUNT(*) FROM %I.%I', p_schema_name, p_table_name);
  EXECUTE query_sql INTO result;
  RETURN COALESCE(result, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para listar datasets do schema
CREATE OR REPLACE FUNCTION public.list_schema_datasets(
  p_schema_name TEXT
) RETURNS JSONB AS $$
DECLARE
  query_sql TEXT;
  result JSONB;
BEGIN
  query_sql := format(
    'SELECT jsonb_agg(jsonb_build_object(
      ''id'', id,
      ''name'', display_name,
      ''tableName'', table_name,
      ''rowCount'', row_count,
      ''createdAt'', created_at,
      ''columns'', columns
    )) FROM %I._datasets_metadata',
    p_schema_name
  );
  
  EXECUTE query_sql INTO result;
  
  RETURN COALESCE(result, '[]'::JSONB);
EXCEPTION
  WHEN undefined_table THEN
    RETURN '[]'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_workspace_schema TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_dataset_table TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.insert_dataset_rows TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_dataset TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.query_dataset TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.count_dataset_rows TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_schema_datasets TO anon, authenticated;

-- =====================================================
-- FIM DO SETUP
-- =====================================================
