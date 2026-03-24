import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Eres INbot, el asistente financiero de INbig Finanzas.
Eres experto en mercados financieros de Latinoamérica (Argentina, Brasil, México, Chile, Colombia).
Ayudas a inversores retail a entender mercados, instrumentos financieros, análisis técnico y fundamental.
Siempre incluyes un disclaimer: "Esta información es educativa y no constituye asesoramiento financiero."
Responde en español, de forma clara, concisa y sin jerga innecesaria.
Si no sabes algo o no tienes datos en tiempo real, dilo claramente.`

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Límite de mensajes por plan (TODO: implementar rate limiting por tier)
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-10), // últimos 10 mensajes de contexto
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({ message: content.text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Error procesando tu mensaje' },
      { status: 500 }
    )
  }
}
