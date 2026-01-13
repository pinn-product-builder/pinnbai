import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import type { GlobalFilters, PeriodFilter } from '@/types/dashboard';

const DEFAULT_ORG_ID = '073605bb-b60f-4928-b5b9-5fa149f35941';

export function useGlobalFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: GlobalFilters = useMemo(() => ({
    orgId: searchParams.get('org') || DEFAULT_ORG_ID,
    period: (searchParams.get('period') as PeriodFilter) || '30d',
    startDate: searchParams.get('start') || undefined,
    endDate: searchParams.get('end') || undefined,
    comparePrevious: searchParams.get('compare') === 'true',
    source: searchParams.get('source') || undefined,
  }), [searchParams]);

  const setFilters = useCallback((updates: Partial<GlobalFilters>) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      
      if (updates.orgId !== undefined) {
        if (updates.orgId) newParams.set('org', updates.orgId);
        else newParams.delete('org');
      }
      
      if (updates.period !== undefined) {
        newParams.set('period', updates.period);
      }
      
      if (updates.startDate !== undefined) {
        if (updates.startDate) newParams.set('start', updates.startDate);
        else newParams.delete('start');
      }
      
      if (updates.endDate !== undefined) {
        if (updates.endDate) newParams.set('end', updates.endDate);
        else newParams.delete('end');
      }
      
      if (updates.comparePrevious !== undefined) {
        if (updates.comparePrevious) newParams.set('compare', 'true');
        else newParams.delete('compare');
      }
      
      if (updates.source !== undefined) {
        if (updates.source) newParams.set('source', updates.source);
        else newParams.delete('source');
      }
      
      return newParams;
    });
  }, [setSearchParams]);

  const setOrgId = useCallback((orgId: string) => setFilters({ orgId }), [setFilters]);
  const setPeriod = useCallback((period: PeriodFilter) => setFilters({ period }), [setFilters]);
  const setComparePrevious = useCallback((compare: boolean) => setFilters({ comparePrevious: compare }), [setFilters]);
  const setDateRange = useCallback((start: string, end: string) => setFilters({ startDate: start, endDate: end, period: 'custom' }), [setFilters]);

  return {
    filters,
    setFilters,
    setOrgId,
    setPeriod,
    setComparePrevious,
    setDateRange,
  };
}
