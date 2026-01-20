/**
 * Step 1: Seleção de Workspace com opção de criar novo
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Loader2, Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { workspaceService } from '@/services/workspaces';
import { Organization } from '@/types/saas';
import { toast } from 'sonner';

interface StepWorkspaceProps {
  selectedWorkspace: Organization | null;
  onSelect: (workspace: Organization) => void;
}

export function StepWorkspace({ selectedWorkspace, onSelect }: StepWorkspaceProps) {
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    slug: '',
    plan: 'basic' as Organization['plan'],
  });

  const queryClient = useQueryClient();

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces-list', 'active'],
    queryFn: () => workspaceService.list({ status: 'active' }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Organization>) => workspaceService.create(data),
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces-list'] });
      toast.success('Workspace criado com sucesso!');
      onSelect(newOrg);
      setShowCreateForm(false);
      setNewWorkspace({ name: '', slug: '', plan: 'basic' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar workspace');
    },
  });

  const filteredWorkspaces = React.useMemo(() => {
    if (!workspaces) return [];
    if (!search) return workspaces;
    const s = search.toLowerCase();
    return workspaces.filter(ws => 
      ws.name.toLowerCase().includes(s) || 
      ws.slug.toLowerCase().includes(s)
    );
  }, [workspaces, search]);

  const planColors: Record<string, string> = {
    enterprise: 'bg-pinn-orange-500/20 text-pinn-orange-500',
    pro: 'bg-info/20 text-info',
    basic: 'bg-text-3/20 text-text-2',
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setNewWorkspace({ ...newWorkspace, name, slug });
  };

  const handleCreate = () => {
    if (!newWorkspace.name.trim()) {
      toast.error('Nome do workspace é obrigatório');
      return;
    }
    if (!newWorkspace.slug.trim()) {
      toast.error('Slug do workspace é obrigatório');
      return;
    }
    createMutation.mutate(newWorkspace);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-1 mb-1">
            Selecione o Workspace
          </h3>
          <p className="text-sm text-text-3">
            Escolha onde seus dados serão armazenados
          </p>
        </div>
        {!showCreateForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Workspace
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 rounded-xl border border-pinn-orange-500/50 bg-pinn-orange-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-text-1">Criar Novo Workspace</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCreateForm(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Nome *</Label>
              <Input
                id="ws-name"
                placeholder="Minha Empresa"
                value={newWorkspace.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-bg-2 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-slug">Slug *</Label>
              <Input
                id="ws-slug"
                placeholder="minha-empresa"
                value={newWorkspace.slug}
                onChange={(e) => setNewWorkspace({ ...newWorkspace, slug: e.target.value })}
                className="bg-bg-2 border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Plano</Label>
            <Select
              value={newWorkspace.plan}
              onValueChange={(value) => setNewWorkspace({ ...newWorkspace, plan: value as Organization['plan'] })}
            >
              <SelectTrigger className="bg-bg-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowCreateForm(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-pinn-gradient hover:opacity-90"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Criar Workspace
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <Input
          placeholder="Buscar workspace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-bg-2 border-border"
        />
      </div>

      {/* Workspace List */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-pinn-orange-500 animate-spin" />
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-10 h-10 text-text-3 mx-auto mb-2" />
            <p className="text-text-3">Nenhum workspace encontrado</p>
            {!showCreateForm && (
              <Button
                variant="link"
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-pinn-orange-500"
              >
                Criar novo workspace
              </Button>
            )}
          </div>
        ) : (
          filteredWorkspaces.map((ws) => {
            const isSelected = selectedWorkspace?.id === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => onSelect(ws)}
                className={cn(
                  "w-full p-4 rounded-xl border transition-all text-left",
                  "flex items-center justify-between gap-4",
                  isSelected 
                    ? "border-pinn-orange-500 bg-pinn-orange-500/10" 
                    : "border-border bg-bg-2 hover:border-text-3"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isSelected ? "bg-pinn-gradient text-bg-0" : "bg-bg-3 text-text-2"
                  )}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-1">{ws.name}</p>
                    <p className="text-sm text-text-3">/{ws.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={cn(planColors[ws.plan] || planColors.basic)}>
                    {ws.plan}
                  </Badge>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-4 h-4 text-bg-0" />
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StepWorkspace;
