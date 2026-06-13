'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Send, RefreshCw, Zap, TrendingUp, DollarSign,
  AlertTriangle, Activity, Clock, XCircle,
  Loader2, ChevronDown
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import type { AppSettings, ChatMessage, MetaInsights } from '@/types/ai'

const SUGGESTIONS = [
  'Como está minha conta hoje?',
  'Onde estou perdendo dinheiro?',
  'Qual campanha devo pausar?',
  'Qual campanha devo escalar?',
  'O que está derrubando meu ROAS?',
  'Me dê um plano de ação.',
]

const DATE_PRESETS = [
  { id: 'today', label: 'Hoje' },
  { id: 'last_7d', label: '7 dias' },
  { id: 'last_14d', label: '14 dias' },
  { id: 'last_30d', label: '30 dias' },
]

function buildMetaContext(insights: MetaInsights): string {
  const { summary, campaigns, account, period } = insights
  const fmt = (n: number) => `R$${n.toFixed(2)}`
  const top5 = [...campaigns].sort((a, b) => b.spend - a.spend).slice(0, 10)

  return `CONTA: ${account.name} (ID: ${account.id})
PERÍODO: ${period}
RESUMO: Gasto=${fmt(summary.total_spend)} | Impressões=${summary.total_impressions.toLocaleString()} | Cliques=${summary.total_clicks.toLocaleString()} | Conversões=${summary.total_conversions} | ROAS Médio=${summary.avg_roas.toFixed(2)} | CTR Médio=${summary.avg_ctr.toFixed(2)}% | CPM Médio=${fmt(summary.avg_cpm)} | Campanhas Ativas=${summary.active_campaigns} | Pausadas=${summary.paused_campaigns}

CAMPANHAS (top por gasto):
${top5.map(c => `- ${c.name} [${c.status}] | Obj: ${c.objective} | Gasto: ${fmt(c.spend)} | ROAS: ${c.roas.toFixed(2)} | CTR: ${c.ctr.toFixed(2)}% | CPC: ${fmt(c.cpc)} | Conv: ${c.conversions}`).join('\n')}`
}

function MarkdownText({ content }: { content: string }) {
  const lines = content.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <p key={i} className="text-white font-bold text-sm mt-3 mb-1">{line.slice(4)}</p>
        if (line.startsWith('## ')) return <p key={i} className="text-white font-bold text-base mt-3 mb-1">{line.slice(3)}</p>
        if (line.startsWith('# ')) return <p key={i} className="text-white font-bold text-lg mt-3 mb-1">{line.slice(2)}</p>
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-white font-semibold text-sm">{line.slice(2, -2)}</p>
        if (line.startsWith('- ') || line.startsWith('• ')) return <p key={i} className="text-white/80 text-sm flex gap-2"><span className="text-blue-400 mt-0.5">•</span><span>{line.slice(2)}</span></p>
        if (line.trim() === '') return <div key={i} className="h-1" />
        return <p key={i} className="text-white/80 text-sm leading-relaxed">{line}</p>
      })}
    </div>
  )
}

export default function LivePage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [insights, setInsights] = useState<MetaInsights | null>(null)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [metaError, setMetaError] = useState('')
  const [datePreset, setDatePreset] = useState('last_7d')
  const [showPresets, setShowPresets] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const loadInsights = useCallback(async (s: AppSettings, preset: string) => {
    setLoadingInsights(true)
    setMetaError('')
    try {
      const res = await fetch('/api/meta/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: s.meta.accessToken, adAccountId: s.meta.adAccountId, datePreset: preset }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erro ao buscar dados')
      }
      const data = await res.json() as MetaInsights
      setInsights(data)
    } catch (err) {
      setMetaError(err instanceof Error ? err.message : 'Erro ao conectar à Meta Ads')
    } finally {
      setLoadingInsights(false)
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('ga_settings')
    if (stored) {
      try {
        const s = JSON.parse(stored) as AppSettings
        setSettings(s)
        if (s.meta.accessToken && s.meta.adAccountId) loadInsights(s, 'last_7d')
      } catch { /* ignore */ }
    }
  }, [loadInsights])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return
    if (!settings?.ai.apiKey) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant', content: 'Configure sua API Key em **Configurações** antes de usar o chat.', timestamp: new Date().toISOString()
      }])
      return
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    const assistantId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp: new Date().toISOString() }])
    setStreaming(true)

    abortRef.current = new AbortController()

    try {
      const context = insights ? buildMetaContext(insights) : 'Nenhum dado da Meta disponível.'
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), aiSettings: settings.ai, metaContext: context }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Erro no chat')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))
          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.error) throw new Error(parsed.error)
              if (parsed.text) {
                fullText += parsed.text
                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: fullText } : m))
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') throw e
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const errMsg = err instanceof Error ? err.message : 'Erro inesperado'
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: errMsg } : m))
    } finally {
      setStreaming(false)
    }
  }, [streaming, settings, insights, messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const changePreset = (preset: string) => {
    setDatePreset(preset)
    setShowPresets(false)
    if (settings) loadInsights(settings, preset)
  }

  const hasMetaConfig = settings?.meta.accessToken && settings?.meta.adAccountId
  const hasAiConfig = settings?.ai.apiKey

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/[0.06] p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Bot size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">Análise ao Vivo</h1>
              <p className="text-white/40 text-xs">IA conectada à Meta Ads em tempo real</p>
            </div>
          </div>

          {/* Meta status + period selector */}
          <div className="flex items-center gap-3">
            {loadingInsights && <span className="flex items-center gap-1.5 text-blue-400 text-xs"><Loader2 size={12} className="animate-spin" />Sincronizando</span>}
            {insights && !loadingInsights && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
                {insights.account.name}
              </span>
            )}
            {metaError && <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle size={12} />Desconectado</span>}

            {/* Period */}
            <div className="relative">
              <button onClick={() => setShowPresets(!showPresets)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/60 text-xs hover:bg-white/[0.07] transition-colors">
                {DATE_PRESETS.find(p => p.id === datePreset)?.label}
                <ChevronDown size={12} />
              </button>
              <AnimatePresence>
                {showPresets && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-8 glass rounded-xl p-1 z-50 min-w-[120px]">
                    {DATE_PRESETS.map(p => (
                      <button key={p.id} onClick={() => changePreset(p.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${datePreset === p.id ? 'text-blue-400 bg-blue-500/10' : 'text-white/60 hover:bg-white/[0.04]'}`}>
                        {p.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {hasMetaConfig && (
              <button onClick={() => settings && loadInsights(settings, datePreset)} disabled={loadingInsights}
                className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.07] transition-colors disabled:opacity-40">
                <RefreshCw size={14} className={loadingInsights ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Meta Summary Bar */}
        {insights && (
          <div className="border-b border-white/[0.04] px-4 py-2 flex items-center gap-6 flex-shrink-0 overflow-x-auto">
            {[
              { icon: DollarSign, label: 'Gasto', value: `R$${insights.summary.total_spend.toFixed(0)}`, color: 'text-blue-400' },
              { icon: TrendingUp, label: 'ROAS', value: `${insights.summary.avg_roas.toFixed(2)}x`, color: insights.summary.avg_roas >= 2 ? 'text-emerald-400' : 'text-amber-400' },
              { icon: Activity, label: 'CTR', value: `${insights.summary.avg_ctr.toFixed(2)}%`, color: 'text-indigo-400' },
              { icon: Zap, label: 'Ativas', value: `${insights.summary.active_campaigns}`, color: 'text-emerald-400' },
              { icon: AlertTriangle, label: 'Pausadas', value: `${insights.summary.paused_campaigns}`, color: 'text-amber-400' },
              { icon: Clock, label: 'Período', value: insights.period, color: 'text-white/40' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
                <Icon size={12} className={color} />
                <span className="text-white/30 text-xs">{label}:</span>
                <span className={`text-xs font-semibold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Not configured */}
          {!hasMetaConfig && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="text-amber-400" size={28} />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Meta Ads não conectado</p>
                <p className="text-white/40 text-sm">Configure seu Access Token e Ad Account ID nas Configurações para usar o Análise ao Vivo.</p>
              </div>
              <a href="/settings" className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
                Ir para Configurações
              </a>
            </motion.div>
          )}

          {/* Meta error */}
          {hasMetaConfig && metaError && messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-4 border-red-500/20 bg-red-500/5">
              <p className="text-red-400 text-sm font-medium mb-1">Erro ao conectar à Meta Ads</p>
              <p className="text-white/50 text-xs">{metaError}</p>
              <p className="text-white/40 text-xs mt-2">Verifique suas credenciais em Configurações.</p>
            </motion.div>
          )}

          {/* Welcome + suggestions */}
          {hasMetaConfig && messages.length === 0 && !metaError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full gap-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Bot className="text-blue-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Global Analytics AI</h2>
                <p className="text-white/40 text-sm">
                  {insights ? `Conta ${insights.account.name} conectada · ${insights.summary.active_campaigns} campanhas ativas` : 'Converse com sua conta Meta Ads em tempo real.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="glass glass-hover rounded-xl px-4 py-3 text-sm text-white/60 hover:text-white text-left transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={14} className="text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-500/20 border border-blue-500/20 text-white' : 'glass'}`}>
                  {msg.role === 'assistant' && msg.content === '' ? (
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400"
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                      ))}
                    </div>
                  ) : msg.role === 'assistant' ? (
                    <MarkdownText content={msg.content} />
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {hasMetaConfig && (
          <div className="border-t border-white/[0.06] p-4 flex-shrink-0">
            {!hasAiConfig && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
                <p className="text-amber-300/70 text-xs">Configure a API Key da IA em <a href="/settings" className="underline">Configurações</a> para usar o chat.</p>
              </div>
            )}
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre sua conta Meta Ads..."
                rows={1}
                disabled={streaming || !hasAiConfig}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/40 transition-all resize-none disabled:opacity-40"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                }}
              />
              <button onClick={() => sendMessage(input)} disabled={streaming || !input.trim() || !hasAiConfig}
                className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                {streaming ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-white/20 text-[10px] mt-2 text-center">Enter para enviar · Shift+Enter para nova linha</p>
          </div>
        )}
      </div>
    </div>
  )
}
