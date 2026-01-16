/**
 * Página de Data Sources
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Database, Plus, Search, Filter, RefreshCw, MoreVertical,
  FileSpreadsheet, Server, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataSourceWizard } from '@/components/app/DataSourceWizard';
import { dataSourcesService } from '@/services/dataSources';
import { DataSource, DataSourceType } from '@/types/saas';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TYPE_ICONS: Record<DataSourceType, React.ElementType> = {
  upload: FileSpreadsheet,
  supabase: Database,
  postgres: Server,
  mysql: Server,
};

const TYPE_LABELS: Record<DataSourceType, string> = {
  upload: 'Upload',
  supabase: 'Supabase',
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
};

const STATUS_CONFIG = {
  active: { icon: CheckCircle, label: 'Ativo', color: 'text-success' },
  inactive: { icon: AlertCircle, label: 'Inativo', color: 'text-text-3' },
  error: { icon: AlertCircle, label: 'Erro', color: 'text-danger' },
  syncing: { icon: Loader2, label: 'Sincronizando', color: 'text-warning' },
};

export default function DataSourcesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { orgId } = useSaasAuth();
  
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wizardOpen, setWizardOpen] = useState(searchParams.get('new') === 'true');

  const loadDataSources = async () => {
    setLoading(true);
    try {
      const data = await dataSourcesService.list(orgId || '', { search });
      setDataSources(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataSources();
  }, [orgId, search]);

  const handleSync = async (id: string) => {
    await dataSourcesService.sync(id);
    loadDataSources();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Data Sources</h1>
          <p className="text-text-3 mt-1">Gerencie as origens de dados conectadas</p>
        </div>
        <Button 
          onClick={() => setWizardOpen(true)}
          className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Data Source
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <Input
            placeholder="Buscar data sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-bg-1 border-border"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-pinn-orange-500" />
        </div>
      ) : dataSources.length === 0 ? (
        <div className="text-center py-20">
          <Database className="w-16 h-16 mx-auto text-text-3 mb-4" />
          <h3 className="text-lg font-semibold text-text-1 mb-2">Nenhum Data Source</h3>
          <p className="text-text-3 mb-6">Conecte sua primeira fonte de dados para começar</p>
          <Button 
            onClick={() => setWizardOpen(true)}
            className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Data Source
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {dataSources.map((ds) => {
            const TypeIcon = TYPE_ICONS[ds.type];
            const statusConfig = STATUS_CONFIG[ds.status];
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={ds.id}
                className="p-4 rounded-xl bg-bg-1 border border-border hover:border-pinn-orange-500/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/app/data-sources/${ds.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-bg-2 flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-pinn-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-1 group-hover:text-pinn-orange-500 transition-colors">
                        {ds.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-text-3">{TYPE_LABELS[ds.type]}</span>
                        <div className={cn("flex items-center gap-1", statusConfig.color)}>
                          <StatusIcon className={cn("w-3 h-3", ds.status === 'syncing' && "animate-spin")} />
                          <span className="text-xs">{statusConfig.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {ds.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-bg-2 text-text-2">
                        {tag}
                      </Badge>
                    ))}
                    {ds.lastSyncAt && (
                      <span className="text-xs text-text-3">
                        Sync: {new Date(ds.lastSyncAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-bg-1 border-border">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSync(ds.id); }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sincronizar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wizard */}
      <DataSourceWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        orgId={orgId || ''}
        onSuccess={loadDataSources}
      />
    </div>
  );
}
