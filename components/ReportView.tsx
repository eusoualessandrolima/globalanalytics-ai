import type { AnalysisReport } from '@/types/campaign'
import MetricCards from './MetricCards'
import AnomalyList from './AnomalyList'
import { FileText, Clock } from 'lucide-react'

interface ReportViewProps {
  report: AnalysisReport
  warnings?: string[]
}

export default function ReportView({ report, warnings }: ReportViewProps) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="text-accent" size={24} />
            <h2 className="text-2xl font-bold">Relatório de Análise</h2>
          </div>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Clock size={14} />
            <span>{new Date(report.gerado_em).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {warnings && warnings.length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4">
            <p className="text-warning text-sm font-medium mb-1">Avisos do processamento:</p>
            {warnings.map((w, i) => <p key={i} className="text-white/70 text-xs">{w}</p>)}
          </div>
        )}

        <div className="bg-secondary rounded-xl p-5 border border-white/5 mb-6">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">Resumo Executivo</p>
          <p className="text-white/85 leading-relaxed">{report.resumo_executivo}</p>
        </div>

        <MetricCards report={report} />
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Anomalias Detectadas</h3>
        <AnomalyList anomalias={report.anomalias} />
      </div>
    </div>
  )
}
