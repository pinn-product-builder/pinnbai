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
}

// Hook para buscar leads individuais
export function useLeadsList(orgId: string) {
  return useQuery({
    queryKey: ['leads-list', orgId],
    queryFn: async () => {
      // Tenta buscar da view de leads com detalhes do funil
      // Se não existir, tenta tabelas alternativas
      const tables = [
        'vw_leads_current', // View com leads atuais
        'leads', // Tabela base de leads
        'kommo_leads', // Leads do Kommo CRM
        'vw_funnel_leads_detail', // View detalhada do funil
      ];
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(500);
        
        if (!error && data && data.length > 0) {
          console.log(`Leads carregados da tabela: ${table}`);
          return { data, source: table };
        }
      }
      
      // Fallback: tentar sem filtro de org_id
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        
        if (!error && data && data.length > 0) {
          console.log(`Leads carregados da tabela (sem org_id): ${table}`);
          return { data, source: table };
        }
      }
      
      return { data: [], source: null };
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

export function LeadsTable({ orgId }: LeadsTableProps) {
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
            Não foi possível encontrar uma tabela de leads no banco de dados.
            <br />
            Tabelas tentadas: vw_leads_current, leads, kommo_leads, vw_funnel_leads_detail
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
              {filteredLeads.map((lead: Lead, index: number) => (
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
