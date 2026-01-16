/**
 * Admin: Templates
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Plus, BarChart3, TrendingUp,
  Settings, Eye, Star, Zap, Layers, Gauge
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { templatesService } from '@/services/templates';
import { cn } from '@/lib/utils';
import { SAAS_ROUTES } from '@/lib/saasRoutes';
import { ApplyTemplateModal } from '@/components/templates/ApplyTemplateModal';

// Mapeamento de template ID para rota
const templateRoutes: Record<string, string> = {
  'tpl-agent-sales': SAAS_ROUTES.TEMPLATES.AGENT_SALES,
  'tpl-revenue-os': SAAS_ROUTES.TEMPLATES.REVENUE_OS,
  'tpl-growth-engine': SAAS_ROUTES.TEMPLATES.GROWTH_ENGINE,
  'tpl-process-automation': SAAS_ROUTES.TEMPLATES.PROCESS_AUTOMATION,
  'tpl-microsaas-studio': SAAS_ROUTES.TEMPLATES.MICROSAAS_STUDIO,
};

export default function AdminTemplatesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['admin-templates', search, categoryFilter],
    queryFn: () => templatesService.list({
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      search: search || undefined,
    }),
  });

  const { data: categories } = useQuery({
    queryKey: ['template-categories'],
    queryFn: () => templatesService.getCategories(),
  });

  const categoryIcons: Record<string, React.ElementType> = {
    executivo: BarChart3,
    vendas: TrendingUp,
    trafego: Zap,
    operacoes: Settings,
    custom: FileText,
  };

  const categoryColors: Record<string, string> = {
    executivo: 'bg-pinn-orange-500/20 text-pinn-orange-500',
    vendas: 'bg-success/20 text-success',
    trafego: 'bg-info/20 text-info',
    operacoes: 'bg-warning/20 text-warning',
    custom: 'bg-text-3/20 text-text-2',
  };

  // Renderiza estrelas de complexidade
  const renderComplexity = (templateId: string) => {
    const { level, label } = templatesService.getComplexityLevel(templateId);
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3",
                i < level 
                  ? "text-pinn-orange-500 fill-pinn-orange-500" 
                  : "text-text-3/30"
              )}
            />
          ))}
        </div>
        <span className="text-[10px] text-text-3 ml-1">{label}</span>
      </div>
    );
  };

  const handlePreview = (templateId: string) => {
    const route = templateRoutes[templateId];
    if (route) {
      navigate(route);
    }
  };

  const handleApply = (templateId: string, templateName: string) => {
    setSelectedTemplate({ id: templateId, name: templateName });
    setApplyModalOpen(true);
  };

  return (
    <>
      {/* Modal de Aplicar Template */}
      {selectedTemplate && (
        <ApplyTemplateModal
          open={applyModalOpen}
          onOpenChange={setApplyModalOpen}
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
        />
      )}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-1">Templates</h1>
          <p className="text-text-3 mt-1">Biblioteca de modelos de dashboard Pinn</p>
        </div>
        <Button className="bg-pinn-gradient text-bg-0">
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-bg-1 border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg-2 border-border"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-bg-2 border-border">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                <SelectItem value="all">Todas</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => {
          const Icon = categoryIcons[template.category] || FileText;
          const { level } = templatesService.getComplexityLevel(template.id);
          
          return (
            <Card key={template.id} className="bg-bg-1 border-border hover:border-pinn-orange-500/30 transition-colors group">
              <CardContent className="p-0">
                {/* Preview Image */}
                <div className="h-40 bg-bg-2 rounded-t-xl flex items-center justify-center border-b border-border relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pinn-orange-500/5 to-transparent" />
                  <div className="flex flex-col items-center gap-2">
                    <Layers className="w-12 h-12 text-pinn-orange-500/30" />
                    <span className="text-xs text-text-3">Nível {level}</span>
                  </div>
                  {/* Complexity badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-bg-0/80 backdrop-blur-sm border-border">
                      <Gauge className="w-3 h-3 mr-1" />
                      {level}/5
                    </Badge>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-text-1">{template.name}</h3>
                      {renderComplexity(template.id)}
                    </div>
                    <Badge className={cn("capitalize", categoryColors[template.category])}>
                      {template.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-text-3 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-text-3">
                    <span>{template.widgets.length} widgets</span>
                    <span>{template.requiredMetrics.length} métricas</span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handlePreview(template.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-pinn-gradient text-bg-0"
                      onClick={() => handleApply(template.id, template.name)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {(!templates || templates.length === 0) && (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-text-3 mx-auto mb-4" />
            <p className="text-text-2">Nenhum template encontrado</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
