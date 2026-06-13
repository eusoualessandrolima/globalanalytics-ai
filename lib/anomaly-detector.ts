import type { CampaignRow, Anomaly } from '@/types/campaign'

function avg(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

export function detectAnomaliesStatistical(rows: CampaignRow[]): Anomaly[] {
  const anomalies: Anomaly[] = []

  const byObjective: Record<string, CampaignRow[]> = {}
  for (const row of rows) {
    const obj = (row.objetivo || 'outros').toLowerCase()
    if (!byObjective[obj]) byObjective[obj] = []
    byObjective[obj].push(row)
  }

  for (const [objetivo, campaigns] of Object.entries(byObjective)) {
    // CPA > 2x media
    if (['vendas', 'conversoes'].some(o => objetivo.includes(o))) {
      const cpas = campaigns.filter(c => c.compras > 0).map(c => c.gasto / c.compras)
      const avgCPA = avg(cpas)
      for (const camp of campaigns) {
        if (camp.compras > 0) {
          const cpa = camp.gasto / camp.compras
          if (cpa > avgCPA * 2) {
            anomalies.push({
              campanha: camp.campanha,
              metrica: 'CPA',
              valor_atual: parseFloat(cpa.toFixed(2)),
              valor_referencia: parseFloat(avgCPA.toFixed(2)),
              severidade: 'alta',
              descricao: `CPA de R$${cpa.toFixed(2)} é ${(cpa/avgCPA).toFixed(1)}x acima da média do objetivo`,
              recomendacao: 'Revisar criativos e segmentação desta campanha'
            })
          }
        }
      }
    }

    // CTR < 0.5%
    for (const camp of campaigns) {
      if (camp.CTR < 0.5 && camp.impressoes > 1000) {
        anomalies.push({
          campanha: camp.campanha,
          metrica: 'CTR',
          valor_atual: camp.CTR,
          valor_referencia: 0.5,
          severidade: 'media',
          descricao: `CTR de ${camp.CTR}% está abaixo do mínimo recomendado de 0.5%`,
          recomendacao: 'Testar novos criativos ou revisar copy do anúncio'
        })
      }

      // Frequência > 7
      if (camp.frequencia > 7) {
        anomalies.push({
          campanha: camp.campanha,
          metrica: 'Frequência',
          valor_atual: camp.frequencia,
          valor_referencia: 7,
          severidade: 'media',
          descricao: `Frequência de ${camp.frequencia} indica fadiga de criativo`,
          recomendacao: 'Renovar criativos ou expandir público-alvo'
        })
      }

      // ROAS < 1.5 em campanhas de vendas
      if (['vendas', 'conversoes'].some(o => objetivo.includes(o)) && camp.ROAS > 0 && camp.ROAS < 1.5) {
        anomalies.push({
          campanha: camp.campanha,
          metrica: 'ROAS',
          valor_atual: camp.ROAS,
          valor_referencia: 1.5,
          severidade: 'alta',
          descricao: `ROAS de ${camp.ROAS} está abaixo do mínimo de 1.5`,
          recomendacao: 'Campanha está gerando prejuízo — pausar ou revisar estratégia'
        })
      }
    }

    // Gasto sem conversão
    const totalGasto = campaigns.reduce((s, c) => s + c.gasto, 0)
    for (const camp of campaigns) {
      if (camp.gasto > totalGasto * 0.2 && camp.compras === 0 && camp.custo_por_lead === 0) {
        anomalies.push({
          campanha: camp.campanha,
          metrica: 'Gasto sem conversão',
          valor_atual: camp.gasto,
          valor_referencia: totalGasto * 0.2,
          severidade: 'alta',
          descricao: `Campanha consumiu ${((camp.gasto/totalGasto)*100).toFixed(0)}% do orçamento sem conversões`,
          recomendacao: 'Pausar campanha imediatamente e revisar configurações de conversão'
        })
      }
    }
  }

  // Queda brusca de CTR por dia
  const byCampaign: Record<string, CampaignRow[]> = {}
  for (const row of rows) {
    if (!byCampaign[row.campanha]) byCampaign[row.campanha] = []
    byCampaign[row.campanha].push(row)
  }

  for (const [campanha, days] of Object.entries(byCampaign)) {
    const sorted = [...days].sort((a, b) => a.data.localeCompare(b.data))
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].CTR
      const curr = sorted[i].CTR
      if (prev > 0 && (prev - curr) / prev > 0.3) {
        anomalies.push({
          campanha,
          metrica: 'Queda de CTR',
          valor_atual: curr,
          valor_referencia: prev,
          severidade: 'alta',
          descricao: `CTR caiu ${(((prev-curr)/prev)*100).toFixed(0)}% de ${sorted[i-1].data} para ${sorted[i].data}`,
          recomendacao: 'Verificar mudanças no criativo ou aumento de concorrência no leilão'
        })
      }
    }
  }

  return anomalies
}

export function validateAnomaliesAgainstData(anomalies: Anomaly[], rows: CampaignRow[]): Anomaly[] {
  const campaignNames = new Set(rows.map(r => r.campanha))
  return anomalies.filter(a => campaignNames.has(a.campanha))
}
