/**
 * Painel de Chat IA para análise de dados
 * Permite conversar sobre os dados e gerar relatórios
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Sparkles, 
  Loader2,
  BarChart3,
  FileBarChart,
  Lightbulb,
  Briefcase,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SUPABASE_CONFIG } from '@/lib/config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isReport?: boolean;
  reportType?: string;
}

interface DataChatPanelProps {
  workspaceSlug: string;
  datasetName: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

// Use Lovable Cloud URL for Edge Functions
const LOVABLE_CLOUD_URL = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const LOVABLE_CLOUD_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

export function DataChatPanel({ 
  workspaceSlug, 
  datasetName, 
  isOpen = true, 
  onClose,
  className 
}: DataChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'reports'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `👋 Olá! Sou o **Pinn Analytics AI**, seu analista de dados inteligente.

Estou conectado ao dataset **${datasetName}** e posso ajudá-lo a:

📊 **Analisar dados** - Faça perguntas sobre qualquer métrica
📈 **Identificar padrões** - Encontro tendências e correlações
💡 **Gerar insights** - Descubro oportunidades ocultas
📝 **Criar relatórios** - Gere relatórios em diferentes formatos

**Experimente perguntar:**
- "Qual é o resumo dos dados?"
- "Quais são as principais métricas?"
- "Identifique anomalias nos dados"
- "Qual a tendência de vendas?"

Como posso ajudar você hoje?`,
        timestamp: new Date()
      }]);
    }
  }, [datasetName]);

  const streamChat = useCallback(async (
    userMessage: string,
    action: 'chat' | 'report' = 'chat',
    reportType?: string
  ) => {
    const allMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    console.log('Sending to data-chat:', { workspaceSlug, datasetName, action, messagesCount: allMessages.length, url: LOVABLE_CLOUD_URL });
    
    const response = await fetch(`${LOVABLE_CLOUD_URL}/functions/v1/data-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_CLOUD_KEY}`,
        'apikey': LOVABLE_CLOUD_KEY,
      },
      body: JSON.stringify({
        messages: [...allMessages, { role: 'user', content: userMessage }],
        workspaceSlug,
        datasetName,
        action,
        reportType
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      let errorMsg = 'Erro ao conectar com o agente IA';
      try {
        const error = await response.json();
        errorMsg = error.error || errorMsg;
      } catch {
        errorMsg = `Erro ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let assistantContent = '';
    let textBuffer = '';

    // Create assistant message
    const assistantId = `msg-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isReport: action === 'report',
      reportType
    }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => 
              prev.map(m => 
                m.id === assistantId 
                  ? { ...m, content: assistantContent }
                  : m
              )
            );
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    return assistantContent;
  }, [messages, workspaceSlug, datasetName]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    try {
      await streamChat(userMessage, 'chat');
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Erro: ${error.message}. Por favor, tente novamente.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (type: 'summary' | 'detailed' | 'insights' | 'executive') => {
    const reportLabels: Record<string, string> = {
      summary: 'Resumo Executivo',
      detailed: 'Relatório Detalhado',
      insights: 'Análise de Insights',
      executive: 'Relatório C-Level'
    };

    const userMessage = `Gere um ${reportLabels[type]} completo dos dados.`;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `📝 Gerando: ${reportLabels[type]}`,
      timestamp: new Date()
    }]);

    setIsLoading(true);
    setActiveTab('chat');
    
    try {
      await streamChat(userMessage, 'report', type);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Erro ao gerar relatório: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAsMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { icon: BarChart3, label: 'Resumo', prompt: 'Faça um resumo dos principais dados' },
    { icon: Lightbulb, label: 'Insights', prompt: 'Quais insights você identifica nesses dados?' },
    { icon: Sparkles, label: 'Tendências', prompt: 'Quais tendências você observa?' },
  ];

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "flex flex-col border-border/50 bg-card/95 backdrop-blur transition-all duration-300",
      isExpanded ? "fixed inset-4 z-50" : "h-[600px]",
      className
    )}>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Pinn Analytics AI</CardTitle>
              <p className="text-xs text-muted-foreground">
                Analisando: <span className="text-foreground font-medium">{datasetName}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'reports')} className="mt-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {activeTab === 'chat' ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted/50 border border-border/50"
                    )}>
                      {msg.isReport && (
                        <Badge variant="secondary" className="mb-2 text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {msg.reportType === 'summary' && 'Resumo Executivo'}
                          {msg.reportType === 'detailed' && 'Relatório Detalhado'}
                          {msg.reportType === 'insights' && 'Análise de Insights'}
                          {msg.reportType === 'executive' && 'Relatório C-Level'}
                        </Badge>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content.split('\n').map((line, i) => {
                            // Simple markdown rendering
                            if (line.startsWith('## ')) {
                              return <h2 key={i} className="text-base font-semibold mt-3 mb-1">{line.slice(3)}</h2>;
                            }
                            if (line.startsWith('### ')) {
                              return <h3 key={i} className="text-sm font-medium mt-2 mb-1">{line.slice(4)}</h3>;
                            }
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={i} className="font-semibold">{line.slice(2, -2)}</p>;
                            }
                            if (line.startsWith('- ')) {
                              return <li key={i} className="ml-4">{line.slice(2)}</li>;
                            }
                            return <p key={i}>{line}</p>;
                          })}
                        </div>
                      </div>
                      {msg.role === 'assistant' && msg.content && (
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/30">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3 w-3 mr-1" />
                            ) : (
                              <Copy className="h-3 w-3 mr-1" />
                            )}
                            Copiar
                          </Button>
                          {msg.isReport && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => downloadAsMarkdown(msg.content, `relatorio-${msg.reportType}`)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 items-center text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                    <span className="text-sm">Analisando dados...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border/30">
                {quickPrompts.map((qp, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => {
                      setInputValue(qp.prompt);
                      textareaRef.current?.focus();
                    }}
                  >
                    <qp.icon className="h-3 w-3 mr-1" />
                    {qp.label}
                  </Button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre seus dados..."
                  className="resize-none min-h-[44px] max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Reports Tab */
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Gere relatórios profissionais automaticamente baseados nos dados do seu dataset.
            </p>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-4"
                onClick={() => handleGenerateReport('summary')}
                disabled={isLoading}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <FileBarChart className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Resumo Executivo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Visão geral com destaques e métricas principais
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-4"
                onClick={() => handleGenerateReport('detailed')}
                disabled={isLoading}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Relatório Detalhado</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Análise completa com estatísticas e correlações
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-4"
                onClick={() => handleGenerateReport('insights')}
                disabled={isLoading}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Análise de Insights</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Descoberta de padrões ocultos e oportunidades
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="justify-start h-auto py-4 px-4"
                onClick={() => handleGenerateReport('executive')}
                disabled={isLoading}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Relatório C-Level</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Formato executivo para apresentações
                    </p>
                  </div>
                </div>
              </Button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Gerando relatório...</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
