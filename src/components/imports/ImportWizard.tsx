/**
 * Import Wizard - Wizard de importação de dados com 5 passos
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, Check, ArrowLeft, ArrowRight, X, Building2,
  FileSpreadsheet, FileJson, Table2, Sparkles, Loader2,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Organization } from '@/types/saas';
import { schemaService } from '@/services/schemaService';
import { dashboardsService } from '@/services/dashboards';
import { generateDashboardFromSchema } from '@/lib/dashboardGenerator';
import { toast } from 'sonner';

// Step Components
import { StepWorkspace } from './steps/StepWorkspace';
import { StepUpload } from './steps/StepUpload';
import { StepSchema } from './steps/StepSchema';
import { StepConfirmation } from './steps/StepConfirmation';
import { StepDashboard } from './steps/StepDashboard';

export interface ImportWizardData {
  workspace: Organization | null;
  file: File | null;
  storagePath: string | null;
  schema: DetectedSchema | null;
  datasetName: string;
  datasetDescription: string;
  primaryDateColumn: string | null;
  generateDashboard: boolean;
  dashboardTemplate: string | null;
}

export interface DetectedColumn {
  name: string;
  displayName: string;
  dataType: 'date' | 'datetime' | 'currency' | 'percent' | 'integer' | 'number' | 'text' | 'category' | 'id' | 'boolean';
  isMeasure: boolean;
  isDimension: boolean;
  isPrimaryDate: boolean;
  nullRatio: number;
  cardinality: number;
  sampleValues: string[];
}

export interface DetectedSchema {
  columns: DetectedColumn[];
  rowCount: number;
  previewData: Record<string, any>[];
}

interface ImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (importId: string) => void;
}

const STEPS = [
  { id: 1, title: 'Workspace', icon: Building2, description: 'Selecione o workspace' },
  { id: 2, title: 'Upload', icon: Upload, description: 'Envie seu arquivo' },
  { id: 3, title: 'Esquema', icon: Table2, description: 'Configure as colunas' },
  { id: 4, title: 'Confirmar', icon: Check, description: 'Revise e confirme' },
  { id: 5, title: 'Dashboard', icon: Sparkles, description: 'Gere um dashboard' },
];

export function ImportWizard({ open, onOpenChange, onComplete }: ImportWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [wizardData, setWizardData] = useState<ImportWizardData>({
    workspace: null,
    file: null,
    storagePath: null,
    schema: null,
    datasetName: '',
    datasetDescription: '',
    primaryDateColumn: null,
    generateDashboard: true,
    dashboardTemplate: 'auto',
  });

  const updateWizardData = useCallback((updates: Partial<ImportWizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return wizardData.workspace !== null;
      case 2:
        return wizardData.file !== null && wizardData.storagePath !== null;
      case 3:
        return wizardData.schema !== null;
      case 4:
        return wizardData.datasetName.trim().length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, wizardData]);

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - complete wizard
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const workspace = wizardData.workspace;
      const schema = wizardData.schema;
      
      if (!workspace || !schema) {
        throw new Error('Dados incompletos para finalizar importação');
      }

      // Tentar criar schema no backend (pode falhar se Edge Functions não estiverem deployadas)
      let schemaCreated = false;
      try {
        console.log('Criando/verificando schema do workspace:', workspace.slug);
        const schemaResult = await schemaService.createWorkspaceSchema(
          workspace.id,
          workspace.slug,
          workspace.name
        );
        
        if (schemaResult.success) {
          console.log('Schema criado/verificado:', schemaResult.schemaName);
          schemaCreated = true;

          // Preparar colunas para inserção
          const columns = schema.columns.map(col => ({
            name: col.name,
            dataType: col.dataType
          }));

          // Inserir dados no schema isolado do workspace
          const datasetId = `dataset-${Date.now()}`;
          const tableName = wizardData.datasetName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
          
          console.log('Inserindo dados no dataset:', tableName);
          const insertResult = await schemaService.insertImportedData(
            workspace.slug,
            datasetId,
            tableName,
            columns,
            schema.previewData
          );
          
          if (insertResult.success) {
            console.log('Dados inseridos:', insertResult.rowCount, 'linhas');
          }
        }
      } catch (backendErr) {
        console.warn('Backend não disponível, continuando com dashboard local:', backendErr);
        // Continua mesmo se o backend falhar - vamos criar o dashboard localmente
      }

      // Dataset ID para referência
      const datasetId = `dataset-${Date.now()}`;
      
      // Gerar dashboard automaticamente se solicitado
      let dashboardId: string | null = null;
      
      if (wizardData.generateDashboard) {
        console.log('Gerando dashboard automático...');
        
        const generatedDash = generateDashboardFromSchema({
          schema,
          datasetId,
          template: (wizardData.dashboardTemplate as 'auto' | 'sales' | 'analytics' | 'overview') || 'auto',
          primaryDateColumn: wizardData.primaryDateColumn,
        });

        const newDashboard = await dashboardsService.create({
          orgId: workspace.id,
          name: `${wizardData.datasetName} - ${generatedDash.name}`,
          description: generatedDash.description,
          widgets: generatedDash.widgets,
          status: 'draft',
        });

        dashboardId = newDashboard.id;
        console.log('Dashboard criado:', dashboardId, 'com', generatedDash.widgets.length, 'widgets');
        
        toast.success(
          `Dashboard "${newDashboard.name}" criado com ${generatedDash.widgets.length} visualizações!`,
          { duration: 5000 }
        );
      }
      
      if (schemaCreated) {
        toast.success(`Importação concluída! Dados salvos em ${workspace.name}`);
      } else {
        toast.info('Dashboard criado localmente. Configure o backend para persistir dados.');
      }
      
      const importId = datasetId;
      onComplete?.(importId);
      
      // Se criou dashboard, navegar para edição
      if (dashboardId) {
        handleClose();
        navigate(`/app/dashboards/${dashboardId}`);
      } else {
        handleClose();
      }
    } catch (err: any) {
      console.error('Erro na importação:', err);
      setError(err.message || 'Erro ao finalizar importação. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setWizardData({
      workspace: null,
      file: null,
      storagePath: null,
      schema: null,
      datasetName: '',
      datasetDescription: '',
      primaryDateColumn: null,
      generateDashboard: true,
      dashboardTemplate: 'auto',
    });
    setError(null);
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepWorkspace 
            selectedWorkspace={wizardData.workspace}
            onSelect={(ws) => updateWizardData({ workspace: ws })}
          />
        );
      case 2:
        return (
          <StepUpload
            workspace={wizardData.workspace!}
            file={wizardData.file}
            onUploadComplete={(file, storagePath, schema) => {
              updateWizardData({ 
                file, 
                storagePath,
                schema,
                datasetName: file.name.replace(/\.[^/.]+$/, ''),
              });
            }}
            onError={(err) => setError(err)}
          />
        );
      case 3:
        return (
          <StepSchema
            schema={wizardData.schema!}
            onSchemaChange={(schema) => updateWizardData({ schema })}
            primaryDateColumn={wizardData.primaryDateColumn}
            onPrimaryDateChange={(col) => updateWizardData({ primaryDateColumn: col })}
          />
        );
      case 4:
        return (
          <StepConfirmation
            wizardData={wizardData}
            onDataChange={updateWizardData}
          />
        );
      case 5:
        return (
          <StepDashboard
            wizardData={wizardData}
            onDataChange={updateWizardData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-bg-1 border-border p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-text-1">
              Nova Importação
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Steps Progress */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const Icon = step.icon;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      isActive && "bg-pinn-gradient text-bg-0",
                      isCompleted && "bg-success/20 text-success",
                      !isActive && !isCompleted && "bg-bg-2 text-text-3"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden md:block">
                      <p className={cn(
                        "font-medium text-sm",
                        isActive && "text-text-1",
                        !isActive && "text-text-3"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-xs text-text-3">{step.description}</p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-4",
                      step.id < currentStep ? "bg-success" : "bg-border"
                    )} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between border-t border-border mt-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isProcessing}
            className="border-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-2 text-sm text-text-3">
            Passo {currentStep} de {STEPS.length}
          </div>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isProcessing}
            className="bg-pinn-gradient text-bg-0 hover:opacity-90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : currentStep === 5 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Finalizar
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImportWizard;
