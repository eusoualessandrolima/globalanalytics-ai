# GlobalAnalytics AI

> Plataforma inteligente de análise de campanhas Meta Ads com Claude AI e notificação automática via WhatsApp.

Desenvolvido como projeto seletivo da **Global Platform**.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Funcionalidades](#funcionalidades)
4. [Como Rodar Localmente](#como-rodar-localmente)
5. [Deploy na Vercel](#deploy-na-vercel)
6. [Arquitetura](#arquitetura)
7. [Respostas Dissertativas](#respostas-dissertativas)

---

## Visão Geral

**GlobalAnalytics AI** é uma aplicação web que permite ao gestor de tráfego pago fazer upload de um CSV exportado do Meta Ads (Facebook/Instagram Ads) e receber, em poucos segundos, uma análise inteligente do desempenho das campanhas. A análise é feita por um agente Claude AI que:

- Identifica **anomalias** com base em critérios objetivos (CTR baixo, CPA elevado, fadiga de criativo, ROAS deficitário etc.)
- Classifica cada anomalia por **severidade** (alta / média / baixa)
- Gera **recomendações práticas** para cada problema detectado
- Calcula um **Score Geral** de saúde do conjunto de campanhas
- Envia automaticamente um **resumo via WhatsApp** ao gestor responsável

---

## Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Framework | Next.js (App Router) | 14.2.29 |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS | 3.4 |
| IA | Anthropic Claude (`claude-sonnet-4-6`) | SDK 0.52 |
| Parsing | PapaParse | 5.4.1 |
| Validação | Zod | 3.23 |
| Ícones | Lucide React | 0.400 |
| Mensageria | Evolution API (WhatsApp) | REST |
| Deploy | Vercel | — |

### Paleta de Cores

| Função | Hex |
|--------|-----|
| Fundo principal | `#0D1B2A` |
| Painéis secundários | `#111F30` |
| Destaque (botões, links) | `#2D6AE0` |
| Sucesso | `#1D9E75` |
| Alerta | `#EF9F27` |
| Erro / Crítico | `#E24B4A` |

---

## Funcionalidades

### 1. Upload de CSV
- Drag-and-drop ou seleção manual
- Validação de formato (.csv) e tamanho (máximo 10MB)
- Feedback visual em tempo real (drag-over, loading)

### 2. Parsing Inteligente
- Reconhece formato CSV padrão do Meta Ads (28 colunas)
- Normaliza valores numéricos em formato brasileiro (vírgula como decimal, prefixo `R$`, sufixo `%`)
- Reporta colunas faltantes e linhas inválidas como warnings sem bloquear a análise

### 3. Análise por Claude AI
- Prompt estruturado por objetivo de campanha (vendas, leads, mensagens, reconhecimento)
- Regras objetivas de detecção:
  - **CPA > 2x média do objetivo** → severidade alta
  - **CTR < 0,5%** com mais de 1000 impressões → severidade média
  - **Frequência > 7** → severidade média (fadiga)
  - **Queda de CTR > 30%** em relação ao dia anterior → severidade alta
  - **ROAS < 1,5** em campanha de vendas → severidade alta
  - **Gasto > 20% do total sem nenhuma conversão** → severidade alta
- Resposta validada com Zod antes de uso

### 4. Fallback Estatístico
- Se a Claude API falhar (timeout, rate-limit, indisponibilidade), o sistema aplica heurísticas locais equivalentes em `lib/anomaly-detector.ts` para garantir que o usuário sempre receba um relatório.

### 5. Notificação WhatsApp
- Mensagem formatada com emojis e seções:
  - Período analisado
  - Score geral
  - Gasto total e ROAS médio
  - Quantidade de anomalias por severidade
  - Top 3 anomalias críticas com descrição e recomendação
- Disparo "fire-and-forget" — não bloqueia o response da análise

### 6. Interface Web
- **Sidebar** com navegação entre Upload, Relatório e Anomalias
- **Cards de métrica** com Score, Gasto Total, ROAS Médio e Total de Anomalias
- **Lista de anomalias** agrupada por severidade, com expansão de detalhes
- **Estados claros:** idle / loading / done / error

---

## Como Rodar Localmente

### Pré-requisitos

- Node.js 18 ou superior
- npm, yarn ou pnpm
- Chave da Anthropic API ([obter aqui](https://console.anthropic.com))
- (Opcional) Instância Evolution API ativa para notificações WhatsApp

### Passos

```bash
# 1. Clonar o projeto
git clone <repo-url>
cd global-analytics-ia

# 2. Instalar dependências
npm install

# 3. Copiar variáveis de ambiente
cp .env.example .env.local

# 4. Editar .env.local com suas chaves reais
# ANTHROPIC_API_KEY=sk-ant-...
# WHATSAPP_API_URL=https://...
# WHATSAPP_API_KEY=...
# WHATSAPP_INSTANCE=...
# WHATSAPP_NUMBER_DESTINO=5562...

# 5. Rodar em modo desenvolvimento
npm run dev

# 6. Acessar http://localhost:3000
```

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run start` | Inicia build de produção |
| `npm run lint` | Verifica padrões de código |

---

## Deploy na Vercel

### Via Dashboard

1. Importe o repositório no [vercel.com/new](https://vercel.com/new)
2. Configure as variáveis de ambiente (Settings → Environment Variables):
   - `ANTHROPIC_API_KEY`
   - `WHATSAPP_API_URL`
   - `WHATSAPP_API_KEY`
   - `WHATSAPP_INSTANCE`
   - `WHATSAPP_NUMBER_DESTINO`
3. Deploy automático a cada push para `main`

### Via CLI

```bash
npm install -g vercel
vercel login
vercel             # primeiro deploy (preview)
vercel --prod      # deploy de produção
```

---

## Arquitetura

```
global-analytics-ia/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── analyze/route.ts      # POST: parse + análise + notify
│   │   ├── notify/route.ts       # POST: reenvio manual WhatsApp
│   │   └── health/route.ts       # GET: healthcheck
│   ├── globals.css               # Tailwind + reset + scrollbar
│   ├── layout.tsx                # Root layout (lang pt-BR)
│   └── page.tsx                  # Página principal (orquestra UI)
├── components/                   # React components
│   ├── Sidebar.tsx               # Navegação lateral
│   ├── UploadArea.tsx            # Drag-and-drop CSV
│   ├── LoadingState.tsx          # Loading com spinner duplo
│   ├── MetricCards.tsx           # Score, Gasto, ROAS, Anomalias
│   ├── AnomalyList.tsx           # Lista expandível por severidade
│   └── ReportView.tsx            # View do relatório completo
├── lib/                          # Lógica de domínio (server-side)
│   ├── csv-parser.ts             # PapaParse + normalização BR
│   ├── claude-analyzer.ts        # SDK Anthropic + retry + zod
│   ├── anomaly-detector.ts       # Fallback estatístico local
│   ├── report-generator.ts       # Formatação WhatsApp
│   └── whatsapp-notify.ts        # Evolution API client
├── types/
│   └── campaign.ts               # Tipos compartilhados
├── CLAUDE.md                     # Instruções para Claude Code
├── MEMORY.md                     # Memória persistente do projeto
├── SKILLS.md                     # Catálogo de skills/stack
├── Agentes.md                    # Documentação dos agentes AIOX
├── package.json
├── tsconfig.json                 # TS strict + path alias @/
├── tailwind.config.ts            # Paleta customizada
├── postcss.config.js
├── next.config.js
├── vercel.json
├── .gitignore
└── .env.example
```

### Fluxo de Dados

```
[Cliente]                       [Servidor (Vercel/Node)]
   │
   │  1. Upload CSV via drag-and-drop
   ├─────────► POST /api/analyze
   │           │
   │           │  2. parseCSV() — normaliza, valida colunas
   │           │
   │           │  3. analyzeWithClaude() — prompt + retry x3
   │           │     │
   │           │     ├─[sucesso]─► validação Zod
   │           │     │
   │           │     └─[falha]──► buildFallbackReport()
   │           │                  (lib/anomaly-detector)
   │           │
   │           │  4. sendWhatsAppNotification() — fire-and-forget
   │           │     (não bloqueia o response)
   │           │
   │  5. ◄──── 200 OK { report, meta, warnings }
   │
   │  6. Renderiza ReportView (MetricCards + AnomalyList)
   │
   └──► [Usuário recebe WhatsApp ~5s depois]
```

---

## Respostas Dissertativas

### 1. Como o Claude foi utilizado na análise dos dados?

O Claude (`claude-sonnet-4-6`) é o **cérebro analítico** da aplicação. Em `lib/claude-analyzer.ts`, construímos um prompt estruturado que:

1. **Define o papel:** "Você é um especialista em análise de campanhas Meta Ads"
2. **Estabelece regras específicas por objetivo** (vendas, leads, mensagens, reconhecimento) — porque uma campanha de awareness não deve ser julgada pela mesma métrica de uma campanha de venda direta
3. **Lista critérios objetivos de anomalia** (CPA > 2x média, CTR < 0,5%, Frequência > 7, etc.) com severidade calibrada
4. **Serializa o CSV** em formato linha-a-linha (mais eficiente que JSON em tokens)
5. **Força resposta em JSON estrito** com schema explícito — sem markdown, sem texto fora do JSON

A resposta é **validada com Zod** antes de ser consumida (`ReportSchema.parse()`), garantindo que mesmo se o modelo "alucinar" um campo, a aplicação não quebre.

Adicionalmente, implementamos **retry com backoff exponencial** (3 tentativas, delays de 1s → 2s → 4s) para mitigar falhas transitórias, e um **fallback estatístico local** (`lib/anomaly-detector.ts`) que aplica heurísticas equivalentes caso a Claude API esteja indisponível — garantindo que o usuário sempre receba um relatório útil.

### 2. Quais decisões de arquitetura foram tomadas e por quê?

**Next.js 14 com App Router** foi escolhido por unificar frontend e backend em uma única base de código, permitindo desenvolvimento e deploy ágeis na Vercel. O App Router moderno separa naturalmente Server Components (estáticos, sem JS no cliente) de Client Components (interativos), o que reduz o bundle e melhora a performance.

**Stateless por design** — não há banco de dados. Cada análise é processada em memória e retornada ao cliente. Isso simplifica o MVP, elimina riscos de LGPD (nenhum CSV é armazenado), e reduz custo operacional. O trade-off (sem histórico) é aceitável para a fase atual e pode ser adicionado depois sem refatorar o core.

**Server-only para a Claude API** — o SDK Anthropic só é importado em arquivos `app/api/*/route.ts` (executados no servidor). Isso garante que a `ANTHROPIC_API_KEY` jamais vaze para o navegador e impede que o bundle do cliente cresça com dependências pesadas.

**Fire-and-forget para WhatsApp** — após a análise, a notificação é disparada sem aguardar resposta. Justificativa: o Evolution API pode ter latência variável (até 10s), e o usuário não deve esperar isso para ver o relatório. Falhas são logadas mas não bloqueiam o fluxo principal.

**Validação dupla (Zod + Fallback)** — a saída da IA é validada por schema, e se a validação falhar (ou a API estiver fora), uma análise estatística local assume. Defesa em profundidade: o usuário nunca vê uma tela quebrada.

**Imports absolutos com `@/`** — configurado em `tsconfig.json`. Evita strings frágeis como `../../../lib/foo` e facilita refatorações.

**Tailwind com paleta customizada** — as cores oficiais da Global Platform foram registradas em `tailwind.config.ts` como classes utilitárias (`bg-background`, `text-accent`, etc.), garantindo consistência visual sem CSS espalhado.

### 3. Como a aplicação garante resiliência e qualidade?

**Resiliência:**

- **Retry exponencial** na chamada à Claude (3 tentativas com backoff)
- **Fallback estatístico** que replica os critérios da IA com heurísticas locais — usuário sempre recebe relatório
- **Timeouts explícitos** (10s no WhatsApp, 30s no Vercel, 60s no client) para evitar requests pendurados
- **Fire-and-forget** no WhatsApp — falha não bloqueia o response
- **Validação de input** em duas camadas (client: tamanho/formato; server: estrutura/colunas)

**Qualidade:**

- **TypeScript strict mode** em todo o projeto (`strict: true`)
- **Zero `any`** — uso de `unknown` quando o tipo é incerto, com narrowing explícito
- **Zod schemas** validando fronteiras externas (Claude response, request bodies)
- **Estados discriminados** no frontend (`AppState = 'idle' | 'loading' | 'done' | 'error'`)
- **Componentização atomizada** — cada componente tem uma responsabilidade clara
- **Logs estruturados** com prefixos por origem (`[Analyze]`, `[WhatsApp]`, `[Notify]`)
- **Tratamento de erro em todas as routes de API** — nunca retorna 500 sem mensagem útil

### 4. Como o sistema lida com formatos brasileiros e dados sujos?

O CSV do Meta Ads exportado em português brasileiro traz peculiaridades:

- Vírgula como separador decimal (`1,5` em vez de `1.5`)
- Prefixo `R$` em valores monetários
- Sufixo `%` em taxas
- Linhas em branco no início/fim
- Headers com espaços ou caracteres especiais

A função `cleanNumeric()` em `lib/csv-parser.ts` resolve todos esses casos:

```ts
const str = String(value).replace(/[R$\s%,]/g, '').replace(',', '.')
const num = parseFloat(str)
return isNaN(num) ? 0 : num
```

Adicionalmente, o PapaParse é configurado com `skipEmptyLines: true` e `trimHeaders: true`, e validamos as colunas obrigatórias com comparação case-insensitive — tolerando pequenas variações de naming entre exports do Meta.

Se faltar uma coluna obrigatória, retornamos um erro 422 com a lista explícita das colunas ausentes. Se houver linhas malformadas, processamos as válidas e retornamos as inválidas como `warnings` (não-fatais), exibidas no relatório para transparência.

### 5. Próximos passos e melhorias planejadas

| Iteração | Item | Justificativa |
|----------|------|---------------|
| v1.1 | Exportar PDF | Cliente pode arquivar ou compartilhar fisicamente |
| v1.2 | Histórico de análises | Requer auth + Supabase/Neon — habilita comparativo temporal |
| v1.3 | Comparativo período-a-período | Detectar tendências (não só pontos no tempo) |
| v1.4 | Webhook bidirectional | Receber leitura/resposta do WhatsApp |
| v2.0 | Suporte multi-plataforma | Google Ads, TikTok Ads (padrões CSV distintos) |
| v2.1 | Dashboard com gráficos | Recharts ou Tremor — visualização temporal |
| v2.2 | Multi-tenant | Auth + isolamento de dados por agência |

---

## Licença

Projeto desenvolvido para fins de avaliação técnica (Global Platform). Todos os direitos reservados.

## Autor

Desenvolvido com Claude Code (Anthropic) seguindo a metodologia **AIOX (AI-Orchestrated System for Full Stack Development)**.
