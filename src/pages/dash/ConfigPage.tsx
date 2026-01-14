import React, { useState } from 'react';
import { Settings, Zap, CheckCircle, XCircle, Loader2, Database, Key } from 'lucide-react';
import { PageHeader, Section, ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useGlobalFilters } from '@/hooks/useGlobalFilters';
import { testIngestion } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  timestamp: string;
}

export default function ConfigPage() {
  const { filters } = useGlobalFilters();
  const orgId = filters.orgId;
  const { toast } = useToast();

  // Ingestion test state
  const [ingestKey, setIngestKey] = useState('');
  const [isTestingIngestion, setIsTestingIngestion] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<TestResult | null>(null);

  const handleTestIngestion = async () => {
    if (!ingestKey.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe a chave de ingestão',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingIngestion(true);
    setIngestionResult(null);

    try {
      const result = await testIngestion(ingestKey);
      
      const testResult: TestResult = {
        success: result.success,
        message: result.success 
          ? `Conexão estabelecida! org_id: ${result.data?.org_id || 'N/A'}`
          : result.error || 'Falha na conexão',
        data: result.data,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      };
      
      setIngestionResult(testResult);
      
      toast({
        title: result.success ? 'Sucesso' : 'Falha',
        description: testResult.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (err: any) {
      const testResult: TestResult = {
        success: false,
        message: err?.message || 'Erro desconhecido',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      };
      setIngestionResult(testResult);
      
      toast({
        title: 'Erro',
        description: testResult.message,
        variant: 'destructive',
      });
    } finally {
      setIsTestingIngestion(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Configurações"
        description="Configurações e testes do sistema"
      />

      {/* Informações da Organização */}
      <Section title="Organização Atual">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-primary" />
              <span className="font-medium">ID da Organização</span>
            </div>
            <code className="text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded">
              {orgId || 'Nenhuma selecionada'}
            </code>
          </div>
        </div>
      </Section>

      {/* Teste de Ingestão */}
      <Section title="Testar Ingestão (smart-processor)">
        <ChartCard
          title="Ping de Conexão"
          subtitle="Teste a conectividade com o endpoint de ingestão"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ingest-key" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Chave de Ingestão (x-ingest-key)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="ingest-key"
                  type="password"
                  placeholder="Sua chave de ingestão..."
                  value={ingestKey}
                  onChange={(e) => setIngestKey(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleTestIngestion}
                  disabled={isTestingIngestion || !ingestKey.trim()}
                  className="gap-2"
                >
                  {isTestingIngestion ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Ping
                </Button>
              </div>
            </div>

            {/* Resultado do teste */}
            {ingestionResult && (
              <div
                className={cn(
                  "p-4 rounded-lg border",
                  ingestionResult.success
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-destructive/30 bg-destructive/5"
                )}
              >
                <div className="flex items-start gap-3">
                  {ingestionResult.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "font-medium",
                      ingestionResult.success ? "text-emerald-500" : "text-destructive"
                    )}>
                      {ingestionResult.success ? 'Conexão OK' : 'Falha na Conexão'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ingestionResult.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Testado às {ingestionResult.timestamp}
                    </p>
                    
                    {/* Dados retornados */}
                    {ingestionResult.data && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Resposta:
                        </p>
                        <pre className="text-xs bg-muted/30 p-2 rounded overflow-auto max-h-32">
                          {JSON.stringify(ingestionResult.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• O ping envia <code className="bg-muted/30 px-1 rounded">{"{ ping: true }"}</code> para <code className="bg-muted/30 px-1 rounded">/functions/v1/smart-processor</code></p>
              <p>• Uma resposta bem-sucedida retorna <code className="bg-muted/30 px-1 rounded">ok: true</code> e o <code className="bg-muted/30 px-1 rounded">org_id</code> associado</p>
            </div>
          </div>
        </ChartCard>
      </Section>

      {/* Endpoints Info */}
      <Section title="Endpoints de Edge Functions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">generate-insights</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Gera insights IA sob demanda. Chamado via botão "Atualizar" nos painéis de insights.
            </p>
            <code className="text-xs bg-muted/30 px-2 py-1 rounded block">
              POST /functions/v1/generate-insights
            </code>
          </div>

          <div className="p-4 rounded-lg border bg-card space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="font-medium text-sm">smart-processor</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Processa eventos de ingestão. Requer header <code>x-ingest-key</code>.
            </p>
            <code className="text-xs bg-muted/30 px-2 py-1 rounded block">
              POST /functions/v1/smart-processor
            </code>
          </div>
        </div>
      </Section>
    </div>
  );
}