import type { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, Check } from 'lucide-react'

export const metadata: Metadata = { title: 'Crear cuenta' }

const PLANS = [
  { id: 'free', name: 'Lector', price: 'Gratis', features: ['Noticias del día', 'Datos básicos de mercado', 'Glosario financiero'] },
  { id: 'basic', name: 'IN Basic', price: 'USD 8/mes', features: ['Todo lo anterior', 'Alertas de precio', 'Análisis técnico básico'] },
  { id: 'pro', name: 'IN Pro', price: 'USD 15/mes', features: ['Todo lo anterior', 'Chat IA ilimitado', 'Watchlist avanzada', 'Screener de acciones'] },
  { id: 'pro_plus', name: 'IN Pro+', price: 'USD 20/mes', features: ['Todo lo anterior', 'API access', 'Informes personalizados', 'Soporte prioritario'] },
]

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl mb-4">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            IN<span className="text-emerald-500">big</span> Finanzas
          </Link>
          <h1 className="text-3xl font-bold">Elegí tu plan</h1>
          <p className="text-muted-foreground mt-2">Empezá gratis, escalá cuando quieras</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-xl p-5 ${plan.id === 'pro' ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-border/40'}`}
            >
              {plan.id === 'pro' && (
                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full mb-3 inline-block">
                  Popular
                </span>
              )}
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <p className="text-2xl font-bold mt-1 text-emerald-400">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full mt-5 py-2 rounded-md text-sm font-medium transition-colors ${
                plan.id === 'pro'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'border border-border/40 hover:bg-accent text-foreground'
              }`}>
                {plan.id === 'free' ? 'Empezar gratis' : 'Elegir plan'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
