import type { AnalysisReport, Anomaly } from '@/types/campaign'

export function groupAnomaliesBySeverity(anomalias: Anomaly[]) {
  return {
    alta: anomalias.filter(a => a.severidade === 'alta'),
    media: anomalias.filter(a => a.severidade === 'media'),
    baixa: anomalias.filter(a => a.severidade === 'baixa'),
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatWhatsAppMessage(report: AnalysisReport): string {
  const { alta, media, baixa } = groupAnomaliesBySeverity(report.anomalias)
  const top3 = report.anomalias
    .sort((a, b) => {
      const order = { alta: 0, media: 1, baixa: 2 }
      return order[a.severidade] - order[b.severidade]
    })
    .slice(0, 3)

  const top3Text = top3.map((a, i) =>
    `${i + 1}. *${a.campanha}* — ${a.metrica}\n   📌 ${a.descricao}\n   💡 ${a.recomendacao}`
  ).join('\n\n')

  return `🤖 *GlobalAnalytics AI — Relatório de Campanhas*

📅 *Período:* ${report.periodo_analisado}
📊 *Score Geral:* ${report.score_geral}/100
💰 *Gasto Total:* ${formatCurrency(report.total_gasto)}
📈 *ROAS Médio:* ${report.roas_medio.toFixed(2)}x

⚠️ *Anomalias Detectadas:*
🔴 Alta severidade: ${alta.length}
🟡 Média severidade: ${media.length}
🟢 Baixa severidade: ${baixa.length}

🏆 *Top 3 Anomalias Críticas:*

${top3Text}

_Relatório gerado em ${new Date(report.gerado_em).toLocaleString('pt-BR')}_`
}
