/**
 * Admin: Usuários
 */

import React, { useState } from 'react';
import { 
  Users, Search, Plus, MoreVertical, Mail,
  Shield, Edit, Trash2, UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/services/users';
import { workspaceService } from '@/services/workspaces';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/saas';

export default function AdminUsuariosPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => usersService.listAll({
      role: roleFilter !== 'all' ? roleFilter as UserRole : undefined,
      search: search || undefined,
    }),
  });

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces-for-users'],
    queryFn: () => workspaceService.list(),
  });

  const getWorkspaceName = (orgId?: string) => {
    if (!orgId) return 'Sem workspace';
    const ws = workspaces?.find(w => w.id === orgId);
    return ws?.name || orgId;
  };

  const roleLabels: Record<string, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-pinn-orange-500/20 text-pinn-orange-500' },
    org_admin: { label: 'Admin Org', color: 'bg-info/20 text-info' },
    editor: { label: 'Editor', color: 'bg-success/20 text-success' },
    viewer: { label: 'Visualizador', color: 'bg-text-3/20 text-text-2' },
    client_afonsina: { label: 'Cliente', color: 'bg-pinn-gold-500/20 text-pinn-gold-500' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Usuários</h1>
          <p className="text-text-3 mt-1">Gerencie todos os usuários da plataforma</p>
        </div>
        <Button className="bg-pinn-gradient text-bg-0">
          <Plus className="w-4 h-4 mr-2" />
          Convidar Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">{users?.length || 0}</p>
              <p className="text-sm text-text-3">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-pinn-orange-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-pinn-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">
                {users?.filter(u => u.role === 'super_admin').length || 0}
              </p>
              <p className="text-sm text-text-3">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">
                {users?.filter(u => u.lastLoginAt).length || 0}
              </p>
              <p className="text-sm text-text-3">Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-bg-1 border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-pinn-gold-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-pinn-gold-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1">
                {users?.filter(u => !u.lastLoginAt).length || 0}
              </p>
              <p className="text-sm text-text-3">Pendentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-bg-1 border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg-2 border-border"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-bg-2 border-border">
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                <SelectItem value="all">Todas as funções</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="org_admin">Admin Org</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
                <SelectItem value="client_afonsina">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-bg-1 border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-text-3">Usuário</TableHead>
                <TableHead className="text-text-3">Workspace</TableHead>
                <TableHead className="text-text-3">Função</TableHead>
                <TableHead className="text-text-3">Último acesso</TableHead>
                <TableHead className="text-text-3 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pinn-gradient flex items-center justify-center text-bg-0 text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-1">{user.name}</p>
                        <p className="text-xs text-text-3">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-2 text-sm">
                    {getWorkspaceName(user.orgId)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(roleLabels[user.role]?.color || roleLabels.viewer.color)}>
                      {roleLabels[user.role]?.label || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-3 text-sm">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Nunca'
                    }
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-bg-1 border-border">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2" />
                          Alterar Função
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-danger">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {(!users || users.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-text-3">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
