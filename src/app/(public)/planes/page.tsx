/**
 * /planes — Pricing page
 * El Netflix Financiero: 4 tiers claros, visual impactante
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import UpgradeButton from '@/components/upgrade/upgrade-button'

export const metadata: Metadata = {
  title: 'Planes — INBIG Finanzas',
  description: 'Elegí tu plan. Desde gratis hasta la terminal Bloomberg completa.',
}

const PLANS = [
  {
    id:       'lector',
    name:     'Lector',
    price:    0,
    period:   'siempre',
    badge:    null,
    color:    'border-zinc-700',
    btnStyle: 'bg-zinc-800 hover:bg-zinc-700 text-white',
    cta:      'Empezar gratis',
    href:     '/register',
    features: [
      'Noticias financieras del día',
      'Dólar + tipos de cambio',
      'Top cripto en tiempo real',
      'Copilot IA — 5 consultas/día',
      'Graficador básico (1 activo)',
      'Acceso a la comunidad',
    ],
    disabled: [],
  },
  {
    id:       'basic',
    name:     'Basic',
    price:    8,
    period:   'mes',
    badge:    null,
    color:    'border-blue-700',
    btnStyle: 'bg-blue-600 hover:bg-blue-500 text-white',
    cta:      'Empezar Basic',
    href:     '/register?plan=basic',
    features: [
      'Todo lo de Lector',
      'Briefings IA diarios (mercados, macro)',
      'Copilot IA — 30 consultas/día',
      'Alertas de precio por email',
      'Screener de acciones BYMA + CEDEAR',
      'Acceso al mapa de bolsas mundiales',
      'Exportar datos a CSV',
    ],
    disabled: [],
  },
  {
    id:       'plus',
    name:     'Plus',
    price:    18,
    period:   'mes',
    badge:    'Más popular',
    color:    'border-emerald-500',
    btnStyle: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    cta:      'Empezar Plus',
    href:     '/register?plan=plus',
    features: [
      'Todo lo de Basic',
      'Terminal de trading completa',
      'TradingView charts avanzados',
      'Copilot IA — ilimitado',
      'Trading plan personalizado IA',
      'Watchlist ilimitada (cualquier activo)',
      'Feed social — actividad de la comunidad',
      'Alertas push + WhatsApp',
      'Acceso prioritario a nuevas features',
    ],
    disabled: [],
  },
  {
    id:       'premium',
    name:     'Premium',
    price:    35,
    period:   'mes',
    badge:    'Próximamente',
    color:    'border-yellow-500',
    btnStyle: 'bg-yellow-600 hover:bg-yellow-500 text-black font-bold',
    cta:      'Anotarme en lista de espera',
    href:     '/register?plan=premium',
    features: [
      'Todo lo de Plus',
      'Datos institucionales (flujos, opciones)',
      'API de datos INBIG para tu código',
      'Asesor IA con memoria completa (6 meses)',
      'Señales de trading (backtested)',
      'Acceso a sala de trading en vivo',
      'Integración con brokers (en desarrollo)',
      'Soporte prioritario 1:1',
      'Early access a productos nuevos',
    ],
    disabled: [],
  },
]

const FAQS = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Sin permanencia, sin penalidades. Cancelás y seguís con el plan gratuito.',
  },
  {
    q: '¿Los datos son en tiempo real?',
    a: 'Sí para usuarios Plus y Premium. Basic y Lector tienen delay de 15 minutos en algunos mercados.',
  },
  {
    q: '¿Cómo funciona el trading plan personalizado?',
    a: 'Al registrarte en Plus, completás un onboarding: qué mercados operás, qué activos seguís, tu perfil de riesgo. La IA arma tu dashboard a medida en menos de 24hs.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Tarjeta de crédito/débito (Visa, Mastercard, Amex) y MercadoPago para usuarios de LATAM.',
  },
  {
    q: '¿Hay descuento por pago anual?',
    a: 'Sí, 2 meses gratis al pagar el año por adelantado. Disponible próximamente.',
  },
]

export default function PlanesPage({
  searchParams,
}: {
  searchParams?: { upgrade?: string }
}) {
  const upgradeRequired = searchParams?.upgrade === 'required'

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Banner upgrade required */}
      {upgradeRequired && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-sm text-center px-6 py-3">
          Necesitás un plan de pago para acceder al dashboard. Elegí tu plan abajo.
        </div>
      )}

      {/* Hero */}
      <div className="text-center px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-800/40 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          El Netflix financiero de LATAM
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          Tu terminal financiera,<br />
          <span className="text-emerald-400">a tu medida</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Noticias en vivo · Mercados en tiempo real · IA que te asesora · Comunidad de traders.
          Todo en un lugar. Empezá gratis hoy.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative flex flex-col bg-zinc-900 border-2 ${plan.color} rounded-2xl p-6 ${plan.badge === 'Más popular' ? 'ring-2 ring-emerald-500/30' : ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full ${
                  plan.badge === 'Más popular'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-yellow-500 text-black'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Name + price */}
              <div className="mb-6">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">{plan.name}</p>
                <div className="flex items-end gap-1">
                  {plan.price === 0 ? (
                    <span className="text-4xl font-bold text-white">Gratis</span>
                  ) : (
                    <>
                      <span className="text-sm text-zinc-400 mb-1.5">USD</span>
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-sm text-zinc-400 mb-1.5">/{plan.period}</span>
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="mb-6">
                {plan.id === 'lector' ? (
                  <Link
                    href="/register"
                    className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${plan.btnStyle}`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <UpgradeButton
                    plan={plan.id as 'basic' | 'plus' | 'premium'}
                    label={plan.cta}
                    className={plan.btnStyle}
                  />
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-zinc-300">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-500 mb-6">Confiado por traders en Argentina, México, Colombia y más</p>
          <div className="flex justify-center gap-8 text-center flex-wrap">
            {[
              { n: '12,400+', label: 'Usuarios registrados' },
              { n: '$0',      label: 'Para empezar' },
              { n: '4',       label: 'Plataformas de datos' },
              { n: '24/7',    label: 'Noticias en vivo' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.n}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparación visual */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-white text-center mb-8">¿Qué incluye cada plan?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 pr-4 text-zinc-400 font-medium w-56">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} className="py-3 px-4 text-center font-semibold text-white">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {[
                  { label: 'Noticias en vivo',             vals: [true, true, true, true]  },
                  { label: 'Dólar / divisas LATAM',        vals: [true, true, true, true]  },
                  { label: 'Cripto en tiempo real',        vals: [true, true, true, true]  },
                  { label: 'Copilot IA',                   vals: ['5/día', '30/día', '∞', '∞ + memoria'] },
                  { label: 'Trading plan personalizado',   vals: [false, false, true, true] },
                  { label: 'TradingView avanzado',         vals: [false, false, true, true] },
                  { label: 'Mapa de bolsas mundiales',     vals: [false, true, true, true]  },
                  { label: 'Feed social comunidad',        vals: [false, false, true, true] },
                  { label: 'Alertas precio',               vals: [false, true, true, true]  },
                  { label: 'API de datos',                 vals: [false, false, false, true]},
                  { label: 'Señales de trading',           vals: [false, false, false, true]},
                  { label: 'Sala trading en vivo',         vals: [false, false, false, true]},
                ].map(row => (
                  <tr key={row.label} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 pr-4 text-zinc-400">{row.label}</td>
                    {row.vals.map((v, i) => (
                      <td key={i} className="py-3 px-4 text-center">
                        {v === true  && <span className="text-emerald-400 text-base">✓</span>}
                        {v === false && <span className="text-zinc-700 text-base">—</span>}
                        {typeof v === 'string' && <span className="text-zinc-300 text-xs font-medium">{v}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-sm font-semibold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-800/30 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-white mb-3">Empezá ahora. Siempre podés escalar.</h2>
          <p className="text-zinc-400 mb-6">Registrate gratis, no se requiere tarjeta. Actualizá cuando quieras.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Empezar gratis →
            </Link>
            <Link href="/terminal" className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Ver la terminal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
