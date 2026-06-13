export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIProvider {
  chat(messages: AIMessage[], onChunk: (chunk: string) => void): Promise<void>
  testConnection(): Promise<boolean>
}
