'use client'

const COLOR_MAP: Record<string, { border: string; badge: string; glow: string }> = {
  blue:   { border: 'border-emerald-800 hover:border-emerald-600', badge: 'bg-emerald-900/40 text-emerald-400', glow: 'text-emerald-400' },
  green:  { border: 'border-emerald-800 hover:border-emerald-600', badge: 'bg-emerald-900/40 text-emerald-400', glow: 'text-emerald-400' },
  purple: { border: 'border-purple-800 hover:border-purple-600',   badge: 'bg-purple-900/40 text-purple-400',   glow: 'text-purple-400'  },
  orange: { border: 'border-orange-800 hover:border-orange-600',   badge: 'bg-orange-900/40 text-orange-400',   glow: 'text-orange-400'  },
  yellow: { border: 'border-yellow-800 hover:border-yellow-600',   badge: 'bg-yellow-900/40 text-yellow-400',   glow: 'text-yellow-400'  },
  cyan:   { border: 'border-cyan-800 hover:border-cyan-600',       badge: 'bg-cyan-900/40 text-cyan-400',       glow: 'text-cyan-400'    },
  red:    { border: 'border-red-800 hover:border-red-600',         badge: 'bg-red-900/40 text-red-400',         glow: 'text-red-400'     },
  blue2:  { border: 'border-blue-800 hover:border-blue-600',       badge: 'bg-blue-900/40 text-blue-400',       glow: 'text-blue-400'    },
  zinc:   { border: 'border-zinc-700 hover:border-zinc-600',       badge: 'bg-zinc-800 text-zinc-400',          glow: 'text-zinc-400'    },
}

interface DivisaCardProps {
  nombre: string
  compra: number | null
  venta:  number | null
  icon:   string
  desc:   string
  color:  string
}

export function DivisaCard({ nombre, compra, venta, icon, desc, color }: DivisaCardProps) {
  const c  = COLOR_MAP[color] ?? COLOR_MAP['zinc']
  const spread = compra && venta ? ((venta - compra) / compra * 100).toFixed(1) : null

  return (
    <div className={`bg-zinc-900 border ${c.border} rounded-xl p-5 transition-colors group`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="text-white font-semibold text-sm">Dólar {nombre}</p>
            <p className="text-zinc-500 text-xs leading-snug max-w-[160px]">{desc}</p>
          </div>
        </div>
      </div>

      {/* Compra / Venta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800/60 rounded-lg p-3">
          <p className="text-zinc-500 text-xs mb-1">Compra</p>
          <p className="text-white font-bold text-lg font-mono">
            {compra ? `$${compra.toLocaleString('es-AR')}` : '—'}
          </p>
        </div>
        <div className="bg-zinc-800/60 rounded-lg p-3">
          <p className="text-zinc-500 text-xs mb-1">Venta</p>
          <p className={`font-bold text-lg font-mono ${c.glow}`}>
            {venta ? `$${venta.toLocaleString('es-AR')}` : '—'}
          </p>
        </div>
      </div>

      {/* Spread */}
      {spread && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-zinc-500 text-xs">Spread</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
            {spread}%
          </span>
        </div>
      )}
    </div>
  )
}
