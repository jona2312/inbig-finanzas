import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/journal/[id]/diary
 * Actualiza los campos del Diario del Trader para un trade específico.
 * Separa los campos del diario (subjetivos) de los campos del trade (objetivos).
 *
 * Fases:
 *   antes  → emotion_before, plan, setup, risk_reward_planned
 *   durante → notes (durante el trade)
 *   después → emotion_after, reflection, quality_score, followed_plan
 */

const DIARY_FIELDS_ALLOWED = new Set([
  // Fase: Antes del trade
  'emotion_before',
  'plan',
  'setup',
  'risk_reward_planned',
  // Fase: Durante
  'notes',
  // Fase: Después
  'emotion_after',
  'reflection',
  'quality_score',
  'followed_plan',
  // Campos de timing
  'entry_time',
  'exit_time',
])

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Filtrar solo campos del diario permitidos
    const updates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(body)) {
      if (DIARY_FIELDS_ALLOWED.has(key)) {
        updates[key] = value
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid diary fields provided' },
        { status: 400 }
      )
    }

    // Validar quality_score en rango 1-10
    if ('quality_score' in updates) {
      const score = Number(updates.quality_score)
      if (isNaN(score) || score < 1 || score > 10) {
        return NextResponse.json(
          { error: 'quality_score must be between 1 and 10' },
          { status: 400 }
        )
      }
      updates.quality_score = score
    }

    // Solo puede editar sus propios trades
    const { data, error } = await supabase
      .from('trade_journal')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('PATCH /api/journal/[id]/diary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/journal/[id]/diary
 * Obtiene los campos del diario de un trade específico.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('trade_journal')
      .select(
        'id, symbol, status, emotion_before, emotion_after, plan, setup, notes, reflection, quality_score, followed_plan, risk_reward_planned, entry_time, exit_time, created_at'
      )
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('GET /api/journal/[id]/diary error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
