import Papa from 'papaparse'
import type { CampaignRow, ParsedCSV } from '@/types/campaign'

// Normaliza texto removendo acentos e espaços extras para comparação fuzzy
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9]/g, '') // remove tudo que não é letra/número
    .trim()
}

// Mapeamento flexível: chave = nome normalizado do Meta Ads → valor = nome interno
const COLUMN_MAP: Record<string, string> = {
  // campanha
  campanha: 'campanha',
  nomecampanha: 'campanha',
  nomeda: 'campanha', // "Nome da Campanha"
  campaign: 'campanha',
  campaignname: 'campanha',

  // objetivo
  objetivo: 'objetivo',
  objective: 'objetivo',

  // data
  data: 'data',
  date: 'data',
  datadeinicio: 'data',
  datainicio: 'data',
  periodo: 'data',
  reportingstart: 'data',
  dia: 'data',

  // alcance
  alcance: 'alcance',
  reach: 'alcance',

  // impressoes
  impressoes: 'impressoes',
  impressions: 'impressoes',

  // frequencia
  frequencia: 'frequencia',
  frequency: 'frequencia',

  // gasto
  gasto: 'gasto',
  valorusadobrl: 'gasto',
  quantiagastadobrl: 'gasto',
  valorgastobrl: 'gasto',
  amountspent: 'gasto',
  spend: 'gasto',
  custototal: 'gasto',
  investimento: 'gasto',

  // CPM
  cpm: 'CPM',
  cpmcustopor1000impressoes: 'CPM',
  custopormilimpressoes: 'CPM',

  // CPC
  cpctodos: 'CPC',
  cpc: 'CPC',
  custoportodos: 'CPC',
  custoporcliquelink: 'CPC',

  // CTR
  ctrtodos: 'CTR',
  ctr: 'CTR',
  taxadecliques: 'CTR',

  // pagina_destino (cliques no link)
  paginadestino: 'pagina_destino',
  cliquesnolink: 'pagina_destino',
  linkclicks: 'pagina_destino',
  cliqueslink: 'pagina_destino',

  // video
  visualizacoesvideo: 'video',
  videoviews: 'video',
  video: 'video',

  // carrinho
  adicionosaocarrinho: 'carrinho',
  adicionaosaocarrinho: 'carrinho',
  addtocart: 'carrinho',
  carrinho: 'carrinho',
  addstobasket: 'carrinho',

  // checkout
  checkoutsiniciados: 'checkout',
  checkoutiniciado: 'checkout',
  initiatedcheckouts: 'checkout',
  checkout: 'checkout',

  // compras
  compras: 'compras',
  purchases: 'compras',
  purchase: 'compras',
  vendassite: 'compras',

  // ROAS
  roas: 'ROAS',
  roasdecomprasnawebsite: 'ROAS',
  roascompras: 'ROAS',
  websitepurchaseroas: 'ROAS',
  retornoinvestimento: 'ROAS',

  // custo_por_lead
  custoparlead: 'custo_por_lead',
  custoporlead: 'custo_por_lead',
  costperlead: 'custo_por_lead',
  custoporesultado: 'custo_por_lead',
  leads: 'custo_por_lead',
  cpl: 'custo_por_lead',

  // custo_por_conversa
  custoporconversa: 'custo_por_conversa',
  custoporiniciodeconversa: 'custo_por_conversa',
  messagingconversationsstarted: 'custo_por_conversa',
  customensagem: 'custo_por_conversa',
  conversas: 'custo_por_conversa',
}

const NUMERIC_COLUMNS = [
  'alcance', 'impressoes', 'frequencia', 'gasto', 'CPM', 'CPC', 'CTR',
  'pagina_destino', 'video', 'carrinho', 'checkout', 'compras', 'ROAS',
  'custo_por_lead', 'custo_por_conversa'
]

function cleanNumeric(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const str = String(value)
    .replace(/R\$\s?/g, '')
    .replace(/\s/g, '')
    .replace('%', '')
    .replace(/\./g, '') // separador de milhar BR
    .replace(',', '.')  // decimal BR
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

// Tenta mapear nome de coluna do CSV para nome interno
function mapColumnName(rawCol: string): string | null {
  const key = normalize(rawCol)
  return COLUMN_MAP[key] ?? null
}

export function parseCSV(content: string): ParsedCSV {
  const errors: string[] = []
  const warnings: string[] = []

  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
  })

  if (result.errors.length > 0) {
    result.errors.slice(0, 5).forEach(e => {
      errors.push(`Linha ${e.row ?? '?'}: ${e.message}`)
    })
  }

  const rawColumns = result.meta.fields ?? []

  if (rawColumns.length === 0) {
    errors.push('Arquivo CSV sem colunas reconhecidas. Verifique se o arquivo está no formato correto.')
    return { data: [], errors, meta: { totalRows: 0, validRows: 0, columns: [] } }
  }

  // Construir mapeamento de coluna original → nome interno
  const colMapping: Record<string, string> = {}
  const unmappedCols: string[] = []

  for (const col of rawColumns) {
    const mapped = mapColumnName(col)
    if (mapped) {
      colMapping[col] = mapped
    } else {
      unmappedCols.push(col)
    }
  }

  const mappedInternals = new Set(Object.values(colMapping))

  // Verificar colunas mínimas obrigatórias
  const hasAnyIdentifier = mappedInternals.has('campanha') || mappedInternals.has('objetivo') || mappedInternals.has('data')
  const hasAnyMetric = mappedInternals.has('gasto') || mappedInternals.has('CTR') || mappedInternals.has('impressoes') || mappedInternals.has('ROAS')

  if (!hasAnyIdentifier && !hasAnyMetric) {
    const colList = rawColumns.slice(0, 8).join(', ')
    errors.push(
      `Nenhuma coluna reconhecida do Meta Ads encontrada. ` +
      `Colunas no arquivo: ${colList}${rawColumns.length > 8 ? '...' : ''}. ` +
      `Certifique-se de exportar o relatório diretamente do Meta Ads (Gerenciador de Anúncios → Exportar → CSV).`
    )
    return { data: [], errors, meta: { totalRows: 0, validRows: 0, columns: rawColumns } }
  }

  if (unmappedCols.length > 0 && unmappedCols.length <= 10) {
    warnings.push(`Colunas não mapeadas (ignoradas): ${unmappedCols.join(', ')}`)
  }

  // Processar linhas normalizando os nomes das colunas
  const data: CampaignRow[] = result.data.map((rawRow) => {
    const row: Record<string, string | number> = {
      campanha: '', objetivo: '', data: '',
      alcance: 0, impressoes: 0, frequencia: 0, gasto: 0,
      CPM: 0, CPC: 0, CTR: 0, pagina_destino: 0, video: 0,
      carrinho: 0, checkout: 0, compras: 0, ROAS: 0,
      custo_por_lead: 0, custo_por_conversa: 0,
    }

    for (const [rawKey, value] of Object.entries(rawRow)) {
      const internalKey = colMapping[rawKey]
      if (!internalKey) continue

      if (NUMERIC_COLUMNS.includes(internalKey)) {
        row[internalKey] = cleanNumeric(value)
      } else {
        row[internalKey] = String(value ?? '').trim()
      }
    }

    // Fallback: se campanha vazia, tentar nome do conjunto/anúncio
    if (!row.campanha) {
      for (const [rawKey, value] of Object.entries(rawRow)) {
        const k = normalize(rawKey)
        if (k.includes('conjunto') || k.includes('anuncio') || k.includes('adset')) {
          row.campanha = String(value ?? '').trim()
          break
        }
      }
    }

    return row as CampaignRow
  })

  const validData = data.filter(r =>
    (r.campanha || r.objetivo) &&
    (r.gasto > 0 || r.impressoes > 0 || r.CTR > 0)
  )

  if (validData.length === 0 && data.length > 0) {
    warnings.push('Linhas encontradas mas sem dados numéricos válidos. Verifique se o arquivo tem dados de desempenho.')
  }

  return {
    data: validData.length > 0 ? validData : data,
    errors: [...errors, ...warnings],
    meta: {
      totalRows: result.data.length,
      validRows: validData.length > 0 ? validData.length : data.length,
      columns: rawColumns,
    }
  }
}

export function csvToSummary(rows: CampaignRow[]): string {
  return rows.map(row =>
    `Campanha: ${row.campanha || '(sem nome)'} | Objetivo: ${row.objetivo || 'N/A'} | Data: ${row.data || 'N/A'} | ` +
    `Gasto: R$${row.gasto} | CTR: ${row.CTR}% | ROAS: ${row.ROAS} | ` +
    `CPM: ${row.CPM} | CPC: ${row.CPC} | Frequência: ${row.frequencia} | ` +
    `Compras: ${row.compras} | Checkout: ${row.checkout} | ` +
    `Custo/Lead: ${row.custo_por_lead} | Custo/Conversa: ${row.custo_por_conversa}`
  ).join('\n')
}
