/**
 * GET  /api/checkin         — Check-in del día (crea vacío si no existe)
 * POST /api/checkin         — Crear/actualizar check-in del día
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const { data } = await (supabase as any)
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Devolver el de hoy o null (el cliente decide si mostrar el form)
  return NextResponse.json(data ?? null)
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const today = (body.date as string) ?? new Date().toISOString().split('T')[0]

  const { data, error } = await (supabase as any)
    .from('daily_checkins')
    .upsert({
      user_id:         user.id,
      date:            today,
      mood:            body.mood,
      focus_level:     body.focus_level,
      confidence:      body.confidence,
      trading_today:   body.trading_today ?? true,
      daily_goal:      body.daily_goal,
      max_trades:      body.max_trades,
      max_loss_usd:    body.max_loss_usd,
      notes:           body.notes,
      end_of_day_notes: body.end_of_day_notes,
      followed_plan:   body.followed_plan,
    }, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
