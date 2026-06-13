'use client'
import { useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import UploadArea from '@/components/UploadArea'
import ReportView from '@/components/ReportView'
import LoadingState from '@/components/LoadingState'
import type { AnalysisReport } from '@/types/campaign'

type AppState = 'idle' | 'loading' | 'done' | 'error'

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload')
  const [appState, setAppState] = useState<AppState>('idle')
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string[]>([])

  const handleFileSelect = useCallback(async (file: File) => {
    setAppState('loading')
    setErrorMsg(null)
    setErrorDetails([])
    setReport(null)

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
    setWarnings([])
    setErrorMsg(null)
    setErrorDetails([])
    setActiveTab('upload')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-auto">
        {appState === 'loading' && <LoadingState message="Analisando campanhas com Claude AI..." />}

        {appState === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
            <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center">
              <span className="text-danger text-3xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-danger">Erro na análise</h2>
            <p className="text-white/60 text-center max-w-md">{errorMsg}</p>
            {errorDetails.length > 0 && (
              <div className="bg-secondary border border-danger/20 rounded-xl p-4 max-w-lg w-full">
                <p className="text-white/40 text-xs font-semibold uppercase mb-2">Detalhes</p>
                <ul className="space-y-1">
                  {errorDetails.map((d, i) => (
                    <li key={i} className="text-white/70 text-sm">• {d}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={handleReset}
              className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {appState === 'idle' && (
          <UploadArea onFileSelect={handleFileSelect} isLoading={false} />
        )}

        {appState === 'done' && report && (
          <>
            {activeTab === 'upload' && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-white/60">Análise concluída!</p>
                <button
                  onClick={() => setActiveTab('report')}
                  className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Ver Relatório
                </button>
                <button
                  onClick={handleReset}
                  className="text-white/40 hover:text-white text-sm transition-colors"
                >
                  Nova análise
                </button>
              </div>
            )}
            {(activeTab === 'report' || activeTab === 'anomalies') && (
              <ReportView report={report} warnings={warnings} />
            )}
          </>
        )}
      </main>
    </div>
  )
}
