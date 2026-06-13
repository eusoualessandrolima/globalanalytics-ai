import { NextRequest, NextResponse } from 'next/server'
import { MetaAdsClient } from '@/lib/meta-ads/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId, datePreset = 'last_7d' } = await request.json() as {
      accessToken: string
      adAccountId: string
      datePreset?: string
    }

    if (!accessToken || !adAccountId) {
      return NextResponse.json({ error: 'Access Token e Ad Account ID são obrigatórios' }, { status: 400 })
    }

    const client = new MetaAdsClient(accessToken, adAccountId)
    const insights = await client.getInsights(datePreset)
    return NextResponse.json(insights)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao buscar dados da Meta'
    console.error('[Meta/insights]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
