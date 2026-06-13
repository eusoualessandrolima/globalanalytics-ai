'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

const steps = [
  { id: 1, label: 'Importando campanhas', duration: 800 },
  { id: 2, label: 'Processando métricas', duration: 1200 },
  { id: 3, label: 'Detectando anomalias', duration: 1500 },
  { id: 4, label: 'Calculando tendências', duration: 1000 },
  { id: 5, label: 'Identificando oportunidades', duration: 1200 },
  { id: 6, label: 'Gerando insights executivos', duration: 800 },
]

export default function LoadingState({ message = 'Analisando campanhas...' }: { message?: string }) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let elapsed = 0
    const total = steps.reduce((s, st) => s + st.duration, 0)
    const timeouts: ReturnType<typeof setTimeout>[] = []
    steps.forEach((step, i) => {
      const startAt = elapsed
      const finishAt = elapsed + step.duration - 100
      timeouts.push(setTimeout(() => {
        setCurrentStep(i)
        setProgress(Math.round(((startAt + step.duration) / total) * 100))
      }, startAt))
      timeouts.push(setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id])
      }, finishAt))
      elapsed += step.duration
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center"
            animate={{ boxShadow: ['0 0 20px rgba(59,130,246,0.1)', '0 0 40px rgba(59,130,246,0.25)', '0 0 20px rgba(59,130,246,0.1)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Loader2 className="text-blue-400 animate-spin" size={28} />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Processando dados</h2>
          <p className="text-white/40 text-sm">{message}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="glass rounded-2xl p-5 space-y-3">
          {steps.map((step, i) => {
            const isDone = completedSteps.includes(step.id)
            const isActive = currentStep === i && !isDone

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isDone ? 'bg-emerald-500/20 border border-emerald-500/30' :
                  isActive ? 'bg-blue-500/20 border border-blue-500/30' :
                  'bg-white/[0.04] border border-white/[0.06]'
                }`}>
                  {isDone ? (
                    <Check size={12} className="text-emerald-400" />
                  ) : isActive ? (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  )}
                </div>
                <span className={`text-sm transition-colors duration-300 ${
                  isDone ? 'text-emerald-400' :
                  isActive ? 'text-white' :
                  'text-white/30'
                }`}>
                  {step.label}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
