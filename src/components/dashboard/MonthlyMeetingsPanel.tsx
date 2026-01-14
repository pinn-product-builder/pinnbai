import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  ExternalLink, 
  Video, 
  CheckCircle2, 
  Clock, 
  User,
  Phone
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
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
  is_done?: boolean;
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

interface MonthlyMeetingsPanelProps {
  orgId: string;
  compact?: boolean;
}

export function MonthlyMeetingsPanel({ orgId, compact = false }: MonthlyMeetingsPanelProps) {
  const { data: meetings, isLoading } = useMonthlyMeetings(orgId);
  const [markedDone, setMarkedDone] = useState<Set<string>>(new Set());
  
  // Por enquanto, armazenamos localmente. Para persistir, precisaria de uma coluna na tabela
  const toggleDone = (meetingId: string) => {
    setMarkedDone(prev => {
      const newSet = new Set(prev);
      if (newSet.has(meetingId)) {
        newSet.delete(meetingId);
        toast.info('Reunião marcada como pendente');
      } else {
        newSet.add(meetingId);
        toast.success('Reunião marcada como realizada!');
      }
      return newSet;
    });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
  const doneCount = markedDone.size;
  const totalCount = meetings.length;
  const displayMeetings = compact ? meetings.slice(0, 5) : meetings;
  
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
      
      {/* Meetings List - Compact */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {displayMeetings.map((meeting) => {
          const startDate = parseISO(meeting.start_at);
          const isPast = startDate < now;
          const isDone = markedDone.has(meeting.id);
          
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
                  {meeting.lead_name || 'Lead sem nome'}
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
                  variant={isDone ? "ghost" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    isDone && "text-green-600"
                  )}
                  onClick={() => toggleDone(meeting.id)}
                >
                  <CheckCircle2 className={cn("w-4 h-4", isDone && "fill-current")} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      {compact && meetings.length > 5 && (
        <p className="text-xs text-center text-muted-foreground">
          +{meetings.length - 5} reuniões
        </p>
      )}
    </div>
  );
}
