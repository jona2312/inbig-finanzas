'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Trade {
  id: string
  symbol: string
  direction: 'long' | 'short'
  status: 'open' | 'closed' | 'cancelled'
  entry_price?: number
  exit_price?: number
  pnl?: number
  pnl_pct?: number
  risk_reward?: number
  emotion_before?: string
  emotion_after?: string
  entry_reason?: string
  quality_score?: number
  opened_at: string
  closed_at?: string
  outcome?: 'win' | 'loss' | 'breakeven'
  timeframe?: string
  strategy?: string
}

interface Stats {
  total: number
  wins: number
  losses: number
  win_rate: number
  total_pnl: number
  avg_rr: number
}

const EMOTION_EMOJI: Record<string, string> = {
  calm: '😌', focused: '🎯', confident: '💪', excited: '🔥',
  anxious: '😰', fear: '😨', frustrated: '😤', revenge: '💢',
}

function DiaryProgress({ trade }: { trade: Trade }) {
  const phases = [
    { key: 'A', done: !!(trade.emotion_before && trade.entry_reason), title: 'Antes — plan + emoción' },
    { key: 'D', done: trade.status !== 'open', title: 'Cierre registrado' },
    { key: 'P', done: !!(trade.emotion_after), title: 'Post — reflexión' },
  ]
  return (
    <div className="flex gap-1">
      {phases.map((p) => (
        <span key={p.key} title={p.title}
          className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-bold
            ${p.done ? 'bg-cyan-500/30 text-cyan-400' : 'bg-zinc-800 text-zinc-600'}`}>
          {p.key}
        </span>
      ))}
    </div>
  )
}

export default function JournalPage() {
  const [trades, setTrades]   = useState<Trade[]>([])
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<'all' | 'open' | 'closed'>('all')
  const [page, setPage]       = useState(0)
  const LIMIT = 20

  // Cargar stats una vez
  useEffect(() => {
    fetch('/api/journal/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  // Cargar trades al cambiar filtro o página
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ limit: String(LIMIT), offset: String(page * LIMIT) })
        if (filter !== 'all') params.set('status', filter)
        const res = await fetch(`/api/journal?${params}`)
        const json = await res.json()
        setTrades(json.trades ?? [])   // ← fix: era json.data
      } catch (e) {
        console.error('Error loading trades:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filter, page])

  return (
    <div className="min-h-screen bg-zinc-950 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">📓 Diario del Trader</h1>
          <p className="text-zinc-400 text-sm mt-1">Registrá cada trade · Entendé tus patrones · Mejorá tu proceso</p>
        </div>
        <Link href="/dashboard/journal/new"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-colors">
          + Registrar trade
        </Link>
      </div>

      {/* Stats bar */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Trades',    value: stats.total,                              color: 'text-white'       },
            { label: 'Ganados',   value: stats.wins,                               color: 'text-emerald-400' },
            { label: 'Perdidos',  value: stats.losses,                             color: 'text-red-400'     },
            { label: 'Win rate',  value: `${stats.win_rate}%`,                     color: stats.win_rate >= 50 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'PnL total', value: `${stats.total_pnl >= 0 ? '+' : ''}${stats.total_pnl.toFixed(0)}`, color: stats.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'R:R medio', value: `${stats.avg_rr.toFixed(2)}R`,            color: stats.avg_rr >= 1 ? 'text-emerald-400' : 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(['all', 'open', 'closed'] as const).map((f) => (
          <button key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border
              ${filter === f
                ? 'bg-zinc-700 text-white border-zinc-600'
                : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}>
            {f === 'all' ? 'Todos' : f === 'open' ? 'Abiertos' : 'Cerrados'}
          </button>
        ))}
      </div>

      {/* Trades */}
      {loading ? (
        <div className="text-center py-16 text-zinc-600">Cargando trades...</div>
      ) : trades.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📓</p>
          <p className="text-zinc-400 text-lg mb-2 font-medium">
            {filter === 'all' ? 'Tu diario está vacío' : `No hay trades ${filter === 'open' ? 'abiertos' : 'cerrados'}`}
          </p>
          <p className="text-zinc-600 text-sm mb-6">
            Registrá tu primer trade para empezar a entrenar tu proceso mental
          </p>
          <Link href="/dashboard/journal/new"
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition-colors">
            + Registrar primer trade
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {trades.map((trade) => (
            <Link key={trade.id} href={`/dashboard/journal/${trade.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 hover:border-zinc-600 transition-all group">
              <div className="flex items-center justify-between">

                {/* Left: Symbol + tags */}
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white group-hover:text-cyan-400 transition-colors text-lg">
                    {trade.symbol}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold
                    ${trade.direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {trade.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs
                    ${trade.status === 'open' ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                    : trade.status === 'closed' ? 'text-zinc-400 bg-zinc-800'
                    : 'text-zinc-600 bg-zinc-900 border border-zinc-800'}`}>
                    {trade.status === 'open' ? '● Abierto' : trade.status === 'closed' ? 'Cerrado' : 'Cancelado'}
                  </span>
                  {trade.timeframe && (
                    <span className="text-xs text-zinc-600">{trade.timeframe}</span>
                  )}
                  <span className="text-xs text-zinc-700">
                    {new Date(trade.opened_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>

                {/* Right: stats + diary progress */}
                <div className="flex items-center gap-5">
                  {/* Emotions */}
                  {(trade.emotion_before || trade.emotion_after) && (
                    <div className="flex items-center gap-1 text-base">
                      {trade.emotion_before && <span title={`Antes: ${trade.emotion_before}`}>{EMOTION_EMOJI[trade.emotion_before] ?? '•'}</span>}
                      {trade.emotion_before && trade.emotion_after && <span className="text-zinc-700 text-xs">→</span>}
                      {trade.emotion_after && <span title={`Después: ${trade.emotion_after}`}>{EMOTION_EMOJI[trade.emotion_after] ?? '•'}</span>}
                    </div>
                  )}

                  {/* PnL */}
                  {trade.pnl !== undefined && trade.pnl !== null ? (
                    <div className="text-right min-w-[60px]">
                      <div className={`text-sm font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </div>
                      <div className="text-xs text-zinc-600">
                        {trade.risk_reward ? `${trade.risk_reward.toFixed(1)}R` : trade.pnl_pct ? `${trade.pnl_pct.toFixed(1)}%` : ''}
                      </div>
                    </div>
                  ) : trade.entry_price ? (
                    <div className="text-right min-w-[60px]">
                      <div className="text-xs text-zinc-600">Entrada</div>
                      <div className="text-sm font-mono text-zinc-300">{trade.entry_price}</div>
                    </div>
                  ) : null}

                  {/* Diary progress */}
                  <DiaryProgress trade={trade} />
                  <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {trades.length === LIMIT && (
        <div className="flex justify-center mt-6">
          <button onClick={() => setPage(page + 1)}
            className="px-4 py-2 text-sm text-zinc-400 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors">
            Cargar más →
          </button>
        </div>
      )}
    </div>
  )
}
