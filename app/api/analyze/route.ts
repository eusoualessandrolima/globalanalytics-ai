import { NextRequest, NextResponse } from 'next/server'
import { parseCSV } from '@/lib/csv-parser'
import { analyzeWithClaude } from '@/lib/claude-analyzer'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notify'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Arquivo deve ser CSV' }, { status: 400 })
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
