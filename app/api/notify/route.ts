import { NextRequest, NextResponse } from 'next/server'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notify'
import type { AnalysisReport } from '@/types/campaign'

export const maxDuration = 15
export const dynamic = 'force-dynamic'

const MAX_BODY_SIZE = 512 * 1024 // 512KB — relatórios JSON são pequenos

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Payload muito grande. Máximo: 512KB' },
        { status: 413 }
      )
    }

    const body = (await request.json()) as { report?: AnalysisReport }

    if (!body || typeof body !== 'object' || !body.report) {
      return NextResponse.json({ error: 'Relatório não fornecido' }, { status: 400 })
    }

    // Sanity check: garantir que o report tem o shape mínimo esperado
    // (defesa contra payloads malformados que poderiam quebrar formatWhatsAppMessage).
    const r = body.report
    if (
      typeof r.score_geral !== 'number' ||
      typeof r.total_gasto !== 'number' ||
      typeof r.roas_medio !== 'number' ||
      !Array.isArray(r.anomalias)
    ) {
      return NextResponse.json({ error: 'Relatório com formato inválido' }, { status: 422 })
    }

    const result = await sendWhatsAppNotification(r)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Notify] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar notificação' },
      { status: 500 }
    )
  }
}
