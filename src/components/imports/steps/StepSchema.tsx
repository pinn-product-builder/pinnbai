/**
 * Step 3: Detecção e Configuração de Esquema
 */

import React, { useState } from 'react';
import { 
  Calendar, DollarSign, Hash, Type, Tag, ToggleLeft,
  Percent, Clock, Key, Table2, ArrowUpDown, Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { DetectedSchema, DetectedColumn } from '../ImportWizard';

interface StepSchemaProps {
  schema: DetectedSchema;
  onSchemaChange: (schema: DetectedSchema) => void;
  primaryDateColumn: string | null;
  onPrimaryDateChange: (column: string | null) => void;
}

const DATA_TYPE_CONFIG = {
  date: { icon: Calendar, label: 'Data', color: 'text-info' },
  datetime: { icon: Clock, label: 'Data/Hora', color: 'text-info' },
  currency: { icon: DollarSign, label: 'Moeda', color: 'text-success' },
  percent: { icon: Percent, label: 'Percentual', color: 'text-warning' },
  integer: { icon: Hash, label: 'Inteiro', color: 'text-pinn-orange-500' },
  number: { icon: Hash, label: 'Número', color: 'text-pinn-orange-500' },
  text: { icon: Type, label: 'Texto', color: 'text-text-2' },
  category: { icon: Tag, label: 'Categoria', color: 'text-purple-400' },
  id: { icon: Key, label: 'ID', color: 'text-text-3' },
  boolean: { icon: ToggleLeft, label: 'Booleano', color: 'text-cyan-400' },
};

export function StepSchema({ schema, onSchemaChange, primaryDateColumn, onPrimaryDateChange }: StepSchemaProps) {
  const [tab, setTab] = useState<'columns' | 'preview'>('columns');

  const updateColumn = (index: number, updates: Partial<DetectedColumn>) => {
    const newColumns = [...schema.columns];
    newColumns[index] = { ...newColumns[index], ...updates };
    onSchemaChange({ ...schema, columns: newColumns });
  };

  const dateColumns = schema.columns.filter(c => c.dataType === 'date' || c.dataType === 'datetime');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-1 mb-1">
            Configurar Esquema
          </h3>
          <p className="text-sm text-text-3">
            {schema.columns.length} colunas detectadas • {schema.rowCount.toLocaleString('pt-BR')} linhas
          </p>
        </div>

        {/* Primary Date Column Selector */}
        {dateColumns.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-3">Coluna de data principal:</span>
            <Select 
              value={primaryDateColumn || ''} 
              onValueChange={(v) => onPrimaryDateChange(v || null)}
            >
              <SelectTrigger className="w-[180px] bg-bg-2 border-border">
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent className="bg-bg-1 border-border">
                {dateColumns.map(col => (
                  <SelectItem key={col.name} value={col.name}>
                    {col.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="bg-bg-2 border border-border">
          <TabsTrigger value="columns" className="data-[state=active]:bg-bg-3">
            <Table2 className="w-4 h-4 mr-2" />
            Colunas
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-bg-3">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="columns" className="mt-4">
          <ScrollArea className="h-[400px] rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-bg-2 sticky top-0 z-10">
                  <TableHead className="text-text-3 w-[200px]">Coluna</TableHead>
                  <TableHead className="text-text-3 w-[150px]">Tipo</TableHead>
                  <TableHead className="text-text-3 text-center w-[80px]">Medida</TableHead>
                  <TableHead className="text-text-3 text-center w-[80px]">Dimensão</TableHead>
                  <TableHead className="text-text-3">Amostra</TableHead>
                  <TableHead className="text-text-3 text-right w-[100px]">Qualidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schema.columns.map((col, index) => {
                  const typeConfig = DATA_TYPE_CONFIG[col.dataType];
                  const TypeIcon = typeConfig.icon;
                  const qualityPercent = Math.round((1 - col.nullRatio) * 100);

                  return (
                    <TableRow key={col.name} className="border-border hover:bg-bg-2/50">
                      <TableCell>
                        <Input
                          value={col.displayName}
                          onChange={(e) => updateColumn(index, { displayName: e.target.value })}
                          className="h-8 bg-transparent border-transparent hover:border-border focus:border-pinn-orange-500"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={col.dataType}
                          onValueChange={(v) => updateColumn(index, { 
                            dataType: v as DetectedColumn['dataType'],
                            isMeasure: ['currency', 'percent', 'integer', 'number'].includes(v),
                            isDimension: ['date', 'datetime', 'text', 'category', 'boolean'].includes(v),
                          })}
                        >
                          <SelectTrigger className="h-8 w-full bg-bg-2 border-border">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={cn("w-3.5 h-3.5", typeConfig.color)} />
                              <span>{typeConfig.label}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-bg-1 border-border">
                            {Object.entries(DATA_TYPE_CONFIG).map(([key, config]) => {
                              const Icon = config.icon;
                              return (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={cn("w-3.5 h-3.5", config.color)} />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={col.isMeasure}
                          onCheckedChange={(v) => updateColumn(index, { isMeasure: v })}
                          className="data-[state=checked]:bg-success"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={col.isDimension}
                          onCheckedChange={(v) => updateColumn(index, { isDimension: v })}
                          className="data-[state=checked]:bg-info"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {col.sampleValues.slice(0, 3).map((val, i) => (
                            <Badge 
                              key={i} 
                              variant="outline" 
                              className="bg-bg-2 border-border text-text-2 text-xs"
                            >
                              {String(val).substring(0, 20)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            qualityPercent >= 95 && "bg-success",
                            qualityPercent >= 80 && qualityPercent < 95 && "bg-warning",
                            qualityPercent < 80 && "bg-danger"
                          )} />
                          <span className={cn(
                            "text-sm font-mono",
                            qualityPercent >= 95 && "text-success",
                            qualityPercent >= 80 && qualityPercent < 95 && "text-warning",
                            qualityPercent < 80 && "text-danger"
                          )}>
                            {qualityPercent}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-bg-2">
                  {schema.columns.map(col => (
                    <TableHead key={col.name} className="text-text-3 whitespace-nowrap">
                      {col.displayName}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schema.previewData.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="border-border hover:bg-bg-2/50">
                    {schema.columns.map(col => (
                      <TableCell key={col.name} className="text-text-1 whitespace-nowrap">
                        {row[col.name] !== undefined ? String(row[col.name]) : '—'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-text-3 mt-2 text-center">
            Mostrando {schema.previewData.length} de {schema.rowCount.toLocaleString('pt-BR')} linhas
          </p>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-bg-2 border border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-pinn-orange-500">
            {schema.columns.filter(c => c.isMeasure).length}
          </p>
          <p className="text-xs text-text-3">Medidas</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-info">
            {schema.columns.filter(c => c.isDimension).length}
          </p>
          <p className="text-xs text-text-3">Dimensões</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-success">
            {Math.round(schema.columns.reduce((acc, c) => acc + (1 - c.nullRatio), 0) / schema.columns.length * 100)}%
          </p>
          <p className="text-xs text-text-3">Qualidade Média</p>
        </div>
      </div>
    </div>
  );
}

export default StepSchema;
