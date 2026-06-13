'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import UploadArea from '@/components/UploadArea'
import ReportView from '@/components/ReportView'
import LoadingState from '@/components/LoadingState'
import type { AnalysisReport, CampaignRow } from '@/types/campaign'

type AppState = 'idle' | 'loading' | 'done' | 'error'
type ActiveTab = 'upload' | 'report'

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('upload')
  const [appState, setAppState] = useState<AppState>('idle')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [rows, setRows] = useState<CampaignRow[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string[]>([])

  const handleFileSelect = useCallback(async (file: File) => {
    setAppState('loading')
    setErrorMsg(null)
    setErrorDetails([])
    setReport(null)
    setRows([])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(60000),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMsg(data.error || 'Erro ao processar análise')
        setErrorDetails(data.details ?? [])
        setAppState('error')
        return
      }

      setReport(data.report)
      setRows(data.rows ?? [])
      setWarnings(data.warnings ?? [])
      setAppState('done')
      setActiveTab('report')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setErrorMsg(msg.includes('timeout') ? 'Timeout: análise demorou mais de 60s' : msg)
      setAppState('error')
    }
  }, [])

  const handleReset = () => {
    setAppState('idle')
    setReport(null)
    setRows([])
    setWarnings([])
    setErrorMsg(null)
    setErrorDetails([])
    setActiveTab('upload')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeTab={activeTab}
        hasReport={!!report}
        onTabChange={tab => {
          if (appState === 'done') setActiveTab(tab as ActiveTab)
        }}
      />

      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {appState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingState />
            </motion.div>
          )}

          {appState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-screen gap-5 p-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <span className="text-red-400 text-2xl font-bold">!</span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-red-400 mb-2">Erro na análise</h2>
                <p className="text-white/50 max-w-md text-sm">{errorMsg}</p>
              </div>
              {errorDetails.length > 0 && (
                <div className="glass rounded-xl p-4 max-w-lg w-full">
                  <p className="text-white/30 text-xs font-semibold uppercase mb-2">Detalhes</p>
                  <ul className="space-y-1">
                    {errorDetails.map((d, i) => <li key={i} className="text-white/60 text-sm">• {d}</li>)}
                  </ul>
                </div>
              )}
              <button onClick={handleReset} className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors">
                Tentar novamente
              </button>
            </motion.div>
          )}

          {appState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <UploadArea onFileSelect={handleFileSelect} isLoading={false} />
            </motion.div>
          )}

          {appState === 'done' && report && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {activeTab === 'upload' && (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                  <p className="text-white/50">Análise concluída!</p>
                  <button onClick={() => setActiveTab('report')} className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors">
                    Ver Relatórios
                  </button>
                  <button onClick={handleReset} className="text-white/30 hover:text-white/60 text-sm transition-colors">
                    Nova análise
                  </button>
                </div>
              )}
              {activeTab === 'report' && (
                <ReportView report={report} rows={rows} warnings={warnings} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
