import type { AIProvider, AIMessage } from './types'

export class OpenAIProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'gpt-4o') {
    this.apiKey = apiKey
    this.model = model
  }

  async chat(messages: AIMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))
      for (const line of lines) {
        const data = line.slice(6)
        if (data === '[DONE]') continue
        try {
          const parsed = JSON.parse(data)
          const text = parsed.choices?.[0]?.delta?.content
          if (text) onChunk(text)
        } catch { /* skip */ }
      }
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      })
      return res.ok
    } catch {
      return false
    }
  }
}
