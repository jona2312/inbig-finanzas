/**
 * GET  /api/journal        — Lista trades del usuario (con filtros)
 * POST /api/journal        — Crea un nuevo trade en el diario
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ─── GET: listar trades ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status    = searchParams.get('status')    // open | closed | all
  const symbol    = searchParams.get('symbol')
  const limit     = parseInt(searchParams.get('limit') ?? '50')
  const offset    = parseInt(searchParams.get('offset') ?? '0')

  let query = (supabase as any)
    .from('trade_journal')
    .select('*')
    .eq('user_id', user.id)
    .order('opened_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') query = query.eq('status', status)
  if (symbol) query = query.eq('symbol', symbol.toUpperCase())

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ trades: data ?? [], count })
}

// ─── POST: crear trade ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Calcular R:R automáticamente si se proveen los datos
  let risk_reward = body.risk_reward as number | undefined
  if (!risk_reward && body.entry_price && body.stop_loss && body.take_profit) {
    const entry = Number(body.entry_price)
    const sl    = Number(body.stop_loss)
    const tp    = Number(body.take_profit)
    const risk   = Math.abs(entry - sl)
    const reward = Math.abs(tp - entry)
    if (risk > 0) risk_reward = parseFloat((reward / risk).toFixed(2))
  }

  const { data, error } = await (supabase as any)
    .from('trade_journal')
    .insert({
      user_id:        user.id,
      symbol:         (body.symbol as string)?.toUpperCase(),
      asset_type:     body.asset_type,
      direction:      body.direction,
      timeframe:      body.timeframe,
      strategy:       body.strategy,
      entry_price:    body.entry_price,
      exit_price:     body.exit_price,
      stop_loss:      body.stop_loss,
      take_profit:    body.take_profit,
      lot_size:       body.lot_size,
      leverage:       body.leverage ?? 1,
      pnl:            body.pnl,
      pnl_pct:        body.pnl_pct,
      risk_reward,
      status:         body.status ?? 'open',
      outcome:        body.outcome,
      emotion_before: body.emotion_before,
      emotion_during: body.emotion_during,
      emotion_after:  body.emotion_after,
      followed_plan:  body.followed_plan,
      entry_reason:   body.entry_reason,
      exit_reason:    body.exit_reason,
      lesson:         body.lesson,
      tags:           body.tags ?? [],
      screenshot_url: body.screenshot_url,
      macro_context:  body.macro_context ?? {},
      session:        body.session,
      opened_at:      body.opened_at ?? new Date().toISOString(),
      closed_at:      body.closed_at,
    })
    .select()
    .single()

  if (error) {
    console.error('[journal] insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Disparar actualización de trader_profile en background (no bloqueante)
  updateTraderProfile(supabase, user.id).catch(console.error)

  return NextResponse.json(data, { status: 201 })
}

// ─── Actualizar perfil calculado del trader ────────────────────────────────────
async function updateTraderProfile(supabase: any, userId: string) {
  const { data: trades } = await supabase
    .from('trade_journal')
    .select('outcome, pnl, pnl_pct, risk_reward, symbol, session, timeframe, strategy, status')
    .eq('user_id', userId)
    .eq('status', 'closed')

  if (!trades || trades.length === 0) return

  const closed = trades.filter((t: any) => t.outcome)
  const wins   = closed.filter((t: any) => t.outcome === 'win')
  const win_rate    = closed.length > 0 ? parseFloat(((wins.length / closed.length) * 100).toFixed(1)) : 0
  const avg_rr      = closed.length > 0 ? parseFloat((closed.reduce((s: number, t: any) => s + (t.risk_reward ?? 0), 0) / closed.length).toFixed(2)) : 0
  const avg_pnl     = closed.length > 0 ? parseFloat((closed.reduce((s: number, t: any) => s + (t.pnl ?? 0), 0) / closed.length).toFixed(2)) : 0

  // Detectar sesión y activos preferidos
  const sessionCount: Record<string, number> = {}
  const symbolCount:  Record<string, number> = {}
  trades.forEach((t: any) => {
    if (t.session) sessionCount[t.session] = (sessionCount[t.session] ?? 0) + 1
    if (t.symbol)  symbolCount[t.symbol]   = (symbolCount[t.symbol]  ?? 0) + 1
  })
  const preferred_session  = Object.entries(sessionCount).sort((a, b) => b[1] - a[1])[0]?.[0]
  const best_assets        = Object.entries(symbolCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s]) => s)

  await supabase
    .from('trader_profile')
    .upsert({
      user_id: userId,
      win_rate,
      avg_rr,
      avg_pnl,
      total_trades: closed.length,
      preferred_session,
      best_assets,
      last_analysis_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
}
