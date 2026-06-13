'use client'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { AnalysisReport, CampaignRow } from '@/types/campaign'
import MetricCards from './MetricCards'
import AnomalyList from './AnomalyList'
import { Clock } from 'lucide-react'

// Heavy components carregados dinamicamente para reduzir bundle inicial.
// Recharts (~80kB) e Framer-motion-heavy hero só carregam quando há report pronto.
const Charts = dynamic(() => import('./Charts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="glass rounded-xl p-5 h-[260px] animate-pulse bg-white/[0.02]" />
      ))}
    </div>
  ),
})

const InsightHero = dynamic(() => import('./InsightHero'), {
  ssr: false,
  loading: () => <div className="glass rounded-2xl p-6 mb-6 h-[220px] animate-pulse bg-white/[0.02]" />,
})

interface ReportViewProps {
  report: AnalysisReport
  rows?: CampaignRow[]
  warnings?: string[]
}

export default function ReportView({ report, rows = [], warnings }: ReportViewProps) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Intelligence Report</h2>
          <p className="text-white/40 text-sm mt-0.5">{report.periodo_analisado} · {report.total_campanhas} campanhas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Clock size={12} />
            <span>{new Date(report.gerado_em).toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </motion.div>

      {/* Warnings */}
      {warnings && warnings.filter(w => !w.includes('não mapeadas')).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl p-3 mb-4 border-amber-500/20 bg-amber-500/5"
        >
          {warnings.filter(w => !w.includes('não mapeadas')).map((w, i) => (
            <p key={i} className="text-amber-300/70 text-xs">⚠ {w}</p>
          ))}
        </motion.div>
      )}

      {/* Principal Descoberta */}
      <InsightHero report={report} />

      {/* KPIs */}
      <MetricCards report={report} rows={rows} />

      {/* Gráficos */}
      {rows.length > 0 && <Charts rows={rows} report={report} />}

      {/* Anomalias agrupadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Anomalias Detectadas</h3>
            <p className="text-white/40 text-sm">{report.anomalias.length} ocorrências agrupadas por tipo</p>
          </div>
        </div>
        <AnomalyList anomalias={report.anomalias} />
      </motion.div>
    </div>
  )
}
