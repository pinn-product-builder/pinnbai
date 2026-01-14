# Pinn Growth Dashboard (Afonsina)

Este projeto é um dashboard de BI feito em **React + TypeScript** para consolidar métricas de aquisição e operação: **executivo**, **conversas**, **tráfego** e **VAPI**. A fonte de dados e autenticação é o **Supabase** (Auth + Postgres + Views + Edge Functions).

## O que o projeto resolve (visão de dev)

Na prática, ele resolve duas dores comuns:

- **Centralizar números** que ficam espalhados em Ads/CRM/telefonia (e.g. leads, entradas, reuniões, custos, chamadas).
- **Operar e acompanhar tendência** (séries diárias, heatmaps, top anúncios, motivos de encerramento) com filtros e cache.

## Funcionalidades (por tela)

- **Executivo**: KPIs principais, evolução diária, funil atual, próximas reuniões e insights.
- **Conversas**: KPIs de mensagens, série diária, distribuição por hora, heatmap e tabelas.
- **Tráfego**: investimento, CPL, entradas, custo por reunião, top anúncios e série diária.
- **VAPI**: KPIs de ligações, série diária, motivos de finalização e últimas chamadas.
- **Admin/Config**: páginas restritas ao admin para mapeamentos e operações (ingestões, etc.).

## Stack

- React 18 + TypeScript
- Vite
- React Router
- TanStack React Query
- Supabase (Auth + Postgres Views + Edge Functions)
- Tailwind + shadcn/ui (Radix UI)
- Recharts

## Como rodar localmente

Pré-requisitos: Node.js 18+

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

## Arquitetura (alto nível)

O app é um SPA com três “blocos” principais:

1. **UI** (páginas + componentes) renderiza gráficos/tabelas/cards.
2. **Hooks/Contextos** concentram regra de negócio e estado (auth, filtros e queries).
3. **Supabase** fornece sessão + dados via views/tabelas e algumas edge functions.

```text
pages/components  →  hooks/contexts  →  supabaseClient  →  views/tabelas/edge functions
```

## Rotas

Rotas ficam centralizadas em `src/lib/config.ts` (`ROUTES`).

- Público: `/login`
- Protegido:
  - `/dash/executivo`
  - `/dash/conversas`
  - `/dash/trafego`
  - `/dash/vapi`
- Admin:
  - `/dash/admin`
  - `/dash/config`

## Autenticação e RBAC (admin/user)

Arquivos-chave:

- `src/contexts/AuthContext.tsx`: provider do estado de autenticação.
- `src/hooks/useAuth.ts`: integra com Supabase Auth e resolve **role**.
- `src/components/ProtectedRoute.tsx`: protege rotas e faz redirects.

Fluxo:

1. Login via `supabase.auth.signInWithPassword`.
2. `useAuth` escuta `onAuthStateChange` e chama RPC para buscar a role.
3. A role vem da RPC `get_user_role` (centralizada em `src/lib/supabaseViews.ts` → `SUPABASE_RPC.GET_USER_ROLE`).
4. `ProtectedRoute` bloqueia acesso e redireciona quando necessário.

## Filtros globais (persistidos na URL)

O dashboard usa filtros globais que ficam na URL (compartilháveis):

- `org`: orgId
- `period`: `7d | 14d | 30d | 60d | 90d | custom`
- `start` / `end`: quando `period=custom`
- `compare`: `true|false`
- `source`: opcional

Implementação:

- `src/hooks/useGlobalFilters.ts`: lê/escreve `searchParams`.
- `src/components/dashboard/GlobalFilterBar.tsx`: UI do filtro.
- Defaults/opções em `src/lib/config.ts`: `DEFAULT_ORG_ID`, `DEFAULT_PERIOD`, `PERIOD_OPTIONS`, `PERIOD_DAYS`.

## Dados (React Query) e “fonte da verdade”

Todas as queries estão em `src/hooks/useDashboardData.ts`.

O padrão é:

- `queryKey` bem definido (ex.: `['executive-kpis', orgId, period]`)
- `enabled: !!orgId` quando faz sentido
- cache/refetch automático do React Query

### Views/tabelas/RPC/Edge Functions centralizados

Para evitar strings “soltas” no código, a aplicação centraliza nomes do Supabase em:

- `src/lib/supabaseViews.ts`
  - `SUPABASE_VIEWS`: views (KPIs, séries, funil, calendário, etc.)
  - `SUPABASE_TABLES`: tabelas (leads, tráfego, insights, etc.)
  - `SUPABASE_RPC`: RPCs (role)
  - `SUPABASE_EDGE_FUNCTIONS`: edge functions (insights/ingestão)

Isso é o que deixa a manutenção mais tranquila: se o nome de uma view muda, você altera em **um lugar**.

## Supabase (como o projeto usa)

- Cliente: `src/lib/supabaseClient.ts` (config via `SUPABASE_CONFIG` em `src/lib/config.ts`)
- Views principais (ver `SUPABASE_VIEWS`):
  - Executivo: `vw_dashboard_kpis_30d_v3`, `vw_dashboard_daily_60d_v3`, `vw_funnel_current_v3`, `vw_calendar_events_current_v3`
  - Conversas: `vw_kommo_msg_in_daily_60d_v3`, `vw_kommo_msg_in_by_hour_7d_v3`, `vw_kommo_msg_in_heatmap_30d_v3`
  - Tráfego: `vw_afonsina_custos_funil_dia`
  - VAPI: `v3_calls_daily_v3`, `v3_calls_ended_reason_daily`
  - Admin: `vw_funnel_mapping_coverage`, `vw_funnel_unmapped_candidates`

> Nota de segurança: a chave **anon** é pública por design (client-side). O que protege os dados é **RLS + policies** no Supabase.

## Estrutura do projeto

```text
src/
  components/
    dashboard/           # layout/cards/charts/tabelas do dashboard
    ui/                  # shadcn/ui
    ProtectedRoute.tsx
  contexts/
    AuthContext.tsx
  hooks/
    useAuth.ts
    useDashboardData.ts
    useGlobalFilters.ts
  lib/
    config.ts
    supabaseViews.ts
    supabaseClient.ts
    dateHelpers.ts
    calculations.ts
    format.ts
    kpiDefinitions.ts
    utils.ts
  pages/
    dash/                # páginas por domínio (executivo/conversas/tráfego/vapi/admin/config)
    LoginPage.tsx
```

## Manutenção (do jeito que eu manteria)

Regras simples que evitam dor:

- **Não hardcode** nome de view/tabela/RPC: use `src/lib/supabaseViews.ts`.
- **Não hardcode** rotas: use `ROUTES` (`src/lib/config.ts`).
- Para datas/períodos: use `src/lib/dateHelpers.ts`.
- Para cálculos: use `src/lib/calculations.ts`.
- Para formatação (R$, %, etc.): use `src/lib/format.ts`.

## Troubleshooting

### “Cannot find module …” / arquivos vermelhos no IDE

Normalmente é cache do TS Server:

- `Ctrl+Shift+P` → **TypeScript: Restart TS Server**
- se persistir: `Developer: Reload Window`

### Dependências

Se `node_modules` não existir ou estiver quebrado:

```bash
npm install
```

## Licença

Defina a licença do repositório (MIT / Proprietária / etc.).
