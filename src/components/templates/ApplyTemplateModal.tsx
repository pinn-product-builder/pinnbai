/**
 * Modal de Aplicar Template
 * Permite selecionar um dataset e criar um dashboard baseado no template
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Database, 
  ArrowRight, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dataSetsService } from '@/services/dataSets';
import { templatesService } from '@/services/templates';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SAAS_ROUTES } from '@/lib/saasRoutes';

interface ApplyTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  templateName: string;
  orgId?: string;
}

export function ApplyTemplateModal({
  open,
  onOpenChange,
  templateId,
  templateName,
  orgId = '073605bb-b60f-4928-b5b9-5fa149f35941', // Default para Afonsina
}: ApplyTemplateModalProps) {
  const navigate = useNavigate();
  const [selectedDataSet, setSelectedDataSet] = useState<string>('');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');

  // Buscar datasets disponíveis
  const { data: dataSets, isLoading: dataSetsLoading } = useQuery({
    queryKey: ['datasets-for-template', orgId],
    queryFn: () => dataSetsService.list(orgId, { status: 'published' }),
    enabled: open,
  });

  // Buscar detalhes do template
  const { data: template } = useQuery({
    queryKey: ['template-detail', templateId],
    queryFn: () => templatesService.getById(templateId),
    enabled: open,
  });

  // Mutation para aplicar template
  const applyMutation = useMutation({
    mutationFn: async () => {
      return templatesService.apply(templateId, selectedDataSet, orgId);
    },
    onSuccess: (result) => {
      setStep('success');
      toast.success('Dashboard criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar dashboard');
    },
  });

  const handleApply = () => {
    if (!selectedDataSet) {
      toast.error('Selecione um dataset');
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = () => {
    applyMutation.mutate();
  };

  const handleGoToDashboard = () => {
    onOpenChange(false);
    navigate(SAAS_ROUTES.ADMIN.DASHBOARDS);
  };

  const resetModal = () => {
    setStep('select');
    setSelectedDataSet('');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  const { level: complexityLevel, label: complexityLabel } = templatesService.getComplexityLevel(templateId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-bg-0 border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-text-1">
            <Layers className="w-5 h-5 text-pinn-orange-500" />
            Aplicar Template
          </DialogTitle>
          <DialogDescription className="text-text-3">
            {step === 'select' && 'Selecione um dataset para criar seu dashboard'}
            {step === 'confirm' && 'Confirme as configurações do seu novo dashboard'}
            {step === 'success' && 'Dashboard criado com sucesso!'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Selecionar Dataset */}
        {step === 'select' && (
          <div className="space-y-6 py-4">
            {/* Template selecionado */}
            <div className="p-4 rounded-xl bg-bg-1 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-3">Template selecionado</p>
                  <p className="font-semibold text-text-1">{templateName}</p>
                </div>
                <Badge className="bg-pinn-orange-500/20 text-pinn-orange-500">
                  Nível {complexityLevel}
                </Badge>
              </div>
              {template && (
                <div className="flex gap-4 mt-3 text-xs text-text-3">
                  <span>{template.widgets.length} widgets</span>
                  <span>{template.requiredMetrics.length} métricas</span>
                </div>
              )}
            </div>

            {/* Lista de Datasets */}
            <div className="space-y-3">
              <Label className="text-text-2">Selecione um Dataset</Label>
              
              {dataSetsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-bg-1 animate-pulse" />
                  ))}
                </div>
              ) : dataSets && dataSets.length > 0 ? (
                <RadioGroup value={selectedDataSet} onValueChange={setSelectedDataSet}>
                  <div className="space-y-2">
                    {dataSets.map((ds) => (
                      <label
                        key={ds.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                          selectedDataSet === ds.id
                            ? "border-pinn-orange-500 bg-pinn-orange-500/5"
                            : "border-border bg-bg-1 hover:border-pinn-orange-500/30"
                        )}
                      >
                        <RadioGroupItem value={ds.id} className="border-border" />
                        <Database className="w-5 h-5 text-text-3" />
                        <div className="flex-1">
                          <p className="font-medium text-text-1">{ds.name}</p>
                          <p className="text-xs text-text-3">{ds.columns?.length || 0} colunas • {ds.sourceName}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {ds.status}
                        </Badge>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-border text-center">
                  <Database className="w-10 h-10 text-text-3 mx-auto mb-3" />
                  <p className="text-text-2 font-medium">Nenhum dataset disponível</p>
                  <p className="text-xs text-text-3 mt-1">Crie um dataset primeiro para usar este template</p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleApply}
                disabled={!selectedDataSet}
                className="bg-pinn-gradient text-bg-0"
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmar */}
        {step === 'confirm' && (
          <div className="space-y-6 py-4">
            <div className="p-6 rounded-xl bg-bg-1 border border-border space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-pinn-orange-500" />
                <div>
                  <p className="font-semibold text-text-1">Pronto para criar!</p>
                  <p className="text-sm text-text-3">Revise as configurações abaixo</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-text-3">Template</span>
                  <span className="font-medium text-text-1">{templateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Dataset</span>
                  <span className="font-medium text-text-1">
                    {dataSets?.find(ds => ds.id === selectedDataSet)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Widgets</span>
                  <span className="font-medium text-text-1">{template?.widgets.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Atenção</p>
                <p className="text-text-3 mt-1">
                  As métricas do template serão mapeadas automaticamente para as colunas do dataset selecionado.
                  Você poderá ajustar manualmente depois.
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep('select')}>
                Voltar
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={applyMutation.isPending}
                className="bg-pinn-gradient text-bg-0"
              >
                {applyMutation.isPending ? 'Criando...' : 'Criar Dashboard'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Sucesso */}
        {step === 'success' && (
          <div className="space-y-6 py-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-text-1 mb-2">Dashboard Criado!</h3>
              <p className="text-text-3">
                Seu novo dashboard baseado no template <strong>{templateName}</strong> está pronto.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Fechar
              </Button>
              <Button 
                onClick={handleGoToDashboard}
                className="bg-pinn-gradient text-bg-0"
              >
                Ver Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
