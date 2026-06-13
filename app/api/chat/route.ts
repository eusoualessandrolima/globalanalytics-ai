import { NextRequest } from 'next/server'
import { createAIProvider } from '@/lib/ai-providers'
import type { AISettings, ChatMessage } from '@/types/ai'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

function buildSystemPrompt(context: string): string {
  return `Você é um consultor especialista em tráfego pago Meta Ads da plataforma Global Analytics Intelligence.

Você tem acesso aos dados reais da conta Meta Ads do usuário. Use esses dados para responder de forma precisa, estratégica e acionável.

DADOS ATUAIS DA CONTA:
${context}

DIRETRIZES:
- Seja direto, preciso e estratégico
- Use os dados reais fornecidos para embasar suas respostas
- Estruture respostas complexas com: Resumo Executivo → Métricas → Problemas → Oportunidades → Recomendações
- Para perguntas simples, responda de forma concisa
- Use valores em BRL quando relevante
- Destaque campanhas específicas pelo nome quando mencionar dados
- Aja como um analista de tráfego sênior, não apenas como um chatbot
- Responda SEMPRE em português brasileiro`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      messages: ChatMessage[]
      aiSettings: AISettings
      metaContext: string
    }

    const { messages, aiSettings, metaContext } = body

    if (!aiSettings?.apiKey) {
      return new Response(JSON.stringify({ error: 'API Key da IA não configurada. Acesse Configurações.' }), { status: 400 })
    }

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'Mensagens não fornecidas' }), { status: 400 })
    }

    const provider = createAIProvider(aiSettings)

    const systemMessage = { role: 'system' as const, content: buildSystemPrompt(metaContext || 'Nenhum dado da Meta Ads disponível. Oriente o usuário a conectar sua conta nas Configurações.') }
    const allMessages = [systemMessage, ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))]

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await provider.chat(allMessages, (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
          })
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Erro ao processar resposta'
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[Chat] Error:', err)
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500 })
  }
}
