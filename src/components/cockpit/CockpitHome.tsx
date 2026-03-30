'use client'

/**
 * CockpitHome — HOME privada de INBIG
 * Comportamiento: cockpit contextual que se reorganiza según
 * el estado del mercado y el perfil del trader.
 *
 * Estados: pre-mercado | en-sesion | post-sesion | fin-de-semana
 * Spec: /docs/COCKPIT_UX_SPEC.md
 */

import { useEffect, useState, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type MarketState = 'pre-market' | 'in-session' | 'post-session' | 'weekend'

interface TraderStats {
  win_rate: number
  avg_rr: number
  avg_pnl: number
  total_pnl: number
  total: number
  wins: number
  losses: number
  by_session: Record<string, { trades: number; pnl: number; wins: number }>
  by_emotion: Record<string, { trades: number; wins: number; avg_pnl: number }>
  monthly_pnl: { month: string; pnl: number }[]
  profile: {
    win_rate: number
    avg_rr: number
    preferred_session: string
    best_assets: string[]
    weak_points?: string[]
  } | null
}

interface DailyCheckin {
  mood: number
  focus_level: number
  confidence: number
  trading_today: boolean
  daily_goal?: string
  max_trades?: number
  max_loss_usd?: number
  notes?: string
}

interface RecentTrade {
  id: string
  symbol: string
  direction: string
  status: string
  outcome?: string
  pnl?: number
  opened_at: string
}

// ─── Función: detectar estado del mercado según horario UTC-3 (Buenos Aires) ─

function getMarketState(): MarketState {
  const now = new Date()
  const day = now.getDay() // 0=dom, 6=sab
  // Ajuste a UTC-3
  const utcHour = now.getUTCHours()
  const localHour = ((utcHour - 3) + 24) % 24

  if (day === 0 || day === 6) return 'weekend'

  // Pre-mercado: 06:00-09:29 (hora local)
  if (localHour >= 6 && localHour < 9) return 'pre-market'
  if (localHour === 9 && now.getUTCMinutes() < 30) return 'pre-market'

  // En sesión: 09:30-17:00
  if (localHour >= 9 && localHour < 17) return 'in-session'

  // Post-sesión: 17:00-22:00
  if (localHour >= 17 && localHour < 22) return 'post-session'

  // Fuera de horario / noche → pre-market del día siguiente
  return 'pre-market'
}

// ─── Mensajes del copiloto por estado ─────────────────────────────────────────

const COPILOT_QUESTIONS: Record<MarketState, string[]> = {
  'pre-market': [
    '¿Qué condición debe darse hoy para que NO operes?',
    '¿Tu estado emocional de hoy favorece la paciencia o la acción?',
    '¿Qué setup vas a esperar hoy? ¿Tiene historia positiva en tu diario?',
  ],
  'in-session': [
    '¿Esto sigue alineado con tu plan del día?',
    '¿Ya alcanzaste tu objetivo o tu límite de pérdida?',
    '¿La presión que sentís viene del mercado o de vos?',
  ],
  'post-session': [
    '¿La salida fue parte del plan o reacción emocional?',
    '¿Qué trade fue el más claro de hoy y por qué?',
    '¿Completaste el diario? Es el hábito que más separa traders.',
  ],
  'weekend': [
    '¿Qué patrón querés corregir la semana que viene?',
    '¿Tu mejor trade de la semana fue por setup o por suerte?',
    '¿Revisaste la correlación entre tu estado emocional y tus resultados?',
  ],
}

function getCopilotQuestion(state: MarketState, stats: TraderStats | null): string {
  const questions = COPILOT_QUESTIONS[state]
  if (!stats) return questions[0]

  // Personalización: si el trader pierde más cuando opera emocionado, priorizar esa pregunta
  if (state === 'pre-market' && stats.by_emotion) {
    const emotionKeys = Object.keys(stats.by_emotion)
    const worst = emotionKeys.sort((a, b) =>
      (stats.by_emotion[a]?.avg_pnl ?? 0) - (stats.by_emotion[b]?.avg_pnl ?? 0)
    )[0]
    if (worst && stats.by_emotion[worst]?.avg_pnl < 0) {
      return `Tu historial muestra pérdidas cuando operás con "${worst}". ¿Cuál es tu estado emocional ahora?`
    }
  }
  return questions[Math.floor(Math.random() * questions.length)]
}

// ─── Componentes UI ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ?? 'text-white'}`}>{value}</p>
      {sub && <p className="text-zinc-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function StateLabel({ state }: { state: MarketState }) {
  const config: Record<MarketState, { label: string; color: string; dot: string }> = {
    'pre-market':   { label: 'Pre-mercado',  color: 'text-yellow-400', dot: 'bg-yellow-400' },
    'in-session':   { label: 'En sesión',    color: 'text-green-400',  dot: 'bg-green-400 animate-pulse' },
    'post-session': { label: 'Post-sesión',  color: 'text-blue-400',   dot: 'bg-blue-400' },
    'weekend':      { label: 'Fin de semana',color: 'text-purple-400', dot: 'bg-purple-400' },
  }
  const c = config[state]
  return (
    <span className={`flex items-center gap-2 text-sm font-medium ${c.color}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

function CopilotBlock({ question, state }: { question: string; state: MarketState }) {
  const hint: Record<MarketState, string> = {
    'pre-market':   'Entrenando tu intención del día',
    'in-session':   'Recordando tu plan · alertando riesgo contextual',
    'post-session': 'Cerrando el ciclo reflexivo del día',
    'weekend':      'Modo revisión y aprendizaje semanal',
  }
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🧠</span>
        <div>
          <p className="text-white font-semibold text-sm">Copiloto INBIG</p>
          <p className="text-zinc-500 text-xs">{hint[state]}</p>
        </div>
      </div>
      <blockquote className="border-l-2 border-emerald-500 pl-4">
        <p className="text-zinc-200 text-base leading-relaxed italic">&ldquo;{question}&rdquo;</p>
      </blockquote>
    </div>
  )
}

function CheckinBlock({ checkin }: { checkin: DailyCheckin | null }) {
  if (!checkin) {
    return (
      <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center gap-3 h-full">
        <span className="text-3xl">📋</span>
        <p className="text-zinc-400 text-sm text-center">No hiciste el check-in de hoy.</p>
        <a href="/dashboard/checkin" className="text-emerald-400 text-sm font-medium hover:underline">
          Hacer check-in →
        </a>
      </div>
    )
  }
  const mood = checkin.mood ?? 0
  const focus = checkin.focus_level ?? 0
  const conf = checkin.confidence ?? 0
  const avg = Math.round((mood + focus + conf) / 3)
  const emoji = avg >= 4 ? '🟢' : avg === 3 ? '🟡' : '🔴'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white font-semibold text-sm">Estado de hoy</p>
        <span className="text-xl">{emoji}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['Mood', mood], ['Foco', focus], ['Confianza', conf]].map(([label, val]) => (
          <div key={label as string} className="text-center">
            <p className="text-zinc-500 text-xs mb-1">{label}</p>
            <p className="text-white font-bold">{val}/5</p>
          </div>
        ))}
      </div>
      {checkin.trading_today === false && (
        <p className="mt-3 text-xs text-yellow-400 text-center">⚠ Decidiste no operar hoy</p>
      )}
      {checkin.daily_goal && (
        <p className="mt-3 text-zinc-400 text-xs border-t border-zinc-800 pt-3">
          Meta: {checkin.daily_goal}
        </p>
      )}
    </div>
  )
}

function RecentTradesBlock({ trades }: { trades: RecentTrade[] }) {
  if (!trades.length) {
    return (
      <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center gap-3">
        <span className="text-3xl">📓</span>
        <p className="text-zinc-400 text-sm text-center">Aún no hay trades en tu diario.</p>
        <a href="/dashboard/journal/new" className="text-emerald-400 text-sm font-medium hover:underline">
          Registrar trade →
        </a>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-white font-semibold text-sm">Diario del Trader</p>
        <a href="/dashboard/journal" className="text-zinc-500 text-xs hover:text-emerald-400">Ver todo →</a>
      </div>
      <div className="space-y-2">
        {trades.slice(0, 4).map(t => {
          const pnlColor = (t.pnl ?? 0) > 0 ? 'text-green-400' : (t.pnl ?? 0) < 0 ? 'text-red-400' : 'text-zinc-400'
          const statusBadge = t.status === 'open'
            ? <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Abierto</span>
            : t.outcome === 'win'
            ? <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Win</span>
            : <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Loss</span>

          return (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium text-sm">{t.symbol}</span>
                <span className="text-zinc-500 text-xs">{t.direction?.toUpperCase()}</span>
                {statusBadge}
              </div>
              {t.pnl !== undefined && t.pnl !== null && (
                <span className={`text-sm font-medium ${pnlColor}`}>
                  {t.pnl > 0 ? '+' : ''}{t.pnl.toFixed(2)}
                </span>
              )}
            </div>
          )
        })}
      </div>
      {trades.some(t => t.status === 'closed' && !t.outcome) && (
        <a href="/dashboard/journal" className="block mt-3 text-center text-xs text-emerald-400 hover:underline">
          Completar reflexión pendiente →
        </a>
      )}
    </div>
  )
}

function StatsBlock({ stats }: { stats: TraderStats | null }) {
  if (!stats || stats.total === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <p className="text-zinc-500 text-sm text-center">Sin estadísticas aún. Registrá trades para ver tu performance.</p>
      </div>
    )
  }

  const lastMonth = stats.monthly_pnl?.slice(-1)[0]
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label="Win Rate"
        value={`${stats.win_rate}%`}
        sub={`${stats.wins}W / ${stats.losses}L`}
        color={stats.win_rate >= 50 ? 'text-green-400' : 'text-red-400'}
      />
      <StatCard
        label="Avg R:R"
        value={stats.avg_rr.toFixed(2)}
        sub="ratio riesgo/recompensa"
        color={stats.avg_rr >= 1.5 ? 'text-green-400' : 'text-yellow-400'}
      />
      <StatCard
        label="PnL Total"
        value={`${stats.total_pnl >= 0 ? '+' : ''}${stats.total_pnl.toFixed(0)}`}
        sub={stats.profile?.preferred_session ? `Sesión: ${stats.profile.preferred_session}` : undefined}
        color={stats.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'}
      />
      <StatCard
        label="Este mes"
        value={lastMonth ? `${lastMonth.pnl >= 0 ? '+' : ''}${lastMonth.pnl.toFixed(0)}` : '—'}
        sub={lastMonth?.month ?? 'sin datos'}
        color={lastMonth && lastMonth.pnl >= 0 ? 'text-green-400' : 'text-red-400'}
      />
    </div>
  )
}

// ─── Hero / Briefing por estado ───────────────────────────────────────────────

function HeroBlock({ state, checkin, stats }: {
  state: MarketState
  checkin: DailyCheckin | null
  stats: TraderStats | null
}) {
  const heroConfig: Record<MarketState, { icon: string; title: string; subtitle: string }> = {
    'pre-market': {
      icon: '🌅',
      title: 'Preparate para la sesión',
      subtitle: 'Revisá tu plan, tu estado emocional y los eventos del día antes de operar.',
    },
    'in-session': {
      icon: '🔴',
      title: 'Mercado abierto',
      subtitle: 'Seguí el plan. El copiloto está activo.',
    },
    'post-session': {
      icon: '📊',
      title: 'Sesión cerrada',
      subtitle: 'Es el momento de reflexionar. Completá el diario antes de cerrar el día.',
    },
    'weekend': {
      icon: '📅',
      title: 'Revisión semanal',
      subtitle: 'Sin mercado. El mejor momento para aprender de la semana.',
    },
  }

  const h = heroConfig[state]
  const tradeReadiness = checkin
    ? checkin.mood >= 3 && checkin.focus_level >= 3 && checkin.confidence >= 3
    : null

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{h.icon}</span>
            <StateLabel state={state} />
          </div>
          <h2 className="text-white text-xl font-bold mb-1">{h.title}</h2>
          <p className="text-zinc-400 text-sm max-w-lg">{h.subtitle}</p>
        </div>
        {tradeReadiness !== null && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            tradeReadiness
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {tradeReadiness ? '✓ Listo para operar' : '⚠ Revisar estado'}
          </div>
        )}
      </div>
      {stats?.profile?.best_assets && stats.profile.best_assets.length > 0 && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-zinc-500 text-xs">Tus activos:</span>
          {stats.profile.best_assets.slice(0, 5).map(asset => (
            <span key={asset} className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-md">
              {asset}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CockpitHome() {
  const [marketState, setMarketState] = useState<MarketState>('pre-market')
  const [stats, setStats]             = useState<TraderStats | null>(null)
  const [checkin, setCheckin]         = useState<DailyCheckin | null>(null)
  const [trades, setTrades]           = useState<RecentTrade[]>([])
  const [loading, setLoading]         = useState(true)
  const [copilotQ, setCopilotQ]       = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, checkinRes, tradesRes] = await Promise.allSettled([
        fetch('/api/journal/stats'),
        fetch('/api/checkin'),
        fetch('/api/journal?limit=5'),
      ])

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const s = await statsRes.value.json()
        setStats(s)
      }
      if (checkinRes.status === 'fulfilled' && checkinRes.value.ok) {
        const c = await checkinRes.value.json()
        setCheckin(c)
      }
      if (tradesRes.status === 'fulfilled' && tradesRes.value.ok) {
        const t = await tradesRes.value.json()
        setTrades(t.trades ?? [])
      }
    } catch (e) {
      console.error('[CockpitHome] load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const state = getMarketState()
    setMarketState(state)
    loadData()

    // Re-evaluar estado de mercado cada minuto
    const interval = setInterval(() => {
      setMarketState(getMarketState())
    }, 60_000)
    return () => clearInterval(interval)
  }, [loadData])

  useEffect(() => {
    setCopilotQ(getCopilotQuestion(marketState, stats))
  }, [marketState, stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Cargando cockpit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-6 max-w-6xl mx-auto">
      {/* TOP BAR */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
        <StateLabel state={marketState} />
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 text-sm">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <button
            onClick={loadData}
            className="text-zinc-500 hover:text-emerald-400 text-xs border border-zinc-700 rounded-lg px-3 py-1 transition-colors"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* HERO / BRIEFING */}
      <HeroBlock state={marketState} checkin={checkin} stats={stats} />

      {/* FILA PRINCIPAL: Watchlist/Stats + Copiloto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Izquierda: stats o check-in según estado */}
        {marketState === 'pre-market' || marketState === 'weekend' ? (
          <CheckinBlock checkin={checkin} />
        ) : (
          <StatsBlock stats={stats} />
        )}

        {/* Derecha: Copiloto */}
        <CopilotBlock question={copilotQ} state={marketState} />
      </div>

      {/* FILA SECUNDARIA: Stats + Diario */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Si arriba mostramos checkin, ahora mostramos stats */}
        {marketState === 'pre-market' || marketState === 'weekend' ? (
          <StatsBlock stats={stats} />
        ) : (
          <CheckinBlock checkin={checkin} />
        )}

        {/* Diario del Trader */}
        <RecentTradesBlock trades={trades} />
      </div>

      {/* CTA contextual inferior */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href="/dashboard/journal/new"
           className="bg-emerald-600 hover:bg-emerald-500 text-white text-center text-sm font-medium rounded-xl py-3 transition-colors">
          + Registrar trade
        </a>
        <a href="/dashboard/scenarios"
           className="bg-zinc-800 hover:bg-zinc-700 text-white text-center text-sm font-medium rounded-xl py-3 transition-colors">
          ⚡ Motor de Escenarios
        </a>
        <a href="/dashboard/journal"
           className="bg-zinc-800 hover:bg-zinc-700 text-white text-center text-sm font-medium rounded-xl py-3 transition-colors">
          📓 Ver Diario completo
        </a>
      </div>
    </div>
  )
        }
