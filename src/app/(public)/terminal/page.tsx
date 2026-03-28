/**
 * /terminal — Gran terminal Pro estilo Bloomberg
 *
 * La experiencia flagship de INBIG:
 * - TradingView Advanced Chart (embed oficial — free tier)
 * - Watchlist personalizada del usuario
 * - Copilot IA contextual a lo que está viendo
 * - Feed de actividad de la comunidad
 * - Mapa de bolsas mundiales
 *
 * Free preview: cualquiera puede verla. Features avanzados = Plus.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TerminalClient } from '@/components/terminal/terminal-client'

export const metadata: Metadata = {
  title: 'Terminal — INBIG Finanzas',
  description: 'Terminal de trading estilo Bloomberg. Graficá cualquier activo, consultá la IA, seguí tu watchlist.',
}

export const dynamic = 'force-dynamic'

export default async function TerminalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Traer perfil + tier del usuario
  let tier: 'lector' | 'in_pro' | 'in_pro_plus' = 'lector'
  let tradingPlan: Record<string, unknown> | null = null

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    const [profileRes, planRes] = await Promise.allSettled([
      sb.from('profiles').select('tier').eq('id', user.id).single(),
      sb.from('trading_plans').select('*').eq('user_id', user.id).single(),
    ])

    if (profileRes.status === 'fulfilled' && profileRes.value.data) {
      tier = profileRes.value.data.tier ?? 'lector'
    }
    if (planRes.status === 'fulfilled' && planRes.value.data) {
      tradingPlan = planRes.value.data
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* Header terminal */}
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-xs">← INBIG</Link>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            📊 Terminal
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              tier === 'in_pro_plus' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-700/40' :
              tier === 'in_pro'      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-700/40' :
                                      'bg-zinc-800 text-zinc-500 border border-zinc-700'
            }`}>
              {tier === 'in_pro_plus' ? 'Premium' : tier === 'in_pro' ? 'Plus' : 'Preview'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {tier === 'lector' && (
            <Link
              href="/planes"
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Desbloquear terminal completa →
            </Link>
          )}
          {user ? (
            <span className="text-xs text-zinc-500">{user.email}</span>
          ) : (
            <Link href="/login" className="text-xs text-zinc-400 hover:text-zinc-200">Iniciar sesión</Link>
          )}
        </div>
      </div>

      {/* Terminal body */}
      <div className="flex-1 overflow-hidden">
        <TerminalClient
          tier={tier}
          userId={user?.id ?? null}
          tradingPlan={tradingPlan}
        />
      </div>
    </div>
  )
}
