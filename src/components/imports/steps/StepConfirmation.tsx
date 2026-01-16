/**
 * Step 4: Confirmação
 */

import React from 'react';
import { 
  FileSpreadsheet, Building2, Calendar, Table2, 
  Columns3, Hash, CheckCircle2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ImportWizardData } from '../ImportWizard';

interface StepConfirmationProps {
  wizardData: ImportWizardData;
  onDataChange: (updates: Partial<ImportWizardData>) => void;
}

export function StepConfirmation({ wizardData, onDataChange }: StepConfirmationProps) {
  const measures = wizardData.schema?.columns.filter(c => c.isMeasure) || [];
  const dimensions = wizardData.schema?.columns.filter(c => c.isDimension) || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-1 mb-1">
          Confirmar Dataset
        </h3>
        <p className="text-sm text-text-3">
          Revise e nomeie seu dataset antes de finalizar
        </p>
      </div>

      {/* Dataset Name & Description */}
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dataset-name" className="text-text-2">
            Nome do Dataset <span className="text-danger">*</span>
          </Label>
          <Input
            id="dataset-name"
            value={wizardData.datasetName}
            onChange={(e) => onDataChange({ datasetName: e.target.value })}
            placeholder="Ex: Vendas Janeiro 2025"
            className="bg-bg-2 border-border"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dataset-description" className="text-text-2">
            Descrição (opcional)
          </Label>
          <Textarea
            id="dataset-description"
            value={wizardData.datasetDescription}
            onChange={(e) => onDataChange({ datasetDescription: e.target.value })}
            placeholder="Descreva o conteúdo e finalidade deste dataset..."
            className="bg-bg-2 border-border resize-none h-20"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Info */}
        <div className="p-4 rounded-xl bg-bg-2 border border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pinn-orange-500/15 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-pinn-orange-500" />
            </div>
            <div>
              <p className="text-xs text-text-3">Arquivo</p>
              <p className="font-medium text-text-1 truncate max-w-[200px]">
                {wizardData.file?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/15 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-text-3">Workspace</p>
              <p className="font-medium text-text-1">
                {wizardData.workspace?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Data Stats */}
        <div className="p-4 rounded-xl bg-bg-2 border border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center">
              <Hash className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-text-3">Linhas</p>
              <p className="font-medium text-text-1">
                {wizardData.schema?.rowCount.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center">
              <Columns3 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-text-3">Colunas</p>
              <p className="font-medium text-text-1">
                {wizardData.schema?.columns.length} ({measures.length} medidas, {dimensions.length} dimensões)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Date */}
      {wizardData.primaryDateColumn && (
        <div className="p-4 rounded-xl bg-info/10 border border-info/20 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-info" />
          <div>
            <p className="text-sm font-medium text-text-1">
              Coluna de data principal: {wizardData.primaryDateColumn}
            </p>
            <p className="text-xs text-text-3">
              Será usada como eixo temporal nos gráficos
            </p>
          </div>
        </div>
      )}

      {/* Columns Preview */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-text-2">Colunas configuradas</p>
        <div className="flex flex-wrap gap-2">
          {wizardData.schema?.columns.map((col) => (
            <Badge 
              key={col.name}
              variant="outline"
              className={cn(
                "gap-1.5 py-1.5",
                col.isMeasure && "bg-success/10 border-success/30 text-success",
                col.isDimension && !col.isMeasure && "bg-info/10 border-info/30 text-info",
                !col.isMeasure && !col.isDimension && "bg-bg-2 border-border text-text-2"
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              {col.displayName}
            </Badge>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="p-4 rounded-xl bg-bg-2 border border-border">
        <p className="text-sm font-medium text-text-1 mb-3">Checklist</p>
        <div className="space-y-2">
          {[
            { label: 'Workspace selecionado', ok: !!wizardData.workspace },
            { label: 'Arquivo enviado', ok: !!wizardData.storagePath },
            { label: 'Esquema detectado', ok: !!wizardData.schema },
            { label: 'Nome do dataset definido', ok: wizardData.datasetName.trim().length > 0 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center",
                item.ok ? "bg-success text-bg-0" : "bg-bg-3 text-text-3"
              )}>
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <span className={cn(
                "text-sm",
                item.ok ? "text-text-1" : "text-text-3"
              )}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StepConfirmation;
