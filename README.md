# Pinn Growth Dashboard (Afonsina)

Dashboard web de **Business Intelligence** para acompanhar performance de aquisição, conversas, tráfego pago e ligações (VAPI), com autenticação e dados via **Supabase**.

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

## Licença

Defina aqui a licença do repositório (ex.: MIT / Proprietária).
