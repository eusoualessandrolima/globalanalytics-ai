# Agentes.md — GlobalAnalytics AI

Descrição dos agentes (AIOX) utilizados na construção e manutenção do projeto.

## Visão Geral

O projeto foi desenvolvido seguindo a metodologia AIOX (AI-Orchestrated System for Full Stack Development), com agentes especializados executando responsabilidades específicas.

## Agentes Utilizados

### @dev — Dex (Builder)

**Persona:** Engenheiro full-stack pragmático, focado em entregar código funcional e testável.

**Responsabilidades neste projeto:**
- Implementação de toda a base de código (Next.js + TypeScript)
- Criação dos handlers de API (`/analyze`, `/notify`, `/health`)
- Integração com Anthropic SDK e Evolution API
- Componentização React (Sidebar, UploadArea, MetricCards, AnomalyList, ReportView)
- Lógica de parsing CSV e detecção de anomalias
- Aplicação do protocolo IDS (Incremental Development System): buscar/adaptar antes de criar

**Princípios:**
- Imports absolutos `@/`
- Validação com zod em fronteiras externas
- Tipagem estrita, sem `any`
- Resiliência: fallback estatístico quando IA falha

### @architect — Aria

**Persona:** Arquiteta de sistemas, focada em decisões de design e estrutura.

**Decisões arquiteturais:**
- App Router do Next.js 14 (vs Pages Router) — alinhado com padrão atual
- Stateless por design (sem DB) — simplifica MVP
- Fire-and-forget para WhatsApp — desacopla criticidades
- Validação dupla (zod + fallback estatístico) — defesa em profundidade
- Server-only para SDK Anthropic — protege API key

### @qa — Quinn

**Persona:** Especialista em qualidade, garantindo que entregas atendam aos critérios.

**Validações deste projeto:**
- TypeScript strict mode habilitado
- Validação de input (tamanho, formato) no client e server
- Tratamento de erros em todas as routes de API
- Loading/error states no UI
- Tipos exhaustivos para `AppState`

### @ux-design-expert — Uma

**Persona:** Designer de UX/UI, focada em experiência do usuário.

**Contribuições visuais:**
- Paleta dark mode (#0D1B2A base, #2D6AE0 accent)
- Hierarquia visual: cards de métrica → resumo → anomalias detalhadas
- Severidade por cor (verde/amarelo/vermelho) com ícones lucide
- Drag-and-drop com feedback visual (scale, border, bg)
- Skeleton/loading com spinner duplo + bounce dots

### @devops — Gage

**Persona:** Engenheiro de infraestrutura, responsável por deploy e CI/CD.

**Configurações:**
- `vercel.json` para deploy automático
- `.gitignore` com proteção de `.env*` e build outputs
- `.env.example` documentando variáveis necessárias
- Variáveis sensíveis nunca commitadas

## Fluxo de Colaboração

```
@architect (design) → @dev (implementação) → @qa (validação) → @ux (refinamento) → @devops (deploy)
```

Em projetos AIOX maiores, esse fluxo é orquestrado por handoffs entre agentes (`.aiox/handoffs/`), preservando contexto entre transições.

## Princípios Constitucionais Aplicados

Conforme a Constituição AIOX:

| Artigo | Princípio | Aplicação no projeto |
|--------|-----------|----------------------|
| I | CLI First | `npm run dev/build/lint` |
| II | Agent Authority | Cada decisão respeita o escopo do agente |
| III | Story-Driven | Implementação seguiu especificação prévia |
| IV | No Invention | Apenas requisitos especificados foram implementados |
| V | Quality First | TypeScript strict, validação zod, fallback resiliente |
| VI | Absolute Imports | Configurado em `tsconfig.json` |
