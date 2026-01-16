/**
 * Layout do Admin
 */

import React, { useState } from 'react';
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, FileText, GitBranch,
  ChevronLeft, ChevronRight, LogOut, Sun, Moon, Layers, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SAAS_ROUTES } from '@/lib/saasRoutes';

const PinnLogoIcon = () => (
  <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
    <path d="M6 2 L6 10 L18 22" stroke="#FF8A3D" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M26 30 L26 22 L14 10" stroke="#C84E0A" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const navItems = [
  { path: SAAS_ROUTES.ADMIN.VISAO_GERAL, label: 'Visão Geral', icon: LayoutDashboard },
  { path: SAAS_ROUTES.ADMIN.WORKSPACES, label: 'Workspaces', icon: Building2 },
  { path: SAAS_ROUTES.ADMIN.DASHBOARDS, label: 'Dashboards', icon: Layers },
  { path: SAAS_ROUTES.ADMIN.USUARIOS, label: 'Usuários', icon: Users },
  { path: SAAS_ROUTES.ADMIN.TEMPLATES, label: 'Templates', icon: FileText },
  { path: SAAS_ROUTES.ADMIN.PIPELINES, label: 'Pipelines', icon: GitBranch },
  { path: SAAS_ROUTES.ADMIN.IMPORTS, label: 'Importações', icon: Upload },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useSaasAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full z-40 transition-all duration-300",
        "bg-bg-1 border-r border-border",
        collapsed ? "w-16" : "w-60"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pinn-gradient flex items-center justify-center shadow-pinn-glow">
              <PinnLogoIcon />
            </div>
            {!collapsed && <span className="font-semibold text-lg text-text-1">Pinn Admin</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative",
                  isActive 
                    ? "bg-pinn-orange-500/12 border border-pinn-orange-500/25 text-text-1" 
                    : "text-text-2 hover:text-text-1 hover:bg-bg-2 border border-transparent"
                )}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-pinn-gradient" />}
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-pinn-orange-500")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-16 left-0 right-0 px-3 space-y-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-2 hover:text-text-1 hover:bg-bg-2"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {!collapsed && <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-text-3 hover:text-danger hover:bg-danger/10"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 rounded-full",
            "bg-bg-2 border border-border flex items-center justify-center text-text-3",
            "hover:bg-pinn-orange-500 hover:border-pinn-orange-500 hover:text-bg-0 transition-all"
          )}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "ml-16" : "ml-60")}>
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-bg-0/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-text-1">Painel Administrativo</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-2">{user?.email}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
