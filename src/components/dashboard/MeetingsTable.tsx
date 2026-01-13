import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, Calendar, User, Mail, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Meeting } from '@/types/dashboard';

interface MeetingsTableProps {
  meetings: Meeting[];
  isLoading?: boolean;
}

export function MeetingsTable({ meetings, isLoading }: MeetingsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/10">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
        <Calendar className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Nenhuma reunião agendada</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      confirmed: { label: 'Confirmado', variant: 'default' },
      pending: { label: 'Pendente', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'destructive' },
    };

    const { label, variant } = statusMap[status.toLowerCase()] || { label: status, variant: 'outline' as const };

    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-2">
      {meetings.map((meeting, index) => {
        const startDate = parseISO(meeting.start_at);
        const endDate = meeting.end_at ? parseISO(meeting.end_at) : null;
        
        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg",
              "bg-muted/5 border border-border/30",
              "hover:bg-muted/10 transition-colors"
            )}
          >
            {/* Date/Time */}
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary">
              <span className="text-lg font-bold">{format(startDate, 'dd')}</span>
              <span className="text-[10px] uppercase">{format(startDate, 'MMM', { locale: ptBR })}</span>
            </div>

            {/* Meeting Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground truncate">
                  {meeting.summary || 'Reunião sem título'}
                </h4>
                {getStatusBadge(meeting.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(startDate, 'HH:mm')}
                  {endDate && ` - ${format(endDate, 'HH:mm')}`}
                </span>
                {meeting.lead_name && (
                  <span className="flex items-center gap-1 truncate">
                    <User className="w-3 h-3" />
                    {meeting.lead_name}
                  </span>
                )}
                {meeting.lead_email && (
                  <span className="flex items-center gap-1 truncate max-w-32">
                    <Mail className="w-3 h-3" />
                    {meeting.lead_email}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {(meeting.meeting_url || meeting.html_link) && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1"
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
