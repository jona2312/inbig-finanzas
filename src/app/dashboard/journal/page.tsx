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
  plan?: string
  quality_score?: number
  created_at: string
  closed_at?: string
}

const EMOTION_EMOJI: Record<string, string> = {
  calm: '😌', focused: '🎯', confident: '💪', excited: '🔥',
  anxious: '😰', fear: '😨', frustrated: '😤', revenge: '💢',
}

function DiaryProgress({ trade }: { trade: Trade }) {
  const phases = [
    { key: 'antes', label: 'A', done: !!(trade.emotion_before && trade.plan) },
    { key: 'durante', label: 'D', done: false },
    { key: 'despues', label: 'P', done: !!(trade.emotion_after) },
  ]
  return (
    <div className="flex gap-1">
      {phases.map((p) => (
        <span
          key={p.key}
          title={p.key}
          className={`w-5 h-5 rounded text-xs flex items-center justify-center font-bold
            ${p.done ? 'bg-cyan-500/30 text-cyan-400' : 'bg-zinc-800 text-zinc-600'}`}
        >
          {p.label}
        </span>
      ))}
    </div>
  )
}

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [page, setPage] = useState(0)
  const LIMIT = 20

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          limit: String(LIMIT),
          offset: String(page * LIMIT),
        })
        if (filter !== 'all') params.set('status', filter)
        const res = await fetch(`/api/journal?${params}`)
        const json = await res.json()
        setTrades(json.data ?? [])
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
          <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-300 text-sm mb-1 block">← Volver al cockpit</Link>
          <h1 className="text-2xl font-bold text-white">📓 Diario del Trader</h1>
          <p className="text-zinc-400 text-sm mt-1">Tu historial de trades con análisis pre/post</p>
        </div>
        <Link
          href="/dashboard/journal/new"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          + Registrar trade
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(['all', 'open', 'closed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors border
              ${filter === f
                ? 'bg-zinc-700 text-white border-zinc-600'
                : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
              }`}
          >
            {f === 'all' ? 'Todos' : f === 'open' ? 'Abiertos' : 'Cerrados'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-zinc-600">Cargando trades...</div>
      ) : trades.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-lg mb-2">No hay trades registrados</p>
          <p className="text-zinc-600 text-sm mb-6">Empezá registrando tu primer trade para entrenar tu proceso</p>
          <Link
            href="/dashboard/journal/new"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Registrar primer trade
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {trades.map((trade) => (
            <Link
              key={trade.id}
              href={`/dashboard/journal/${trade.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 hover:border-zinc-600 transition-all group"
            >
              <div className="flex items-center justify-between">
                {/* Left: Symbol + direction + status */}
                <div className="flex items-center gap-3">
                  <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {trade.symbol}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium
                    ${trade.direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {trade.direction === 'long' ? '▲' : '▼'} {trade.direction.toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs
                    ${trade.status === 'open' ? 'text-cyan-400 bg-cyan-500/10' : 'text-zinc-500 bg-zinc-800'}`}>
                    {trade.status === 'open' ? 'Abierto' : trade.status === 'closed' ? 'Cerrado' : 'Cancelado'}
                  </span>
                </div>

                {/* Right: PnL + diary progress */}
                <div className="flex items-center gap-6">
                  {/* Emotions */}
                  {(trade.emotion_before || trade.emotion_after) && (
                    <div className="flex items-center gap-1 text-sm">
                      {trade.emotion_before && (
                        <span title={`Antes: ${trade.emotion_before}`}>
                          {EMOTION_EMOJI[trade.emotion_before] ?? '•'}
                        </span>
                      )}
                      {trade.emotion_before && trade.emotion_after && <span className="text-zinc-700">→</span>}
                      {trade.emotion_after && (
                        <span title={`Después: ${trade.emotion_after}`}>
                          {EMOTION_EMOJI[trade.emotion_after] ?? '•'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quality score */}
                  {trade.quality_score && (
                    <div className="text-center">
                      <div className={`text-sm font-bold
                        ${trade.quality_score >= 7 ? 'text-emerald-400'
                        : trade.quality_score >= 5 ? 'text-yellow-400'
                        : 'text-red-400'}`}>
                        {trade.quality_score}/10
                      </div>
                      <div className="text-xs text-zinc-600">calidad</div>
                    </div>
                  )}

                  {/* PnL */}
                  {trade.pnl !== undefined ? (
                    <div className="text-right">
                      <div className={`text-sm font-bold
                        ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                      </div>
                      <div className="text-xs text-zinc-600">
                        {trade.risk_reward ? `${trade.risk_reward.toFixed(1)}R` : `${trade.pnl_pct?.toFixed(1)}%`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-sm text-zinc-600">Entrada</div>
                      <div className="text-sm font-mono text-zinc-400">{trade.entry_price}</div>
                    </div>
                  )}

                  {/* Diary progress */}
                  <DiaryProgress trade={trade} />

                  <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {trades.length === LIMIT && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 text-sm text-zinc-400 border border-zinc-800 rounded-lg hover:border-zinc-600 transition-colors"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  )
}

export const metadata = {
  title: 'Diario del Trader | INbig',
}
