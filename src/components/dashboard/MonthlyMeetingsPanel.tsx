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
}

export function MonthlyMeetingsPanel({ orgId }: MonthlyMeetingsPanelProps) {
  const queryClient = useQueryClient();
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }
  
  if (!meetings?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Calendar className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhuma reunião válida este mês</p>
      </div>
    );
  }
  
  const now = new Date();
  const doneCount = markedDone.size;
  const totalCount = meetings.length;
  
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalCount} reuniões
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">
            {doneCount} / {totalCount} realizadas
          </span>
        </div>
      </div>
      
      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map((meeting) => {
          const startDate = parseISO(meeting.start_at);
          const isPast = startDate < now;
          const isDone = markedDone.has(meeting.id);
          
          return (
            <Card 
              key={meeting.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                isDone && "ring-2 ring-green-500/50 bg-green-50/50 dark:bg-green-950/20",
                !isDone && isPast && "opacity-75"
              )}
            >
              {isDone && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Realizada
                  </Badge>
                </div>
              )}
              
              <CardContent className="p-4 space-y-3">
                {/* Date & Time */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                    <span className="text-lg font-bold leading-none">{format(startDate, 'dd')}</span>
                    <span className="text-[10px] uppercase">{format(startDate, 'MMM', { locale: ptBR })}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {format(startDate, 'EEEE', { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(startDate, 'HH:mm')}
                    </p>
                  </div>
                </div>
                
                {/* Lead Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm truncate">
                      {meeting.lead_name || meeting.summary || 'Lead sem nome'}
                    </span>
                  </div>
                  {meeting.lead_phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span>{meeting.lead_phone}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {(meeting.meeting_url || meeting.html_link) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1"
                      asChild
                    >
                      <a
                        href={meeting.meeting_url || meeting.html_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Video className="w-3 h-3" />
                        Entrar
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                  
                  <Button
                    variant={isDone ? "secondary" : "default"}
                    size="sm"
                    className={cn(
                      "flex-1 gap-1",
                      isDone && "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                    )}
                    onClick={() => toggleDone(meeting.id)}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {isDone ? 'Desfazer' : 'Realizada'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
