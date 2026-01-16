/**
 * Step 1: Seleção de Workspace
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Check, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { workspaceService } from '@/services/workspaces';
import { Organization } from '@/types/saas';

interface StepWorkspaceProps {
  selectedWorkspace: Organization | null;
  onSelect: (workspace: Organization) => void;
}

export function StepWorkspace({ selectedWorkspace, onSelect }: StepWorkspaceProps) {
  const [search, setSearch] = React.useState('');

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces-list', 'active'],
    queryFn: () => workspaceService.list({ status: 'active' }),
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text-1 mb-1">
          Selecione o Workspace
        </h3>
        <p className="text-sm text-text-3">
          Escolha onde seus dados serão armazenados
        </p>
      </div>

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
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-pinn-orange-500 animate-spin" />
          </div>
        ) : filteredWorkspaces.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-10 h-10 text-text-3 mx-auto mb-2" />
            <p className="text-text-3">Nenhum workspace encontrado</p>
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
