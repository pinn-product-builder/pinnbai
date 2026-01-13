import React from 'react';
import { Calendar, GitCompare, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function GlobalFilterBar() {
  const { filters, setPeriod, setComparePrevious, setDateRange } = useGlobalFilters();

  const [dateRange, setDateRangeLocal] = React.useState<{ from?: Date; to?: Date }>({});

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRangeLocal(range);
      setDateRange(
        format(range.from, 'yyyy-MM-dd'),
        format(range.to, 'yyyy-MM-dd')
      );
    }
  };

  return (
    <div className="h-full flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Period Select */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={filters.period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-32 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="60d">60 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {filters.period === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2" />
                {dateRange.from && dateRange.to 
                  ? `${format(dateRange.from, 'dd/MM', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM', { locale: ptBR })}`
                  : 'Selecionar período'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange as any}
                onSelect={handleDateRangeSelect as any}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Compare Toggle */}
      <div className="flex items-center gap-3">
        <GitCompare className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Comparar período anterior</span>
        <Switch
          checked={filters.comparePrevious}
          onCheckedChange={setComparePrevious}
        />
      </div>
    </div>
  );
}
