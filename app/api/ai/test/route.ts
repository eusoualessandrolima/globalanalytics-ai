import { NextRequest, NextResponse } from 'next/server'
import { createAIProvider } from '@/lib/ai-providers'
import type { AISettings } from '@/types/ai'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json() as AISettings
    if (!settings?.apiKey) {
      return NextResponse.json({ success: false, error: 'API Key não fornecida' }, { status: 400 })
    }
    const provider = createAIProvider(settings)
    const ok = await provider.testConnection()
    return NextResponse.json({ success: ok, error: ok ? undefined : 'Conexão falhou' })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Erro' }, { status: 500 })
  }
}
