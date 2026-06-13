import { formatWhatsAppMessage } from './report-generator'
import type { AnalysisReport } from '@/types/campaign'

export async function sendWhatsAppNotification(report: AnalysisReport): Promise<{ success: boolean; error?: string }> {
  const apiUrl = process.env.WHATSAPP_API_URL
  const apiKey = process.env.WHATSAPP_API_KEY
  const instance = process.env.WHATSAPP_INSTANCE
  const number = process.env.WHATSAPP_NUMBER_DESTINO

  if (!apiUrl || !apiKey || !instance || !number) {
    return { success: false, error: 'Variáveis de ambiente WhatsApp não configuradas' }
  }

  const message = formatWhatsAppMessage(report)

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number,
        text: message,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      const text = await response.text()
      return { success: false, error: `Erro HTTP ${response.status}: ${text}` }
    }

    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error('[WhatsApp] Erro ao enviar:', error)
    return { success: false, error }
  }
}
