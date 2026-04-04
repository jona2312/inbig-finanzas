import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Eres el Copilot de INbig Finanzas, asistente especializado en trading y mercados financieros para traders latinoamericanos.

Tu misión:
- Ayudar a traders a mejorar sus decisiones de inversión
- Analizar trades del diario cuando te los compartan
- Explicar análisis técnico, fundamental y macro con claridad
- Recordar el contexto personal del usuario entre conversaciones

Estilo: claro, directo, profesional, en español latinoamericano.
Siempre aclarar que tu contenido es educativo, no asesoramiento financiero regulado.`

/**
 * POST /api/copilot — Chat con IA + contexto de memorias personales
 */
export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: {
    message: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { message, history = [] } = body
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })
  }

  // Cargar memorias activas del usuario
  const { data: memories } = await (supabase as any)
    .from('copilot_memory')
    .select('memory_type, content')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('confidence', { ascending: false })
    .limit(10)

  let systemWithMemory = SYSTEM_PROMPT
  if (memories && memories.length > 0) {
    const memCtx = memories
      .map((m: { memory_type: string; content: string }) => `- [${m.memory_type}] ${m.content}`)
      .join('\n')
    systemWithMemory += `\n\n## Lo que sabes del usuario:\n${memCtx}`
  }

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    ...history.slice(-10),
    { role: 'user', content: message },
  ]

  try {
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1500,
      system: systemWithMemory,
      messages,
    })

    const reply =
      response.content[0].type === 'text' ? response.content[0].text : ''

    extractAndSaveMemory(supabase as any, user.id, message).catch(console.error)

    return NextResponse.json({ reply })
  } catch (err: unknown) {
    console.error('[copilot] anthropic error:', err)
    return NextResponse.json(
      { error: 'Error al procesar la respuesta de IA' },
      { status: 500 }
    )
  }
}

async function extractAndSaveMemory(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  userMessage: string
) {
  const lower = userMessage.toLowerCase()
  const triggers = [
    'prefiero', 'me gusta', 'opero', 'mi estrategia', 'soy trader',
    'uso ', 'mi broker', 'tengo cuenta', 'mi objetivo', 'mi timeframe',
    'mi par favorito', 'trabajo con', 'quiero aprender',
  ]
  if (!triggers.some((t) => lower.includes(t)) || userMessage.length < 20) return

  await (supabase as any).from('copilot_memory').insert({
    user_id: userId,
    memory_type: 'preference',
    content: userMessage.slice(0, 500),
    confidence: 0.7,
    source: 'chat',
    is_active: true,
  })
}
