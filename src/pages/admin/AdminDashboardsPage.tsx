/**
 * Admin: Página para visualizar e acessar todos os dashboards
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Search, Building2, Eye, ExternalLink, 
  CheckCircle, Clock, Loader2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { dashboardsService } from '@/services/dashboards';
import { workspaceService } from '@/services/workspaces';
import { Dashboard, Organization } from '@/types/saas';
import { useSaasAuth } from '@/contexts/SaasAuthContext';

// Dashboard legado da Afonsina
const AFONSINA_LEGACY_DASHBOARD = {
  id: 'afonsina-legacy',
  orgId: '073605bb-b60f-4928-b5b9-5fa149f35941',
  name: 'Dashboard Executivo Afonsina',
  description: 'Dashboard legado da Afonsina (acesso direto)',
  status: 'published' as const,
  widgets: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: new Date().toISOString(),
  isLegacy: true,
};

export default function AdminDashboardsPage() {
  const navigate = useNavigate();
  const { impersonate } = useSaasAuth();
  
  const [dashboards, setDashboards] = useState<(Dashboard & { orgName?: string; isLegacy?: boolean })[]>([]);
  const [workspaces, setWorkspaces] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [dashboardsData, workspacesData] = await Promise.all([
          dashboardsService.listAll(),
          workspaceService.list(),
        ]);
        
        // Enriquecer dashboards com nome do workspace
        const enriched = dashboardsData.map(d => ({
          ...d,
          orgName: workspacesData.find(w => w.id === d.orgId)?.name || 'Desconhecido',
        }));
        
        // Adicionar dashboard legado da Afonsina
        const afonsinaOrg = workspacesData.find(w => w.id === AFONSINA_LEGACY_DASHBOARD.orgId);
        const allDashboards = [
          { ...AFONSINA_LEGACY_DASHBOARD, orgName: afonsinaOrg?.name || 'Afonsina' },
          ...enriched,
        ];
        
        setDashboards(allDashboards);
        setWorkspaces(workspacesData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredDashboards = dashboards.filter(d => {
    if (selectedOrg !== 'all' && d.orgId !== selectedOrg) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(searchLower) ||
        d.orgName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleAccessDashboard = async (dashboard: Dashboard & { isLegacy?: boolean }) => {
    if (dashboard.isLegacy) {
      // Redirecionar para o dashboard legado da Afonsina
      navigate('/dash/executivo');
    } else {
      // Navegar para o builder/visualização
      navigate(`/app/dashboards/${dashboard.id}`);
    }
  };

  const handleImpersonate = async (orgId: string) => {
    const org = workspaces.find(w => w.id === orgId);
    await impersonate(orgId, org?.name || 'Workspace');
    navigate('/app/dashboards');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Todos os Dashboards</h1>
          <p className="text-text-3 mt-1">Visualize e acesse dashboards de todos os workspaces</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
          <Input
            placeholder="Buscar dashboards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-bg-1 border-border"
          />
        </div>
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="h-10 px-3 rounded-lg bg-bg-1 border border-border text-text-1 text-sm"
        >
          <option value="all">Todos os Workspaces</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-bg-1 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pinn-orange-500/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-pinn-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{dashboards.length}</p>
              <p className="text-sm text-text-3">Total de Dashboards</p>
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
                {dashboards.filter(d => d.status === 'published').length}
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
                {dashboards.filter(d => d.status === 'draft').length}
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
      ) : filteredDashboards.length === 0 ? (
        <div className="text-center py-20">
          <LayoutDashboard className="w-16 h-16 mx-auto text-text-3 mb-4" />
          <h3 className="text-lg font-semibold text-text-1 mb-2">Nenhum Dashboard Encontrado</h3>
          <p className="text-text-3">Ajuste os filtros ou crie novos dashboards</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="p-4 rounded-xl bg-bg-1 border border-border hover:border-pinn-orange-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    dashboard.isLegacy ? "bg-success/10" : "bg-bg-2"
                  )}>
                    <LayoutDashboard className={cn(
                      "w-6 h-6",
                      dashboard.isLegacy ? "text-success" : "text-pinn-orange-500"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-text-1">{dashboard.name}</h3>
                      {dashboard.isLegacy && (
                        <Badge className="bg-success/10 text-success text-xs">
                          Legado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm text-text-3">
                        <Building2 className="w-3 h-3" />
                        <span>{dashboard.orgName}</span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          dashboard.status === 'published' 
                            ? "bg-success/10 text-success" 
                            : "bg-warning/10 text-warning"
                        )}
                      >
                        {dashboard.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                      {!dashboard.isLegacy && (
                        <span className="text-xs text-text-3">
                          {dashboard.widgets.length} widgets
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAccessDashboard(dashboard)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {dashboard.isLegacy ? 'Acessar Dashboard' : 'Visualizar'}
                  </Button>
                  {!dashboard.isLegacy && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImpersonate(dashboard.orgId)}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Acessar como
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Access to Afonsina */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-pinn-orange-500/10 to-pinn-orange-600/5 border border-pinn-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text-1 mb-1">Dashboard Legado Afonsina</h3>
            <p className="text-sm text-text-3">
              Acesse o dashboard original da Afonsina exatamente como foi criado
            </p>
          </div>
          <Button 
            onClick={() => navigate('/dash/executivo')}
            className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
          >
            Acessar Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
