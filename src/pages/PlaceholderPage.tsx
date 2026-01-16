/**
 * Página placeholder para rotas do Admin/App
 * Será substituída por páginas completas
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

export function PlaceholderPage() {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('visao-geral')) return 'Visão Geral';
    if (path.includes('workspaces')) return 'Workspaces';
    if (path.includes('usuarios')) return 'Usuários';
    if (path.includes('templates')) return 'Templates';
    if (path.includes('pipelines')) return 'Pipelines';
    if (path.includes('dashboards')) return 'Dashboards';
    if (path.includes('data-sources')) return 'Data Sources';
    if (path.includes('data-sets')) return 'Data Sets';
    if (path.includes('configuracoes')) return 'Configurações';
    return 'Página';
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-pinn-orange-500/10 flex items-center justify-center mx-auto">
          <Construction className="w-8 h-8 text-pinn-orange-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-1">{getPageTitle()}</h1>
        <p className="text-text-3 max-w-md">
          Esta página está em construção. Em breve você terá acesso completo a todas as funcionalidades.
        </p>
        <p className="text-xs text-text-3/60 font-mono">{location.pathname}</p>
      </div>
    </div>
  );
}
