/**
 * Admin: Lista de Workspaces
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, Filter, Plus, MoreVertical,
  Eye, Settings, UserPlus, Trash2, ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/services/workspaces';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import { Organization } from '@/types/saas';

function WorkspaceCard({ org, onView, onImpersonate }: { 
  org: Organization; 
  onView: () => void;
  onImpersonate: () => void;
}) {
  const planColors: Record<string, string> = {
    basic: 'bg-text-3/20 text-text-2',
    pro: 'bg-info/20 text-info',
    enterprise: 'bg-pinn-orange-500/20 text-pinn-orange-500',
  };

  return (
    <Card className="bg-bg-1 border-border hover:border-pinn-orange-500/30 transition-colors group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pinn-gradient flex items-center justify-center text-bg-0 font-bold text-lg">
              {org.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-text-1">{org.name}</h3>
              <p className="text-xs text-text-3">{org.slug}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-bg-1 border-border">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImpersonate}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar como
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Usuário
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Desativar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge className={cn("capitalize", planColors[org.plan] || planColors.basic)}>
            {org.plan}
          </Badge>
          <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className={org.status === 'active' ? 'bg-success/20 text-success' : ''}>
            {org.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-3">Criado em</p>
            <p className="text-text-1">{new Date(org.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-text-3">Última atualização</p>
            <p className="text-text-1">{new Date(org.updatedAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            <Eye className="w-4 h-4 mr-2" />
            Detalhes
          </Button>
          <Button size="sm" className="flex-1 bg-pinn-gradient text-bg-0" onClick={onImpersonate}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Acessar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminWorkspacesPage() {
  const navigate = useNavigate();
  const { impersonate } = useSaasAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['admin-workspaces', search, statusFilter, planFilter],
    queryFn: () => workspaceService.list({
      status: statusFilter !== 'all' ? statusFilter as any : undefined,
      plan: planFilter !== 'all' ? planFilter : undefined,
      search: search || undefined,
    }),
  });

  const handleImpersonate = async (org: Organization) => {
    await impersonate(org.id, org.name);
    // Redirecionar para o app do cliente
    navigate('/app/dashboards');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Workspaces</h1>
          <p className="text-text-3 mt-1">Gerencie os clientes da plataforma</p>
        </div>
        <Button className="bg-pinn-gradient text-bg-0">
          <Plus className="w-4 h-4 mr-2" />
          Novo Workspace
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-bg-1 border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg-2 border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-bg-2 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px] bg-bg-2 border-border">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-bg-1 border-border animate-pulse">
              <CardContent className="p-5 h-64" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces?.map((org) => (
            <WorkspaceCard
              key={org.id}
              org={org}
              onView={() => navigate(`/admin/workspaces/${org.id}`)}
              onImpersonate={() => handleImpersonate(org)}
            />
          ))}
          {workspaces?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Building2 className="w-12 h-12 text-text-3 mx-auto mb-4" />
              <p className="text-text-2">Nenhum workspace encontrado</p>
              <p className="text-text-3 text-sm">Tente ajustar os filtros ou criar um novo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
