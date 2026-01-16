/**
 * Página de Dashboards (App)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, Plus, Search, MoreVertical, Eye, Edit, Copy, Trash2, 
  CheckCircle, Clock, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { dashboardsService } from '@/services/dashboards';
import { Dashboard } from '@/types/saas';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DashboardsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orgId } = useSaasAuth();
  
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(searchParams.get('new') === 'true');
  const [newDashboard, setNewDashboard] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const loadDashboards = async () => {
    setLoading(true);
    try {
      const data = await dashboardsService.list(orgId || '', { search });
      setDashboards(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboards();
  }, [orgId, search]);

  const handleCreate = async () => {
    if (!newDashboard.name.trim()) return;
    
    setCreating(true);
    try {
      const created = await dashboardsService.create({
        orgId: orgId || '',
        name: newDashboard.name,
        description: newDashboard.description,
        status: 'draft',
        widgets: [],
      });
      setCreateDialogOpen(false);
      setNewDashboard({ name: '', description: '' });
      navigate(`/app/dashboards/${created.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (id: string) => {
    await dashboardsService.publish(id);
    loadDashboards();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Dashboards</h1>
          <p className="text-text-3 mt-1">Crie e gerencie seus dashboards personalizados</p>
        </div>
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Dashboard
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <Input
          placeholder="Buscar dashboards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-bg-1 border-border"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-pinn-orange-500" />
        </div>
      ) : dashboards.length === 0 ? (
        <div className="text-center py-20">
          <LayoutDashboard className="w-16 h-16 mx-auto text-text-3 mb-4" />
          <h3 className="text-lg font-semibold text-text-1 mb-2">Nenhum Dashboard</h3>
          <p className="text-text-3 mb-6">Crie seu primeiro dashboard para visualizar seus dados</p>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Dashboard
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="p-4 rounded-xl bg-bg-1 border border-border hover:border-pinn-orange-500/30 transition-all cursor-pointer group"
              onClick={() => navigate(`/app/dashboards/${dashboard.id}`)}
            >
              {/* Preview area */}
              <div className="aspect-video rounded-lg bg-bg-2 mb-4 flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
                  {dashboard.widgets.slice(0, 6).map((w, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "bg-bg-3 rounded",
                        w.type === 'kpi' && "col-span-1",
                        (w.type === 'line' || w.type === 'bar') && "col-span-2",
                        w.type === 'table' && "col-span-3"
                      )}
                    />
                  ))}
                  {dashboard.widgets.length === 0 && (
                    <div className="col-span-3 flex items-center justify-center">
                      <LayoutDashboard className="w-8 h-8 text-text-3" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-1 group-hover:text-pinn-orange-500 transition-colors">
                    {dashboard.name}
                  </h3>
                  {dashboard.description && (
                    <p className="text-sm text-text-3 mt-1 line-clamp-1">{dashboard.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs",
                        dashboard.status === 'published' 
                          ? "bg-success/10 text-success" 
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {dashboard.status === 'published' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Publicado</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Rascunho</>
                      )}
                    </Badge>
                    <span className="text-xs text-text-3">
                      {dashboard.widgets.length} widgets
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-bg-1 border-border">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/app/dashboards/${dashboard.id}`); }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    {dashboard.status === 'draft' && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePublish(dashboard.id); }}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Publicar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-bg-1 border-border">
          <DialogHeader>
            <DialogTitle className="text-text-1">Novo Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Dashboard Executivo"
                value={newDashboard.name}
                onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                className="bg-bg-2 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o propósito deste dashboard..."
                value={newDashboard.description}
                onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                className="bg-bg-2 border-border"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!newDashboard.name.trim() || creating}
              className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
