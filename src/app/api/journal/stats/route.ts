/**
 * GET /api/journal/stats — Estadísticas calculadas del trader
 * Devuelve métricas de performance, patrones detectados y North Star metrics
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  // Traer todos los trades cerrados
  const { data: trades } = await (supabase as any)
    .from('trade_journal')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'closed')
    .order('closed_at', { ascending: true })

  // Traer perfil computado
  const { data: profile } = await (supabase as any)
    .from('trader_profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!trades || trades.length === 0) {
    return NextResponse.json({
      total: 0, wins: 0, losses: 0, win_rate: 0,
      avg_rr: 0, avg_pnl: 0, total_pnl: 0,
      best_trade: null, worst_trade: null,
      by_session: {}, by_symbol: {}, by_emotion: {},
      by_day_of_week: {}, monthly_pnl: [],
      profile: profile ?? null,
    })
  }

  const withOutcome = trades.filter((t: any) => t.outcome)
  const wins    = withOutcome.filter((t: any) => t.outcome === 'win')
  const losses  = withOutcome.filter((t: any) => t.outcome === 'loss')
  const total_pnl = trades.reduce((s: number, t: any) => s + (t.pnl ?? 0), 0)
  const win_rate  = withOutcome.length > 0 ? parseFloat(((wins.length / withOutcome.length) * 100).toFixed(1)) : 0
  const avg_rr    = withOutcome.length > 0 ? parseFloat((withOutcome.reduce((s: number, t: any) => s + (t.risk_reward ?? 0), 0) / withOutcome.length).toFixed(2)) : 0
  const avg_pnl   = withOutcome.length > 0 ? parseFloat((total_pnl / withOutcome.length).toFixed(2)) : 0

  // Mejor y peor trade
  const sorted_pnl = [...trades].sort((a: any, b: any) => (b.pnl ?? 0) - (a.pnl ?? 0))
  const best_trade  = sorted_pnl[0] ?? null
  const worst_trade = sorted_pnl[sorted_pnl.length - 1] ?? null

  // Agrupar por sesión
  const by_session: Record<string, { trades: number; pnl: number; wins: number }> = {}
  trades.forEach((t: any) => {
    if (!t.session) return
    if (!by_session[t.session]) by_session[t.session] = { trades: 0, pnl: 0, wins: 0 }
    by_session[t.session].trades++
    by_session[t.session].pnl += t.pnl ?? 0
    if (t.outcome === 'win') by_session[t.session].wins++
  })

  // Agrupar por símbolo
  const by_symbol: Record<string, { trades: number; pnl: number; wins: number }> = {}
  trades.forEach((t: any) => {
    if (!t.symbol) return
    if (!by_symbol[t.symbol]) by_symbol[t.symbol] = { trades: 0, pnl: 0, wins: 0 }
    by_symbol[t.symbol].trades++
    by_symbol[t.symbol].pnl += t.pnl ?? 0
    if (t.outcome === 'win') by_symbol[t.symbol].wins++
  })

  // Correlación emoción → resultado
  const by_emotion: Record<string, { trades: number; wins: number; avg_pnl: number }> = {}
  trades.forEach((t: any) => {
    const emo = t.emotion_before
    if (!emo) return
    if (!by_emotion[emo]) by_emotion[emo] = { trades: 0, wins: 0, avg_pnl: 0 }
    by_emotion[emo].trades++
    by_emotion[emo].avg_pnl += t.pnl ?? 0
    if (t.outcome === 'win') by_emotion[emo].wins++
  })
  // Promediar pnl por emoción
  Object.keys(by_emotion).forEach(emo => {
    by_emotion[emo].avg_pnl = parseFloat((by_emotion[emo].avg_pnl / by_emotion[emo].trades).toFixed(2))
  })

  // PnL mensual (últimos 6 meses)
  const monthly: Record<string, number> = {}
  trades.forEach((t: any) => {
    if (!t.closed_at) return
    const month = t.closed_at.slice(0, 7) // YYYY-MM
    monthly[month] = (monthly[month] ?? 0) + (t.pnl ?? 0)
  })
  const monthly_pnl = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, pnl]) => ({ month, pnl: parseFloat(pnl.toFixed(2)) }))

  return NextResponse.json({
    total: trades.length,
    wins: wins.length,
    losses: losses.length,
    win_rate,
    avg_rr,
    avg_pnl,
    total_pnl: parseFloat(total_pnl.toFixed(2)),
    best_trade,
    worst_trade,
    by_session,
    by_symbol,
    by_emotion,
    monthly_pnl,
    profile: profile ?? null,
  })
}
