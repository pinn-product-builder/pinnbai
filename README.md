# Pinn Growth Dashboard (Afonsina)

Dashboard web de **Business Intelligence** para acompanhar performance de aquisição, conversas, tráfego pago e ligações (VAPI), com autenticação e dados via **Supabase**.

## Índice

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Como rodar localmente](#como-rodar-localmente)
- [Arquitetura (visão técnica)](#arquitetura-visão-técnica)
- [Rotas da aplicação](#rotas-da-aplicação)
- [Autenticação e autorização (RBAC)](#autenticação-e-autorização-rbac)
- [Filtros globais (URL-driven)](#filtros-globais-url-driven)
- [Dados e queries (React Query)](#dados-e-queries-react-query)
- [Supabase (tabelas/views/RPC/Edge Functions)](#supabase-tabelasviewsrpcedge-functions)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Biblioteca de manutenção (src/lib)](#biblioteca-de-manutenção-srclib)
- [Convenções de manutenção (importante)](#convenções-de-manutenção-importante)
- [Troubleshooting](#troubleshooting)
- [Licença](#licença)

## Visão geral

O projeto entrega um painel com múltiplas visões:

- **Executivo**: KPIs principais, evolução diária, funil atual, próximas reuniões, insights.
- **Conversas**: indicadores e distribuição de mensagens (diário / por hora / heatmap), tabelas e insights.
- **Tráfego**: investimento, CPL, entradas no funil, top anúncios, séries diárias e insights.
- **VAPI**: KPIs de ligações, séries diárias, motivos de finalização, últimas chamadas e insights.
- **Admin/Config**: telas restritas para administradores (mapeamentos, ingestões, etc.).

## Stack

- **React 18 + TypeScript**
- **Vite** (dev server e build)
- **React Router** (rotas)
- **TanStack React Query** (cache/queries)
- **Supabase** (Auth + Postgres + Views + Edge Functions)
- **Tailwind CSS + shadcn/ui (Radix UI)** (UI)
- **Recharts** (gráficos)

## Funcionalidades

- **Autenticação** via Supabase (sessão persistente + refresh automático).
- **Controle de acesso** por role (`admin`/`user`) com rotas protegidas.
- **Dashboards** por domínio (executivo, conversas, tráfego, VAPI).
- **Filtros globais** persistidos na URL (compartilháveis).
- **Cache e sincronização de dados** com React Query.
- **Modo apresentação (View Mode)** com atalho de teclado.
- **UI moderna** com Tailwind + shadcn/ui + Radix UI.

## Como rodar localmente

Pré-requisitos:

- **Node.js 18+**

Comandos:

```bash
npm install
npm run dev
```

Outros scripts:

```bash
npm run build
npm run preview
npm run lint
```

## Arquitetura (visão técnica)

O app é um SPA React com camadas claras:

```text
UI (pages/components)
  ↓ usa
Hooks (src/hooks) + Contextos (src/contexts)
  ↓ acessa
Supabase Client (src/lib/supabaseClient.ts)
  ↓ consulta
Views/Tabelas (Postgres via Supabase) + Edge Functions
```

- **UI**: páginas em `src/pages` e componentes em `src/components`.
- **Estado**:
  - estado “server” via **React Query** (cache/requests)
  - auth via **AuthContext**
  - filtros globais via **URL search params**
- **Dados**: consultas padronizadas em `src/hooks/useDashboardData.ts`.
- **Manutenção**: constantes/utilitários centralizados em `src/lib/`.

## Rotas da aplicação

- **Público**
  - `/login`
- **Protegido (requer login)**
  - `/dash/executivo`
  - `/dash/conversas`
  - `/dash/trafego`
  - `/dash/vapi`
- **Admin (requer role admin)**
  - `/dash/admin`
  - `/dash/config`

As rotas e paths ficam centralizados em `src/lib/config.ts` (`ROUTES`).

## Autenticação e autorização (RBAC)

O fluxo é:

1. Login com email/senha via Supabase Auth.
2. O hook `useAuth` (em `src/hooks/useAuth.ts`) mantém `user`, `session`, `loading` e busca a **role** do usuário.
3. A role é obtida via RPC (Postgres function): `get_user_role` (constante em `src/lib/supabaseViews.ts` → `SUPABASE_RPC.GET_USER_ROLE`).
4. Rotas protegidas usam `src/components/ProtectedRoute.tsx`:
   - se **não autenticado**, redireciona para `/login`;
   - se `requireAdmin` e usuário não é admin, redireciona para o dashboard.

Componentes/arquivos chave:

- `src/contexts/AuthContext.tsx`: Provider e hook `useAuthContext()`.
- `src/hooks/useAuth.ts`: integração Supabase Auth + role.
- `src/components/ProtectedRoute.tsx`: gate de rota (auth/admin).

## Dados e queries (React Query)

Toda leitura de dados é feita via hooks no arquivo:

- `src/hooks/useDashboardData.ts`

Esse arquivo concentra os hooks por domínio:

- **Executivo**: `useExecutiveKpis`, `useExecutiveDaily`, `useFunnelCurrent`, `useMeetingsUpcoming`
- **Conversas**: `useConversationsKpis`, `useConversationsDaily`, `useConversationsByHour`, `useConversationsHeatmap`
- **Tráfego**: `useTrafegoKpis`, `useTrafegoDaily`, `useTopAds`, `useInvestimento`
- **VAPI**: `useCallsKpis`, `useCallsDaily`, `useCallsEndedReasons`, `useCallsEndedReasonsTrend`, `useCallsLast50`
- **Admin**: `useMappingCoverage`, `useUnmappedCandidates`, `useIngestionRuns`
- **Insights**: `useInsights`, `useInsightsHistory`, `generateInsights`, `testIngestion`
- **Apoio**: `useOrgOptions`, `useLeadsCount`, `useKpiDictionary`

### Fonte da verdade para tabelas/views do Supabase

Para facilitar manutenção e evitar strings repetidas, nomes de views/tabelas ficam em:

- `src/lib/supabaseViews.ts`
  - `SUPABASE_VIEWS`: views (ex.: `vw_dashboard_kpis_30d_v3`)
  - `SUPABASE_TABLES`: tabelas (ex.: `leads_v2`, `ai_insights`)
  - `SUPABASE_RPC`: RPCs (ex.: `get_user_role`)
  - `SUPABASE_EDGE_FUNCTIONS`: edge functions (ex.: `generate-insights`)

## Filtros globais (URL-driven)

O dashboard possui filtros globais persistidos na URL:

- `org` (orgId)
- `period` (`7d | 14d | 30d | 60d | 90d | custom`)
- `start` / `end` (quando `custom`)
- `compare` (comparar com período anterior)
- `source` (opcional)

Implementação:

- `src/hooks/useGlobalFilters.ts` (lê/escreve `searchParams`)
- `src/components/dashboard/GlobalFilterBar.tsx` (UI do filtro)

Defaults e opções:

- `src/lib/config.ts` (`DEFAULT_ORG_ID`, `DEFAULT_PERIOD`, `PERIOD_OPTIONS`, `PERIOD_DAYS`)

## Supabase (tabelas/views/RPC/Edge Functions)

### Cliente

- `src/lib/supabaseClient.ts` usa `SUPABASE_CONFIG` (em `src/lib/config.ts`)

### Views (Postgres)

Centralizadas em `src/lib/supabaseViews.ts` (`SUPABASE_VIEWS`):

- **Executivo**
  - `vw_dashboard_kpis_30d_v3`
  - `vw_dashboard_daily_60d_v3`
  - `vw_funnel_current_v3`
  - `vw_calendar_events_current_v3`
- **Conversas**
  - `vw_kommo_msg_in_daily_60d_v3`
  - `vw_kommo_msg_in_by_hour_7d_v3`
  - `vw_kommo_msg_in_heatmap_30d_v3`
- **Tráfego**
  - `vw_afonsina_custos_funil_dia`
- **VAPI**
  - `v3_calls_daily_v3`
  - `v3_calls_ended_reason_daily`
- **Admin**
  - `vw_funnel_mapping_coverage`
  - `vw_funnel_unmapped_candidates`

### Tabelas

Centralizadas em `src/lib/supabaseViews.ts` (`SUPABASE_TABLES`):

- `leads_v2`
- `trafego`
- `vapi_calls`
- `ai_insights`
- `kpi_dictionary`
- `ingestion_runs`

### RPC

- `get_user_role` (centralizado em `SUPABASE_RPC`)

### Edge Functions

- `generate-insights` (centralizado em `SUPABASE_EDGE_FUNCTIONS`)
- `smart-processor` (centralizado em `SUPABASE_EDGE_FUNCTIONS`)

> Nota de segurança: a chave **anon** é pública por design (client-side), mas o acesso real aos dados depende de **RLS (Row Level Security)** e policies no Supabase.

## Estrutura do projeto

```text
src/
  components/
    dashboard/           # componentes do dashboard (cards, charts, tabelas, layout)
    ui/                  # shadcn/ui
    ProtectedRoute.tsx
  contexts/
    AuthContext.tsx
  hooks/
    useAuth.ts
    useDashboardData.ts
    useGlobalFilters.ts
  lib/
    config.ts            # constantes/config centralizadas
    supabaseViews.ts     # nomes de views/tabelas/RPC/edge functions
    supabaseClient.ts    # cliente Supabase
    format.ts            # formatação (moeda, % etc.)
    dateHelpers.ts       # helpers de datas/períodos
    calculations.ts      # cálculos/reduções (CPL, conversões etc.)
    kpiDefinitions.ts    # fallback de definições de KPI (tooltip)
    utils.ts             # cn()
  pages/
    dash/                # páginas do dashboard
    LoginPage.tsx
```

## Biblioteca de manutenção (`src/lib`)

Os arquivos abaixo foram criados/refatorados para reduzir duplicação e facilitar manutenção:

- `src/lib/config.ts`: constantes globais (rotas, períodos, limites, atalhos, defaults, config do Supabase)
- `src/lib/supabaseViews.ts`: “fonte da verdade” de views/tabelas/RPC/edge functions
- `src/lib/dateHelpers.ts`: helpers de datas/períodos e variação percentual
- `src/lib/calculations.ts`: agregações e cálculos (CPL, conversão, taxas etc.)
- `src/lib/format.ts`: formatação (moeda, número, percentuais, datas)
- `src/lib/kpiDefinitions.ts`: fallback local para tooltips/descrições de KPI
- `src/lib/utils.ts`: `cn()` (clsx + tailwind-merge)

## Convenções de manutenção (importante)

Para manter o projeto fácil de dar manutenção:

- **Views/tabelas/RPC/edge functions**: sempre usar constantes de `src/lib/supabaseViews.ts`
- **Rotas**: sempre usar `ROUTES` de `src/lib/config.ts`
- **Períodos/limites/defaults**: usar constantes de `src/lib/config.ts`
- **Datas**: usar helpers de `src/lib/dateHelpers.ts`
- **Cálculos**: usar `src/lib/calculations.ts`
- **Formatação**: usar `src/lib/format.ts`

## Supabase (configuração)

O cliente fica em `src/lib/supabaseClient.ts` e utiliza `SUPABASE_CONFIG` de `src/lib/config.ts`.

> Nota: a chave **anon** do Supabase é pública (padrão do Supabase), mas **as permissões reais dependem do RLS** no banco.

## Troubleshooting

### Arquivos “vermelhos” no IDE / erros de “Cannot find module …”

Normalmente é cache do TypeScript Language Server.

- No Cursor/VS Code: `Ctrl+Shift+P` → **TypeScript: Restart TS Server**
- Se persistir: `Developer: Reload Window`

### node_modules ausente / dependências não instaladas

Se os imports não forem resolvidos ou o app não rodar:

```bash
npm install
```

## Licença

Defina aqui a licença do repositório (ex.: MIT / Proprietária).
