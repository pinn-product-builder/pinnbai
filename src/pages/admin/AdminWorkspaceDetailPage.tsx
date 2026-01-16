/**
 * Admin: Detalhe do Workspace
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Users, Database, BarChart3,
  Settings, RefreshCw, MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/services/workspaces';
import { usersService } from '@/services/users';
import { dataSetsService } from '@/services/dataSets';
import { dashboardsService } from '@/services/dashboards';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import { cn } from '@/lib/utils';

export default function AdminWorkspaceDetailPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { impersonate } = useSaasAuth();

  const { data: org, isLoading } = useQuery({
    queryKey: ['workspace', orgId],
    queryFn: () => workspaceService.getById(orgId!),
    enabled: !!orgId,
  });

  const { data: stats } = useQuery({
    queryKey: ['workspace-stats', orgId],
    queryFn: () => workspaceService.getStats(orgId!),
    enabled: !!orgId,
  });

  const { data: users } = useQuery({
    queryKey: ['workspace-users', orgId],
    queryFn: () => usersService.listByOrg(orgId!),
    enabled: !!orgId,
  });

  const { data: dataSets } = useQuery({
    queryKey: ['workspace-datasets', orgId],
    queryFn: () => dataSetsService.list(orgId!),
    enabled: !!orgId,
  });

  const { data: dashboards } = useQuery({
    queryKey: ['workspace-dashboards', orgId],
    queryFn: () => dashboardsService.list(orgId!),
    enabled: !!orgId,
  });

  const handleImpersonate = async () => {
    if (org) {
      await impersonate(org.id, org.name);
      navigate('/app/dashboards');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-pinn-orange-500" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-12">
        <p className="text-text-2">Workspace não encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/workspaces')}>
          Voltar
        </Button>
      </div>
    );
  }

  const planColors: Record<string, string> = {
    basic: 'bg-text-3/20 text-text-2',
    pro: 'bg-info/20 text-info',
    enterprise: 'bg-pinn-orange-500/20 text-pinn-orange-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/workspaces')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pinn-gradient flex items-center justify-center text-bg-0 font-bold text-lg">
              {org.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-1">{org.name}</h1>
              <p className="text-text-3">{org.slug}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button className="bg-pinn-gradient text-bg-0" onClick={handleImpersonate}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Acessar como
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-3">Status</p>
                <Badge className={org.status === 'active' ? 'bg-success/20 text-success mt-1' : 'bg-text-3/20 text-text-2 mt-1'}>
                  {org.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <Badge className={cn("capitalize", planColors[org.plan])}>
                {org.plan}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{stats?.users || 0}</p>
              <p className="text-sm text-text-3">Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{stats?.dataSets || 0}</p>
              <p className="text-sm text-text-3">Datasets</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-pinn-orange-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-pinn-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{stats?.dashboards || 0}</p>
              <p className="text-sm text-text-3">Dashboards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-bg-1 border border-border">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-bg-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuários do Workspace</CardTitle>
              <Button size="sm" variant="outline">Convidar</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-2/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pinn-gradient flex items-center justify-center text-bg-0 text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-1">{user.name}</p>
                        <p className="text-xs text-text-3">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{user.role.replace('_', ' ')}</Badge>
                  </div>
                ))}
                {(!users || users.length === 0) && (
                  <p className="text-center text-text-3 py-4">Nenhum usuário encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards">
          <Card className="bg-bg-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dashboards</CardTitle>
              <Button size="sm" variant="outline">Criar</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboards?.map((dash) => (
                  <div key={dash.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-2/50">
                    <div>
                      <p className="text-sm font-medium text-text-1">{dash.name}</p>
                      <p className="text-xs text-text-3">{dash.description}</p>
                    </div>
                    <Badge variant={dash.status === 'published' ? 'default' : 'secondary'}>
                      {dash.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                ))}
                {(!dashboards || dashboards.length === 0) && (
                  <p className="text-center text-text-3 py-4">Nenhum dashboard encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets">
          <Card className="bg-bg-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Datasets</CardTitle>
              <Button size="sm" variant="outline">Criar</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataSets?.map((ds) => (
                  <div key={ds.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-2/50">
                    <div>
                      <p className="text-sm font-medium text-text-1">{ds.name}</p>
                      <p className="text-xs text-text-3">Fonte: {ds.sourceName}</p>
                    </div>
                    <Badge variant={ds.status === 'published' ? 'default' : 'secondary'}>
                      {ds.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                ))}
                {(!dataSets || dataSets.length === 0) && (
                  <p className="text-center text-text-3 py-4">Nenhum dataset encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
