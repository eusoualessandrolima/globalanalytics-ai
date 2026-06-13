'use client'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Target, DollarSign, TrendingUp, AlertTriangle, BarChart2, Activity, Users, ShoppingCart } from 'lucide-react'
import type { AnalysisReport, CampaignRow } from '@/types/campaign'

interface MetricCardsProps {
  report: AnalysisReport
  rows?: CampaignRow[]
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current) }
  }, [target, duration])
  return value
}

function MetricCard({
  icon: Icon,
  label,
  value,
  formatted,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType
  label: string
  value: number
  formatted: string
  sub: string
  color: string
  delay: number
}) {
  const animated = useCountUp(value)
  const displayValue = formatted.replace(String(Math.round(value)), String(Math.round(animated)))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="glass glass-hover rounded-xl p-5 group cursor-default"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.07] transition-colors`}>
          <Icon size={16} className={color} />
        </div>
        <span className="text-[10px] text-white/25 font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{displayValue}</p>
      <p className="text-white/40 text-xs mt-1">{sub}</p>
    </motion.div>
  )
}

export default function MetricCards({ report, rows }: MetricCardsProps) {
  const altaCount = report.anomalias.filter(a => a.severidade === 'alta').length
  const avgCTR = rows && rows.length > 0 ? rows.reduce((s, r) => s + (r.CTR || 0), 0) / rows.length : 0
  const avgFreq = rows && rows.length > 0 ? rows.reduce((s, r) => s + (r.frequencia || 0), 0) / rows.length : 0
  const totalCompras = rows ? rows.reduce((s, r) => s + (r.compras || 0), 0) : 0
  const avgCPA = totalCompras > 0 ? report.total_gasto / totalCompras : 0

  const scoreColor = report.score_geral >= 80 ? 'text-emerald-400' : report.score_geral >= 60 ? 'text-amber-400' : 'text-red-400'

  const cards = [
    { icon: Target, label: 'Score', value: report.score_geral, formatted: `${Math.round(report.score_geral)}/100`, sub: report.score_geral >= 80 ? 'Excelente performance' : report.score_geral >= 60 ? 'Performance regular' : 'Atenção necessária', color: scoreColor, delay: 0 },
    { icon: TrendingUp, label: 'ROAS Médio', value: report.roas_medio, formatted: `${report.roas_medio.toFixed(2)}x`, sub: report.roas_medio >= 3 ? 'Acima do benchmark' : 'Abaixo do ideal', color: report.roas_medio >= 3 ? 'text-emerald-400' : 'text-amber-400', delay: 0.05 },
    { icon: DollarSign, label: 'Investimento', value: report.total_gasto, formatted: `R$${report.total_gasto.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, sub: `${report.total_campanhas} campanhas`, color: 'text-blue-400', delay: 0.1 },
    { icon: AlertTriangle, label: 'Anomalias', value: report.anomalias.length, formatted: `${report.anomalias.length}`, sub: `${altaCount} de alta severidade`, color: altaCount > 0 ? 'text-red-400' : 'text-emerald-400', delay: 0.15 },
    { icon: BarChart2, label: 'CTR Médio', value: avgCTR, formatted: `${avgCTR.toFixed(2)}%`, sub: avgCTR >= 1 ? 'Acima da média' : 'Abaixo da média', color: avgCTR >= 1 ? 'text-emerald-400' : 'text-amber-400', delay: 0.2 },
    { icon: Activity, label: 'Freq. Média', value: avgFreq, formatted: `${avgFreq.toFixed(1)}x`, sub: avgFreq > 5 ? 'Risco de fadiga' : 'Saudável', color: avgFreq > 5 ? 'text-amber-400' : 'text-emerald-400', delay: 0.25 },
    { icon: Users, label: 'Campanhas', value: report.total_campanhas, formatted: `${report.total_campanhas}`, sub: report.periodo_analisado, color: 'text-indigo-400', delay: 0.3 },
    { icon: ShoppingCart, label: 'CPA Médio', value: avgCPA, formatted: avgCPA > 0 ? `R$${avgCPA.toFixed(2)}` : 'N/A', sub: 'Custo por aquisição', color: 'text-violet-400', delay: 0.35 },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map(card => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  )
}
