# SKILLS.md — GlobalAnalytics AI

Catálogo de skills, ferramentas e domínios de conhecimento utilizados no projeto.

## Frontend

### Next.js 14 (App Router)
- **Versão:** 14.2.29
- **Padrões usados:** Server Components por padrão, Client Components (`'use client'`) onde há interatividade
- **Rotas:** App Router (`app/page.tsx`, `app/api/*/route.ts`)
- **Layouts:** Root layout em `app/layout.tsx`

### React 18
- **Hooks usados:** `useState`, `useCallback`, `useRef`
- **Padrão:** Componentes funcionais, sem classes
- **Composição:** Componentização atomizada (Sidebar, MetricCards, AnomalyList, etc.)

### TypeScript 5
- **Modo:** `strict: true`
- **Convenções:**
  - Interfaces para shapes de dados
  - Tipos discriminados (`AppState = 'idle' | 'loading' | ...`)
  - Sem `any` — usar `unknown` quando necessário

### Tailwind CSS 3.4
- **Configuração:** Paleta customizada em `tailwind.config.ts`
- **Classes utilizadas:** Flexbox, Grid, transitions, hover states, dark theme
- **Convenção:** Classes inline; sem CSS modules

### Lucide React (Ícones)
- **Versão:** 0.400.0
- **Ícones usados:** `BarChart3`, `Upload`, `FileText`, `Zap`, `Target`, `DollarSign`, `TrendingUp`, `AlertTriangle`, `AlertCircle`, `Info`, `Clock`, `ChevronUp`, `ChevronDown`

## Backend / Server

### Anthropic SDK
- **Versão:** 0.52.0
- **Modelo:** `claude-sonnet-4-6`
- **Padrão:** Inicialização única do client; chamadas via `messages.create`
- **Retry:** Backoff exponencial manual (3 tentativas)

### PapaParse
- **Versão:** 5.4.1
- **Configuração:** `header: true`, `skipEmptyLines: true`, `trimHeaders: true`
- **Validação:** Verifica colunas obrigatórias, normaliza valores numéricos BR

### Zod
- **Versão:** 3.23.8
- **Uso:** Validação de schema da resposta da Claude (`ReportSchema`, `AnomalySchema`)
- **Padrão:** Schemas em escopo de módulo, parse no consumo

### Evolution API (WhatsApp)
- **Protocolo:** REST POST `/message/sendText/{instance}`
- **Autenticação:** Header `apikey`
- **Timeout:** 10s via `AbortSignal.timeout`

## Domínio: Análise de Tráfego Pago

### Métricas Centrais
- **CTR (Click-Through Rate):** % de cliques sobre impressões. Saudável: > 1%
- **CPM (Custo por Mil Impressões):** Custo de mostrar o anúncio 1000 vezes
- **CPC (Custo por Clique):** Custo médio de cada clique
- **CPA (Custo por Aquisição):** Gasto / compras
- **ROAS (Return on Ad Spend):** Receita / gasto. Saudável: > 1.5
- **Frequência:** Vezes que o mesmo usuário viu o anúncio. > 7 = fadiga

### Objetivos de Campanha
- **VENDAS / CONVERSÕES:** Foco em ROAS, CPA, checkout-para-compra
- **LEADS:** Foco em custo por lead, CTR, frequência
- **MENSAGENS:** Foco em custo por conversa
- **RECONHECIMENTO:** Foco em alcance, frequência, CPM

## Engenharia de Prompts

### Estrutura do Prompt
- **System Context:** "Você é um especialista em análise Meta Ads"
- **Rules:** Critérios objetivos por objetivo + severidade
- **Data:** CSV serializado em formato linha-a-linha
- **Output Spec:** JSON estrito com schema explícito

### Anti-padrões evitados
- ❌ Pedir markdown — quebra parsing
- ❌ Permitir respostas livres — sem schema
- ❌ Não validar JSON — risco de runtime error

## DevOps / Deploy

### Vercel
- **Configuração:** `vercel.json` minimal (framework next, build/dev/install padrão)
- **Variáveis:** definidas no dashboard ou via CLI `vercel env`
- **Cold start:** mitigado pelo timeout de 30s do route

### Environment
- Node.js 18+
- Variáveis sensíveis em `.env.local` (gitignored)
- Variáveis públicas com prefixo `NEXT_PUBLIC_`

## Padrões de Resiliência

### Retry com Backoff
- Tentativas: 3
- Delays: 1s → 2s → 4s
- Aplicado: chamadas à Claude API

### Fallback Estatístico
- Quando: qualquer falha de IA (timeout, parse, validação)
- O que faz: aplica heurísticas locais que mimetizam a análise da IA
- Resultado: usuário sempre recebe um relatório, mesmo offline da Claude

### Fire-and-Forget
- Aplicado: notificação WhatsApp pós-análise
- Justificativa: não bloquear UX por dependência externa de baixa criticidade
