import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Video, 
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MonthlyMeeting {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  summary: string;
  meeting_url: string;
  html_link: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
}

interface MeetingAttendance {
  meeting_id: string;
  attended: boolean;
}

// Hook para buscar reuniões do mês
export function useMonthlyMeetings(orgId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();
  
  return useQuery({
    queryKey: ['monthly-meetings', orgId, format(now, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vw_calendar_events_current_v3')
        .select('*')
        .eq('org_id', orgId)
        .neq('status', 'cancelled')
        .gte('start_at', monthStart)
        .lte('start_at', monthEnd)
        .order('start_at', { ascending: true });
      
      if (error) throw error;
      return data as MonthlyMeeting[];
    },
    enabled: !!orgId,
  });
}

// Hook para buscar status de comparecimento
function useMeetingAttendance(orgId: string) {
  return useQuery({
    queryKey: ['meeting-attendance', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_attendance')
        .select('meeting_id, attended')
        .eq('org_id', orgId)
        .eq('attended', true);
      
      if (error) throw error;
      
      // Retorna um Set dos IDs das reuniões realizadas
      const attendedIds = new Set<string>();
      data?.forEach((item: MeetingAttendance) => {
        if (item.attended) attendedIds.add(item.meeting_id);
      });
      return attendedIds;
    },
    enabled: !!orgId,
  });
}

// Hook para alternar status de comparecimento
function useToggleAttendance(orgId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ meetingId, attended }: { meetingId: string; attended: boolean }) => {
      if (attended) {
        // Marcar como realizada (upsert)
        const { error } = await supabase
          .from('meeting_attendance')
          .upsert({
            meeting_id: meetingId,
            org_id: orgId,
            attended: true,
            marked_at: new Date().toISOString()
          }, {
            onConflict: 'meeting_id,org_id'
          });
        
        if (error) throw error;
      } else {
        // Desmarcar (atualizar para false)
        const { error } = await supabase
          .from('meeting_attendance')
          .update({ attended: false, marked_at: new Date().toISOString() })
          .eq('meeting_id', meetingId)
          .eq('org_id', orgId);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { attended }) => {
      // Invalidar queries para atualizar KPIs e contagens
      queryClient.invalidateQueries({ queryKey: ['meeting-attendance', orgId] });
      queryClient.invalidateQueries({ queryKey: ['executive-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-meetings'] });
      
      if (attended) {
        toast.success('Reunião marcada como realizada!');
      } else {
        toast.info('Reunião desmarcada');
      }
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da reunião');
    }
  });
}

interface MonthlyMeetingsPanelProps {
  orgId: string;
  compact?: boolean;
}

export function MonthlyMeetingsPanel({ orgId, compact = false }: MonthlyMeetingsPanelProps) {
  const { data: meetings, isLoading: meetingsLoading } = useMonthlyMeetings(orgId);
  const { data: attendedIds, isLoading: attendanceLoading } = useMeetingAttendance(orgId);
  const toggleMutation = useToggleAttendance(orgId);
  
  const isLoading = meetingsLoading || attendanceLoading;
  
  const handleToggle = (meetingId: string, currentlyDone: boolean) => {
    toggleMutation.mutate({ meetingId, attended: !currentlyDone });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  
  if (!meetings?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
        <Calendar className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Nenhuma reunião este mês</p>
      </div>
    );
  }
  
  const now = new Date();
  const doneCount = attendedIds?.size || 0;
  const totalCount = meetings.length;
  
  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">
            {format(now, "MMM/yy", { locale: ptBR })}
          </span>
          <Badge variant="secondary" className="text-xs">
            {totalCount} reuniões
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          <span>{doneCount}/{totalCount}</span>
        </div>
      </div>
      
      {/* Meetings List - All meetings, scrollable */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {meetings.map((meeting) => {
          const startDate = parseISO(meeting.start_at);
          const isPast = startDate < now;
          const isDone = attendedIds?.has(meeting.id) || false;
          const isToggling = toggleMutation.isPending;
          
          // Determinar nome a exibir
          const displayName = meeting.lead_name?.trim() || 'Sem nome';
          
          return (
            <div 
              key={meeting.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg border transition-all",
                isDone && "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
                !isDone && isPast && "opacity-60"
              )}
            >
              {/* Date */}
              <div className="flex flex-col items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary flex-shrink-0">
                <span className="text-sm font-bold leading-none">{format(startDate, 'dd')}</span>
                <span className="text-[9px] uppercase">{format(startDate, 'MMM', { locale: ptBR })}</span>
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(startDate, 'HH:mm')} • {meeting.lead_phone || 'Sem telefone'}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {(meeting.meeting_url || meeting.html_link) && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={meeting.meeting_url || meeting.html_link} target="_blank" rel="noopener noreferrer">
                      <Video className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    isDone && "text-green-600"
                  )}
                  onClick={() => handleToggle(meeting.id, isDone)}
                  disabled={isToggling}
                >
                  <CheckCircle2 className={cn("w-4 h-4", isDone && "fill-current")} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
