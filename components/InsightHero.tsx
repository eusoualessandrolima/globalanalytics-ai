'use client'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'
import type { AnalysisReport, Anomaly } from '@/types/campaign'

export default function InsightHero({ report }: { report: AnalysisReport }) {
  const altaCount = report.anomalias.filter(a => a.severidade === 'alta').length
  const severityOrder: Record<Anomaly['severidade'], number> = { alta: 0, media: 1, baixa: 2 }
  const topAnomaly = [...report.anomalias].sort((a, b) => severityOrder[a.severidade] - severityOrder[b.severidade])[0]

  const potentialROAS = report.roas_medio < 3 && report.roas_medio > 0
    ? `+${((3 - report.roas_medio) / report.roas_medio * 100).toFixed(0)}%`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-6 mb-6 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(15,23,42,0.8) 100%)',
        border: '1px solid rgba(59,130,246,0.2)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <Sparkles size={14} className="text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Principal Descoberta</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 leading-snug">
              {report.resumo_executivo.length > 120
                ? report.resumo_executivo.slice(0, 120) + '...'
                : report.resumo_executivo}
            </h3>
            {topAnomaly && (
              <div className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/60 font-medium">{topAnomaly.campanha}</p>
                  <p className="text-xs text-amber-300/80 mt-0.5">{topAnomaly.descricao}</p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {potentialROAS && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/15">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400/70 font-semibold uppercase tracking-wide">ROAS Potencial</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{potentialROAS}</p>
                <p className="text-[11px] text-emerald-400/50 mt-0.5">recuperável</p>
              </div>
            )}
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/15">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-[10px] text-red-400/70 font-semibold uppercase tracking-wide">Críticas</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{altaCount}</p>
              <p className="text-[11px] text-red-400/50 mt-0.5">anomalias</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/15">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={14} className="text-blue-400" />
                <span className="text-[10px] text-blue-400/70 font-semibold uppercase tracking-wide">Score</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{report.score_geral}</p>
              <p className="text-[11px] text-blue-400/50 mt-0.5">de 100</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/15">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={14} className="text-indigo-400" />
                <span className="text-[10px] text-indigo-400/70 font-semibold uppercase tracking-wide">ROAS</span>
              </div>
              <p className="text-2xl font-bold text-indigo-400">{report.roas_medio.toFixed(1)}x</p>
              <p className="text-[11px] text-indigo-400/50 mt-0.5">médio</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
