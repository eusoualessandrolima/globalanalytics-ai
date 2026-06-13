import { NextRequest, NextResponse } from 'next/server'
import { parseCSV } from '@/lib/csv-parser'
import { analyzeWithClaude } from '@/lib/claude-analyzer'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notify'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB — alinhado com validação client-side

export async function POST(request: NextRequest) {
  try {
    // Validação de Content-Length (defesa em profundidade — barra bodies grandes
    // antes mesmo de ler o multipart, evitando OOM em payloads abusivos).
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE + 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 10MB' },
        { status: 413 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Arquivo deve ser CSV' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 10MB' },
        { status: 413 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Arquivo vazio' }, { status: 400 })
    }

    const content = await file.text()
    const parsed = parseCSV(content)

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json({
        error: 'CSV inválido',
        details: parsed.errors
      }, { status: 422 })
    }

    if (parsed.data.length === 0) {
      return NextResponse.json({ error: 'CSV sem dados válidos' }, { status: 422 })
    }

    const report = await analyzeWithClaude(parsed.data)

    sendWhatsAppNotification(report).catch(err => {
      console.error('[Analyze] WhatsApp notification failed:', err)
    })

    return NextResponse.json({
      report,
      rows: parsed.data,
      meta: parsed.meta,
      warnings: parsed.errors
    })
  } catch (err) {
    console.error('[Analyze] Error:', err)
    return NextResponse.json(
      { error: 'Erro interno ao processar análise' },
      { status: 500 }
    )
  }
}
