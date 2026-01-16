/**
 * Wizard de criação de Data Source
 */

import React, { useState } from 'react';
import { 
  Upload, Database, Server, ChevronRight, ChevronLeft, 
  Check, FileSpreadsheet, Loader2, AlertCircle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dataSourcesService } from '@/services/dataSources';
import { DataSourceType } from '@/types/saas';

interface DataSourceWizardProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  onSuccess?: () => void;
}

const DATA_SOURCE_TYPES: { type: DataSourceType; label: string; icon: React.ElementType; description: string; comingSoon?: boolean }[] = [
  { type: 'upload', label: 'Upload de Arquivo', icon: FileSpreadsheet, description: 'Importar Excel (.xlsx) ou CSV' },
  { type: 'supabase', label: 'Supabase', icon: Database, description: 'Conectar projeto Supabase existente' },
  { type: 'postgres', label: 'PostgreSQL', icon: Server, description: 'Conexão direta com banco PostgreSQL' },
  { type: 'mysql', label: 'MySQL', icon: Server, description: 'Conexão direta com banco MySQL' },
];

const STEPS = ['Tipo', 'Configuração', 'Detalhes'];

export function DataSourceWizard({ open, onClose, orgId, onSuccess }: DataSourceWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<DataSourceType | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [details, setDetails] = useState({ name: '', description: '', tags: '' });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][] | null>(null);

  const resetWizard = () => {
    setStep(0);
    setSelectedType(null);
    setConfig({});
    setDetails({ name: '', description: '', tags: '' });
    setTestResult(null);
    setUploadedFile(null);
    setPreviewData(null);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setConfig({
        fileName: file.name,
        fileType: file.name.endsWith('.xlsx') ? 'xlsx' : 'csv',
      });
      // Mock preview data
      setPreviewData([
        ['Nome', 'Email', 'Valor', 'Data'],
        ['João Silva', 'joao@email.com', 'R$ 1.500', '2024-01-15'],
        ['Maria Santos', 'maria@email.com', 'R$ 2.300', '2024-01-16'],
        ['Pedro Oliveira', 'pedro@email.com', 'R$ 890', '2024-01-17'],
      ]);
      setDetails(prev => ({ ...prev, name: file.name.replace(/\.(xlsx|csv)$/i, '') }));
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await dataSourcesService.testConnection(config);
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType) return;
    
    setSaving(true);
    try {
      await dataSourcesService.create({
        orgId,
        name: details.name,
        description: details.description,
        type: selectedType,
        config,
        tags: details.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onSuccess?.();
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return selectedType !== null;
    if (step === 1) {
      if (selectedType === 'upload') return uploadedFile !== null;
      if (selectedType === 'supabase') return config.projectUrl && config.schema;
      if (selectedType === 'postgres' || selectedType === 'mysql') {
        return config.host && config.port && config.database && config.username;
      }
    }
    if (step === 2) return details.name.trim() !== '';
    return true;
  };

  const renderStepContent = () => {
    // Step 1: Select Type
    if (step === 0) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {DATA_SOURCE_TYPES.map((item) => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              disabled={item.comingSoon}
              className={cn(
                "p-6 rounded-xl border-2 text-left transition-all duration-200",
                selectedType === item.type
                  ? "border-pinn-orange-500 bg-pinn-orange-500/10"
                  : "border-border hover:border-pinn-orange-500/50 bg-bg-2",
                item.comingSoon && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  selectedType === item.type ? "bg-pinn-orange-500 text-white" : "bg-bg-3 text-text-2"
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-text-1">{item.label}</h4>
                  {item.comingSoon && <span className="text-xs text-text-3">Em breve</span>}
                </div>
              </div>
              <p className="text-sm text-text-3">{item.description}</p>
            </button>
          ))}
        </div>
      );
    }

    // Step 2: Configuration
    if (step === 1) {
      if (selectedType === 'upload') {
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-pinn-orange-500/50 transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto text-text-3 mb-4" />
                <p className="text-text-1 font-medium mb-1">
                  {uploadedFile ? uploadedFile.name : 'Arraste um arquivo ou clique para selecionar'}
                </p>
                <p className="text-sm text-text-3">Suporta Excel (.xlsx) e CSV</p>
              </label>
            </div>

            {previewData && (
              <div className="space-y-3">
                <h4 className="font-medium text-text-1">Preview das primeiras linhas</h4>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-bg-2">
                      <tr>
                        {previewData[0].map((header, i) => (
                          <th key={i} className="px-4 py-2 text-left text-text-2 font-medium">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(1).map((row, i) => (
                        <tr key={i} className="border-t border-border">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2 text-text-1">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {config.fileType === 'xlsx' && (
              <div className="space-y-2">
                <Label>Aba do Excel</Label>
                <Input
                  placeholder="Sheet1"
                  value={config.sheet || ''}
                  onChange={(e) => setConfig({ ...config, sheet: e.target.value })}
                />
              </div>
            )}

            {config.fileType === 'csv' && (
              <div className="space-y-2">
                <Label>Delimitador</Label>
                <Input
                  placeholder=","
                  value={config.delimiter || ','}
                  onChange={(e) => setConfig({ ...config, delimiter: e.target.value })}
                  className="w-24"
                />
              </div>
            )}
          </div>
        );
      }

      if (selectedType === 'supabase') {
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>URL do Projeto Supabase</Label>
              <Input
                placeholder="https://xxxxx.supabase.co"
                value={config.projectUrl || ''}
                onChange={(e) => setConfig({ ...config, projectUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Chave Anon (pública)</Label>
              <Input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={config.anonKey || ''}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Schema</Label>
              <Input
                placeholder="public"
                value={config.schema || 'public'}
                onChange={(e) => setConfig({ ...config, schema: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !config.projectUrl}
              className="mt-4"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Testar Conexão
            </Button>
            {testResult && (
              <div className={cn(
                "p-3 rounded-lg flex items-center gap-2 text-sm",
                testResult.success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}>
                {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {testResult.message}
              </div>
            )}
          </div>
        );
      }

      if (selectedType === 'postgres' || selectedType === 'mysql') {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host</Label>
                <Input
                  placeholder="db.example.com"
                  value={config.host || ''}
                  onChange={(e) => setConfig({ ...config, host: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Porta</Label>
                <Input
                  type="number"
                  placeholder={selectedType === 'postgres' ? '5432' : '3306'}
                  value={config.port || ''}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Database</Label>
              <Input
                placeholder="nome_do_banco"
                value={config.database || ''}
                onChange={(e) => setConfig({ ...config, database: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usuário</Label>
                <Input
                  placeholder="postgres"
                  value={config.username || ''}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={config.password || ''}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={config.ssl || false}
                onCheckedChange={(checked) => setConfig({ ...config, ssl: checked })}
              />
              <Label>Usar SSL</Label>
            </div>
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !config.host || !config.database}
              className="mt-4"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Testar Conexão
            </Button>
            {testResult && (
              <div className={cn(
                "p-3 rounded-lg flex items-center gap-2 text-sm",
                testResult.success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
              )}>
                {testResult.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {testResult.message}
              </div>
            )}
          </div>
        );
      }
    }

    // Step 3: Details
    if (step === 2) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Data Source *</Label>
            <Input
              placeholder="Ex: CRM Principal, Meta Ads Junho"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descreva a origem e o propósito deste data source..."
              value={details.description}
              onChange={(e) => setDetails({ ...details, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags (separadas por vírgula)</Label>
            <Input
              placeholder="crm, vendas, leads"
              value={details.tags}
              onChange={(e) => setDetails({ ...details, tags: e.target.value })}
            />
          </div>

          <div className="mt-6 p-4 rounded-lg bg-bg-2 border border-border">
            <h4 className="font-medium text-text-1 mb-3">Resumo</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-3">Tipo:</span>
                <span className="text-text-1">{DATA_SOURCE_TYPES.find(t => t.type === selectedType)?.label}</span>
              </div>
              {selectedType === 'upload' && uploadedFile && (
                <div className="flex justify-between">
                  <span className="text-text-3">Arquivo:</span>
                  <span className="text-text-1">{uploadedFile.name}</span>
                </div>
              )}
              {(selectedType === 'postgres' || selectedType === 'mysql') && config.host && (
                <div className="flex justify-between">
                  <span className="text-text-3">Conexão:</span>
                  <span className="text-text-1">{config.host}:{config.port}/{config.database}</span>
                </div>
              )}
              {selectedType === 'supabase' && config.projectUrl && (
                <div className="flex justify-between">
                  <span className="text-text-3">Projeto:</span>
                  <span className="text-text-1 truncate max-w-[200px]">{config.projectUrl}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-bg-1 border-border">
        <DialogHeader>
          <DialogTitle className="text-xl text-text-1">Novo Data Source</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  i < step ? "bg-pinn-orange-500 text-white" :
                  i === step ? "bg-pinn-orange-500/20 border-2 border-pinn-orange-500 text-pinn-orange-500" :
                  "bg-bg-3 text-text-3"
                )}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  i === step ? "text-text-1" : "text-text-3"
                )}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-2",
                  i < step ? "bg-pinn-orange-500" : "bg-bg-3"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="py-4 min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => step > 0 ? setStep(step - 1) : handleClose()}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {step === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!canProceed() || saving}
              className="bg-pinn-orange-500 hover:bg-pinn-orange-600"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Data Source
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
