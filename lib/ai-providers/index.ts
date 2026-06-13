import type { AIProvider } from './types'
import { ClaudeProvider } from './claude'
import { OpenAIProvider } from './openai'
import { GeminiProvider } from './gemini'
import type { AISettings } from '@/types/ai'

export function createAIProvider(settings: AISettings): AIProvider {
  switch (settings.provider) {
    case 'claude':
      return new ClaudeProvider(settings.apiKey, settings.model)
    case 'openai':
      return new OpenAIProvider(settings.apiKey, settings.model)
    case 'gemini':
      return new GeminiProvider(settings.apiKey, settings.model)
    default:
      throw new Error(`Provider desconhecido: ${settings.provider}`)
  }
}

export type { AIProvider }
export * from './types'
