import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { CampaignRow, AnalysisReport } from '@/types/campaign'
import { csvToSummary } from './csv-parser'
import { detectAnomaliesStatistical, validateAnomaliesAgainstData } from './anomaly-detector'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const AnomalySchema = z.object({
  campanha: z.string(),
  metrica: z.string(),
  valor_atual: z.number(),
  valor_referencia: z.number(),
  severidade: z.enum(['alta', 'media', 'baixa']),
  descricao: z.string(),
  recomendacao: z.string(),
})

const ReportSchema = z.object({
  resumo_executivo: z.string(),
  periodo_analisado: z.string(),
  total_campanhas: z.number(),
  total_gasto: z.number(),
  roas_medio: z.number(),
  anomalias: z.array(AnomalySchema),
  score_geral: z.number().min(0).max(100),
  gerado_em: z.string(),
})

function buildPrompt(rows: CampaignRow[]): string {
  const dadosCsv = csvToSummary(rows)
  const estruturaJson = JSON.stringify({
    resumo_executivo: 'string',
    periodo_analisado: 'string',
    total_campanhas: 0,
    total_gasto: 0,
    roas_medio: 0,
    anomalias: [{
      campanha: 'string',
      metrica: 'string',
      valor_atual: 0,
      valor_referencia: 0,
      severidade: 'alta | media | baixa',
      descricao: 'string',
      recomendacao: 'string'
    }],
    score_geral: 0,
    gerado_em: 'timestamp ISO'
  }, null, 2)

  return `Você é um especialista em análise de campanhas de tráfego pago Meta Ads.

Analise os dados abaixo e identifique anomalias relevantes.
Seja criterioso: nem toda métrica importa para todo objetivo.

Regras por objetivo:
- VENDAS: priorize ROAS, CPA, taxa de checkout para compra
- LEADS: priorize custo por lead, CTR, frequência
- MENSAGENS: priorize custo por conversa, CTR
- RECONHECIMENTO: priorize frequência, CPM, alcance

Critérios de anomalia:
- CPA > 2x a média das outras campanhas do mesmo objetivo = ALTA
- CTR < 0.5% = MÉDIA
- Frequência > 7 = MÉDIA (fadiga de criativo)
- Queda de CTR > 30% em relação ao dia anterior = ALTA
- ROAS < 1.5 em campanha de vendas = ALTA
- Gasto > 20% do total sem nenhuma conversão = ALTA

DADOS DAS CAMPANHAS:
${dadosCsv}

Responda APENAS em JSON válido, sem texto antes ou depois, seguindo exatamente esta estrutura:
${estruturaJson}`
}

async function callClaudeWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      })
      const content = message.content[0]
      if (content.type === 'text') return content.text
      throw new Error('Resposta inesperada da API')
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000))
      }
    }
  }
  throw lastError ?? new Error('Falha após múltiplas tentativas')
}

export async function analyzeWithClaude(rows: CampaignRow[]): Promise<AnalysisReport> {
  const prompt = buildPrompt(rows)

  try {
    const rawResponse = await callClaudeWithRetry(prompt)
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON não encontrado na resposta')

    const parsed = JSON.parse(jsonMatch[0])
    const validated = ReportSchema.parse(parsed)

    validated.anomalias = validateAnomaliesAgainstData(validated.anomalias, rows)
    return validated
  } catch (err) {
    console.error('[Claude] API falhou, usando fallback estatístico:', err instanceof Error ? err.message : err)
    return buildFallbackReport(rows)
  }
}

function buildFallbackReport(rows: CampaignRow[]): AnalysisReport {
  const anomalias = detectAnomaliesStatistical(rows)
  const totalGasto = rows.reduce((s, r) => s + r.gasto, 0)
  const roasValues = rows.filter(r => r.ROAS > 0).map(r => r.ROAS)
  const roasMedio = roasValues.length > 0
    ? roasValues.reduce((a, b) => a + b, 0) / roasValues.length
    : 0

  const datas = rows.map(r => r.data).filter(Boolean).sort()
  const periodo = datas.length > 0 ? `${datas[0]} a ${datas[datas.length - 1]}` : 'N/A'

  const altaCount = anomalias.filter(a => a.severidade === 'alta').length
  const mediaCount = anomalias.filter(a => a.severidade === 'media').length
  // Score: penaliza alta (-10) e média (-5), mínimo 0
  const score = Math.max(0, 100 - (altaCount * 10) - (mediaCount * 5))

  return {
    resumo_executivo: `Análise estatística de ${rows.length} registros de campanha. ${anomalias.length} anomalias detectadas via análise local (Claude API indisponível).`,
    periodo_analisado: periodo,
    total_campanhas: new Set(rows.map(r => r.campanha)).size,
    total_gasto: parseFloat(totalGasto.toFixed(2)),
    roas_medio: parseFloat(roasMedio.toFixed(2)),
    anomalias,
    score_geral: score,
    gerado_em: new Date().toISOString()
  }
}
