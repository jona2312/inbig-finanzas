import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `Eres el Copilot de INbig Finanzas, asistente especializado en trading, análisis técnico y psicología del trader.

Tu objetivo es ayudar al trader a:
- Analizar operaciones y patrones
- Mejorar su disciplina y gestión emocional
- Revisar su diario de trading
- Entender conceptos de análisis técnico y fundamental
- Tomar mejores decisiones de riesgo

Responde siempre en español, de forma directa y práctica. Evita respuestas genéricas.
Si el trader menciona una operación específica, analiza contexto, riesgo/beneficio y psicología.
Sé directo, no des vueltas. Máximo 3-4 párrafos salvo que se pida más detalle.`

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { message, history = [] } = await req.json()
    if (!message) return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })

    // Cargar memorias activas del usuario (máx 10)
    const { data: memories } = await (supabase as any)
      .from('copilot_memory')
      .select('memory_type, content, confidence')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)

    // Construir system prompt con contexto de memoria
    let systemWithMemory = SYSTEM_PROMPT
    if (memories && memories.length > 0) {
      const memoryContext = memories
        .map((m: any) => `[${m.memory_type}] ${m.content}`)
        .join('\n')
      systemWithMemory += `\n\nCONTEXTO DEL TRADER (recuerdos previos):\n${memoryContext}`
    }

    // Construir historial de mensajes para OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemWithMemory },
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      temperature: 0.7,
      messages,
    })

    const reply = response.choices[0]?.message?.content ?? 'Sin respuesta del modelo.'

    // Guardar memoria en background (no bloquea la respuesta)
    extractAndSaveMemory(supabase, user.id, message).catch(console.error)

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[copilot] error:', error)
    return NextResponse.json({ error: 'Error interno del copilot' }, { status: 500 })
  }
}

// -------------------------------------------------------
// Extrae y guarda preferencias/contexto del mensaje
// -------------------------------------------------------
async function extractAndSaveMemory(supabase: any, userId: string, userMessage: string) {
  const triggers = [
    'prefiero', 'me gusta', 'opero', 'mi estrategia', 'soy trader',
    'uso ', 'trabajo con', 'mi timeframe', 'mi par favorito',
    'suelo', 'normalmente', 'siempre que', 'cada vez que',
    'mi mayor problema', 'me cuesta', 'me resulta difícil',
  ]

  const lower = userMessage.toLowerCase()
  const hasTrigger = triggers.some(t => lower.includes(t))
  if (!hasTrigger) return

  // Limitar a 50 memorias por usuario
  const { count } = await supabase
    .from('copilot_memory')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  if ((count ?? 0) >= 50) return

  await supabase.from('copilot_memory').insert({
    user_id: userId,
    memory_type: 'preference',
    content: userMessage.slice(0, 500),
    confidence: 0.7,
    source: 'chat',
  })
}
