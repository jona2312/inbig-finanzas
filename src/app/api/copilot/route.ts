/**
 * POST /api/copilot — News Copilot con Perplexity Sonar
 *
 * Recibe una pregunta en español del usuario y devuelve un análisis
 * fundamentado en fuentes web en tiempo real (Perplexity Sonar).
 *
 * Tier gate: in_pro y in_pro_plus tienen acceso completo.
 * lector / in_basic: respuesta limitada (sin fuentes, sin análisis profundo).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface PerplexityResponse {
  choices: {
    message: { content: string }
    finish_reason: string
  }[]
  citations?: string[]
  usage?: { prompt_tokens: number; completion_tokens: number }
}

interface CopilotRequest {
  query: string
  context?: 'noticias' | 'mercados' | 'crypto' | 'divisas' | 'general'
}

// ─── System prompts por contexto ──────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  noticias: `Eres el Copiloto Financiero de INBIG Finanzas, especializado en noticias económicas de Latinoamérica.
Responde siempre en español, con claridad y precisión periodística.
Tu objetivo es explicar el impacto real de las noticias en el patrimonio del usuario.
Sé directo: qué pasó, por qué importa, qué implica para los inversores LATAM.
Máximo 4 párrafos. Incluye siempre un "¿Qué significa para vos?" al final.`,

  mercados: `Eres el Copiloto de Mercados de INBIG Finanzas, experto en acciones argentinas (BYMA), CEDEARs y mercados LATAM.
Responde en español con lenguaje claro, no jerga técnica excesiva.
Cuando cites datos de precios, aclara que pueden variar. Nunca des recomendaciones de compra/venta explícitas.
Estructura: contexto → análisis → factores clave → outlook.`,

  crypto: `Eres el Copiloto Crypto de INBIG Finanzas.
Explica el mercado cripto en español para inversores latinoamericanos.
Considera el contexto local: restricciones cambiarias, uso de crypto como cobertura al peso, CEDEARs cripto.
Sé objetivo: tanto oportunidades como riesgos. Máximo 3-4 párrafos.`,

  divisas: `Eres el Copiloto de Divisas de INBIG Finanzas, especializado en el mercado cambiario argentino.
Explica los 7 tipos de dólar, la brecha, las restricciones y el contexto macro.
Responde en español, con contexto histórico cuando sea relevante.
Nunca hagas recomendaciones sobre cómo evadir controles cambiarios.`,

  general: `Eres el Copiloto Financiero de INBIG Finanzas — inteligencia financiera para latinoamericanos.
Responde preguntas sobre economía, mercados, finanzas personales e inversiones en español.
Sé claro, directo y útil. Usa contexto LATAM cuando sea relevante (Argentina, México, Brasil, Colombia, Chile).
Añade siempre una perspectiva práctica: ¿cómo afecta esto al inversor retail latinoamericano?
IMPORTANTE: No eres asesor financiero. Aclara esto al final si la pregunta implica una decisión de inversión específica.`,
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: CopilotRequest = await req.json()
    const { query, context = 'general' } = body

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Query muy corta' }, { status: 400 })
    }

    if (query.length > 500) {
      return NextResponse.json({ error: 'Query demasiado larga (máx 500 caracteres)' }, { status: 400 })
    }

    // ── Tier gate (opcional — si no hay sesión, modo público limitado) ──
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let userTier = 'lector'

    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('tier')
        .eq('id', user.id)
        .single()
      userTier = profile?.tier ?? 'lector'
    }

    const isPro = userTier === 'in_pro' || userTier === 'in_pro_plus'

    // ── Sin API key de Perplexity → fallback con mensaje educativo ──
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json({
        answer: `El Copiloto financiero estará disponible próximamente. Estamos integrando fuentes de noticias en tiempo real para responder tu consulta sobre: "${query}"`,
        sources: [],
        tier_limited: false,
        model: 'fallback',
      })
    }

    // ── Construcción de mensajes ──
    const systemPrompt = SYSTEM_PROMPTS[context] ?? SYSTEM_PROMPTS.general

    const messages: PerplexityMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ]

    // ── Modelo: sonar-pro para Pro+, sonar para el resto ──
    const model = userTier === 'in_pro_plus' ? 'sonar-pro' : 'sonar'

    const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: isPro ? 800 : 300,
        temperature: 0.2,
        return_citations: true,
        search_recency_filter: 'week', // noticias de la semana
      }),
    })

    if (!perplexityRes.ok) {
      const errText = await perplexityRes.text()
      console.error('[Copilot] Perplexity error:', perplexityRes.status, errText)
      return NextResponse.json({ error: 'Error al consultar fuentes. Intenta de nuevo.' }, { status: 502 })
    }

    const data: PerplexityResponse = await perplexityRes.json()
    const answer = data.choices[0]?.message?.content ?? ''
    const sources = data.citations ?? []

    // ── Log de uso en Supabase (sin await para no bloquear respuesta) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (user) {
      // tabla assistant_usage no está en los tipos generados aún — cast temporal
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(supabase as any).from('assistant_usage').insert({
        user_id: user.id,
        query,
        answer: answer.slice(0, 1000),
        model_used: model,
        tokens_used: (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0),
        tier: userTier,
        button_type: context,
        sources: sources.slice(0, 5),
      }).then(() => {}).catch(console.error)
    }

    return NextResponse.json({
      answer,
      sources: isPro ? sources.slice(0, 5) : [],   // fuentes solo para Pro
      tier_limited: !isPro,
      model,
    })

  } catch (err) {
    console.error('[Copilot] Error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
