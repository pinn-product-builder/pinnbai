import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Video, 
  CheckCircle2,
  TrendingUp
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
  description: string;
  meeting_url: string;
  html_link: string;
  lead_name: string;
  lead_email: string;
  lead_phone: string;
  provider_event_id: string;
}

interface MeetingAttendance {
  meeting_id: string;
  attended: boolean;
}

// Emails e nomes a filtrar
const EXCLUDED_PATTERNS = [
  'recesso',
  'ph553479@gmail.com',
  'passisventura@gmail.com',
  '=passisventura@gmail.com',
  'pht544939@gmail.com',
  'pedro@outlook.com',
  'pedro@ponto.com',
  'roberto arruda'
];

function shouldExcludeMeeting(meeting: MonthlyMeeting): boolean {
  const summary = (meeting.summary || '').toLowerCase();
  const description = (meeting.description || '').toLowerCase();
  
  return EXCLUDED_PATTERNS.some(pattern => 
    summary.includes(pattern.toLowerCase()) || 
    description.includes(pattern.toLowerCase())
  );
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
        .eq('status', 'confirmed')
        .gte('start_at', monthStart)
        .lte('start_at', monthEnd)
        .order('start_at', { ascending: true });
      
      if (error) throw error;
      
      // Filtrar reuniões excluídas
      const filtered = (data as MonthlyMeeting[]).filter(m => !shouldExcludeMeeting(m));
      return filtered;
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
        const { error } = await supabase
          .from('meeting_attendance')
          .update({ attended: false, marked_at: new Date().toISOString() })
          .eq('meeting_id', meetingId)
          .eq('org_id', orgId);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { attended }) => {
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

// Extrair link da reunião do description ou html_link
function extractMeetingLink(meeting: MonthlyMeeting): string | null {
  // Primeiro tenta html_link
  if (meeting.html_link) return meeting.html_link;
  
  // Depois meeting_url
  if (meeting.meeting_url) return meeting.meeting_url;
  
  // Tenta extrair do description (Google Meet links)
  if (meeting.description) {
    const meetMatch = meeting.description.match(/https:\/\/meet\.google\.com\/[a-z-]+/i);
    if (meetMatch) return meetMatch[0];
    
    const zoomMatch = meeting.description.match(/https:\/\/[a-z]*\.?zoom\.us\/[^\s<"]+/i);
    if (zoomMatch) return zoomMatch[0];
  }
  
  return null;
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
  const doneCount = meetings.filter(m => attendedIds?.has(m.id)).length;
  const totalCount = meetings.length;
  const attendanceRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  
  return (
    <div className="space-y-3">
      {/* Summary with attendance rate */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium">
            {format(now, "MMMM/yy", { locale: ptBR })}
          </span>
          <Badge variant="secondary" className="text-xs">
            {totalCount} reuniões
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>{doneCount}/{totalCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span className="font-semibold text-blue-600">{attendanceRate}%</span>
          </div>
        </div>
      </div>
      
      {/* Meetings List - All meetings, scrollable */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {meetings.map((meeting) => {
          const startDate = parseISO(meeting.start_at);
          const isPast = startDate < now;
          const meetingId = meeting.provider_event_id || meeting.id;
          const isDone = attendedIds?.has(meetingId) || false;
          const isToggling = toggleMutation.isPending;
          
          // Usar summary como nome do lead
          const displayName = meeting.summary?.trim() || 'Sem nome';
          const meetingLink = extractMeetingLink(meeting);
          
          return (
            <div 
              key={meetingId}
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
                  {format(startDate, 'HH:mm')}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {meetingLink && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <a href={meetingLink} target="_blank" rel="noopener noreferrer" title="Abrir reunião">
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
                  onClick={() => handleToggle(meetingId, isDone)}
                  disabled={isToggling}
                  title={isDone ? "Desmarcar como realizada" : "Marcar como realizada"}
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
