# CLAUDE.md — GlobalAnalytics AI

Instruções específicas deste projeto para o Claude Code. Estas regras complementam as instruções globais do AIOX.

## Visão Geral

**GlobalAnalytics AI** é uma plataforma web (Next.js 14 + TypeScript) desenvolvida como projeto seletivo da Global Platform. Ela permite ao gestor de tráfego fazer upload de um CSV exportado do Meta Ads e receber uma análise inteligente, com detecção de anomalias (CTR baixo, CPA alto, ROAS deficiente, fadiga de criativo etc.) e envio automático de relatório resumido por WhatsApp.

## Stack Confirmada

- **Framework:** Next.js 14 (App Router) + TypeScript estrito
- **Estilização:** Tailwind CSS com paleta customizada
- **IA:** `@anthropic-ai/sdk` (modelo `claude-sonnet-4-6`)
- **Parsing CSV:** `papaparse`
- **Validação:** `zod`
- **Ícones:** `lucide-react`
- **Mensageria:** Evolution API (WhatsApp) via REST
- **Deploy:** Vercel

## Padrões e Convenções

### Imports
- Sempre usar imports absolutos `@/` (configurado em `tsconfig.json`)
- Nunca importar com paths relativos profundos (`../../..`)

### Cores (paleta oficial)
| Variável | Hex | Uso |
|----------|-----|-----|
| `background` | `#0D1B2A` | Fundo principal |
| `secondary` | `#111F30` | Cards, painéis |
| `accent` | `#2D6AE0` | Destaques, botões primários |
| `success` | `#1D9E75` | Estado positivo |
| `warning` | `#EF9F27` | Alertas médios |
| `danger` | `#E24B4A` | Erros, anomalias críticas |

### Tipagem
- Sempre tipar funções públicas com tipos explícitos
- Usar `zod` para validação de payloads externos (Claude API, env vars)
- Nunca usar `any` — preferir `unknown` quando o tipo é incerto

### Estrutura de Diretórios
```
app/             # Pages e API routes (App Router)
  api/           # Server-only handlers
components/      # Componentes React reutilizáveis
lib/             # Lógica de domínio (parsers, analisadores)
types/           # Definições de tipo compartilhadas
```

### API Routes
- Toda route deve responder JSON com `NextResponse.json()`
- Validar inputs com `zod` antes de processar
- Capturar erros e retornar status apropriado (4xx para usuário, 5xx para servidor)
- Logar erros em `console.error` com prefixo `[NomeRoute]`

## Comandos Úteis

```bash
npm install        # instalar dependências
npm run dev        # rodar em modo desenvolvimento (http://localhost:3000)
npm run build      # build de produção
npm run start      # rodar build de produção
npm run lint       # checar lint
```

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```
ANTHROPIC_API_KEY=sk-ant-...
WHATSAPP_API_URL=https://...
WHATSAPP_API_KEY=...
WHATSAPP_INSTANCE=...
WHATSAPP_NUMBER_DESTINO=5562...
```

## Fluxo Principal

1. Usuário faz upload de CSV em `/`
2. Frontend envia para `POST /api/analyze`
3. Backend valida e normaliza CSV (`lib/csv-parser.ts`)
4. Backend chama Claude API com prompt estruturado (`lib/claude-analyzer.ts`)
5. Em caso de falha da Claude, fallback estatístico (`lib/anomaly-detector.ts`)
6. Relatório retorna para frontend e é exibido em `ReportView`
7. Em paralelo, notificação WhatsApp é disparada (`lib/whatsapp-notify.ts`)

## Regras de Anomalia

| Anomalia | Severidade | Critério |
|----------|------------|----------|
| CPA > 2x média do objetivo | Alta | Apenas vendas/conversões |
| CTR < 0,5% | Média | Impressões > 1000 |
| Frequência > 7 | Média | Fadiga de criativo |
| Queda CTR > 30% dia-a-dia | Alta | Comparação cronológica |
| ROAS < 1,5 em vendas | Alta | Campanha de venda |
| Gasto > 20% sem conversão | Alta | Sem compras e sem leads |

## Princípios

- **Resiliência:** Se a Claude API falhar, o sistema deve responder com análise estatística local — nunca cair.
- **Validação:** Toda resposta de IA passa por `zod` antes de ser usada.
- **UX First:** O usuário deve sempre ter feedback visual (loading, erro, sucesso).
- **Privacidade:** Nenhum CSV é persistido. Processamento é totalmente em memória.

## NÃO Fazer

- ❌ Persistir CSV em banco ou disco (processamento é stateless)
- ❌ Confiar cegamente em retorno da Claude — sempre validar com zod
- ❌ Bloquear o response da análise esperando o WhatsApp (fire-and-forget)
- ❌ Expor `ANTHROPIC_API_KEY` no client (usar apenas server-side)
- ❌ Inflar o bundle do client com SDK do Anthropic (apenas em rotas server)

---

## REVISÃO ORTOGRÁFICA E PADRONIZAÇÃO DE TEXTO

Antes de finalizar qualquer implementação, execute uma revisão completa de todos os textos visíveis ao usuário.

Verificar:

- Ortografia
- Gramática
- Concordância verbal
- Concordância nominal
- Acentuação
- Pontuação
- Pluralização
- Capitalização
- Consistência dos termos

Corrigir automaticamente qualquer erro encontrado.

---

## PADRONIZAÇÃO DE UX WRITING

Todos os textos da plataforma devem transmitir profissionalismo e padrão SaaS premium.

Evitar:

- Textos genéricos
- Traduções literais
- Frases mal construídas
- Mensagens técnicas para usuários finais
- Termos inconsistentes

Exemplos:

| ❌ Errado | ✅ Correto |
|-----------|-----------|
| "Campanha analisado" | "Campanha analisada" |
| "Upload feito com sucesso" | "Arquivo enviado com sucesso." |
| "Detected issues" | "Problemas detectados" |
| "Import Data" | "Importar dados" |

---

## AUDITORIA COMPLETA DA INTERFACE

Realizar varredura em todos os textos visíveis ao usuário, incluindo:

- Sidebar e navegação
- Dashboard principal
- Relatórios e análises
- Lista de anomalias
- Área de upload
- Página de configurações
- Modais e overlays
- Alertas e toasts
- Mensagens de erro e sucesso
- Estados vazios (empty states)
- Tooltips e hints
- Placeholders de campos
- Rótulos de botões
- Cabeçalhos de tabelas
- Campos de formulário

Corrigir qualquer erro ortográfico ou inconsistência encontrada.

---

## PADRONIZAÇÃO DE TERMINOLOGIA

Utilizar sempre os mesmos termos em toda a plataforma. Nunca usar variações diferentes para o mesmo conceito.

| Termo correto | Não usar |
|---------------|----------|
| Campanha | campaign, campanha(s) misturado |
| Conjunto de anúncios | ad set, adset |
| Anúncio | ad, criativo (apenas quando referir ao criativo visual) |
| ROAS | Roas, roas |
| CTR | Ctr, ctr |
| CPA | Cpa, cpa |
| Conversões | conversoes, conversão (no plural) |
| Investimento | gasto (preferir "investimento" em contexto de resultado) |
| Análise | analise (sem acento) |
| Relatório | report (fora de contexto técnico) |
| Anomalia | problema, issue |
| Oportunidade | opportunity |

---

## QUALIDADE FINAL

Nenhum texto da interface deve conter:

- ❌ Erros ortográficos
- ❌ Erros gramaticais
- ❌ Textos quebrados ou truncados
- ❌ Traduções incompletas ou literais
- ❌ Mistura de português e inglês sem necessidade técnica

A plataforma deve aparentar ter sido revisada por um UX Writer profissional.

**Após concluir qualquer implementação, gerar um relatório listando todos os textos corrigidos, componentes revisados e inconsistências encontradas durante a auditoria da interface.**
