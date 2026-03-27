'use client'

import type { DollarRate } from '@/services/market'

interface SpreadIndicatorProps {
  rates: DollarRate[]
}

export function SpreadIndicator({ rates }: SpreadIndicatorProps) {
  const oficial = rates.find(r => r.nombre.toLowerCase() === 'oficial')
  if (!oficial?.venta) return null

  const oficialVenta = oficial.venta

  const comparables = rates.filter(r =>
    r.nombre.toLowerCase() !== 'oficial' && r.venta
  )

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="space-y-3">
        {/* Oficial como base */}
        <div className="flex items-center gap-3">
          <div className="w-32 text-sm text-zinc-300 font-medium">Oficial</div>
          <div className="flex-1 bg-zinc-800 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '100%' }} />
          </div>
          <div className="w-24 text-right">
            <span className="text-white font-mono text-sm">${oficialVenta.toLocaleString('es-AR')}</span>
          </div>
          <div className="w-16 text-right text-zinc-500 text-xs">base</div>
        </div>

        {comparables.map((rate) => {
          if (!rate.venta) return null
          const brecha = ((rate.venta - oficialVenta) / oficialVenta) * 100
          const barWidth = Math.min(brecha / 120 * 100, 100) // normalizar a 120% max

          return (
            <div key={rate.nombre} className="flex items-center gap-3">
              <div className="w-32 text-sm text-zinc-300 truncate">{rate.nombre}</div>
              <div className="flex-1 bg-zinc-800 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    brecha > 50 ? 'bg-red-500' :
                    brecha > 20 ? 'bg-yellow-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(barWidth, 5)}%` }}
                />
              </div>
              <div className="w-24 text-right">
                <span className="text-white font-mono text-sm">${rate.venta.toLocaleString('es-AR')}</span>
              </div>
              <div className={`w-16 text-right text-xs font-medium ${
                brecha > 50 ? 'text-red-400' :
                brecha > 20 ? 'text-yellow-400' :
                'text-emerald-400'
              }`}>
                +{brecha.toFixed(0)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
