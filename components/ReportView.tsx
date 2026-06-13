'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Clock, MessageCircle, Mail, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import type { AnalysisReport, CampaignRow } from '@/types/campaign'
import { groupAnomaliesBySeverity } from '@/lib/report-generator'
import MetricCards from './MetricCards'
import AnomalyList from './AnomalyList'

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
  activeTab?: string
}

type SendStatus = 'idle' | 'sending' | 'sent' | 'error'

function NotifySection({ report }: { report: AnalysisReport }) {
  const [waStatus, setWaStatus] = useState<SendStatus>('idle')

  const sendWhatsApp = async () => {
    setWaStatus('sending')
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report }),
      })
      setWaStatus(res.ok ? 'sent' : 'error')
    } catch {
      setWaStatus('error')
    }
    setTimeout(() => setWaStatus('idle'), 4000)
  }

  const sendEmail = () => {
    const { alta, media, baixa } = groupAnomaliesBySeverity(report.anomalias)
    const top3 = [...report.anomalias]
      .sort((a, b) => ({ alta: 0, media: 1, baixa: 2 }[a.severidade] - { alta: 0, media: 1, baixa: 2 }[b.severidade]))
      .slice(0, 3)

    const subject = `GlobalAnalytics AI — Relatório ${report.periodo_analisado}`
    const body = [
      `Relatório de Campanhas Meta Ads`,
      `Período: ${report.periodo_analisado}`,
      `Score Geral: ${report.score_geral}/100`,
      `Investimento Total: R$ ${report.total_gasto.toFixed(2)}`,
      `ROAS Médio: ${report.roas_medio.toFixed(2)}x`,
      ``,
      `Anomalias Detectadas:`,
      `• Alta severidade: ${alta.length}`,
      `• Média severidade: ${media.length}`,
      `• Baixa severidade: ${baixa.length}`,
      ``,
      `Top 3 Alertas:`,
      ...top3.map((a, i) =>
        `${i + 1}. ${a.campanha} — ${a.metrica}\n   ${a.descricao}\n   Recomendação: ${a.recomendacao}`
      ),
      ``,
      `Gerado em: ${new Date(report.gerado_em).toLocaleString('pt-BR')}`,
    ].join('\n')

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8 pt-6 border-t border-white/[0.06]"
    >
      <p className="text-white/30 text-[10px] uppercase font-semibold tracking-widest mb-4">Compartilhar Relatório</p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={sendWhatsApp}
          disabled={waStatus === 'sending'}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {waStatus === 'sending' && <Loader2 size={15} className="animate-spin" />}
          {waStatus === 'sent' && <CheckCircle2 size={15} />}
          {waStatus === 'error' && <XCircle size={15} />}
          {waStatus === 'idle' && <MessageCircle size={15} />}
          {waStatus === 'sending' ? 'Enviando...' : waStatus === 'sent' ? 'Enviado!' : waStatus === 'error' ? 'Falhou' : 'WhatsApp'}
        </button>

        <button
          onClick={sendEmail}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/15 transition-all"
        >
          <Mail size={15} />
          E-mail
        </button>
      </div>

      {waStatus === 'error' && (
        <p className="text-red-400/70 text-xs mt-3">
          WhatsApp não configurado. Adicione as variáveis <span className="font-mono">WHATSAPP_*</span> nas configurações do Vercel.
        </p>
      )}
    </motion.div>
  )
}

export default function ReportView({ report, rows = [], warnings, activeTab = 'report' }: ReportViewProps) {
  const isAnomaliesTab = activeTab === 'anomalies'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">
            {isAnomaliesTab ? 'Anomalias Detectadas' : 'Intelligence Report'}
          </h2>
          <p className="text-white/40 text-sm mt-0.5">
            {isAnomaliesTab
              ? `${report.anomalias.length} ocorrências agrupadas por tipo · ${report.periodo_analisado}`
              : `${report.periodo_analisado} · ${report.total_campanhas} campanhas`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <Clock size={12} />
          <span>{new Date(report.gerado_em).toLocaleString('pt-BR')}</span>
        </div>
      </motion.div>

      {/* Aba: Anomalias */}
      {isAnomaliesTab && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <AnomalyList anomalias={report.anomalias} />
          <NotifySection report={report} />
        </motion.div>
      )}

      {/* Aba: Intelligence (relatório completo) */}
      {!isAnomaliesTab && (
        <>
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

          <InsightHero report={report} />
          <MetricCards report={report} rows={rows} />
          {rows.length > 0 && <Charts rows={rows} report={report} />}
          <NotifySection report={report} />
        </>
      )}
    </div>
  )
}
