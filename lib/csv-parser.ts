import Papa from 'papaparse'
import type { CampaignRow, ParsedCSV } from '@/types/campaign'

const REQUIRED_COLUMNS = [
  'campanha', 'objetivo', 'data', 'alcance', 'impressoes',
  'frequencia', 'gasto', 'CPM', 'CPC', 'CTR'
]

const NUMERIC_COLUMNS = [
  'alcance', 'impressoes', 'frequencia', 'gasto', 'CPM', 'CPC', 'CTR',
  'pagina_destino', 'video', 'carrinho', 'checkout', 'compras', 'ROAS',
  'custo_por_lead', 'custo_por_conversa'
]

function cleanNumeric(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const str = String(value).replace(/[R$\s%,]/g, '').replace(',', '.')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

export function parseCSV(content: string): ParsedCSV {
  const errors: string[] = []

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })

  if (result.errors.length > 0) {
    result.errors.forEach(e => {
      errors.push(`Linha ${e.row ?? '?'}: ${e.message}`)
    })
  }

  const columns = result.meta.fields ?? []
  const missingCols = REQUIRED_COLUMNS.filter(
    col => !columns.some(c => c.toLowerCase() === col.toLowerCase())
  )

  if (missingCols.length > 0) {
    errors.push(`Colunas obrigatórias ausentes: ${missingCols.join(', ')}`)
    return {
      data: [],
      errors,
      meta: { totalRows: 0, validRows: 0, columns }
    }
  }

  const data: CampaignRow[] = result.data.map(row => {
    const cleaned: Record<string, string | number> = {}
    for (const [key, value] of Object.entries(row)) {
      if (NUMERIC_COLUMNS.includes(key)) {
        cleaned[key] = cleanNumeric(value)
      } else {
        cleaned[key] = String(value ?? '').trim()
      }
    }
    return cleaned as CampaignRow
  })

  return {
    data,
    errors,
    meta: {
      totalRows: result.data.length,
      validRows: data.length,
      columns
    }
  }
}

export function csvToSummary(rows: CampaignRow[]): string {
  return rows.map(row =>
    `Campanha: ${row.campanha} | Objetivo: ${row.objetivo} | Data: ${row.data} | ` +
    `Gasto: R$${row.gasto} | CTR: ${row.CTR}% | ROAS: ${row.ROAS} | ` +
    `CPM: ${row.CPM} | CPC: ${row.CPC} | Frequência: ${row.frequencia} | ` +
    `Compras: ${row.compras} | Checkout: ${row.checkout} | ` +
    `Custo/Lead: ${row.custo_por_lead} | Custo/Conversa: ${row.custo_por_conversa}`
  ).join('\n')
}
