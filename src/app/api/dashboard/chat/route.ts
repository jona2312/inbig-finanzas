/**
 * POST /api/dashboard/chat
 *
 * Copilot contextual del dashboard personalizado.
 * Recibe el historial de chat + perfil del usuario.
 * Responde con GPT-4o-mini, personalizado al plan de trading del usuario.
 */

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function buildSystemPrompt(plan: Record<string, unknown> | null): string {
  const base = `Eres INbot, el asistente financiero personalizado de INBIG Finanzas.
Eres experto en mercados de Latinoamérica (especialmente Argentina), cripto, forex y mercados globales.
Siempre respondes en español, de forma clara, directa y accionable.
Incluyes siempre: "Esta información es educativa y no constituye asesoramiento financiero regulado."`

  if (!plan) return base

  const markets     = (plan.markets     as string[] | null) ?? []
  const assets      = (plan.assets      as Array<{ symbol: string }> | null) ?? []
  const riskProfile = (plan.risk_profile as string | null) ?? 'moderado'
  const infoNeeds   = (plan.info_needs  as string[] | null) ?? []

  return `${base}

PERFIL DEL USUARIO:
- Mercados de interés: ${markets.join(', ') || 'general'}
- Activos favoritos: ${assets.map(a => a.symbol).join(', ') || 'sin definir'}
- Perfil de riesgo: ${riskProfile}
- Necesidades de información: ${infoNeeds.join(', ') || 'general'}

Usa este perfil para dar respuestas más relevantes y personalizadas.
Si el usuario pregunta sobre un activo de su watchlist, profundiza más.
Adapta el tono al perfil de riesgo: ${
    riskProfile === 'conservador' ? 'cauteloso, énfasis en preservación de capital' :
    riskProfile === 'agresivo'    ? 'directo, acepta hablar de oportunidades de alto riesgo' :
    'balanceado, diversificación y gestión de riesgo'
  }.`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Traer trading plan del usuario
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: plan } = await (supabase as any)
      .from('trading_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages requerido' }, { status: 400 })
    }

    const response = await openai.chat.completions.create({
      model:      'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: buildSystemPrompt(plan) },
        ...messages.slice(-8),
      ],
    })

    const message = response.choices[0].message.content
    if (!message) throw new Error('Unexpected response type')

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Dashboard chat error:', error)
    return NextResponse.json({ error: 'Error del asistente' }, { status: 500 })
  }
}
/**
 * POST /api/dashboard/chat
 *
 * Copilot contextual del dashboard personalizado.
 * Recibe el historial de chat + perfil del usuario.
 * Responde con Claude, personalizado al plan de trading del usuario.
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(plan: Record<string, unknown> | null): string {
  const base = `Eres INbot, el asistente financiero personalizado de INBIG Finanzas.
Eres experto en mercados de Latinoamérica (especialmente Argentina), cripto, forex y mercados globales.
Siempre respondes en español, de forma clara, directa y accionable.
Incluyes siempre: "Esta información es educativa y no constituye asesoramiento financiero regulado."`

  if (!plan) return base

  const markets     = (plan.markets     as string[] | null)  ?? []
  const assets      = (plan.assets      as Array<{symbol: string}> | null) ?? []
  const riskProfile = (plan.risk_profile as string | null) ?? 'moderado'
  const infoNeeds   = (plan.info_needs   as string[] | null) ?? []

  return `${base}

PERFIL DEL USUARIO:
- Mercados de interés: ${markets.join(', ') || 'general'}
- Activos favoritos: ${assets.map(a => a.symbol).join(', ') || 'sin definir'}
- Perfil de riesgo: ${riskProfile}
- Necesidades de información: ${infoNeeds.join(', ') || 'general'}

Usa este perfil para dar respuestas más relevantes y personalizadas.
Si el usuario pregunta sobre un activo de su watchlist, profundiza más.
Adapta el tono al perfil de riesgo: ${
    riskProfile === 'conservador' ? 'cauteloso, énfasis en preservación de capital' :
    riskProfile === 'agresivo'    ? 'directo, acepta hablar de oportunidades de alto riesgo' :
    'balanceado, diversificación y gestión de riesgo'
  }.`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    // Traer trading plan del usuario
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: plan } = await (supabase as any)
      .from('trading_plans')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages requerido' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5-20251001', // más rápido para chat
      max_tokens: 600,
      system:     buildSystemPrompt(plan),
      messages:   messages.slice(-8), // últimas 8 interacciones
    })

    const content = response.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    return NextResponse.json({ message: content.text })
  } catch (error) {
    console.error('Dashboard chat error:', error)
    return NextResponse.json({ error: 'Error del asistente' }, { status: 500 })
  }
}
