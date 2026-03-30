/**
 * GET    /api/journal/[id] — Detalle de un trade
 * PATCH  /api/journal/[id] — Actualizar trade (cerrar, agregar notas, emoción post)
 * DELETE /api/journal/[id] — Eliminar trade
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data, error } = await (supabase as any)
    .from('trade_journal')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)   // RLS doble: garantiza ownership
    .single()

  if (error) return NextResponse.json({ error: 'Trade no encontrado' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Si se cierra el trade, calcular PnL si no viene en el body
  if (body.status === 'closed' && body.exit_price && !body.pnl) {
    // Obtener entry_price del trade existente
    const { data: existing } = await (supabase as any)
      .from('trade_journal')
      .select('entry_price, direction, lot_size')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      const entry    = Number(existing.entry_price)
      const exit     = Number(body.exit_price)
      const lots     = Number(existing.lot_size ?? 1)
      const rawDiff  = existing.direction === 'long' ? (exit - entry) : (entry - exit)
      body.pnl       = parseFloat((rawDiff * lots).toFixed(2))
      body.pnl_pct   = parseFloat(((rawDiff / entry) * 100).toFixed(2))
      body.outcome   = body.outcome ?? (rawDiff > 0 ? 'win' : rawDiff < 0 ? 'loss' : 'breakeven')
      body.closed_at = body.closed_at ?? new Date().toISOString()
    }
  }

  // Campos permitidos para actualización
  const allowed = [
    'exit_price','stop_loss','take_profit','lot_size','leverage',
    'pnl','pnl_pct','risk_reward','status','outcome',
    'emotion_during','emotion_after','followed_plan',
    'exit_reason','lesson','tags','screenshot_url','closed_at','macro_context','session'
  ]
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  const { data, error } = await (supabase as any)
    .from('trade_journal')
    .update(patch)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { error } = await (supabase as any)
    .from('trade_journal')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
