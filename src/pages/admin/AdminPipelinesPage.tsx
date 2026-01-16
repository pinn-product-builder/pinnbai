/**
 * Admin: Pipelines
 */

import React, { useState } from 'react';
import { 
  GitBranch, Search, RefreshCw, CheckCircle2, 
  XCircle, Clock, Play, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { pipelinesService } from '@/services/pipelines';
import { workspaceService } from '@/services/workspaces';
import { cn } from '@/lib/utils';

export default function AdminPipelinesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: runs, isLoading, refetch } = useQuery({
    queryKey: ['admin-pipelines', statusFilter],
    queryFn: () => pipelinesService.listAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 50,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-pipeline-stats'],
    queryFn: () => pipelinesService.getStats(),
  });

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces-for-pipelines'],
    queryFn: () => workspaceService.list(),
  });

  const getWorkspaceName = (orgId: string) => {
    const ws = workspaces?.find(w => w.id === orgId);
    return ws?.name || 'Desconhecido';
  };

  const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    running: { icon: RefreshCw, color: 'bg-info/20 text-info', label: 'Em execução' },
    success: { icon: CheckCircle2, color: 'bg-success/20 text-success', label: 'Sucesso' },
    error: { icon: XCircle, color: 'bg-danger/20 text-danger', label: 'Erro' },
    pending: { icon: Clock, color: 'bg-warning/20 text-warning', label: 'Pendente' },
  };

  const typeLabels: Record<string, string> = {
    sync: 'Sincronização',
    refresh: 'Refresh',
    transform: 'Transformação',
  };

  const formatDuration = (startedAt: string, finishedAt?: string) => {
    const start = new Date(startedAt).getTime();
    const end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
    const diff = Math.round((end - start) / 1000);
    
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Pipelines</h1>
          <p className="text-text-3 mt-1">Monitore as execuções de sincronização e refresh</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{stats?.total || 0}</p>
              <p className="text-sm text-text-3">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-info animate-spin" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{stats?.running || 0}</p>
              <p className="text-sm text-text-3">Em execução</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{stats?.success || 0}</p>
              <p className="text-sm text-text-3">Sucesso</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{stats?.error || 0}</p>
              <p className="text-sm text-text-3">Com erro</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-bg-1 border-border">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-bg-2 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="running">Em execução</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs List */}
      <Card className="bg-bg-1 border-border">
        <CardHeader>
          <CardTitle>Execuções Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {runs?.map((run) => {
            const status = statusConfig[run.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            
            return (
              <div 
                key={run.id} 
                className="flex items-center justify-between p-4 rounded-xl bg-bg-2/50 hover:bg-bg-2 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", status.color.split(' ')[0])}>
                    <StatusIcon className={cn("w-5 h-5", run.status === 'running' && 'animate-spin', status.color.split(' ')[1])} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-1">{typeLabels[run.type] || run.type}</p>
                      <span className="text-text-3">•</span>
                      <p className="text-sm text-text-3">{getWorkspaceName(run.orgId)}</p>
                    </div>
                    <p className="text-xs text-text-3">
                      {new Date(run.startedAt).toLocaleString('pt-BR')}
                      {run.recordsProcessed && ` • ${run.recordsProcessed.toLocaleString()} registros`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={status.color}>{status.label}</Badge>
                  <span className="text-sm text-text-3 font-mono">
                    {formatDuration(run.startedAt, run.finishedAt)}
                  </span>
                  {run.status === 'error' && (
                    <Button size="sm" variant="outline">
                      <Play className="w-3 h-3 mr-1" />
                      Reprocessar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {(!runs || runs.length === 0) && (
            <p className="text-center text-text-3 py-8">Nenhuma execução encontrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
