import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notify'
import type { AnalysisReport } from '@/types/campaign'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { report: AnalysisReport }
    if (!body.report) {
      return NextResponse.json({ error: 'Relatório não fornecido' }, { status: 400 })
    }
    const result = await sendWhatsAppNotification(body.report)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Notify] Error:', err)
    return NextResponse.json({ success: false, error: 'Erro ao enviar notificação' }, { status: 500 })
  }
}
