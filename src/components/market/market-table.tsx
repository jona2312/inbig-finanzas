'use client'

import { useState } from 'react'
import { type FMPQuote, formatChangePercent, isPositive, formatMarketCap } from '@/services/fmp'

interface MarketTableProps {
  data: FMPQuote[]
}

export function MarketTable({ data }: MarketTableProps) {
  const [selected, setSelected] = useState<string | null>(null)

  if (!data.length) return null

  return (
    <div className="rounded-xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-900 text-zinc-400 text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-3">Activo</th>
            <th className="text-right px-4 py-3">Precio</th>
            <th className="text-right px-4 py-3">Cambio</th>
            <th className="text-right px-4 py-3 hidden md:table-cell">Apertura</th>
            <th className="text-right px-4 py-3 hidden md:table-cell">Máx/Mín</th>
            <th className="text-right px-4 py-3 hidden lg:table-cell">Volumen</th>
            <th className="text-right px-4 py-3 hidden lg:table-cell">Cap. Mercado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {data.map((q) => {
            const positive = isPositive(q.changesPercentage)
            const isSelected = selected === q.symbol

            return (
              <tr
                key={q.symbol}
                onClick={() => setSelected(isSelected ? null : q.symbol)}
                className={`
                  cursor-pointer transition-colors
                  ${isSelected
                    ? 'bg-zinc-800'
                    : 'hover:bg-zinc-900/60'
                  }
                `}
              >
                {/* Activo */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-8 rounded-full ${positive ? 'bg-emerald-500' : 'bg-red-500'}`}
                    />
                    <div>
                      <p className="font-medium text-white">{q.symbol.replace('.BA', '')}</p>
                      <p className="text-xs text-zinc-500 truncate max-w-[140px]">{q.name}</p>
                    </div>
                  </div>
                </td>

                {/* Precio */}
                <td className="px-4 py-3 text-right font-mono font-medium text-white">
                  {q.price?.toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                {/* Cambio */}
                <td className="px-4 py-3 text-right">
                  <span className={`font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatChangePercent(q.changesPercentage)}
                  </span>
                </td>

                {/* Apertura */}
                <td className="px-4 py-3 text-right text-zinc-400 font-mono hidden md:table-cell">
                  {q.open?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                </td>

                {/* Máx/Mín */}
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <span className="text-emerald-400 font-mono text-xs">
                    {q.dayHigh?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-zinc-600 mx-1">/</span>
                  <span className="text-red-400 font-mono text-xs">
                    {q.dayLow?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </span>
                </td>

                {/* Volumen */}
                <td className="px-4 py-3 text-right text-zinc-400 font-mono text-xs hidden lg:table-cell">
                  {q.volume?.toLocaleString('es-AR')}
                </td>

                {/* Market Cap */}
                <td className="px-4 py-3 text-right text-zinc-400 text-xs hidden lg:table-cell">
                  {q.marketCap ? formatMarketCap(q.marketCap) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
