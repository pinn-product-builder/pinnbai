import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  stage_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

interface LeadsTableProps {
  orgId: string;
  compact?: boolean;
}

// Hook para buscar leads individuais da tabela leads_v2
export function useLeadsList(orgId: string) {
  return useQuery({
    queryKey: ['leads-list', orgId],
    queryFn: async () => {
      // Buscar diretamente da tabela leads_v2
      const { data, error } = await supabase
        .from('leads_v2')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) {
        console.error('Erro ao buscar leads_v2:', error);
        throw error;
      }
      
      console.log(`Leads carregados: ${data?.length || 0}`);
      return { data: data || [], source: 'leads_v2' };
    },
    enabled: !!orgId,
  });
}

// Mapeamento de cores para etapas do funil
const stageColors: Record<string, string> = {
  'novo': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'entrada': 'bg-green-500/20 text-green-400 border-green-500/30',
  'desmarque': 'bg-red-500/20 text-red-400 border-red-500/30',
  'reuniao_agendada': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'reuniao_realizada': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

function getStageColor(stage: string | undefined): string {
  if (!stage) return 'bg-muted text-muted-foreground';
  const normalized = stage.toLowerCase().replace(/\s+/g, '_');
  return stageColors[normalized] || 'bg-muted text-muted-foreground';
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function LeadsTable({ orgId, compact = false }: LeadsTableProps) {
  const { data: result, isLoading, error } = useLeadsList(orgId);
  const [search, setSearch] = useState('');
  
  const leads = result?.data || [];
  const source = result?.source;
  
  // Filtrar leads por busca
  const filteredLeads = leads.filter((lead: Lead) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (lead.name?.toLowerCase().includes(searchLower)) ||
      (lead.email?.toLowerCase().includes(searchLower)) ||
      (lead.phone?.includes(search)) ||
      (lead.stage_name?.toLowerCase().includes(searchLower))
    );
  });

  const displayLeads = compact ? filteredLeads.slice(0, 8) : filteredLeads;

  if (error) {
    return (
      <div className="p-6 text-center text-destructive">
        <p>Erro ao carregar leads: {(error as Error).message}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Verifique se a tabela de leads existe e tem permissões corretas.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{filteredLeads.length} leads</span>
          </div>
          <div className="relative flex-1 max-w-[160px]">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 h-7 text-xs"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[280px] overflow-y-auto overflow-x-hidden pr-1">
            {displayLeads.map((lead: Lead, index: number) => (
              <div key={lead.id || index} className="flex items-center gap-3 p-2 rounded-lg border bg-card/50 hover:bg-muted/50">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-medium text-sm truncate">
                    {String(lead.name || lead.lead_name || '-')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {String(lead.phone || lead.lead_phone || lead.email || '-')}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs flex-shrink-0 ${getStageColor(lead.stage_name || lead.status)}`}
                >
                  {(lead.stage_name || lead.status || '-').slice(0, 10)}
                </Badge>
              </div>
            ))}
          </div>
        )}
        
        {filteredLeads.length > 8 && (
          <p className="text-xs text-center text-muted-foreground">
            +{filteredLeads.length - 8} leads
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">
            Leads ({filteredLeads.length})
          </h3>
          {source && (
            <Badge variant="outline" className="text-xs">
              {source}
            </Badge>
          )}
        </div>
        
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum lead encontrado</p>
          <p className="text-sm mt-2">
            A tabela leads_v2 está vazia ou não possui registros.
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] rounded-lg border border-border/50 bg-card/50">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLeads.map((lead: Lead, index: number) => (
                <TableRow key={lead.id || index} className="hover:bg-muted/50">
                  <TableCell className="text-muted-foreground text-sm">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {String(lead.name || lead.lead_name || '-')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {String(lead.email || lead.lead_email || '-')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {String(lead.phone || lead.lead_phone || '-')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStageColor(lead.stage_name || lead.status)}
                    >
                      {lead.stage_name || lead.status || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(lead.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}

export default LeadsTable;
