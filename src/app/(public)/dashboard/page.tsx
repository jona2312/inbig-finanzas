import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import CockpitHome from '@/components/cockpit/CockpitHome'

export const metadata: Metadata = {
  title: 'Cockpit | INbig Finanzas',
  description: 'Tu panel de control de trading',
}

const LiveChannelPlayer = dynamic(
  () => import('@/components/live/LiveChannelPlayer').then(m => m.LiveChannelPlayer),
  { ssr: false }
)

type MarketState = 'pre-market' | 'in-session' | 'post-session' | 'weekend'

function getMarketState(): MarketState {
  const now = new Date()
  const day = now.getUTCDay()
  if (day === 0 || day === 6) return 'weekend'
  const hoursUTC = now.getUTCHours() + now.getUTCMinutes() / 60
  if (hoursUTC < 13.5) return 'pre-market'
  if (hoursUTC < 20) return 'in-session'
  return 'post-session'
}

interface BadgeConfig {
  label: string
  color: string
  pulse?: boolean
}

function getMarketBadge(state: MarketState): BadgeConfig {
  const config: Record<MarketState, BadgeConfig> = {
    'pre-market': { label: 'PRE-MARKET', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    'in-session': { label: 'ABIERTO', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', pulse: true },
    'post-session': { label: 'CERRADO', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    weekend: { label: 'FIN DE SEMANA', color: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30' },
  }
  return config[state]
}

function getHeroMessage(state: MarketState, name: string): string {
  const messages: Record<MarketState, string> = {
    'pre-market': `Buenos días, ${name}. El mercado abre a las 10:30 hs.`,
    'in-session': `Mercado abierto, ${name}. Operar con disciplina.`,
    'post-session': `La sesión terminó. Revisá tu diario antes de cerrar.`,
    weekend: `Fin de semana. Buen momento para revisar estrategia.`,
  }
  return messages[state]
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = user?.email?.split('@')[0] ?? 'Trader'
  const marketState = getMarketState()
  const badge = getMarketBadge(marketState)
  const heroMessage = getHeroMessage(marketState, name)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-tight text-white">
            IN<span className="text-emerald-400">big</span>
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color} ${badge.pulse ? 'animate-pulse' : ''}`}>
            {badge.label}
          </span>
        </div>
        <div className="text-xs text-zinc-500 truncate max-w-[180px]">{user?.email}</div>
      </header>

      {/* HERO BRIEFING */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
        <p className="text-sm text-zinc-300">{heroMessage}</p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
        {/* Main — CockpitHome se autogestiona */}
        <div className="lg:col-span-2">
          <CockpitHome />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* TV en vivo */}
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">TV en vivo</span>
            </div>
            <LiveChannelPlayer />
          </div>

          {/* Terminal quick access */}
          <a
            href="/grafico"
            className="block rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-emerald-500/30 hover:bg-zinc-900/60 transition-all p-4 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-300">Terminal</span>
              <span className="text-emerald-400 text-xs group-hover:translate-x-0.5 transition-transform">↗ Abrir</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['SPY', 'BTC', 'GGAL'].map((sym) => (
                <span key={sym} className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {sym}
                </span>
              ))}
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
