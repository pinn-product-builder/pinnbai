/**
 * Página de Edição de Dashboard
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardBuilder } from '@/components/app/DashboardBuilder';
import { dashboardsService } from '@/services/dashboards';
import { dataSetsService } from '@/services/dataSets';
import { Dashboard, DataSet } from '@/types/saas';
import { useSaasAuth } from '@/contexts/SaasAuthContext';
import { toast } from 'sonner';

export default function DashboardEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orgId } = useSaasAuth();
  
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [dataSets, setDataSets] = useState<DataSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [dashboardData, dataSetsData] = await Promise.all([
          dashboardsService.getById(id),
          dataSetsService.list(orgId || ''),
        ]);
        setDashboard(dashboardData);
        setDataSets(dataSetsData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, orgId]);

  const handleSave = async (widgets: Dashboard['widgets']) => {
    if (!dashboard) return;
    
    await dashboardsService.update(dashboard.id, { widgets });
    toast.success('Dashboard salvo com sucesso!');
  };

  const handlePreview = () => {
    // Open in new tab or modal
    window.open(`/app/dashboards/${id}/preview`, '_blank');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pinn-orange-500" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-text-3 mb-4">Dashboard não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/app/dashboards')}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] -m-6">
      <DashboardBuilder
        dashboardId={dashboard.id}
        dashboardName={dashboard.name}
        initialWidgets={dashboard.widgets}
        dataSets={dataSets}
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </div>
  );
}
