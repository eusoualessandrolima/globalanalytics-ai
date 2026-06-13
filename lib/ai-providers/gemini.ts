import type { AIProvider, AIMessage } from './types'

export class GeminiProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'gemini-2.0-flash') {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: AIMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const systemMsg = messages.find(m => m.role === 'system')
    const chatMessages = messages.filter(m => m.role !== 'system')

    const contents = chatMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const body: Record<string, unknown> = { contents }
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] }
    }
    body.generationConfig = { maxOutputTokens: 2048 }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`)

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        try {
          const data = JSON.parse(line.slice(6))
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) onChunk(text)
        } catch { /* skip */ }
      }
    }
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`
      )
      if (res.ok) return { ok: true }
      const body = await res.json().catch(() => ({}))
      const msg = body?.error?.message ?? `Erro ${res.status}`
      if (res.status === 400 || res.status === 403) return { ok: false, error: 'Chave de API inválida.' }
      return { ok: false, error: msg }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Erro de rede.' }
    }
  }
}
