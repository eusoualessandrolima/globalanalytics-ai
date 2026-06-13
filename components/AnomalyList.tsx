'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, TrendingDown, AlertTriangle, Activity, DollarSign, Info } from 'lucide-react'
import type { Anomaly } from '@/types/campaign'

interface AnomalyListProps {
  anomalias: Anomaly[]
}

type AnomalyGroup = {
  key: string
  label: string
  icon: React.ElementType
  color: string
  bg: string
  items: Anomaly[]
}

function categorize(metrica: string): string {
  const m = metrica.toLowerCase()
  if (m.includes('ctr') || m.includes('queda')) return 'Queda de CTR'
  if (m.includes('frequência') || m.includes('frequencia')) return 'Frequência Alta'
  if (m.includes('cpa')) return 'CPA Elevado'
  if (m.includes('roas')) return 'ROAS Baixo'
  if (m.includes('gasto') || m.includes('conversão') || m.includes('conversao')) return 'Gasto sem Resultado'
  return 'Outras Anomalias'
}

const groupConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Queda de CTR': { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  'Frequência Alta': { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  'CPA Elevado': { icon: DollarSign, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  'ROAS Baixo': { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  'Gasto sem Resultado': { icon: DollarSign, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
  'Outras Anomalias': { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
}

const severityLabel: Record<Anomaly['severidade'], string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }
const severityColor: Record<Anomaly['severidade'], string> = {
  alta: 'text-red-400 bg-red-500/10 border-red-500/20',
  media: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  baixa: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}

function AnomalyGroupCard({ group }: { group: AnomalyGroup }) {
  const [open, setOpen] = useState(false)
  const { icon: Icon, color, bg } = groupConfig[group.label] ?? groupConfig['Outras Anomalias']
  const altaCount = group.items.filter(i => i.severidade === 'alta').length

  return (
    <div className={`glass rounded-xl border overflow-hidden ${bg}`}>
      <button
        onClick={() => setOpen(!open)}
        type="button"
        aria-expanded={open}
        aria-label={`${open ? 'Recolher' : 'Expandir'} grupo ${group.label} (${group.items.length} ocorrências)`}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/[0.04]`}>
            <Icon size={16} className={color} />
          </div>
          <div>
            <p className="font-semibold text-sm text-white">{group.label}</p>
            <p className="text-white/40 text-xs">{group.items.length} ocorrências{altaCount > 0 ? ` · ${altaCount} críticas` : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {altaCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              {altaCount} críticas
            </span>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} className="text-white/40" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.06] divide-y divide-white/[0.04]">
              {group.items.map((a, i) => (
                <div key={i} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-medium text-white/90">{a.campanha}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${severityColor[a.severidade]}`}>
                      {severityLabel[a.severidade]}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs mb-2">{a.descricao}</p>
                  <div className="flex items-start gap-1.5">
                    <span className="text-blue-400 text-xs">→</span>
                    <p className="text-blue-300/70 text-xs">{a.recomendacao}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AnomalyList({ anomalias }: AnomalyListProps) {
  if (anomalias.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
          <Info className="text-emerald-400" size={28} />
        </div>
        <p className="text-xl font-semibold text-emerald-400">Nenhuma anomalia detectada</p>
        <p className="text-white/40 mt-2 text-sm">Suas campanhas estão performando dentro do esperado</p>
      </motion.div>
    )
  }

  // Agrupar anomalias por categoria
  const grouped: Record<string, Anomaly[]> = {}
  for (const a of anomalias) {
    const cat = categorize(a.metrica)
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(a)
  }

  const severityOrder: Record<Anomaly['severidade'], number> = { alta: 0, media: 1, baixa: 2 }
  const groups: AnomalyGroup[] = Object.entries(grouped)
    .map(([key, items]) => ({
      key,
      label: key,
      icon: (groupConfig[key] ?? groupConfig['Outras Anomalias']).icon,
      color: (groupConfig[key] ?? groupConfig['Outras Anomalias']).color,
      bg: (groupConfig[key] ?? groupConfig['Outras Anomalias']).bg,
      items: items.sort((a, b) => severityOrder[a.severidade] - severityOrder[b.severidade]),
    }))
    .sort((a, b) => b.items.filter(i => i.severidade === 'alta').length - a.items.filter(i => i.severidade === 'alta').length)

  return (
    <div className="space-y-3">
      {groups.map((group, i) => (
        <motion.div
          key={group.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <AnomalyGroupCard group={group} />
        </motion.div>
      ))}
    </div>
  )
}
