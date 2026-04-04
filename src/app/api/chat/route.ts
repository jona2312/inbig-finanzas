import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
}

const SYSTEM_PROMPT = `Eres INbot, el asistente financiero de INbig Finanzas.
Eres experto en mercados financieros de Latinoamérica (Argentina, Brasil, México, Chile, Colombia).
Ayudas a inversores retail a entender mercados, instrumentos financieros, análisis técnico y fundamental.
Siempre incluyes un disclaimer: "Esta información es educativa y no constituye asesoramiento financiero."
Responde en español, de forma clara, concisa y sin jerga innecesaria.
Si no sabes algo o no tienes datos en tiempo real, dilo claramente.`

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    // TODO: usar user para rate limiting por tier
    await supabase.auth.getUser()

    // Límite de mensajes por plan (TODO: implementar rate limiting por tier)
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
    })

    const message = response.choices[0].message.content
    if (!message) {
      throw new Error('Unexpected response type')
    }

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Error procesando tu mensaje' },
      { status: 500 }
    )
  }
}
