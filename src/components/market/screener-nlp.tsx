'use client'

import { useState } from 'react'
import type { FMPScreenerResult } from '@/services/fmp'
import { formatMarketCap, isPositive } from '@/services/fmp'

const EJEMPLOS = [
  'Acciones BYMA con mayor volumen',
  'CEDEARs del sector tecnología',
  'Empresas argentinas con market cap mayor a 1B',
  'Acciones con precio menor a $500 en BYMA',
  'S&P 500 sector energía',
]

interface ScreenerResponse {
  results: FMPScreenerResult[]
  query_interpreted: string
  error?: string
}

export function ScreenerNLP() {
  const [query, setQuery]     = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData]       = useState<ScreenerResponse | null>(null)

  async function handleSearch(q?: string) {
    const searchQuery = q ?? query
    if (!searchQuery.trim()) return

    setLoading(true)
    setQuery(searchQuery)

    try {
      const res = await fetch('/api/screener', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query: searchQuery }),
      })
      const json = await res.json()
      setData(json)
    } catch {
      setData({ results: [], query_interpreted: searchQuery, error: 'Error al consultar el screener' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ej: acciones BYMA con mayor volumen hoy..."
            className="
              w-full bg-zinc-800 border border-zinc-700 rounded-lg
              px-4 py-2.5 text-sm text-white placeholder-zinc-500
              focus:outline-none focus:border-blue-500 transition-colors
            "
          />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          className="
            px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700
            text-white text-sm font-medium rounded-lg transition-colors
            disabled:cursor-not-allowed flex items-center gap-2
          "
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          Buscar
        </button>
      </div>

      {/* Ejemplos rápidos */}
      {!data && (
        <div className="flex flex-wrap gap-2">
          {EJEMPLOS.map((ej) => (
            <button
              key={ej}
              onClick={() => handleSearch(ej)}
              className="text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-full px-3 py-1 transition-colors"
            >
              {ej}
            </button>
          ))}
        </div>
      )}

      {/* Query interpretada */}
      {data?.query_interpreted && (
        <p className="text-xs text-zinc-500">
          Buscando: <span className="text-zinc-300">{data.query_interpreted}</span>
        </p>
      )}

      {/* Error */}
      {data?.error && (
        <p className="text-sm text-red-400">{data.error}</p>
      )}

      {/* Resultados */}
      {data?.results && data.results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                <th className="text-left pb-2">Empresa</th>
                <th className="text-right pb-2">Precio</th>
                <th className="text-right pb-2">Volumen</th>
                <th className="text-right pb-2 hidden sm:table-cell">Cap.</th>
                <th className="text-right pb-2 hidden md:table-cell">Sector</th>
                <th className="text-right pb-2">Bolsa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {data.results.map((r) => (
                <tr key={r.symbol} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <p className="font-medium text-white">{r.symbol}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-[160px]">{r.companyName}</p>
                  </td>
                  <td className="py-2.5 text-right font-mono text-white">
                    ${r.price?.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right text-zinc-400 text-xs font-mono">
                    {r.volume?.toLocaleString('es-AR')}
                  </td>
                  <td className="py-2.5 text-right text-zinc-400 text-xs hidden sm:table-cell">
                    {r.marketCap ? formatMarketCap(r.marketCap) : '—'}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500 text-xs hidden md:table-cell truncate max-w-[100px]">
                    {r.sector || '—'}
                  </td>
                  <td className="py-2.5 text-right text-zinc-500 text-xs">
                    {r.exchangeShortName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.results?.length === 0 && !data?.error && (
        <p className="text-sm text-zinc-500 text-center py-4">
          Sin resultados para esta búsqueda. Intentá con otro criterio.
        </p>
      )}
    </div>
  )
}
