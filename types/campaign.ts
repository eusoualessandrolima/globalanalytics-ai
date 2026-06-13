export interface CampaignRow {
  campanha: string
  objetivo: string
  data: string
  alcance: number
  impressoes: number
  frequencia: number
  gasto: number
  CPM: number
  CPC: number
  CTR: number
  pagina_destino: number
  video: number
  carrinho: number
  checkout: number
  compras: number
  ROAS: number
  custo_por_lead: number
  custo_por_conversa: number
  [key: string]: string | number
}

export interface Anomaly {
  campanha: string
  metrica: string
  valor_atual: number
  valor_referencia: number
  severidade: 'alta' | 'media' | 'baixa'
  descricao: string
  recomendacao: string
}

export interface AnalysisReport {
  resumo_executivo: string
  periodo_analisado: string
  total_campanhas: number
  total_gasto: number
  roas_medio: number
  anomalias: Anomaly[]
  score_geral: number
  gerado_em: string
}

export interface ParsedCSV {
  data: CampaignRow[]
  errors: string[]
  meta: {
    totalRows: number
    validRows: number
    columns: string[]
  }
}
