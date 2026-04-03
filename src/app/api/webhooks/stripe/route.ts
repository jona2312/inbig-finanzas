/**
 * POST /api/webhooks/stripe
 *
 * Recibe eventos de Stripe y actualiza el tier del usuario en Supabase.
 * CRÍTICO: Esta lógica vive en código versionado, no en n8n.
 * Un fallo aquí = pérdida de ingresos.
 *
 * Eventos manejados:
 * - checkout.session.completed → tier upgrade
 * - customer.subscription.updated → cambio de plan
 * - customer.subscription.deleted → downgrade a lector
 * - invoice.payment_failed → marcar subscription_status = past_due
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { UserTier } from '@/types/database'

export const dynamic = 'force-dynamic'

// ─── Config ──────────────────────────────────────────────────────────────────

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
  })
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Mapa completo: Stripe Price ID → tier en INBIG
 * Env vars requeridas en Vercel:
 *   STRIPE_PRICE_BASIC_MONTHLY   = price_1TG25q...
 *   STRIPE_PRICE_PLUS_MONTHLY    = price_1TG25r...
 *   STRIPE_PRICE_PREMIUM_MONTHLY = price_1TG25s...
 */
function getTierFromPriceId(priceId: string): UserTier {
  const map: Record<string, UserTier> = {
    [process.env.STRIPE_PRICE_BASIC_MONTHLY   ?? '__missing_basic__']:   'in_basic',
    [process.env.STRIPE_PRICE_PLUS_MONTHLY    ?? '__missing_plus__']:    'in_pro',
    [process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? '__missing_premium__']: 'in_pro_plus',
  }
  const tier = map[priceId]
  if (!tier) {
    console.warn(`[Stripe] Price ID desconocido: ${priceId} → fallback lector`)
    return 'lector'
  }
  return tier
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  try {
    switch (event.type) {

      // ── Checkout completado → nuevo suscriptor ──────────────────────────
      case 'checkout.session.completed': {
        const session        = event.data.object as Stripe.Checkout.Session
        const customerId     = session.customer as string
        const subscriptionId = session.subscription as string
        const userId         = session.metadata?.user_id

        if (!userId) {
          console.error('[Stripe] checkout.session sin user_id en metadata')
          break
        }

        const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny   = subscription as any
        const priceId  = subscription.items.data[0]?.price.id
        const tier     = getTierFromPriceId(priceId)

        await supabase.from('subscriptions').upsert({
          user_id:               userId,
          tier,
          stripe_customer_id:    customerId,
          stripe_subscription_id: subscriptionId,
          status:                subscription.status,
          current_period_start:  subAny.current_period_start
            ? new Date(subAny.current_period_start * 1000).toISOString() : null,
          current_period_end:    subAny.current_period_end
            ? new Date(subAny.current_period_end   * 1000).toISOString() : null,
          started_at:            new Date().toISOString(),
          updated_at:            new Date().toISOString(),
        })

        await supabase.from('users').update({
          tier,
          stripe_customer_id:     customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status:    subscription.status,
          updated_at:             new Date().toISOString(),
        }).eq('id', userId)

        console.log(`[Stripe] ✅ checkout.completed → user ${userId} → tier ${tier}`)
        break
      }

      // ── Subscription actualizada (upgrade/downgrade) ───────────────────
      case 'customer.subscription.updated': {
        const sub        = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const priceId    = sub.items.data[0]?.price.id
        const tier       = getTierFromPriceId(priceId)

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) {
          console.error(`[Stripe] No se encontró usuario para customer ${customerId}`)
          break
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny2 = sub as any
        await supabase.from('users').update({
          tier,
          subscription_status: sub.status,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)

        await supabase.from('subscriptions').update({
          tier,
          status: sub.status,
          current_period_start: subAny2.current_period_start
            ? new Date(subAny2.current_period_start * 1000).toISOString() : null,
          current_period_end: subAny2.current_period_end
            ? new Date(subAny2.current_period_end   * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)

        console.log(`[Stripe] ✅ subscription.updated → user ${user.id} → tier ${tier}`)
        break
      }

      // ── Subscription cancelada → downgrade a lector ────────────────────
      case 'customer.subscription.deleted': {
        const sub        = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) break

        await supabase.from('users').update({
          tier: 'lector',
          subscription_status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)

        await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)

        console.log(`[Stripe] ✅ subscription.deleted → user ${user.id} → tier lector`)
        break
      }

      // ── Pago fallido → marcar past_due ─────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice    = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) break

        await supabase.from('users').update({
          subscription_status: 'past_due',
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)

        console.log(`[Stripe] ⚠️ payment_failed → user ${user.id} → past_due`)
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('[Stripe Webhook] Error procesando evento:', event.type, err)
    return NextResponse.json({ received: true, error: 'Processing error' })
  }
}
