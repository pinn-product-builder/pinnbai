import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalFilterBar } from './GlobalFilterBar';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({ collapsed: false, setCollapsed: () => {} });

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
  const location = useLocation();

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
            "bg-sidebar border-r border-sidebar-border",
            collapsed ? "w-16" : "w-60"
          )}
        >
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-primary">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
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
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-primary glow-primary"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "absolute bottom-4 right-0 translate-x-1/2 w-6 h-6 rounded-full",
              "bg-sidebar-accent border border-sidebar-border",
              "flex items-center justify-center",
              "hover:bg-primary hover:border-primary hover:text-primary-foreground",
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
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
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
