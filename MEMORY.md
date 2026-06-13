# MEMORY.md — GlobalAnalytics AI

Memória persistente do projeto. Fatos, decisões e contexto que devem sobreviver entre sessões.

## Identidade do Projeto

- **Nome:** GlobalAnalytics AI
- **Contexto:** Projeto seletivo da Global Platform
- **Objetivo:** Analisar campanhas Meta Ads via CSV, detectar anomalias com Claude AI e notificar via WhatsApp
- **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Claude API + Evolution API
- **Data de criação:** 2026-06-13

## Decisões Técnicas

### Modelo Claude
- **Modelo escolhido:** `claude-sonnet-4-6`
- **Justificativa:** Balanço entre custo e qualidade para análise estruturada em JSON; suporta janelas grandes o suficiente para múltiplas campanhas em um único prompt.
- **Max tokens:** 4096 (suficiente para o JSON do relatório, mesmo com dezenas de anomalias).

### Estratégia de Fallback
- A Claude API pode falhar (rate limit, timeout, indisponibilidade).
- Decisão: criar `lib/anomaly-detector.ts` com lógica estatística local que replica os critérios de anomalia.
- Em caso de falha, o `analyzeWithClaude` chama `buildFallbackReport` e o usuário recebe análise local com aviso.

### Validação Zod
- Toda resposta da Claude passa por `ReportSchema.parse()`.
- Se a IA retornar JSON malformado ou campos faltando, o fallback é acionado.

### WhatsApp Fire-and-Forget
- A notificação WhatsApp é disparada após a análise, mas o response da API **não espera** a confirmação.
- Justificativa: latência do Evolution API pode ser alta; o usuário não deve esperar.
- Falhas são logadas mas não bloqueiam o fluxo principal.

### Sem Persistência
- Decisão consciente: o sistema é stateless.
- Justificativa: simplicidade do MVP, conformidade com LGPD, sem dependência de DB.
- Trade-off: usuário precisa reanalisar CSV se recarregar a página.

## Estrutura de Arquivos Chave

| Arquivo | Responsabilidade |
|---------|------------------|
| `app/page.tsx` | UI principal — orquestra estados (idle/loading/done/error) |
| `app/api/analyze/route.ts` | Endpoint principal: parse → análise → notificação |
| `app/api/notify/route.ts` | Endpoint isolado para reenvio manual de notificação |
| `app/api/health/route.ts` | Healthcheck para Vercel |
| `lib/csv-parser.ts` | Parse e normalização do CSV Meta Ads |
| `lib/claude-analyzer.ts` | Integração com Claude + retry exponencial |
| `lib/anomaly-detector.ts` | Detecção estatística local (fallback) |
| `lib/report-generator.ts` | Formatação do relatório para WhatsApp |
| `lib/whatsapp-notify.ts` | Envio via Evolution API |

## Colunas Esperadas do CSV

Obrigatórias: `campanha`, `objetivo`, `data`, `alcance`, `impressoes`, `frequencia`, `gasto`, `CPM`, `CPC`, `CTR`
Opcionais: `pagina_destino`, `video`, `carrinho`, `checkout`, `compras`, `ROAS`, `custo_por_lead`, `custo_por_conversa`

Suporta números formatados em BR (vírgula como decimal, prefixo `R$`, sufixo `%`).

## Limites e Constraints

- **Tamanho máximo do CSV:** 10MB (validado no client)
- **Timeout da análise:** 60s no client, 30s no Vercel (`maxDuration`)
- **Retries Claude:** 3 com backoff exponencial (1s, 2s, 4s)
- **Timeout WhatsApp:** 10s

## Paleta de Cores (Identidade)

| Função | Hex |
|--------|-----|
| Fundo | `#0D1B2A` |
| Secundário | `#111F30` |
| Destaque | `#2D6AE0` |
| Sucesso | `#1D9E75` |
| Alerta | `#EF9F27` |
| Erro | `#E24B4A` |

## Itens Abertos / Próximas Iterações

- [ ] Exportar relatório como PDF
- [ ] Histórico de análises (requer auth + DB)
- [ ] Comparativo temporal entre uploads
- [ ] Suporte a múltiplos formatos CSV (Google Ads, TikTok)
- [ ] Webhook de retorno para confirmação de leitura no WhatsApp
