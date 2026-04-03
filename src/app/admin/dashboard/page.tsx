import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

/**
 * Admin Command Center — INBIG Finanzas
 * Métricas: usuarios por tier, revenue Stripe (MRR), costos estimados, usos.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, currency = false) {
  if (currency) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  return n.toLocaleString('es-AR')
}

// ─── Stripe data ──────────────────────────────────────────────────────────────

async function getStripeMetrics() {
  if (!process.env.STRIPE_SECRET_KEY) return null

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' })
  try {
    // Suscripciones activas
    const [basicSubs, plusSubs, premiumSubs] = await Promise.all([
      stripe.subscriptions.list({ price: process.env.STRIPE_PRICE_BASIC_MONTHLY,   status: 'active', limit: 100 }),
      stripe.subscriptions.list({ price: process.env.STRIPE_PRICE_PLUS_MONTHLY,    status: 'active', limit: 100 }),
      stripe.subscriptions.list({ price: process.env.STRIPE_PRICE_PREMIUM_MONTHLY, status: 'active', limit: 100 }),
    ])

    const basicCount   = basicSubs.data.length
    const plusCount    = plusSubs.data.length
    const premiumCount = premiumSubs.data.length

    const mrr = basicCount * 8 + plusCount * 18 + premiumCount * 35
    const arr = mrr * 12

    // Balance disponible
    const balance = await stripe.balance.retrieve()
    const available = (balance.available.find(b => b.currency === 'usd')?.amount ?? 0) / 100

    return { basicCount, plusCount, premiumCount, mrr, arr, available }
  } catch (err) {
    console.error('[Admin] Stripe metrics error:', err)
    return null
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [
    { count: totalUsers },
    { count: basicUsers },
    { count: proUsers },
    { count: proPlusUsers },
    { count: totalArticles },
    { count: totalBriefings },
    { count: totalJournalEntries },
    { data: recentEventsData },
    stripeMetrics,
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'in_basic'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'in_pro'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'in_pro_plus'),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('briefings').select('*', { count: 'exact', head: true }),
    supabase.from('trade_journal').select('*', { count: 'exact', head: true }),
    supabase.from('user_events').select('event_type, created_at').order('created_at', { ascending: false }).limit(20),
    getStripeMetrics(),
  ])

  // Agrupar eventos por tipo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentEvents = (recentEventsData ?? []) as any[]
  const eventCounts = recentEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1
    return acc
  }, {})

  const paidUsers = (basicUsers ?? 0) + (proUsers ?? 0) + (proPlusUsers ?? 0)
  const conversionRate = totalUsers ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0'

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white">Command Center</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Panel de control — INBIG Finanzas</p>
      </div>

      {/* ── REVENUE ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Revenue</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            icon="💵"
            label="MRR"
            value={stripeMetrics ? fmt(stripeMetrics.mrr, true) : '—'}
            sub="mensual recurrente"
            color="text-emerald-400"
          />
          <MetricCard
            icon="📈"
            label="ARR"
            value={stripeMetrics ? fmt(stripeMetrics.arr, true) : '—'}
            sub="anualizado"
            color="text-emerald-300"
          />
          <MetricCard
            icon="💳"
            label="Balance disponible"
            value={stripeMetrics ? fmt(stripeMetrics.available, true) : '—'}
            sub="en Stripe (USD)"
            color="text-blue-400"
          />
          <MetricCard
            icon="🔄"
            label="Conversión"
            value={`${conversionRate}%`}
            sub="free → pago"
            color="text-yellow-400"
          />
        </div>
      </section>

      {/* ── SUSCRIPCIONES POR PLAN ───────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Suscripciones activas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard icon="🆓" label="Lector"   value={fmt((totalUsers ?? 0) - paidUsers)} sub="$0/mes"  color="text-zinc-400" />
          <MetricCard icon="🔵" label="Basic"    value={fmt(stripeMetrics?.basicCount   ?? basicUsers   ?? 0)} sub="$8/mes"  color="text-blue-400"    />
          <MetricCard icon="🟢" label="Plus"     value={fmt(stripeMetrics?.plusCount    ?? proUsers     ?? 0)} sub="$18/mes" color="text-emerald-400" />
          <MetricCard icon="🟡" label="Premium"  value={fmt(stripeMetrics?.premiumCount ?? proPlusUsers ?? 0)} sub="$35/mes" color="text-yellow-400"  />
        </div>
      </section>

      {/* ── USUARIOS ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Usuarios</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard icon="👥" label="Usuarios totales"   value={fmt(totalUsers    ?? 0)} sub="registrados"      color="text-white"       />
          <MetricCard icon="📰" label="Artículos"          value={fmt(totalArticles ?? 0)} sub="publicados"       color="text-orange-400"  />
          <MetricCard icon="📊" label="Briefings"          value={fmt(totalBriefings?? 0)} sub="generados"        color="text-purple-400"  />
          <MetricCard icon="📓" label="Entradas de diario" value={fmt(totalJournalEntries ?? 0)} sub="trade journal" color="text-pink-400" />
        </div>
      </section>

      {/* ── COSTOS ESTIMADOS ────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Costos estimados (mes actual)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '🤖', label: 'Copilot IA (LLM)',    value: '~$0', sub: 'sin queries aún',   color: 'text-zinc-400' },
            { icon: '📡', label: 'n8n (VPS)',            value: '~$20', sub: 'Coolify self-host', color: 'text-zinc-400' },
            { icon: '🟣', label: 'Supabase',             value: '~$0',  sub: 'plan gratuito',     color: 'text-zinc-400' },
            { icon: '▲',  label: 'Vercel',               value: '~$0',  sub: 'plan pro incluido', color: 'text-zinc-400' },
          ].map(m => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          * Costos LLM reales se habilitarán cuando se integre el tracking de tokens por usuario.
        </p>
      </section>

      {/* ── ACTIVIDAD ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Actividad reciente</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Últimos eventos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Últimos 20 eventos</h3>
            {recentEvents.length > 0 ? (
              <div className="space-y-2">
                {recentEvents.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300 font-mono bg-zinc-800 px-2 py-0.5 rounded text-xs">
                      {e.event_type}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {new Date(e.created_at).toLocaleTimeString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Sin eventos. El tracking comienza cuando lleguen usuarios.</p>
            )}
          </div>

          {/* Distribución de eventos */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Top features usadas</h3>
            {Object.keys(eventCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(eventCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3">
                      <div className="flex-1 bg-zinc-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(count / 20) * 100}%` }} />
                      </div>
                      <span className="text-xs text-zinc-400 w-28 truncate">{type}</span>
                      <span className="text-xs text-zinc-300 font-mono w-4 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Sin datos aún.</p>
            )}
          </div>

        </div>
      </section>

    </div>
  )
}

// ─── MetricCard ───────────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, sub, color }: {
  icon: string
  label: string
  value: string | number
  sub: string
  color: string
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-xl mb-1">{icon}</div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-zinc-400 mt-0.5 font-medium">{label}</p>
      <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>
    </div>
  )
}
