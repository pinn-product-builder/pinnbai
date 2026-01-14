import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  TrendingUp, 
  Phone, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wrench,
  Monitor,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalFilterBar } from './GlobalFilterBar';
import { ViewModeDashboard } from './ViewModeDashboard';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  viewMode: boolean;
  setViewMode: (viewMode: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({ 
  collapsed: false, 
  setCollapsed: () => {},
  viewMode: false,
  setViewMode: () => {}
});

export const useSidebarContext = () => useContext(SidebarContext);

const navItems = [
  { path: '/dash/executivo', label: 'Executivo', icon: LayoutDashboard },
  { path: '/dash/conversas', label: 'Conversas', icon: MessageSquare },
  { path: '/dash/trafego', label: 'Tráfego', icon: TrendingUp },
  { path: '/dash/vapi', label: 'VAPI', icon: Phone },
  { path: '/dash/admin', label: 'Admin', icon: Settings },
  { path: '/dash/config', label: 'Config', icon: Wrench },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const location = useLocation();

  // Atalho de teclado ESC para sair do modo view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewMode) {
        setViewMode(false);
      }
      // Atalho F11 ou Ctrl+Shift+V para alternar modo view
      if ((e.key === 'F11' || (e.ctrlKey && e.shiftKey && e.key === 'V')) && !e.repeat) {
        e.preventDefault();
        setViewMode(!viewMode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  // Modo View - tela cheia sem sidebar com dashboard consolidado
  if (viewMode) {
    return (
      <SidebarContext.Provider value={{ collapsed, setCollapsed, viewMode, setViewMode }}>
        <div className="min-h-screen w-full bg-background relative">
          {/* Botão para sair do modo view - aparece no hover */}
          <div className="fixed top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300 group">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(false)}
                  className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background hover:border-primary"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Sair do modo apresentação (ESC)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Indicador sutil no canto */}
          <div className="fixed bottom-4 right-4 z-50 opacity-30 hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 text-xs text-muted-foreground">
              <Monitor className="w-3 h-3" />
              <span>Modo Apresentação</span>
              <span className="text-[10px] opacity-60">(ESC para sair)</span>
            </div>
          </div>

          {/* Dashboard Consolidado com auto-refresh */}
          <main className="w-full min-h-screen p-6 overflow-auto">
            <ViewModeDashboard refreshInterval={60} />
          </main>
        </div>
      </SidebarContext.Provider>
    );
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, viewMode, setViewMode }}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
            "bg-bg-1 border-r border-border",
            collapsed ? "w-16" : "w-60"
          )}
        >
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pinn-gradient flex items-center justify-center shadow-pinn-glow">
                <Sparkles className="w-4 h-4 text-bg-0" />
              </div>
              {!collapsed && (
                <span className="font-semibold text-lg text-gradient-primary">Pinn</span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
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
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-pinn-gradient" />
                  )}
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-pinn-orange-500")} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* View Mode Button */}
          <div className="absolute bottom-16 left-0 right-0 px-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setViewMode(true)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    "text-text-2 hover:text-text-1 hover:bg-bg-2",
                    "border border-dashed border-border hover:border-pinn-orange-500/50"
                  )}
                >
                  <Monitor className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>Modo View</span>}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="pinn-tooltip">
                <p>Apresentação em tela cheia (Ctrl+Shift+V)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 rounded-full",
              "bg-bg-2 border border-border",
              "flex items-center justify-center text-text-3",
              "hover:bg-pinn-orange-500 hover:border-pinn-orange-500 hover:text-bg-0",
              "transition-all duration-200"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </button>
        </aside>

        {/* Main Content */}
        <div 
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            collapsed ? "ml-16" : "ml-60"
          )}
        >
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-bg-0/80 backdrop-blur-xl">
            <GlobalFilterBar />
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}