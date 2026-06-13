import type { AnalysisReport } from '@/types/campaign'
import { TrendingUp, DollarSign, AlertTriangle, Target } from 'lucide-react'

interface MetricCardsProps {
  report: AnalysisReport
}

export default function MetricCards({ report }: MetricCardsProps) {
  const altaCount = report.anomalias.filter(a => a.severidade === 'alta').length
  const scoreColor = report.score_geral >= 80 ? 'text-success' : report.score_geral >= 60 ? 'text-warning' : 'text-danger'

  const cards = [
    {
      icon: Target,
      label: 'Score Geral',
      value: `${report.score_geral}/100`,
      sub: report.score_geral >= 80 ? 'Excelente' : report.score_geral >= 60 ? 'Regular' : 'Crítico',
      color: 'text-accent',
      valueColor: scoreColor,
    },
    {
      icon: DollarSign,
      label: 'Gasto Total',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(report.total_gasto),
      sub: `${report.total_campanhas} campanhas`,
      color: 'text-success',
      valueColor: 'text-white',
    },
    {
      icon: TrendingUp,
      label: 'ROAS Médio',
      value: `${report.roas_medio.toFixed(2)}x`,
      sub: report.roas_medio >= 1.5 ? 'Saudável' : 'Abaixo do ideal',
      color: 'text-warning',
      valueColor: report.roas_medio >= 1.5 ? 'text-success' : 'text-danger',
    },
    {
      icon: AlertTriangle,
      label: 'Anomalias',
      value: `${report.anomalias.length}`,
      sub: `${altaCount} de alta severidade`,
      color: 'text-danger',
      valueColor: altaCount > 0 ? 'text-danger' : 'text-success',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(({ icon: Icon, label, value, sub, color, valueColor }) => (
        <div key={label} className="bg-secondary rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Icon className={color} size={18} />
            <span className="text-white/60 text-sm">{label}</span>
          </div>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          <p className="text-white/40 text-xs mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}
