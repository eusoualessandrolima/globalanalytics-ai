'use client'
import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Shield, Zap, TrendingUp, BarChart2, AlertCircle } from 'lucide-react'

interface UploadAreaProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
}

const stats = [
  { icon: TrendingUp, value: '+1M', label: 'campanhas analisadas' },
  { icon: Zap, value: '<5s', label: 'tempo de análise' },
  { icon: Shield, value: '99.9%', label: 'precisão de detecção' },
  { icon: BarChart2, value: '28', label: 'métricas monitoradas' },
]

export default function UploadArea({ onFileSelect, isLoading }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.CSV')) {
      setError('Apenas arquivos .csv são aceitos')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 10MB')
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative z-10"
      >
        {/* Hero Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
            </span>
            Plataforma de Marketing Intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold tracking-tight mb-4"
          >
            <span className="text-gradient">Global Analytics</span>
            <br />
            <span className="text-white/90 text-4xl">Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed"
          >
            Descubra em segundos quais campanhas estão desperdiçando orçamento
            e quais podem gerar mais lucro.
          </motion.p>
        </div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isLoading && inputRef.current?.click()}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          role="button"
          tabIndex={isLoading ? -1 : 0}
          aria-label="Selecionar arquivo CSV do Meta Ads ou arrastar para esta área"
          aria-disabled={isLoading}
          className={`relative rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 border-gradient outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
            isDragging
              ? 'scale-[1.02] bg-blue-500/10'
              : 'hover:bg-white/[0.02]'
          } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
          style={{
            background: isDragging
              ? 'rgba(59,130,246,0.08)'
              : 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Animated border glow when dragging */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: '0 0 30px rgba(59,130,246,0.2), inset 0 0 30px rgba(59,130,246,0.05)' }}
              />
            )}
          </AnimatePresence>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            className="hidden"
            disabled={isLoading}
            aria-label="Upload de arquivo CSV"
          />

          <div className="relative z-10">
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center"
            >
              <Upload className="text-blue-400" size={28} />
            </motion.div>

            <p className="text-xl font-semibold text-white mb-2">
              {isDragging ? 'Solte o arquivo aqui' : 'Arraste seu CSV do Meta Ads'}
            </p>
            <p className="text-white/40 text-sm mb-6">ou clique para selecionar</p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-medium">
              <Upload size={14} />
              Selecionar arquivo CSV
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {['campanha', 'objetivo', 'gasto', 'CTR', 'ROAS', 'frequencia', '+22 métricas'].map(tag => (
                <span key={tag} className="text-[10px] text-white/30 border border-white/[0.06] px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-center gap-2 text-danger bg-danger/10 border border-danger/20 rounded-xl p-3"
            >
              <AlertCircle size={15} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8"
        >
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="glass glass-hover rounded-xl p-4 text-center"
            >
              <Icon size={16} className="text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
