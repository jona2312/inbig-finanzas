'use client'

/**
 * PersonalDashboard — Dashboard personalizado basado en el trading plan del usuario.
 *
 * Renderiza widgets dinámicamente según mercados, activos y perfil de riesgo.
 * Incluye un Copilot contextual que conoce el perfil del usuario.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles, Send, RefreshCw, TrendingUp, Shield, Zap, Globe, Bitcoin, BarChart2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asset { symbol: string; label?: string }

interface TradingPlan {
  markets:      string[]
  assets:       Asset[]
  risk_profile: string
  info_needs:   string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface PersonalDashboardProps {
  plan:      TradingPlan
  userName:  string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRiskIcon(profile: string) {
  if (profile === 'conservador') return <Shield className="w-4 h-4 text-blue-400" />
  if (profile === 'agresivo')    return <Zap    className="w-4 h-4 text-red-400"  />
  return <BarChart2 className="w-4 h-4 text-amber-400" />
}

function getRiskColor(profile: string) {
  if (profile === 'conservador') return 'text-blue-400'
  if (profile === 'agresivo')    return 'text-red-400'
  return 'text-amber-400'
}

function getMarketLabel(id: string): string {
  const map: Record<string, string> = {
    ar:          '🇦🇷 Acciones AR',
    us:          '🇺🇸 Acciones US',
    crypto:      '₿ Cripto',
    forex:       '💱 Forex',
    commodities: '🛢 Commodities',
  }
  return map[id] ?? id
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// ─── Watchlist Ticker ─────────────────────────────────────────────────────────

function WatchlistTicker({ assets, markets }: { assets: Asset[]; markets: string[] }) {
  const suggestions: Record<string, string[]> = {
    ar:          ['GGAL', 'MELI', 'YPF', 'PAMP'],
    us:          ['AAPL', 'NVDA', 'SPY', 'QQQ'],
    crypto:      ['BTC', 'ETH', 'SOL'],
    forex:       ['EURUSD', 'XAUUSD'],
    commodities: ['GC=F', 'CL=F'],
  }

  const watchlist = assets.length > 0
    ? assets.map(a => a.symbol)
    : markets.flatMap(m => suggestions[m] ?? []).slice(0, 8)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Tu Watchlist</h3>
        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
          {watchlist.length} activos
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {watchlist.map(sym => (
          <a
            key={sym}
            href={`/grafico?symbol=${sym}`}
            className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all"
          >
            <span className="text-xs font-mono font-semibold text-white">{sym}</span>
            <TrendingUp className="w-3 h-3 text-zinc-500" />
          </a>
        ))}
        <a
          href="/grafico"
          className="flex items-center gap-1.5 border border-dashed border-zinc-700 hover:border-amber-500/50 px-3 py-1.5 rounded-lg text-zinc-600 hover:text-amber-400 text-xs transition-all"
        >
          + Graficar
        </a>
      </div>
    </div>
  )
}

// ─── Market Quick Links ───────────────────────────────────────────────────────

function MarketQuickLinks({ markets }: { markets: string[] }) {
  const links: Record<string, { href: string; icon: React.ReactNode; desc: string }> = {
    ar:          { href: '/mercados', icon: <Globe className="w-4 h-4" />,      desc: 'BYMA · CEDEARs · Merval'      },
    us:          { href: '/mercados', icon: <TrendingUp className="w-4 h-4" />, desc: 'S&P 500 · NASDAQ · sectores'   },
    crypto:      { href: '/crypto',   icon: <Bitcoin className="w-4 h-4" />,    desc: 'BTC · ETH · top 100'           },
    forex:       { href: '/divisas',  icon: <Globe className="w-4 h-4" />,      desc: 'Tipos de cambio · ARS'         },
    commodities: { href: '/mercados', icon: <BarChart2 className="w-4 h-4" />,  desc: 'Oro · Petróleo · Soja'         },
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Tus mercados</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {markets.map(m => {
          const link = links[m]
          if (!link) return null
          return (
            <a
              key={m}
              href={link.href}
              className="flex items-center gap-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl p-3 transition-all"
            >
              <div className="text-amber-400">{link.icon}</div>
              <div>
                <p className="text-xs font-semibold text-white">{getMarketLabel(m)}</p>
                <p className="text-[10px] text-zinc-500">{link.desc}</p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

// ─── Risk Profile Card ────────────────────────────────────────────────────────

function RiskCard({ profile }: { profile: string }) {
  const tips: Record<string, string[]> = {
    conservador: [
      'Prioriza bonos y activos de bajo riesgo',
      'Diversificá al menos en 5 activos distintos',
      'Evita posiciones > 10% del portafolio en un solo activo',
      'CEDEARs de empresas estables como refugio',
    ],
    moderado: [
      'Balance 60/40: renta fija + renta variable',
      'Rotación sectorial según ciclo económico',
      'Usá stop-loss en posiciones especulativas',
      'Revisión mensual del portafolio',
    ],
    agresivo: [
      'Gestión de riesgo es key: máx 2% por operación',
      'Crypto: no más del 30% del portafolio total',
      'Operá con tendencia, no contra el mercado',
      'Llevá un diario de operaciones',
    ],
  }

  const currentTips = tips[profile] ?? tips.moderado

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {getRiskIcon(profile)}
        <h3 className="text-sm font-semibold text-white">Perfil: <span className={`capitalize ${getRiskColor(profile)}`}>{profile}</span></h3>
      </div>
      <ul className="space-y-1.5">
        {currentTips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-zinc-400">
            <span className="text-amber-400 mt-0.5 flex-shrink-0">›</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── AI Copilot Chat ──────────────────────────────────────────────────────────

function AICopilot({ plan }: { plan: TradingPlan }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `¡Hola! Soy tu copilot personalizado 🎯 Conozco tu perfil: operás en ${plan.markets.map(getMarketLabel).join(', ')} con perfil ${plan.risk_profile}. ¿En qué te puedo ayudar hoy?`,
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return

    const userMsg: ChatMessage = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/dashboard/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar. Intentá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages])

  const QUICK_ACTIONS = [
    'Resumen del mercado hoy',
    `Análisis de ${plan.assets[0]?.symbol ?? 'BTC'}`,
    'Ideas para mi perfil de riesgo',
    '¿Qué está moviendo los mercados?',
  ]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col" style={{ height: '420px' }}>
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-white">Copilot personalizado</span>
        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full ml-auto">Conoce tu perfil</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-amber-500/20 border border-amber-500/30 text-amber-100 rounded-tr-sm'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            </div>
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
          {QUICK_ACTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-[10px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200 px-2 py-1 rounded-full transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-3 border-t border-zinc-800 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Preguntá algo..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg transition-colors"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PersonalDashboard({ plan, userName }: PersonalDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">
            {getGreeting()}{userName ? `, ${userName.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            Tu dashboard personalizado · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getRiskIcon(plan.risk_profile)}
          <span className={`text-xs font-semibold capitalize ${getRiskColor(plan.risk_profile)}`}>
            {plan.risk_profile}
          </span>
          <a href="/onboarding" className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors ml-2">
            Editar perfil →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <WatchlistTicker assets={plan.assets} markets={plan.markets} />
          <MarketQuickLinks markets={plan.markets} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: '📰 Al día',   href: '/al-dia',   desc: 'Noticias + briefing IA'  },
              { label: '📊 Mercados', href: '/mercados', desc: 'BYMA · S&P · sectores'   },
              { label: '₿ Cripto',    href: '/crypto',   desc: 'Top 100 · precios live'  },
              { label: '💱 Divisas',  href: '/divisas',  desc: 'Dólar · tipos de cambio' },
              { label: '📈 Gráfico',  href: '/grafico',  desc: 'Terminal de trading'     },
              { label: '🎓 Glosario', href: '/glosario', desc: 'Términos financieros'    },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-xl p-3 transition-all"
              >
                <p className="text-xs font-semibold text-white">{item.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <AICopilot plan={plan} />
          <RiskCard profile={plan.risk_profile} />
        </div>
      </div>
    </div>
  )
}
