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

  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      })
      return true
    } catch {
      return false
    }
  }
}
