/**
 * Serviço para gerenciar schemas isolados por workspace
 */

import { supabase } from '@/lib/supabaseClient';

export interface WorkspaceSchema {
  id: string;
  name: string;
  slug: string;
  schemaName: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ImportedDataRow {
  id: string;
  [key: string]: any;
}

export const schemaService = {
  /**
   * Criar schema para novo workspace
   */
  createWorkspaceSchema: async (
    workspaceId: string, 
    workspaceSlug: string, 
    workspaceName: string
  ): Promise<{ success: boolean; schemaName?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-workspace-schema', {
        body: { workspaceId, workspaceSlug, workspaceName }
      });

      if (error) {
        console.error('Error creating workspace schema:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        schemaName: data.schemaName 
      };
    } catch (err: any) {
      console.error('Error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Obter nome do schema para um workspace
   */
  getSchemaName: (workspaceSlug: string): string => {
    return `ws_${workspaceSlug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  },

  /**
   * Inserir dados importados no schema do workspace
   */
  insertImportedData: async (
    workspaceSlug: string,
    datasetId: string,
    datasetName: string,
    columns: { name: string; dataType: string }[],
    rows: Record<string, any>[]
  ): Promise<{ success: boolean; rowCount?: number; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('insert-workspace-data', {
        body: { 
          workspaceSlug, 
          datasetId,
          datasetName,
          columns,
          rows 
        }
      });

      if (error) {
        console.error('Error inserting data:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        rowCount: data.rowCount 
      };
    } catch (err: any) {
      console.error('Error:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Consultar dados do dataset no schema do workspace
   */
  queryDataset: async (
    workspaceSlug: string,
    datasetName: string,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDir?: 'asc' | 'desc';
      filters?: Record<string, any>;
    }
  ): Promise<{ data: ImportedDataRow[]; count: number; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('query-workspace-data', {
        body: { 
          workspaceSlug, 
          datasetName,
          ...options
        }
      });

      if (error) {
        console.error('Error querying data:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { 
        data: data.rows || [], 
        count: data.count || 0 
      };
    } catch (err: any) {
      console.error('Error:', err);
      return { data: [], count: 0, error: err.message };
    }
  },

  /**
   * Listar datasets disponíveis no workspace
   */
  listDatasets: async (workspaceSlug: string): Promise<{ 
    datasets: { name: string; rowCount: number; createdAt: string }[]; 
    error?: string 
  }> => {
    try {
      const { data, error } = await supabase.functions.invoke('list-workspace-datasets', {
        body: { workspaceSlug }
      });

      if (error) {
        console.error('Error listing datasets:', error);
        return { datasets: [], error: error.message };
      }

      return { 
        datasets: data.datasets || [] 
      };
    } catch (err: any) {
      console.error('Error:', err);
      return { datasets: [], error: err.message };
    }
  },

  /**
   * Deletar dataset do workspace
   */
  deleteDataset: async (
    workspaceSlug: string, 
    datasetName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-workspace-dataset', {
        body: { workspaceSlug, datasetName }
      });

      if (error) {
        console.error('Error deleting dataset:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error:', err);
      return { success: false, error: err.message };
    }
  },
};
