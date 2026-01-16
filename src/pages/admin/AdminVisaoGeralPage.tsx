/**
 * Admin: Visão Geral
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, Database, AlertTriangle, 
  Plus, ArrowRight, RefreshCw, Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/services/workspaces';
import { dataSetsService } from '@/services/dataSets';
import { usersService } from '@/services/users';
import { pipelinesService } from '@/services/pipelines';

// KPI Card Component
function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'orange' 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: string;
  color?: 'orange' | 'green' | 'blue' | 'red';
}) {
  const colorClasses = {
    orange: 'bg-pinn-orange-500/10 text-pinn-orange-500',
    green: 'bg-success/10 text-success',
    blue: 'bg-info/10 text-info',
    red: 'bg-danger/10 text-danger',
  };

  return (
    <Card className="bg-bg-1 border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-text-3">{title}</p>
            <p className="text-3xl font-bold text-text-1">{value}</p>
            {trend && <p className="text-xs text-text-3">{trend}</p>}
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Workspace Row Component
function WorkspaceRow({ 
  org, 
  onView 
}: { 
  org: any; 
  onView: () => void;
}) {
  const planColors: Record<string, string> = {
    basic: 'bg-text-3/20 text-text-2',
    pro: 'bg-info/20 text-info',
    enterprise: 'bg-pinn-orange-500/20 text-pinn-orange-500',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-bg-2/50 hover:bg-bg-2 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-pinn-gradient flex items-center justify-center text-bg-0 font-bold">
          {org.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-text-1">{org.name}</p>
          <p className="text-xs text-text-3">Atualizado {new Date(org.updatedAt).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge className={cn("capitalize", planColors[org.plan] || planColors.basic)}>
          {org.plan}
        </Badge>
        <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className={org.status === 'active' ? 'bg-success/20 text-success' : ''}>
          {org.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onView}>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminVisaoGeralPage() {
  const navigate = useNavigate();

  // Fetch data
  const { data: workspaces } = useQuery({
    queryKey: ['admin-workspaces'],
    queryFn: () => workspaceService.list(),
  });

  const { data: workspaceCount } = useQuery({
    queryKey: ['admin-workspace-count'],
    queryFn: () => workspaceService.getCount(),
  });

  const { data: userCount } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: () => usersService.getCount(),
  });

  const { data: dataSetCount } = useQuery({
    queryKey: ['admin-dataset-count'],
    queryFn: () => dataSetsService.getCount(),
  });

  const { data: pipelineStats } = useQuery({
    queryKey: ['admin-pipeline-stats'],
    queryFn: () => pipelinesService.getStats(),
  });

  const recentWorkspaces = workspaces?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Visão Geral</h1>
          <p className="text-text-3 mt-1">Acompanhe o status da plataforma</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button size="sm" className="bg-pinn-gradient text-bg-0">
            <Plus className="w-4 h-4 mr-2" />
            Novo Workspace
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Workspaces Ativos" 
          value={workspaceCount?.active || 0}
          icon={Building2}
          trend={`${workspaceCount?.total || 0} total`}
          color="orange"
        />
        <KpiCard 
          title="Usuários" 
          value={userCount || 0}
          icon={Users}
          color="blue"
        />
        <KpiCard 
          title="Datasets" 
          value={dataSetCount || 0}
          icon={Database}
          color="green"
        />
        <KpiCard 
          title="Execuções com Erro" 
          value={pipelineStats?.error || 0}
          icon={AlertTriangle}
          trend={`${pipelineStats?.running || 0} em execução`}
          color="red"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workspaces */}
        <div className="lg:col-span-2">
          <Card className="bg-bg-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Workspaces Recentes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/workspaces')}>
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentWorkspaces.map((org: any) => (
                <WorkspaceRow 
                  key={org.id} 
                  org={org} 
                  onView={() => navigate(`/admin/workspaces/${org.id}`)}
                />
              ))}
              {recentWorkspaces.length === 0 && (
                <p className="text-center text-text-3 py-8">Nenhum workspace encontrado</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="bg-bg-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/admin/workspaces')}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Criar Workspace
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/usuarios')}
              >
                <Users className="w-4 h-4 mr-2" />
                Convidar Usuário
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/admin/pipelines')}
              >
                <Activity className="w-4 h-4 mr-2" />
                Ver Pipelines
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-bg-1 border-border">
            <CardHeader>
              <CardTitle className="text-lg">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-2">API</span>
                <Badge className="bg-success/20 text-success">Operacional</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-2">Database</span>
                <Badge className="bg-success/20 text-success">Operacional</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-2">Pipelines</span>
                <Badge className="bg-success/20 text-success">Operacional</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
