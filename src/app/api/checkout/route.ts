/**
 * POST /api/checkout
 *
 * Crea una sesión de Stripe Checkout para upgrades de plan.
 * Requiere usuario autenticado. Pasa user_id en metadata
 * para que el webhook pueda asignar el tier correctamente.
 *
 * Body: { plan: 'basic' | 'plus' | 'premium' }
 * Redirect success: /dashboard?upgrade=success
 * Redirect cancel:  /planes
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Price IDs por plan (deben estar en env vars de Vercel)
const PRICE_MAP: Record<string, string | undefined> = {
  basic:   process.env.STRIPE_PRICE_BASIC_MONTHLY,
  plus:    process.env.STRIPE_PRICE_PLUS_MONTHLY,
  premium: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
}

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

export async function POST(req: NextRequest) {
  // 1. Verificar autenticación
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // 2. Leer plan del body
  const body = await req.json().catch(() => ({}))
  const plan = body.plan as string

  const priceId = PRICE_MAP[plan]
  if (!priceId) {
    return NextResponse.json(
      { error: `Plan inválido: ${plan}. Opciones: basic, plus, premium` },
      { status: 400 }
    )
  }

  const stripe = getStripe()
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://inbig-finanzas.vercel.app'

  try {
    // 3. Buscar o crear customer de Stripe para el usuario
    const { data: dbUser } = await supabase
      .from('users')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    let customerId = dbUser?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser?.email ?? user.email ?? '',
        name: dbUser?.full_name ?? undefined,
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      // Guardar customer_id en users
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq('id', user.id)
    }

    // 4. Crear sesión de Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        user_id: user.id,  // CRÍTICO: el webhook lo usa para asignar tier
      },
      subscription_data: {
        metadata: { user_id: user.id },
      },
      success_url: `${origin}/dashboard?upgrade=success&plan=${plan}`,
      cancel_url: `${origin}/planes`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })

  } catch (err) {
    console.error('[Checkout] Error creando sesión:', err)
    return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 })
  }
}
