/**
 * FearGreedWidget — Índice de Miedo y Codicia (Alternative.me)
 *
 * Server Component
 * Gauge visual con valor 0-100 y comparación vs ayer
 */

import type { FearGreedData } from '@/services/fear-greed'

interface FearGreedWidgetProps {
  data: FearGreedData
}

export function FearGreedWidget({ data }: FearGreedWidgetProps) {
  const { value, valueTextEs, change, previousValueText, color, emoji } = data

  // SVG arc gauge — semicírculo
  const RADIUS = 60
  const CX = 80
  const CY = 80
  const circumference = Math.PI * RADIUS
  // value 0-100 → offset del arco
  const arcProgress = (value / 100) * circumference
  const dashOffset  = circumference - arcProgress

  // Color de fondo según valor
  const bgGradient = value <= 24 ? 'from-red-500/10'
    : value <= 44 ? 'from-orange-500/10'
    : value <= 54 ? 'from-yellow-500/10'
    : value <= 74 ? 'from-lime-500/10'
    : 'from-emerald-500/10'

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 bg-gradient-to-br ${bgGradient} to-transparent`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Fear & Greed</h3>
        <span className="text-[10px] text-zinc-500">Crypto sentiment</span>
      </div>

      {/* Gauge SVG */}
      <div className="flex flex-col items-center">
        <svg width="160" height="90" viewBox="0 0 160 90" className="overflow-visible">
          {/* Track */}
          <path
            d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
            fill="none"
            stroke="#27272a"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Progress */}
          <path
            d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${dashOffset}`}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
          {/* Valor central */}
          <text x={CX} y={CY - 8} textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" fontFamily="ui-monospace, monospace">
            {value}
          </text>
        </svg>

        {/* Label */}
        <div className="flex items-center gap-2 -mt-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm font-semibold" style={{ color }}>{valueTextEs}</span>
        </div>

        {/* Comparación vs ayer */}
        {change != null && previousValueText && (
          <div className="mt-2 text-center">
            <p className="text-[10px] text-zinc-500">
              Ayer: <span className="text-zinc-400">{previousValueText}</span>
              {change !== 0 && (
                <span className={`ml-1.5 ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {change > 0 ? '↑' : '↓'} {Math.abs(change)} pts
                </span>
              )}
            </p>
          </div>
        )}

        {/* Escala */}
        <div className="flex w-full justify-between mt-3 px-1">
          {['😱 0', '😨', '😐 50', '😏', '🤑 100'].map((l, i) => (
            <span key={i} className="text-[9px] text-zinc-600">{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
