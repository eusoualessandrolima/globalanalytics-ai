'use client'
import { useRef, useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'

interface UploadAreaProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
}

export default function UploadArea({ onFileSelect, isLoading }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (!file.name.endsWith('.csv')) {
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Análise de Campanhas</h2>
          <p className="text-white/60">Faça upload do seu arquivo CSV do Meta Ads para análise inteligente</p>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isLoading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isLoading
              ? 'opacity-50 cursor-not-allowed border-white/20'
              : isDragging
              ? 'border-accent bg-accent/10 scale-[1.02]'
              : 'border-white/20 hover:border-accent/60 hover:bg-white/5'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={onInputChange}
            className="hidden"
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-white/70 font-medium">Analisando com Claude AI...</p>
              <p className="text-white/40 text-sm">Isso pode levar até 30 segundos</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-accent" size={32} />
              </div>
              <p className="text-xl font-semibold mb-2">Arraste e solte seu CSV</p>
              <p className="text-white/50 mb-4">ou clique para selecionar</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['campanha', 'objetivo', 'gasto', 'CTR', 'ROAS', 'frequencia'].map(col => (
                  <span key={col} className="bg-white/5 text-white/60 text-xs px-2 py-1 rounded">
                    {col}
                  </span>
                ))}
                <span className="text-white/30 text-xs px-2 py-1">+22 colunas</span>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-danger bg-danger/10 border border-danger/30 rounded-lg p-3">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: FileText, label: 'CSV Meta Ads', desc: 'Formato padrão' },
            { icon: Upload, label: 'Até 10MB', desc: 'Suporte a grandes arquivos' },
            { icon: AlertCircle, label: '28 colunas', desc: 'Validação automática' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-secondary rounded-xl p-4">
              <Icon className="mx-auto mb-2 text-accent" size={20} />
              <p className="font-medium text-sm">{label}</p>
              <p className="text-white/40 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
