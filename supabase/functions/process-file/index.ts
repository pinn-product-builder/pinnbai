/**
 * Edge Function: process-file
 * Processa arquivos CSV/XLSX e detecta schema automaticamente
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DetectedColumn {
  name: string;
  displayName: string;
  dataType: 'text' | 'integer' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'category' | 'id' | 'percent';
  isMeasure: boolean;
  isDimension: boolean;
  isPrimaryDate: boolean;
  nullRatio: number;
  cardinality: number;
  sampleValues: string[];
}

interface DetectedSchema {
  columns: DetectedColumn[];
  rowCount: number;
  previewData: Record<string, any>[];
}

// Detect data type from values
function detectDataType(values: any[]): DetectedColumn['dataType'] {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  if (nonNullValues.length === 0) return 'text';
  
  // Check for boolean
  const boolPatterns = ['true', 'false', 'sim', 'não', 'yes', 'no', '1', '0'];
  const allBool = nonNullValues.every(v => 
    boolPatterns.includes(String(v).toLowerCase())
  );
  if (allBool && nonNullValues.length > 0) return 'boolean';
  
  // Check for date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/,  // DD/MM/YYYY
    /^\d{2}-\d{2}-\d{4}$/,  // DD-MM-YYYY
  ];
  const dateTimePatterns = [
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, // ISO datetime
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/, // YYYY-MM-DD HH:MM
  ];
  
  const allDateTime = nonNullValues.every(v => 
    dateTimePatterns.some(p => p.test(String(v)))
  );
  if (allDateTime) return 'datetime';
  
  const allDate = nonNullValues.every(v => 
    datePatterns.some(p => p.test(String(v)))
  );
  if (allDate) return 'date';
  
  // Check for numbers
  const numericValues = nonNullValues.filter(v => {
    const cleaned = String(v).replace(/[R$\s,]/g, '').replace(',', '.');
    return !isNaN(parseFloat(cleaned));
  });
  
  if (numericValues.length === nonNullValues.length) {
    // Check if currency (has R$ or common currency patterns)
    const hasCurrency = nonNullValues.some(v => 
      /R\$|USD|\$|€|£/.test(String(v))
    );
    if (hasCurrency) return 'currency';
    
    // Check if integer or decimal
    const hasDecimal = nonNullValues.some(v => {
      const cleaned = String(v).replace(/[R$\s]/g, '').replace(',', '.');
      return cleaned.includes('.') && !cleaned.endsWith('.00');
    });
    return hasDecimal ? 'number' : 'integer';
  }
  
  // Check cardinality for category detection
  const uniqueValues = new Set(nonNullValues.map(v => String(v).toLowerCase()));
  const cardinality = uniqueValues.size;
  const cardinalityRatio = cardinality / nonNullValues.length;
  
  // Low cardinality suggests category
  if (cardinality <= 20 && cardinalityRatio < 0.1 && nonNullValues.length >= 10) {
    return 'category';
  }
  
  return 'text';
}

// Format column name to display name
function formatDisplayName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Parse CSV content
function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  // Detect delimiter
  const firstLine = lines[0];
  const delimiters = [',', ';', '\t', '|'];
  let delimiter = ',';
  let maxCount = 0;
  
  for (const d of delimiters) {
    const count = (firstLine.match(new RegExp(`\\${d}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      delimiter = d;
    }
  }
  
  // Parse with detected delimiter
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  
  return { headers, rows };
}

// Analyze columns and generate schema
function analyzeData(headers: string[], rows: string[][]): DetectedSchema {
  const columns: DetectedColumn[] = [];
  const previewData: Record<string, any>[] = [];
  
  // Analyze each column
  for (let colIndex = 0; colIndex < headers.length; colIndex++) {
    const name = headers[colIndex] || `column_${colIndex + 1}`;
    const values = rows.map(row => row[colIndex] ?? null);
    
    const nonNullCount = values.filter(v => v !== null && v !== undefined && v !== '').length;
    const nullRatio = 1 - (nonNullCount / values.length);
    
    const uniqueValues = new Set(values.filter(v => v !== null && v !== undefined && v !== ''));
    const cardinality = uniqueValues.size;
    
    const dataType = detectDataType(values);
    
    // Determine if measure or dimension
    const isMeasure = ['integer', 'number', 'currency'].includes(dataType);
    const isDimension = ['text', 'category', 'date', 'datetime'].includes(dataType) || 
      (!isMeasure && cardinality < rows.length * 0.5);
    
    // Detect primary date
    const isPrimaryDate = (dataType === 'date' || dataType === 'datetime') && 
      name.toLowerCase().includes('data') || 
      name.toLowerCase().includes('date') ||
      name.toLowerCase() === 'created_at' ||
      name.toLowerCase() === 'updated_at';
    
    // Get sample values
    const sampleValues = Array.from(uniqueValues).slice(0, 5).map(String);
    
    columns.push({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName: formatDisplayName(name),
      dataType,
      isMeasure,
      isDimension,
      isPrimaryDate: isPrimaryDate && columns.filter(c => c.isPrimaryDate).length === 0,
      nullRatio: Math.round(nullRatio * 100) / 100,
      cardinality,
      sampleValues,
    });
  }
  
  // Build preview data (first 10 rows)
  const previewRows = rows.slice(0, 10);
  for (const row of previewRows) {
    const obj: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      const colName = headers[i]?.toLowerCase().replace(/\s+/g, '_') || `column_${i + 1}`;
      obj[colName] = row[i] ?? null;
    }
    previewData.push(obj);
  }
  
  return {
    columns,
    rowCount: rows.length,
    previewData,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { storagePath, fileType } = await req.json();
    
    if (!storagePath) {
      return new Response(
        JSON.stringify({ error: 'storagePath é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('data-imports')
      .download(storagePath);
    
    if (downloadError) {
      console.error('Download error:', downloadError);
      return new Response(
        JSON.stringify({ error: `Erro ao baixar arquivo: ${downloadError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let schema: DetectedSchema;
    const content = await fileData.text();
    
    // Process based on file type
    if (fileType === 'csv') {
      const { headers, rows } = parseCSV(content);
      schema = analyzeData(headers, rows);
    } else if (fileType === 'json') {
      try {
        const jsonData = JSON.parse(content);
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        if (dataArray.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Arquivo JSON vazio ou inválido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const headers = Object.keys(dataArray[0]);
        const rows = dataArray.map(obj => headers.map(h => obj[h]));
        schema = analyzeData(headers, rows);
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'Erro ao parsear JSON' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      // For Excel files, we'll parse the first few rows as tab-separated
      // In production, you'd use a proper XLSX library
      // For now, return a helpful message
      return new Response(
        JSON.stringify({ 
          error: 'Processamento de XLSX requer conversão. Por favor, salve como CSV primeiro.',
          suggestion: 'csv'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: `Tipo de arquivo não suportado: ${fileType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        schema,
        message: `Detectadas ${schema.columns.length} colunas e ${schema.rowCount} linhas`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error: unknown) {
    console.error('Process error:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao processar arquivo';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
