/**
 * Página de Data Sets
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, Plus, Search, Filter, RefreshCw, 
  CheckCircle, Clock, Loader2, MoreVertical, Eye, Settings, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AppLayout } from '@/components/app/AppLayout';
import { DataSetWizard } from '@/components/app/DataSetWizard';
import { dataSetsService } from '@/services/dataSets';
import { dataSourcesService } from '@/services/dataSources';
import { DataSet, DataSource } from '@/types/saas';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import { toast } from '@/hooks/use-toast';

export default function DataSetsPage() {
  const navigate = useNavigate();
  const { orgId } = useSaasAuth();
  
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const loadData = async () => {
    if (!orgId) return;
    
    setLoading(true);
    try {
      const [dsSets, dsSources] = await Promise.all([
        dataSetsService.list(orgId),
        dataSourcesService.list(orgId),
      ]);
      setDataSets(dsSets);
      setDataSources(dsSources);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const filteredDataSets = dataSets.filter(ds => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      ds.name.toLowerCase().includes(searchLower) ||
      ds.description?.toLowerCase().includes(searchLower) ||
      ds.sourceName?.toLowerCase().includes(searchLower)
    );
  });

  const handleRefresh = async (dataSetId: string) => {
    setRefreshing(dataSetId);
    try {
      const result = await dataSetsService.refresh(dataSetId);
      if (result.success) {
        toast({
          title: 'Dataset atualizado',
          description: `${result.recordsProcessed} registros processados`,
        });
        await loadData();
      }
    } finally {
      setRefreshing(null);
    }
  };

  const handleWizardComplete = async (data: Partial<DataSet>) => {
    await dataSetsService.create({ ...data, orgId });
    setWizardOpen(false);
    await loadData();
    toast({
      title: 'Dataset criado',
      description: 'O dataset foi criado com sucesso',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Data Sets</h1>
          <p className="text-text-3 mt-1">Gerencie seus datasets modelados</p>
        </div>
        <Button 
          onClick={() => setWizardOpen(true)}
          className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Data Set
        </Button>
      </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <Input
            placeholder="Buscar datasets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-bg-1 border-border"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-bg-1 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pinn-orange-500/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-pinn-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-1">{dataSets.length}</p>
                <p className="text-sm text-text-3">Total de Datasets</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-bg-1 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-1">
                  {dataSets.filter(d => d.status === 'published').length}
                </p>
                <p className="text-sm text-text-3">Publicados</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-bg-1 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-1">
                  {dataSets.filter(d => d.status === 'draft').length}
                </p>
                <p className="text-sm text-text-3">Rascunhos</p>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-pinn-orange-500" />
          </div>
        ) : filteredDataSets.length === 0 ? (
          <div className="text-center py-20">
            <Database className="w-16 h-16 mx-auto text-text-3 mb-4" />
            <h3 className="text-lg font-semibold text-text-1 mb-2">Nenhum Dataset</h3>
            <p className="text-text-3 mb-4">Crie seu primeiro dataset para começar</p>
            <Button 
              onClick={() => setWizardOpen(true)}
              className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Dataset
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDataSets.map((dataSet) => (
              <div
                key={dataSet.id}
                className="p-4 rounded-xl bg-bg-1 border border-border hover:border-pinn-orange-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-bg-2 flex items-center justify-center">
                      <Database className="w-6 h-6 text-pinn-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-1">{dataSet.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-text-3">
                          Origem: {dataSet.sourceName || 'Não definida'}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            dataSet.status === 'published' 
                              ? "bg-success/10 text-success" 
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          {dataSet.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </Badge>
                        <span className="text-xs text-text-3">
                          {dataSet.columns.length} colunas · {dataSet.metrics?.length || 0} métricas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefresh(dataSet.id)}
                      disabled={refreshing === dataSet.id}
                    >
                      <RefreshCw className={cn(
                        "w-4 h-4 mr-2",
                        refreshing === dataSet.id && "animate-spin"
                      )} />
                      Atualizar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-bg-1 border-border">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/app/data-sets/${dataSet.id}`)}
                          className="cursor-pointer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-danger">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wizard */}
        <DataSetWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          dataSources={dataSources}
          onComplete={handleWizardComplete}
        />
      </div>
  );
}
