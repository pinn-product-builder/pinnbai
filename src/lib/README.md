# Biblioteca de Utilitários e Configurações

Esta pasta contém utilitários, configurações e constantes centralizadas da aplicação, organizadas para facilitar manutenção e reutilização.

## 📁 Estrutura

### `config.ts`
**Configurações e constantes centralizadas**

- Configurações do Supabase
- Valores padrão (orgId, período)
- Configurações de períodos
- Limites de queries
- Padrões de exclusão
- Rotas da aplicação
- Atalhos de teclado
- Intervalos de refresh

**Uso:**
```typescript
import { DEFAULT_ORG_ID, PERIOD_OPTIONS, ROUTES } from '@/lib/config';
```

### `format.ts`
**Utilitários de formatação**

- `formatCurrency()` - Formata valores monetários (BRL)
- `formatNumber()` - Formata números
- `formatPercent()` - Formata percentuais
- `formatDate()` - Formata datas
- `formatDateTime()` - Formata data e hora
- `formatRelativeTime()` - Tempo relativo ("2h atrás")
- `formatKpiValue()` - Formatação genérica para KPIs
- `formatPhone()` - Formata telefone
- `formatCpfCnpj()` - Formata CPF/CNPJ

**Uso:**
```typescript
import { formatCurrency, formatPercent, formatKpiValue } from '@/lib/format';

const price = formatCurrency(1234.56); // R$ 1.234,56
const percent = formatPercent(0.15); // 15.0%
```

### `dateHelpers.ts`
**Utilitários para manipulação de datas e períodos**

- `getPeriodDays()` - Retorna número de dias de um período
- `getDateRange()` - Calcula range de datas para um período
- `getPreviousPeriodRange()` - Range do período anterior (comparação)
- `getCutoffDate()` - Data de corte (X dias atrás)
- `getCurrentMonthRange()` - Range do mês atual
- `getTodayString()` - Data de hoje em formato ISO
- `isDateInRange()` - Verifica se data está em range
- `calculatePercentageChange()` - Calcula variação percentual
- `getDayOfWeekName()` - Nome do dia da semana
- `getMonthName()` - Nome do mês

**Uso:**
```typescript
import { getDateRange, getPreviousPeriodRange, calculatePercentageChange } from '@/lib/dateHelpers';

const current = getDateRange('30d');
const previous = getPreviousPeriodRange('30d');
const change = calculatePercentageChange(100, 80); // 25%
```

### `calculations.ts`
**Utilitários para cálculos de métricas e KPIs**

- `calculateCPL()` - Custo por Lead
- `calculateCostPerMeeting()` - Custo por Reunião
- `calculateConversionRate()` - Taxa de conversão
- `calculateTaxaEntrada()` - Taxa de entrada
- `calculateTaxaAtendimento()` - Taxa de atendimento
- `calculateAverage()` - Média
- `calculateSum()` - Soma
- `calculateGrowthRate()` - Taxa de crescimento
- `aggregateByDay()` - Agrega dados por dia
- `aggregateFunnelData()` - Agrega dados de funil
- `aggregateCallsData()` - Agrega dados de chamadas
- `calculateMetricsFromFunnel()` - Calcula métricas do funil

**Uso:**
```typescript
import { calculateCPL, aggregateFunnelData, calculateMetricsFromFunnel } from '@/lib/calculations';

const cpl = calculateCPL(1000, 50); // 20
const aggregate = aggregateFunnelData(data);
const metrics = calculateMetricsFromFunnel(aggregate);
```

### `kpiDefinitions.ts`
**Definições locais de KPIs para fallback**

Contém definições de KPIs usadas quando o dicionário do banco não está disponível.

**Uso:**
```typescript
import { LOCAL_KPI_DEFINITIONS } from '@/lib/kpiDefinitions';

const definition = LOCAL_KPI_DEFINITIONS['cpl_30d'];
```

### `supabaseViews.ts`
**Configuração centralizada de views e tabelas do Supabase**

Centraliza nomes de views, tabelas, RPC functions e edge functions.

**Uso:**
```typescript
import { SUPABASE_VIEWS, SUPABASE_TABLES } from '@/lib/supabaseViews';

const { data } = await supabase
  .from(SUPABASE_VIEWS.DASHBOARD_KPIS_30D)
  .select('*');
```

### `supabaseClient.ts`
**Cliente do Supabase**

Configuração e exportação do cliente Supabase.

**Uso:**
```typescript
import { supabase } from '@/lib/supabaseClient';
```

### `utils.ts`
**Utilitários gerais**

- `cn()` - Merge de classes CSS (clsx + tailwind-merge)

**Uso:**
```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional-class')} />
```

## 🎯 Benefícios da Organização

1. **Manutenibilidade**: Todas as constantes e configurações em um só lugar
2. **Reutilização**: Funções utilitárias podem ser usadas em qualquer lugar
3. **Consistência**: Formatação e cálculos padronizados
4. **Testabilidade**: Funções puras fáceis de testar
5. **Type Safety**: TypeScript garante type safety em todas as funções
6. **Documentação**: Código auto-documentado com JSDoc

## 📝 Convenções

- **Constantes**: UPPER_SNAKE_CASE
- **Funções**: camelCase
- **Tipos/Interfaces**: PascalCase
- **Exports**: Named exports (não default, exceto supabaseClient)

## 🔄 Migração

Ao adicionar novas funcionalidades:

1. **Constantes**: Adicione em `config.ts`
2. **Formatação**: Adicione em `format.ts`
3. **Datas**: Adicione em `dateHelpers.ts`
4. **Cálculos**: Adicione em `calculations.ts`
5. **Views/Tabelas**: Adicione em `supabaseViews.ts`

## 🚀 Exemplos de Uso

### Exemplo 1: Formatação de KPI
```typescript
import { formatKpiValue } from '@/lib/format';

<KpiCard
  value={formatKpiValue(1234.56, 'currency')}
  format="currency"
/>
```

### Exemplo 2: Cálculo de Período
```typescript
import { getDateRange, getPreviousPeriodRange } from '@/lib/dateHelpers';

const current = getDateRange('30d');
const previous = getPreviousPeriodRange('30d');
```

### Exemplo 3: Uso de Constantes
```typescript
import { DEFAULT_ORG_ID, PERIOD_OPTIONS, ROUTES } from '@/lib/config';

const orgId = orgId || DEFAULT_ORG_ID;
navigate(ROUTES.DASHBOARD.EXECUTIVO);
```

### Exemplo 4: Cálculo de Métricas
```typescript
import { calculateCPL, calculateCostPerMeeting } from '@/lib/calculations';

const cpl = calculateCPL(spend, leads);
const cpm = calculateCostPerMeeting(spend, meetings);
```
