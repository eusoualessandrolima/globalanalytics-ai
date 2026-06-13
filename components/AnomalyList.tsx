'use client'
import type { Anomaly } from '@/types/campaign'
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface AnomalyListProps {
  anomalias: Anomaly[]
}

const severityConfig = {
  alta: { label: 'Alta', color: 'text-danger', bg: 'bg-danger/10 border-danger/30', icon: AlertTriangle },
  media: { label: 'Média', color: 'text-warning', bg: 'bg-warning/10 border-warning/30', icon: AlertCircle },
  baixa: { label: 'Baixa', color: 'text-success', bg: 'bg-success/10 border-success/30', icon: Info },
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const [expanded, setExpanded] = useState(false)
  const config = severityConfig[anomaly.severidade]
  const Icon = config.icon

  return (
    <div className={`border rounded-xl overflow-hidden ${config.bg}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Icon className={config.color} size={18} />
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{anomaly.campanha}</p>
            <p className="text-white/50 text-xs">{anomaly.metrica}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${config.color} ${config.bg}`}>
            {config.label}
          </span>
          {expanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 mb-3 mt-3">
            <div>
              <p className="text-white/40 text-xs mb-1">Valor Atual</p>
              <p className={`font-bold ${config.color}`}>{anomaly.valor_atual}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Referência</p>
              <p className="font-bold text-white/70">{anomaly.valor_referencia}</p>
            </div>
          </div>
          <p className="text-white/70 text-sm mb-2">{anomaly.descricao}</p>
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
            <p className="text-accent text-xs font-semibold mb-1">Recomendação</p>
            <p className="text-white/80 text-sm">{anomaly.recomendacao}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnomalyList({ anomalias }: AnomalyListProps) {
  const groups = {
    alta: anomalias.filter(a => a.severidade === 'alta'),
    media: anomalias.filter(a => a.severidade === 'media'),
    baixa: anomalias.filter(a => a.severidade === 'baixa'),
  }

  if (anomalias.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Info className="text-success" size={32} />
        </div>
        <p className="text-xl font-semibold text-success">Nenhuma anomalia detectada</p>
        <p className="text-white/50 mt-2">Suas campanhas estão performando dentro do esperado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {(['alta', 'media', 'baixa'] as const).map(sev => {
        if (groups[sev].length === 0) return null
        const config = severityConfig[sev]
        return (
          <div key={sev}>
            <div className="flex items-center gap-2 mb-3">
              <config.icon className={config.color} size={16} />
              <h3 className={`font-semibold ${config.color}`}>
                Severidade {config.label}
              </h3>
              <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
                {groups[sev].length}
              </span>
            </div>
            <div className="space-y-2">
              {groups[sev].map((anomaly, i) => (
                <AnomalyCard key={`${anomaly.campanha}-${anomaly.metrica}-${i}`} anomaly={anomaly} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
