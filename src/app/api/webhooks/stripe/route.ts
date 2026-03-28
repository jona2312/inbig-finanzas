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

// ─── Config ───────────────────────────────────────────────────────────────────

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

// Usamos service role key para writes admin (bypass RLS)
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Map Stripe price ID → user_tier en INBIG
function getTierFromPriceId(priceId: string): UserTier {
  const map: Record<string, UserTier> = {
    [process.env.STRIPE_PRICE_PRO_MONTHLY ?? '']: 'in_pro',
    [process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY ?? '']: 'in_pro_plus',
  }
  return map[priceId] ?? 'in_basic'
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  try {
    switch (event.type) {

      // ── Checkout completado → nuevo suscriptor ──────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const userId = session.metadata?.user_id  // pasado en checkout creation

        if (!userId) {
          console.error('[Stripe] checkout.session sin user_id en metadata')
          break
        }

        // Obtener tier desde el subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny = subscription as any
        const priceId = subscription.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId)

        // Upsert en tabla subscriptions
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          current_period_start: subAny.current_period_start
            ? new Date(subAny.current_period_start * 1000).toISOString()
            : null,
          current_period_end: subAny.current_period_end
            ? new Date(subAny.current_period_end * 1000).toISOString()
            : null,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Actualizar users.tier
        await supabase.from('users').update({
          tier,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        }).eq('id', userId)

        console.log(`[Stripe] ✅ checkout.completed → user ${userId} → tier ${tier}`)
        break
      }

      // ── Subscription actualizada (upgrade/downgrade) ────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        const priceId = sub.items.data[0]?.price.id
        const tier = getTierFromPriceId(priceId)

        // Buscar usuario por stripe_customer_id
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!user) {
          console.error(`[Stripe] No se encontró usuario para customer ${customerId}`)
          break
        }

        await supabase.from('users').update({
          tier,
          subscription_status: sub.status,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subAny2 = sub as any
        await supabase.from('subscriptions').update({
          tier,
          status: sub.status,
          current_period_start: subAny2.current_period_start
            ? new Date(subAny2.current_period_start * 1000).toISOString()
            : null,
          current_period_end: subAny2.current_period_end
            ? new Date(subAny2.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)

        console.log(`[Stripe] ✅ subscription.updated → user ${user.id} → tier ${tier}`)
        break
      }

      // ── Subscription cancelada → downgrade a lector ─────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
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
        const invoice = event.data.object as Stripe.Invoice
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
        // Eventos no manejados — ignorar silenciosamente
        break
    }

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('[Stripe Webhook] Error procesando evento:', event.type, err)
    // Devolver 200 igual para que Stripe no reintente indefinidamente
    return NextResponse.json({ received: true, error: 'Processing error' })
  }
}
