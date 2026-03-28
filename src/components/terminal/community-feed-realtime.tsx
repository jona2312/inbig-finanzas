'use client'

/**
 * CommunityFeedRealtime — Feed social en vivo via Supabase Realtime
 *
 * Muestra actividad anónima de la comunidad:
 * - "Trader de AR está viendo XAUUSD"
 * - "Trader de MX graficó NVDA"
 *
 * Con fallback de datos simulados cuando Supabase no tiene datos aún.
 * En prod: suscripción a INSERT en tabla market_activity.
 */

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id:         string
  country:    string
  flag:       string
  action:     string
  symbol:     string
  created_at: string
  isNew?:     boolean
}

// ─── Mock seed — hasta que haya usuarios reales ───────────────────────────────

const SEED_FEED: ActivityItem[] = [
  { id:'1', country:'AR', flag:'🇦🇷', action:'está viendo',   symbol:'XAUUSD', created_at: new Date(Date.now()-60000).toISOString()  },
  { id:'2', country:'MX', flag:'🇲🇽', action:'graficó',       symbol:'NVDA',   created_at: new Date(Date.now()-180000).toISOString() },
  { id:'3', country:'BR', flag:'🇧🇷', action:'está viendo',   symbol:'MELI',   created_at: new Date(Date.now()-300000).toISOString() },
  { id:'4', country:'AR', flag:'🇦🇷', action:'alertó precio', symbol:'GGAL',   created_at: new Date(Date.now()-420000).toISOString() },
  { id:'5', country:'CO', flag:'🇨🇴', action:'graficó',       symbol:'BTC',    created_at: new Date(Date.now()-600000).toISOString() },
  { id:'6', country:'PE', flag:'🇵🇪', action:'está viendo',   symbol:'SPY',    created_at: new Date(Date.now()-720000).toISOString() },
  { id:'7', country:'CL', flag:'🇨🇱', action:'graficó',       symbol:'AAPL',   created_at: new Date(Date.now()-840000).toISOString() },
  { id:'8', country:'AR', flag:'🇦🇷', action:'está viendo',   symbol:'TSLA',   created_at: new Date(Date.now()-960000).toISOString() },
]

// Simulación de actividad aleatoria para demo
const DEMO_SYMBOLS   = ['XAUUSD','GGAL','MELI','NVDA','BTC','SPY','ETH','AAPL','TSLA','YPF','BMA']
const DEMO_FLAGS     = ['🇦🇷','🇲🇽','🇧🇷','🇨🇴','🇵🇪','🇨🇱','🇺🇾']
const DEMO_ACTIONS   = ['está viendo','graficó','alertó precio','analizó con IA']
const DEMO_COUNTRIES = ['AR','MX','BR','CO','PE','CL','UY']

function randomFeed(): ActivityItem {
  const i = Math.floor(Math.random() * DEMO_FLAGS.length)
  return {
    id:         crypto.randomUUID(),
    country:    DEMO_COUNTRIES[i],
    flag:       DEMO_FLAGS[i],
    action:     DEMO_ACTIONS[Math.floor(Math.random() * DEMO_ACTIONS.length)],
    symbol:     DEMO_SYMBOLS[Math.floor(Math.random() * DEMO_SYMBOLS.length)],
    created_at: new Date().toISOString(),
    isNew:      true,
  }
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)  return `hace ${diff}s`
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}min`
  return `hace ${Math.floor(diff / 3600)}h`
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface CommunityFeedRealtimeProps {
  onSymbolClick?: (symbol: string) => void
  compact?:       boolean
}

export function CommunityFeedRealtime({ onSymbolClick, compact }: CommunityFeedRealtimeProps) {
  const [feed,    setFeed]    = useState<ActivityItem[]>(SEED_FEED)
  const [online,  setOnline]  = useState(0)
  const [active,  setActive]  = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Intentar conectar a Supabase Realtime
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // Sin credenciales — modo demo con simulación
      startSimulation()
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const channel = supabase
      .channel('market_activity')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_activity' },
        (payload) => {
          const row = payload.new as any
          const item: ActivityItem = {
            id:         row.id,
            country:    row.country ?? 'AR',
            flag:       row.flag    ?? '🌎',
            action:     row.action  ?? 'está viendo',
            symbol:     row.symbol  ?? '?',
            created_at: row.created_at ?? new Date().toISOString(),
            isNew:      true,
          }
          setFeed(prev => [item, ...prev.slice(0, 19)])
          setActive(true)
          setTimeout(() => setActive(false), 2000)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Conectado — contar "usuarios online" con presence
          setOnline(Math.floor(Math.random() * 40) + 15) // mock hasta implementar presence
        } else {
          // Fallback a simulación
          startSimulation()
        }
      })

    return () => {
      supabase.removeChannel(channel)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function startSimulation() {
    setOnline(Math.floor(Math.random() * 40) + 15)
    // Agregar actividad simulada cada 8-15 segundos
    function scheduleNext() {
      const delay = 8000 + Math.random() * 7000
      intervalRef.current = setTimeout(() => {
        const item = randomFeed()
        setFeed(prev => [item, ...prev.slice(0, 19)])
        setActive(true)
        setTimeout(() => {
          setFeed(prev => prev.map(f => f.id === item.id ? { ...f, isNew: false } : f))
          setActive(false)
        }, 3000)
        scheduleNext()
      }, delay)
    }
    scheduleNext()
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current) }
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
        {/* Online indicator */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
          <span className="text-[11px] text-zinc-400">{online} traders online ahora</span>
        </div>

        {feed.slice(0, 7).map(item => (
          <div
            key={item.id}
            onClick={() => onSymbolClick?.(item.symbol)}
            className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${
              item.isNew ? 'bg-emerald-500/10 border border-emerald-800/30' : 'hover:bg-zinc-800'
            }`}
          >
            <span className="text-sm shrink-0">{item.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-zinc-300 leading-snug">
                Trader de <span className="text-white font-medium">{item.country}</span>{' '}
                {item.action}{' '}
                <button
                  className="font-mono font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                  onClick={e => { e.stopPropagation(); onSymbolClick?.(item.symbol) }}
                >
                  {item.symbol}
                </button>
              </p>
              <p className="text-[9px] text-zinc-600">{timeAgo(item.created_at)}</p>
            </div>
            {item.isNew && (
              <span className="text-[9px] text-emerald-400 shrink-0 font-medium">NUEVO</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            👥 Comunidad
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">{online} traders online ahora</p>
        </div>
        <div className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-1 rounded-full">
          En vivo · Realtime
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-zinc-800/50 max-h-80 overflow-y-auto">
        {feed.slice(0, 15).map(item => (
          <div
            key={item.id}
            onClick={() => onSymbolClick?.(item.symbol)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
              item.isNew ? 'bg-emerald-500/5' : 'hover:bg-zinc-800/50'
            }`}
          >
            <span className="text-lg shrink-0">{item.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-zinc-300">
                Trader de <span className="text-white font-semibold">{item.country}</span>{' '}
                {item.action}{' '}
                <span className="font-mono font-bold text-emerald-400">{item.symbol}</span>
              </p>
              <p className="text-[10px] text-zinc-600">{timeAgo(item.created_at)}</p>
            </div>
            {item.isNew && (
              <span className="text-[9px] text-emerald-400 font-bold shrink-0 animate-pulse">●</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-600">
          Actividad anónima · Los traders ven lo mismo que vos en tiempo real
        </p>
      </div>
    </div>
  )
}
