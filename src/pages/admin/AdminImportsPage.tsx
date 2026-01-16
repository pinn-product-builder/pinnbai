/**
 * Admin: Lista de Importações de Dados
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Search, Filter, Plus, MoreVertical,
  Eye, RefreshCw, Download, FileSpreadsheet, FileJson,
  CheckCircle2, XCircle, Clock, Loader2, Database,
  AlertTriangle, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { importsService, DataImport, ImportStatus, FileType } from '@/services/imports';

// KPI Card Component
function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: { value: string; isPositive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const variantStyles = {
    default: 'text-pinn-orange-500',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <Card className="bg-bg-1 border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-text-3 text-sm mb-1">{title}</p>
            <p className="text-2xl font-bold text-text-1">{value}</p>
            {trend && (
              <p className={cn(
                "text-xs mt-1",
                trend.isPositive ? "text-success" : "text-danger"
              )}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            variant === 'default' && "bg-pinn-orange-500/15",
            variant === 'success' && "bg-success/15",
            variant === 'warning' && "bg-warning/15",
            variant === 'danger' && "bg-danger/15",
          )}>
            <Icon className={cn("w-5 h-5", variantStyles[variant])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: ImportStatus }) {
  const config: Record<ImportStatus, { label: string; icon: React.ElementType; className: string }> = {
    pending: { 
      label: 'Pendente', 
      icon: Clock, 
      className: 'bg-text-3/20 text-text-2' 
    },
    processing: { 
      label: 'Processando', 
      icon: Loader2, 
      className: 'bg-info/20 text-info' 
    },
    success: { 
      label: 'Concluída', 
      icon: CheckCircle2, 
      className: 'bg-success/20 text-success' 
    },
    error: { 
      label: 'Falhou', 
      icon: XCircle, 
      className: 'bg-danger/20 text-danger' 
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge className={cn("gap-1", className)}>
      <Icon className={cn("w-3 h-3", status === 'processing' && "animate-spin")} />
      {label}
    </Badge>
  );
}

// File Type Badge
function FileTypeBadge({ type }: { type: FileType }) {
  const config: Record<FileType, { icon: React.ElementType; className: string }> = {
    xlsx: { icon: FileSpreadsheet, className: 'bg-success/20 text-success' },
    xls: { icon: FileSpreadsheet, className: 'bg-success/20 text-success' },
    csv: { icon: FileSpreadsheet, className: 'bg-info/20 text-info' },
    json: { icon: FileJson, className: 'bg-warning/20 text-warning' },
  };

  const { icon: Icon, className } = config[type];

  return (
    <Badge variant="outline" className={cn("gap-1 uppercase", className)}>
      <Icon className="w-3 h-3" />
      {type}
    </Badge>
  );
}

export default function AdminImportsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');

  // Query imports
  const { data: imports, isLoading: isLoadingImports } = useQuery({
    queryKey: ['admin-imports', search, statusFilter, fileTypeFilter],
    queryFn: () => importsService.list({
      status: statusFilter !== 'all' ? statusFilter as ImportStatus : undefined,
      file_type: fileTypeFilter !== 'all' ? fileTypeFilter as FileType : undefined,
      search: search || undefined,
    }),
  });

  // Query stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-imports-stats'],
    queryFn: () => importsService.getStats(),
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return '—';
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Importações</h1>
          <p className="text-text-3 mt-1">Gerencie uploads e processamento de dados</p>
        </div>
        <Button className="bg-pinn-gradient text-bg-0 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Importação
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Importações (30 dias)"
          value={stats?.total_imports_30d ?? '—'}
          icon={Upload}
          variant="default"
        />
        <KpiCard
          title="Datasets Ativos"
          value={stats?.active_datasets ?? '—'}
          icon={Database}
          variant="success"
        />
        <KpiCard
          title="Erros (7 dias)"
          value={stats?.errors_7d ?? '—'}
          icon={AlertTriangle}
          variant={stats?.errors_7d && stats.errors_7d > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          title="Última Execução"
          value={stats?.last_success ? formatDate(stats.last_success).split(',')[0] : '—'}
          icon={Calendar}
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card className="bg-bg-1 border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <Input
                placeholder="Buscar por nome do arquivo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg-2 border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-bg-2 border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="success">Concluída</SelectItem>
                <SelectItem value="error">Falhou</SelectItem>
              </SelectContent>
            </Select>
            <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
              <SelectTrigger className="w-[150px] bg-bg-2 border-border">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="xls">Excel (.xls)</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-bg-1 border-border">
        <CardContent className="p-0">
          {isLoadingImports ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-pinn-orange-500 animate-spin" />
            </div>
          ) : imports && imports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-text-3">Arquivo</TableHead>
                  <TableHead className="text-text-3">Tipo</TableHead>
                  <TableHead className="text-text-3">Status</TableHead>
                  <TableHead className="text-text-3 text-right">Linhas</TableHead>
                  <TableHead className="text-text-3 text-right">Colunas</TableHead>
                  <TableHead className="text-text-3">Data</TableHead>
                  <TableHead className="text-text-3 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((item) => (
                  <TableRow key={item.id} className="border-border hover:bg-bg-2/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-bg-2 flex items-center justify-center">
                          <FileSpreadsheet className="w-4 h-4 text-text-2" />
                        </div>
                        <div>
                          <p className="font-medium text-text-1">{item.file_name}</p>
                          <p className="text-xs text-text-3">ID: {item.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <FileTypeBadge type={item.file_type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                      {item.error_message && (
                        <p className="text-xs text-danger mt-1 max-w-[200px] truncate">
                          {item.error_message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-text-1 font-mono">
                      {formatNumber(item.rows_count)}
                    </TableCell>
                    <TableCell className="text-right text-text-1 font-mono">
                      {formatNumber(item.columns_count)}
                    </TableCell>
                    <TableCell className="text-text-2 text-sm">
                      {formatDate(item.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-bg-1 border-border">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reprocessar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar Log
                          </DropdownMenuItem>
                          {item.status === 'success' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-pinn-orange-500">
                                <Database className="w-4 h-4 mr-2" />
                                Abrir Dataset
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-bg-2 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-text-3" />
              </div>
              <h3 className="text-lg font-semibold text-text-1 mb-1">
                Nenhuma importação encontrada
              </h3>
              <p className="text-text-3 text-sm mb-6">
                {search || statusFilter !== 'all' || fileTypeFilter !== 'all'
                  ? 'Tente ajustar os filtros'
                  : 'Faça sua primeira importação de dados'}
              </p>
              <Button className="bg-pinn-gradient text-bg-0">
                <Plus className="w-4 h-4 mr-2" />
                Nova Importação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
