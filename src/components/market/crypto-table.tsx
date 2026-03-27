'use client'

import { useState, useMemo } from 'react'
import { CoinGeckoCoin, formatPrice, formatMarketCap, formatVolume, isPositive } from '@/services/coingecko'

type SortKey = 'market_cap_rank' | 'current_price' | 'price_change_percentage_24h' | 'price_change_percentage_7d_in_currency' | 'market_cap' | 'total_volume'
type SortDir = 'asc' | 'desc'

interface CryptoTableProps {
  coins: CoinGeckoCoin[]
  showSparkline?: boolean
}

function Sparkline({ prices }: { prices: number[] }) {
  if (!prices || prices.length === 0) return null
  const sample = prices.filter((_, i) => i % Math.floor(prices.length / 30) === 0).slice(-30)
  const min = Math.min(...sample)
  const max = Math.max(...sample)
  const range = max - min || 1
  const w = 80, h = 28
  const points = sample.map((p, i) => {
    const x = (i / (sample.length - 1)) * w
    const y = h - ((p - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  const isUp = sample[sample.length - 1] >= sample[0]
  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ChangeCell({ value }: { value?: number }) {
  if (value === undefined || value === null) return <td className="px-3 py-2 text-xs text-zinc-500">—</td>
  const up = isPositive(value)
  return (
    <td className={`px-3 py-2 text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? '+' : ''}{value.toFixed(2)}%
    </td>
  )
}

export default function CryptoTable({ coins, showSparkline = true }: CryptoTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search, setSearch] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'market_cap_rank' ? 'asc' : 'desc')
    }
  }

  const filtered = useMemo(() => {
    let list = [...coins]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      const va = (a[sortKey] ?? 0) as number
      const vb = (b[sortKey] ?? 0) as number
      return sortDir === 'asc' ? va - vb : vb - va
    })
    return list
  }, [coins, search, sortKey, sortDir])

  const ColHeader = ({ label, col }: { label: string; col: SortKey }) => (
    <th
      className="px-3 py-2 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-100 select-none whitespace-nowrap"
      onClick={() => handleSort(col)}
    >
      {label} {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  )

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Search */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
        <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar coin..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none flex-1"
        />
        <span className="text-xs text-zinc-500">{filtered.length} activos</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <ColHeader label="#" col="market_cap_rank" />
              <th className="px-3 py-2 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Activo</th>
              <ColHeader label="Precio" col="current_price" />
              <ColHeader label="24h %" col="price_change_percentage_24h" />
              <ColHeader label="7d %" col="price_change_percentage_7d_in_currency" />
              <ColHeader label="Cap. Mercado" col="market_cap" />
              <ColHeader label="Volumen 24h" col="total_volume" />
              {showSparkline && (
                <th className="px-3 py-2 text-left text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">7 días</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.map(coin => {
              const up24 = isPositive(coin.price_change_percentage_24h)
              return (
                <tr
                  key={coin.id}
                  className="hover:bg-zinc-800/40 transition-colors"
                >
                  {/* Rank */}
                  <td className="px-3 py-2.5 text-xs text-zinc-500 font-mono w-10">
                    {coin.market_cap_rank}
                  </td>

                  {/* Name + Symbol */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {coin.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                      )}
                      <div>
                        <div className="text-zinc-100 font-medium text-sm">{coin.name}</div>
                        <div className="text-zinc-500 text-xs uppercase">{coin.symbol}</div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-2.5 font-mono text-sm text-zinc-100 whitespace-nowrap">
                    {formatPrice(coin.current_price)}
                  </td>

                  {/* 24h % */}
                  <ChangeCell value={coin.price_change_percentage_24h} />

                  {/* 7d % */}
                  <ChangeCell value={coin.price_change_percentage_7d_in_currency} />

                  {/* Market Cap */}
                  <td className="px-3 py-2.5 text-xs text-zinc-400 whitespace-nowrap">
                    {formatMarketCap(coin.market_cap)}
                  </td>

                  {/* Volume */}
                  <td className="px-3 py-2.5 text-xs text-zinc-400 whitespace-nowrap">
                    {formatVolume(coin.total_volume)}
                  </td>

                  {/* Sparkline */}
                  {showSparkline && (
                    <td className="px-3 py-2.5">
                      {coin.sparkline_in_7d?.price && (
                        <Sparkline prices={coin.sparkline_in_7d.price} />
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No se encontraron resultados para "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
