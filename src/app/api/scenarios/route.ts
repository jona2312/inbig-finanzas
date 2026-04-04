/**
 * GET  /api/scenarios       Ã¢ÂÂ Lista escenarios activos del usuario
 * POST /api/scenarios       Ã¢ÂÂ Crea un nuevo escenario (Motor de Escenarios)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await (supabase as any)
    .from('scenario_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON invÃÂ¡lido' }, { status: 400 })
  }

  // Traer perfil del trader para personalizar el copiloto
  const { data: profile } = await (supabase as any)
    .from('trader_profile')
    .select('win_rate, avg_rr, preferred_session, best_assets, weak_points')
    .eq('user_id', user.id)
    .single()

  const { data: tradingPlan } = await (supabase as any)
    .from('trading_plans')
    .select('risk_profile, markets, assets')
    .eq('user_id', user.id)
    .single()

  // Ã¢ÂÂÃ¢ÂÂ Capa 1: Calculadora dura (matemÃÂ¡tica pura) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  const entry  = Number(body.entry_price ?? 0)
  const sl     = Number(body.stop_loss   ?? 0)
  const tp     = Number(body.take_profit ?? 0)
  const lots   = Number(body.lot_size    ?? 1)
  const lev    = Number(body.leverage    ?? 1)

  const risk_per_unit   = sl > 0 ? Math.abs(entry - sl) : 0
  const reward_per_unit = tp > 0 ? Math.abs(tp - entry) : 0
  const rr              = risk_per_unit > 0 ? parseFloat((reward_per_unit / risk_per_unit).toFixed(2)) : 0
  const pnl_potential   = parseFloat((reward_per_unit * lots * lev).toFixed(2))
  const risk_amount     = parseFloat((risk_per_unit   * lots * lev).toFixed(2))

  const calculator = { entry, sl, tp, lots, leverage: lev, risk_per_unit, reward_per_unit, rr, pnl_potential, risk_amount }

  // Ã¢ÂÂÃ¢ÂÂ Capa 2 + 3: Motor de escenario + Copiloto educativo (IA) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  const profileContext = profile
    ? `El trader tiene: win rate ${profile.win_rate}%, R:R promedio ${profile.avg_rr}, sesiÃÂ³n preferida: ${profile.preferred_session ?? 'no definida'}, activos fuertes: ${(profile.best_assets ?? []).join(', ') || 'no definidos'}.`
    : 'No hay historial previo de este trader.'

  const prompt = `Eres el Motor de Escenarios de INBIG Finanzas. AnalizÃÂ¡s el setup de un trader retail de LATAM.

PERFIL DEL TRADER:
${profileContext}
Perfil de riesgo: ${tradingPlan?.risk_profile ?? 'moderado'}

SETUP:
- Activo: ${body.symbol} (${body.asset_type ?? 'no especificado'})
- DirecciÃÂ³n: ${body.direction ?? 'no especificada'}
- Timeframe: ${body.timeframe ?? 'no especificado'}
- Entrada: ${entry > 0 ? entry : 'no definida'}
- Stop Loss: ${sl > 0 ? sl : 'no definido'}
- Take Profit: ${tp > 0 ? tp : 'no definido'}
- R:R calculado: ${rr > 0 ? rr : 'N/A'}

DevolvÃÂ© SOLO un JSON con esta estructura exacta (sin markdown, sin texto extra):
{
  "scenario_bull": { "target": number|null, "probability_pct": number, "key_levels": string, "reasoning": string },
  "scenario_base": { "target": number|null, "probability_pct": number, "key_levels": string, "reasoning": string },
  "scenario_bear": { "target": number|null, "probability_pct": number, "key_levels": string, "reasoning": string },
  "technical_bias": "alcista"|"bajista"|"lateral",
  "volatility_note": string,
  "macro_events": [{ "event": string, "impact": "alto"|"medio"|"bajo", "direction": "alcista"|"bajista"|"neutro" }],
  "copilot_questions": [string, string, string],
  "educational_note": string,
  "risk_size_note": string
}

REGLA DE COMPLIANCE: Nunca des recomendaciones de inversiÃÂ³n. Todo es anÃÂ¡lisis educativo y contextual.`

  let aiResult: Record<string, unknown> = {}
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
    const raw = completion.choices[0].message.content?.trim()
    aiResult = JSON.parse(raw ?? '')
  } catch (e) {
    console.error('[scenarios] AI error:', e)
    // Fallback sin IA
    aiResult = {
      scenario_bull: { probability_pct: 33, reasoning: 'AnÃÂ¡lisis no disponible temporalmente', key_levels: '', target: null },
      scenario_base: { probability_pct: 34, reasoning: 'AnÃÂ¡lisis no disponible temporalmente', key_levels: '', target: null },
      scenario_bear: { probability_pct: 33, reasoning: 'AnÃÂ¡lisis no disponible temporalmente', key_levels: '', target: null },
      technical_bias: 'lateral',
      volatility_note: 'No disponible',
      macro_events: [],
      copilot_questions: ['ÃÂ¿TenÃÂ©s definido tu stop?', 'ÃÂ¿Hay eventos macro hoy?', 'ÃÂ¿Este trade va con tu plan?'],
      educational_note: 'AnÃÂ¡lisis temporal no disponible.',
      risk_size_note: 'RevisÃÂ¡ tu sizing segÃÂºn tu capital disponible.',
    }
  }

  // Ã¢ÂÂÃ¢ÂÂ Guardar en base de datos Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // expira en 7 dÃÂ­as por defecto

  const { data: scenario, error } = await (supabase as any)
    .from('scenario_sessions')
    .insert({
      user_id:             user.id,
      symbol:              (body.symbol as string)?.toUpperCase(),
      asset_type:          body.asset_type,
      current_price:       entry,
      direction:           body.direction,
      timeframe:           body.timeframe,
      scenario_bull:       aiResult.scenario_bull,
      scenario_base:       aiResult.scenario_base,
      scenario_bear:       aiResult.scenario_bear,
      macro_events:        aiResult.macro_events ?? [],
      technical_bias:      aiResult.technical_bias,
      volatility_note:     aiResult.volatility_note,
      copilot_questions:   aiResult.copilot_questions ?? [],
      risk_size:           calculator.risk_amount,
      educational_note:    aiResult.educational_note,
      status:              'active',
      expires_at:          expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ...scenario,
    calculator,           // Capa 1
    risk_size_note: aiResult.risk_size_note,
  }, { status: 201 })
}
