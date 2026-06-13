'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Zap, Brain, CheckCircle2, XCircle, Loader2, Eye, EyeOff, Save } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import type { AppSettings, AIProviderType } from '@/types/ai'

const DEFAULT_SETTINGS: AppSettings = {
  ai: { provider: 'claude', apiKey: '', model: 'claude-sonnet-4-6' },
  meta: { accessToken: '', adAccountId: '', businessId: '' },
}

const AI_MODELS: Record<AIProviderType, { label: string; models: { id: string; name: string }[] }> = {
  claude: { label: 'Claude (Anthropic)', models: [{ id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' }, { id: 'claude-opus-4-7', name: 'Claude Opus 4.7' }] },
  openai: { label: 'OpenAI', models: [{ id: 'gpt-4o', name: 'GPT-4o' }, { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }] },
  gemini: { label: 'Google Gemini', models: [{ id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }, { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }] },
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error'

function StatusBadge({ status, errorMsg }: { status: TestStatus; errorMsg?: string }) {
  if (status === 'idle') return null
  if (status === 'testing') return <span className="flex items-center gap-1.5 text-blue-400 text-xs"><Loader2 size={12} className="animate-spin" />Testando...</span>
  if (status === 'success') return <span className="flex items-center gap-1.5 text-emerald-400 text-xs"><CheckCircle2 size={12} />Conectado</span>
  return <span className="flex items-center gap-1.5 text-red-400 text-xs"><XCircle size={12} />{errorMsg ?? 'Falhou'}</span>
}

function InputField({ label, value, onChange, placeholder, type = 'text', show, onToggle }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; show?: boolean; onToggle?: () => void
}) {
  return (
    <div>
      <label className="text-xs text-white/50 font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type === 'password' ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all pr-10"
        />
        {type === 'password' && onToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [aiStatus, setAiStatus] = useState<TestStatus>('idle')
  const [metaStatus, setMetaStatus] = useState<TestStatus>('idle')
  const [aiError, setAiError] = useState('')
  const [metaError, setMetaError] = useState('')
  const [showAiKey, setShowAiKey] = useState(false)
  const [showMetaToken, setShowMetaToken] = useState(false)
  const [metaAccount, setMetaAccount] = useState<{ name: string; id: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ga_settings')
    if (stored) {
      try { setSettings(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const save = () => {
    localStorage.setItem('ga_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testAI = async () => {
    setAiStatus('testing')
    setAiError('')
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings.ai),
      })
      const data = await res.json()
      setAiStatus(data.success ? 'success' : 'error')
      if (!data.success) setAiError(data.error ?? 'Conexão falhou')
    } catch {
      setAiStatus('error')
      setAiError('Erro de rede')
    }
  }

  const testMeta = async () => {
    setMetaStatus('testing')
    setMetaError('')
    setMetaAccount(null)
    try {
      const res = await fetch('/api/meta/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: settings.meta.accessToken, adAccountId: settings.meta.adAccountId }),
      })
      const data = await res.json()
      setMetaStatus(data.success ? 'success' : 'error')
      if (data.success) setMetaAccount(data.account)
      else setMetaError(data.error ?? 'Conexão falhou')
    } catch {
      setMetaStatus('error')
      setMetaError('Erro de rede')
    }
  }

  const updateAI = (key: keyof AppSettings['ai'], value: string) =>
    setSettings(s => ({ ...s, ai: { ...s.ai, [key]: value } }))
  const updateMeta = (key: keyof AppSettings['meta'], value: string) =>
    setSettings(s => ({ ...s, meta: { ...s.meta, [key]: value } }))

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <Settings size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Configurações</h1>
              <p className="text-white/40 text-sm">API Keys e integrações</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Meta Ads */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Zap size={18} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Meta Ads</h2>
                  <p className="text-white/40 text-xs">Conecte sua conta de anúncios</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={metaStatus} errorMsg={metaError} />
                </div>
              </div>

              <div className="space-y-4">
                <InputField label="Access Token" value={settings.meta.accessToken} onChange={v => updateMeta('accessToken', v)} placeholder="EAAxxxxx..." type="password" show={showMetaToken} onToggle={() => setShowMetaToken(!showMetaToken)} />
                <InputField label="Ad Account ID" value={settings.meta.adAccountId} onChange={v => updateMeta('adAccountId', v)} placeholder="123456789 ou act_123456789" />
                <InputField label="Business ID (opcional)" value={settings.meta.businessId ?? ''} onChange={v => updateMeta('businessId', v)} placeholder="ID do Business Manager" />

                {metaAccount && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400 text-xs font-semibold mb-1">Conta conectada</p>
                    <p className="text-white/70 text-sm font-medium">{metaAccount.name}</p>
                    <p className="text-white/40 text-xs">ID: {metaAccount.id}</p>
                  </div>
                )}

                <button onClick={testMeta} disabled={metaStatus === 'testing' || !settings.meta.accessToken || !settings.meta.adAccountId}
                  className="w-full py-2.5 rounded-xl border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {metaStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
                </button>
              </div>
            </motion.div>

            {/* AI Provider */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <Brain size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Inteligência Artificial</h2>
                  <p className="text-white/40 text-xs">Provider e modelo para o chat</p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={aiStatus} errorMsg={aiError} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 font-medium block mb-2">Provider</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(AI_MODELS) as AIProviderType[]).map(p => (
                      <button key={p} onClick={() => {
                        const firstModel = AI_MODELS[p].models[0].id
                        setSettings(s => ({ ...s, ai: { ...s.ai, provider: p, model: firstModel } }))
                      }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${settings.ai.provider === p ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06]'}`}>
                        {p === 'claude' ? 'Claude' : p === 'openai' ? 'OpenAI' : 'Gemini'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50 font-medium block mb-1.5">Modelo</label>
                  <select value={settings.ai.model} onChange={e => updateAI('model', e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all">
                    {AI_MODELS[settings.ai.provider].models.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#020817]">{m.name}</option>
                    ))}
                  </select>
                </div>

                <InputField label="API Key" value={settings.ai.apiKey} onChange={v => updateAI('apiKey', v)} placeholder="sk-ant-..." type="password" show={showAiKey} onToggle={() => setShowAiKey(!showAiKey)} />

                <button onClick={testAI} disabled={aiStatus === 'testing' || !settings.ai.apiKey}
                  className="w-full py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 text-sm font-medium hover:bg-indigo-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {aiStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
                </button>

                {aiStatus === 'error' && aiError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-xs leading-relaxed">{aiError}</p>
                    {aiError.includes('créditos') || aiError.includes('billing') ? (
                      <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noreferrer"
                        className="text-blue-400 text-xs underline underline-offset-2 mt-1 inline-block">
                        Adicionar créditos →
                      </a>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Save */}
            <button onClick={save} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              <Save size={16} />
              {saved ? 'Salvo!' : 'Salvar Configurações'}
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
