/**
 * CommoditiesWidget — Precios de commodities en tiempo real (FMP)
 *
 * Server Component — datos cacheados 5 min con ISR
 * Muestra: energía, granos (crítico AR), metales
 */

import type { CommodityQuote } from '@/services/commodities'

interface CommoditiesWidgetProps {
  commodities: CommodityQuote[]
  compact?: boolean
}

function pctColor(v: number) {
  return v >= 0 ? 'text-emerald-400' : 'text-red-400'
}

function pctArrow(v: number) {
  return v >= 0 ? '▲' : '▼'
}

const CATEGORY_LABELS = {
  energia: 'Energía',
  granos:  'Granos',
  metales: 'Metales',
}

export function CommoditiesWidget({ commodities, compact = false }: CommoditiesWidgetProps) {
  const byCategory = commodities.reduce<Record<string, CommodityQuote[]>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {})

  if (compact) {
    // Vista compacta para sidebar
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Commodities</h3>
          <a href="/mercados" className="text-xs text-emerald-400 hover:underline">Ver más →</a>
        </div>
        <div className="divide-y divide-zinc-800">
          {commodities.slice(0, 6).map(c => (
            <div key={c.symbol} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">{c.emoji}</span>
                <span className="text-xs text-zinc-300">{c.name}</span>
              </div>
              <div className="text-right tabular-nums">
                <p className="text-xs font-semibold text-white">
                  ${c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-[10px] ${pctColor(c.changesPercentage)}`}>
                  {pctArrow(c.changesPercentage)} {Math.abs(c.changesPercentage).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Vista completa para /mercados
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Commodities</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Precios globales — clave para LATAM</p>
        </div>
        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-1 rounded-full">FMP · 5 min cache</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
        {(['energia', 'granos', 'metales'] as const).map(cat => (
          <div key={cat}>
            <div className="px-4 py-2 bg-zinc-800/40">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                {CATEGORY_LABELS[cat]}
              </span>
            </div>
            <div className="divide-y divide-zinc-800/60">
              {(byCategory[cat] ?? []).map(c => (
                <div key={c.symbol} className="px-4 py-3 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{c.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-white">{c.name}</p>
                      <p className="text-[10px] text-zinc-500">{c.unit}</p>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="text-sm font-bold text-white">
                      ${c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className={`text-xs font-medium ${pctColor(c.changesPercentage)}`}>
                      {pctArrow(c.changesPercentage)} {Math.abs(c.changesPercentage).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
