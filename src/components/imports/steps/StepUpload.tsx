/**
 * Step 2: Upload de Arquivo
 */

import React, { useState, useCallback } from 'react';
import { 
  Upload, FileSpreadsheet, FileJson, Loader2, X, 
  CheckCircle2, AlertCircle, File
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Organization } from '@/types/saas';
import { supabase } from '@/lib/supabaseClient';
import { DetectedSchema, DetectedColumn } from '../ImportWizard';

interface StepUploadProps {
  workspace: Organization;
  file: File | null;
  onUploadComplete: (file: File, storagePath: string, schema: DetectedSchema) => void;
  onError: (error: string) => void;
}

const ACCEPTED_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/csv': 'csv',
  'application/json': 'json',
} as const;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function StepUpload({ workspace, file, onUploadComplete, onError }: StepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [currentFile, setCurrentFile] = useState<File | null>(file);

  const getFileType = (file: File): string | null => {
    const mimeType = file.type;
    if (ACCEPTED_TYPES[mimeType as keyof typeof ACCEPTED_TYPES]) {
      return ACCEPTED_TYPES[mimeType as keyof typeof ACCEPTED_TYPES];
    }
    // Fallback to extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['xlsx', 'xls', 'csv', 'json'].includes(ext || '')) {
      return ext!;
    }
    return null;
  };

  const detectSchema = async (file: File): Promise<DetectedSchema> => {
    // Mock schema detection - in production this would be an edge function
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockColumns: DetectedColumn[] = [
      {
        name: 'data',
        displayName: 'Data',
        dataType: 'date',
        isMeasure: false,
        isDimension: true,
        isPrimaryDate: true,
        nullRatio: 0,
        cardinality: 365,
        sampleValues: ['2025-01-01', '2025-01-02', '2025-01-03'],
      },
      {
        name: 'valor',
        displayName: 'Valor',
        dataType: 'currency',
        isMeasure: true,
        isDimension: false,
        isPrimaryDate: false,
        nullRatio: 0.02,
        cardinality: 450,
        sampleValues: ['1500.00', '2300.50', '890.00'],
      },
      {
        name: 'quantidade',
        displayName: 'Quantidade',
        dataType: 'integer',
        isMeasure: true,
        isDimension: false,
        isPrimaryDate: false,
        nullRatio: 0,
        cardinality: 100,
        sampleValues: ['10', '25', '5'],
      },
      {
        name: 'categoria',
        displayName: 'Categoria',
        dataType: 'category',
        isMeasure: false,
        isDimension: true,
        isPrimaryDate: false,
        nullRatio: 0,
        cardinality: 8,
        sampleValues: ['Eletrônicos', 'Vestuário', 'Alimentos'],
      },
      {
        name: 'vendedor',
        displayName: 'Vendedor',
        dataType: 'text',
        isMeasure: false,
        isDimension: true,
        isPrimaryDate: false,
        nullRatio: 0.05,
        cardinality: 25,
        sampleValues: ['João Silva', 'Maria Santos', 'Pedro Lima'],
      },
      {
        name: 'status',
        displayName: 'Status',
        dataType: 'category',
        isMeasure: false,
        isDimension: true,
        isPrimaryDate: false,
        nullRatio: 0,
        cardinality: 3,
        sampleValues: ['Aprovado', 'Pendente', 'Cancelado'],
      },
    ];

    return {
      columns: mockColumns,
      rowCount: 15420,
      previewData: [
        { data: '2025-01-15', valor: 1500.00, quantidade: 10, categoria: 'Eletrônicos', vendedor: 'João Silva', status: 'Aprovado' },
        { data: '2025-01-15', valor: 2300.50, quantidade: 25, categoria: 'Vestuário', vendedor: 'Maria Santos', status: 'Aprovado' },
        { data: '2025-01-14', valor: 890.00, quantidade: 5, categoria: 'Alimentos', vendedor: 'Pedro Lima', status: 'Pendente' },
        { data: '2025-01-14', valor: 3200.00, quantidade: 15, categoria: 'Eletrônicos', vendedor: 'João Silva', status: 'Aprovado' },
        { data: '2025-01-13', valor: 1200.00, quantidade: 8, categoria: 'Vestuário', vendedor: 'Ana Costa', status: 'Cancelado' },
      ],
    };
  };

  const uploadFile = async (file: File) => {
    const fileType = getFileType(file);
    if (!fileType) {
      onError('Tipo de arquivo não suportado. Use .xlsx, .xls, .csv ou .json');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError('Arquivo muito grande. Tamanho máximo: 50MB');
      return;
    }

    setCurrentFile(file);
    setUploadState('uploading');
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Generate unique path
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `${workspace.id}/imports/${timestamp}/${safeName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('data-imports')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        // If bucket doesn't exist or permission denied, show helpful message
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
          onError('Bucket de storage não configurado. Execute o SQL de configuração primeiro.');
          setUploadState('error');
          return;
        }
        throw uploadError;
      }

      setUploadProgress(100);
      setUploadState('processing');

      // Detect schema
      const schema = await detectSchema(file);

      setUploadState('success');
      onUploadComplete(file, storagePath, schema);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadState('error');
      onError(err.message || 'Erro ao fazer upload do arquivo');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      uploadFile(droppedFile);
    }
  }, [workspace]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };

  const handleRemove = () => {
    setCurrentFile(null);
    setUploadState('idle');
    setUploadProgress(0);
  };

  const getFileIcon = () => {
    if (!currentFile) return File;
    const ext = currentFile.name.split('.').pop()?.toLowerCase();
    if (ext === 'json') return FileJson;
    return FileSpreadsheet;
  };

  const FileIcon = getFileIcon();

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-text-1 mb-1">
          Upload do Arquivo
        </h3>
        <p className="text-sm text-text-3">
          Arraste e solte seu arquivo ou clique para selecionar
        </p>
      </div>

      {/* Current File / Upload Zone */}
      {currentFile && uploadState !== 'idle' ? (
        <div className={cn(
          "p-6 rounded-xl border-2 transition-all",
          uploadState === 'error' && "border-danger bg-danger/5",
          uploadState === 'success' && "border-success bg-success/5",
          (uploadState === 'uploading' || uploadState === 'processing') && "border-pinn-orange-500 bg-pinn-orange-500/5"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
              uploadState === 'error' && "bg-danger/20 text-danger",
              uploadState === 'success' && "bg-success/20 text-success",
              (uploadState === 'uploading' || uploadState === 'processing') && "bg-pinn-orange-500/20 text-pinn-orange-500"
            )}>
              {uploadState === 'uploading' || uploadState === 'processing' ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : uploadState === 'success' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : uploadState === 'error' ? (
                <AlertCircle className="w-7 h-7" />
              ) : (
                <FileIcon className="w-7 h-7" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-text-1 truncate">{currentFile.name}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRemove}
                  className="h-8 w-8 shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-text-3">
                {formatFileSize(currentFile.size)}
              </p>

              {(uploadState === 'uploading' || uploadState === 'processing') && (
                <div className="mt-3 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-text-3">
                    {uploadState === 'uploading' 
                      ? `Enviando arquivo... ${uploadProgress}%`
                      : 'Detectando esquema...'}
                  </p>
                </div>
              )}

              {uploadState === 'success' && (
                <p className="text-sm text-success mt-2">
                  Arquivo enviado e processado com sucesso!
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "p-12 rounded-xl border-2 border-dashed transition-all",
            "flex flex-col items-center justify-center text-center",
            isDragging 
              ? "border-pinn-orange-500 bg-pinn-orange-500/10" 
              : "border-border bg-bg-2 hover:border-text-3"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
            isDragging ? "bg-pinn-gradient text-bg-0" : "bg-bg-3 text-text-2"
          )}>
            <Upload className="w-8 h-8" />
          </div>

          <p className="font-semibold text-text-1 mb-1">
            {isDragging ? 'Solte o arquivo aqui' : 'Arraste seu arquivo'}
          </p>
          <p className="text-sm text-text-3 mb-4">
            ou clique para selecionar do computador
          </p>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".xlsx,.xls,.csv,.json"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button asChild className="bg-bg-3 text-text-1 hover:bg-bg-3/80">
              <span>Selecionar Arquivo</span>
            </Button>
          </label>

          <div className="flex items-center gap-4 mt-6 text-xs text-text-3">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              .xlsx, .xls, .csv
            </span>
            <span className="flex items-center gap-1">
              <FileJson className="w-3.5 h-3.5" />
              .json
            </span>
            <span>Máx 50MB</span>
          </div>
        </div>
      )}

      {/* Workspace info */}
      <div className="p-4 rounded-lg bg-bg-2 border border-border">
        <p className="text-xs text-text-3">Destino</p>
        <p className="text-sm font-medium text-text-1">
          {workspace.name} <span className="text-text-3">/{workspace.slug}</span>
        </p>
      </div>
    </div>
  );
}

export default StepUpload;
