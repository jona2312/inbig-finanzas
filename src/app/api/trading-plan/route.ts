/**
 * POST /api/trading-plan — Guarda el trading plan del onboarding
 * GET  /api/trading-plan — Devuelve el plan del usuario autenticado
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: {
    markets?:     string[]
    assets?:      string[]
    infoNeeds?:   string[]
    riskProfile?: string
    notes?:       string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Transformar assets array de strings a [{symbol, label}]
  const assetsJson = (body.assets ?? []).map(sym => ({ symbol: sym, label: sym }))

  const { error } = await (supabase as any)
    .from('trading_plans')
    .upsert(
      {
        user_id:      user.id,
        markets:      body.markets    ?? [],
        assets:       assetsJson,
        info_needs:   body.infoNeeds  ?? [],
        risk_profile: body.riskProfile ?? 'moderado',
        notes:        body.notes       ?? '',
        generated:    false,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('[trading-plan] upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // También inicializar user_preferences si no existe
  await (supabase as any)
    .from('user_preferences')
    .upsert(
      {
        user_id:        user.id,
        default_symbol: (body.assets ?? [])[0] ?? 'GGAL',
      },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data, error } = await (supabase as any)
    .from('trading_plans')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? null)
}
