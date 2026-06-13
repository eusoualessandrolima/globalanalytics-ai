import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, AIMessage } from './types'

export class ClaudeProvider implements AIProvider {
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model = 'claude-sonnet-4-6') {
    this.client = new Anthropic({ apiKey })
    this.model = model
  }

  async chat(messages: AIMessage[], onChunk: (chunk: string) => void): Promise<void> {
    const systemMsg = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    const stream = await this.client.messages.stream({
      model: this.model,
      max_tokens: 2048,
      system: systemMsg?.content,
      messages: userMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text)
      }
    }
  }

  async testConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      })
      return { ok: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('credit') || msg.includes('balance') || msg.includes('billing'))
        return { ok: false, error: 'Saldo insuficiente. Adicione créditos em console.anthropic.com/settings/billing' }
      if (msg.includes('auth') || msg.includes('401') || msg.includes('invalid'))
        return { ok: false, error: 'Chave de API inválida. Verifique a chave em console.anthropic.com' }
      return { ok: false, error: msg }
    }
  }
}
