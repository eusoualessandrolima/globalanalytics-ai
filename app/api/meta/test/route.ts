import { NextRequest, NextResponse } from 'next/server'
import { MetaAdsClient } from '@/lib/meta-ads/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { accessToken, adAccountId } = await request.json() as { accessToken: string; adAccountId: string }
    if (!accessToken || !adAccountId) {
      return NextResponse.json({ success: false, error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }
    const client = new MetaAdsClient(accessToken, adAccountId)
    const ok = await client.testConnection()
    if (ok) {
      const account = await client.getAccount()
      return NextResponse.json({ success: true, account })
    }
    return NextResponse.json({ success: false, error: 'Não foi possível conectar à conta' }, { status: 401 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
