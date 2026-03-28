'use client'

/**
 * SectorHeatmap — Mapa de calor de sectores estilo Bloomberg/Finviz
 *
 * Muestra sectores como bloques coloreados por % cambio del día.
 * Tamaño de cada bloque proporcional a la capitalización de mercado.
 * 100% cliente — datos mockeados aquí, en prod se llena con FMP /sector
 *
 * Colores:
 *   > +2%  → emerald intenso
 *   0-2%   → emerald suave
 *   0      → zinc (neutral)
 *   0-2%   → rojo suave
 *   < -2%  → rojo intenso
 */

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeatItem {
  ticker:  string
  name:    string
  sector:  string
  change:  number    // % cambio del día
  weight:  number    // peso relativo (1-10) para tamaño del bloque
  price?:  string
}

// ─── Mock data — en prod reemplazar con FMP /sector endpoint ─────────────────

const SECTORS: { id: string; label: string; icon: string; items: HeatItem[] }[] = [
  {
    id: 'energia', label: 'Energía', icon: '⚡',
    items: [
      { ticker:'YPF',   name:'YPF',        sector:'energia', change: 3.2,  weight: 8, price:'$14.8' },
      { ticker:'PAMP',  name:'Pampa',      sector:'energia', change: 1.8,  weight: 5, price:'$62.5' },
      { ticker:'CEPU',  name:'Central Pn', sector:'energia', change:-0.4,  weight: 3, price:'$8.2'  },
      { ticker:'TGSU2', name:'Tes. Gas S', sector:'energia', change: 0.9,  weight: 4, price:'$45.0' },
    ],
  },
  {
    id: 'bancos', label: 'Bancos', icon: '🏦',
    items: [
      { ticker:'GGAL',  name:'Galicia',    sector:'bancos', change: 2.4,  weight: 9, price:'$3.80' },
      { ticker:'BMA',   name:'Macro',      sector:'bancos', change: 1.9,  weight: 7, price:'$7.20' },
      { ticker:'BBAR',  name:'Francés',    sector:'bancos', change:-0.8,  weight: 6, price:'$5.40' },
      { ticker:'SUPV',  name:'Supervielle',sector:'bancos', change: 0.3,  weight: 3, price:'$2.10' },
    ],
  },
  {
    id: 'tech', label: 'Tecnología US', icon: '💻',
    items: [
      { ticker:'AAPL',  name:'Apple',      sector:'tech', change: 0.5,  weight:10, price:'$213'  },
      { ticker:'MSFT',  name:'Microsoft',  sector:'tech', change: 1.2,  weight:10, price:'$415'  },
      { ticker:'NVDA',  name:'NVIDIA',     sector:'tech', change: 4.8,  weight: 9, price:'$877'  },
      { ticker:'MELI',  name:'MercadoLibre',sector:'tech',change: 2.1,  weight: 7, price:'$2,180'},
      { ticker:'TSLA',  name:'Tesla',      sector:'tech', change:-1.4,  weight: 6, price:'$245'  },
      { ticker:'AMZN',  name:'Amazon',     sector:'tech', change: 0.8,  weight: 9, price:'$187'  },
    ],
  },
  {
    id: 'cripto', label: 'Cripto', icon: '₿',
    items: [
      { ticker:'BTC',   name:'Bitcoin',    sector:'cripto', change: 3.2,  weight:10, price:'$84,200'},
      { ticker:'ETH',   name:'Ethereum',   sector:'cripto', change: 2.8,  weight: 8, price:'$3,200' },
      { ticker:'SOL',   name:'Solana',     sector:'cripto', change: 5.4,  weight: 5, price:'$142'   },
      { ticker:'BNB',   name:'BNB',        sector:'cripto', change: 1.1,  weight: 4, price:'$415'   },
      { ticker:'ADA',   name:'Cardano',    sector:'cripto', change:-2.1,  weight: 3, price:'$0.42'  },
    ],
  },
  {
    id: 'commodities', label: 'Commodities', icon: '🌾',
    items: [
      { ticker:'GOLD',  name:'Oro',        sector:'commodities', change: 1.2,  weight: 8, price:'$3,120'},
      { ticker:'WTI',   name:'Petróleo',   sector:'commodities', change:-0.8,  weight: 7, price:'$76.4' },
      { ticker:'SOJA',  name:'Soja',       sector:'commodities', change: 0.4,  weight: 5, price:'$425'  },
      { ticker:'TRIGO', name:'Trigo',      sector:'commodities', change:-1.2,  weight: 4, price:'$580'  },
    ],
  },
  {
    id: 'indices', label: 'Índices', icon: '📈',
    items: [
      { ticker:'SPY',   name:'S&P 500',    sector:'indices', change:-0.4,  weight: 9, price:'$562' },
      { ticker:'QQQ',   name:'Nasdaq',     sector:'indices', change: 0.3,  weight: 8, price:'$476' },
      { ticker:'MERVAL',name:'Merval AR',  sector:'indices', change: 2.8,  weight: 6, price:'$2.1M'},
      { ticker:'IBOV',  name:'Ibovespa BR',sector:'indices', change: 1.1,  weight: 5, price:'$131k'},
    ],
  },
]

// ─── Color helpers ────────────────────────────────────────────────────────────

function changeColor(change: number): string {
  if (change >  3)  return 'bg-emerald-500    text-emerald-950 border-emerald-400'
  if (change >  1)  return 'bg-emerald-700    text-emerald-100 border-emerald-600'
  if (change >  0)  return 'bg-emerald-900    text-emerald-300 border-emerald-800'
  if (change === 0) return 'bg-zinc-800       text-zinc-300    border-zinc-700'
  if (change > -1)  return 'bg-red-900        text-red-300     border-red-800'
  if (change > -3)  return 'bg-red-700        text-red-100     border-red-600'
  return              'bg-red-500        text-red-950     border-red-400'
}

function changeText(change: number): string {
  return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface SectorHeatmapProps {
  compact?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SectorHeatmap({ compact = false }: SectorHeatmapProps) {
  const [selected,       setSelected]       = useState<HeatItem | null>(null)
  const [activeSector,   setActiveSector]   = useState<string | null>(null)

  const filteredSectors = activeSector
    ? SECTORS.filter(s => s.id === activeSector)
    : SECTORS

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-white">🔥 Mapa de calor</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Rendimiento por sector · Hoy</p>
        </div>
        {/* Leyenda */}
        <div className="flex items-center gap-2 text-[9px]">
          {[
            { color: 'bg-emerald-500', label: '+3%+' },
            { color: 'bg-emerald-700', label: '+1~3%' },
            { color: 'bg-zinc-700',    label: '0%' },
            { color: 'bg-red-700',     label: '-1~3%' },
            { color: 'bg-red-500',     label: '-3%+' },
          ].map(l => (
            <span key={l.label} className="flex items-center gap-0.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
              <span className="text-zinc-500">{l.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Filtros de sector */}
      <div className="flex gap-1.5 px-4 pt-3 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSector(null)}
          className={`shrink-0 text-[11px] px-3 py-1 rounded-full border transition-colors ${
            !activeSector ? 'bg-zinc-700 border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Todos
        </button>
        {SECTORS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSector(activeSector === s.id ? null : s.id)}
            className={`shrink-0 text-[11px] px-3 py-1 rounded-full border transition-colors ${
              activeSector === s.id ? 'bg-zinc-700 border-zinc-500 text-white' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="p-4 space-y-4">
        {filteredSectors.map(sector => (
          <div key={sector.id}>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
              {sector.icon} {sector.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {sector.items.map(item => {
                const weightClass = item.weight >= 9 ? 'min-w-[100px]' :
                                    item.weight >= 7 ? 'min-w-[80px]'  :
                                    item.weight >= 5 ? 'min-w-[60px]'  : 'min-w-[48px]'
                return (
                  <button
                    key={item.ticker}
                    onClick={() => setSelected(selected?.ticker === item.ticker ? null : item)}
                    className={`
                      ${weightClass} border rounded-lg p-2 text-left transition-all
                      ${changeColor(item.change)}
                      ${selected?.ticker === item.ticker ? 'ring-2 ring-white/40 scale-105' : 'hover:scale-[1.03]'}
                    `}
                    style={{ height: item.weight >= 7 ? '56px' : '48px' }}
                  >
                    <p className="text-[11px] font-bold font-mono leading-none">{item.ticker}</p>
                    {item.weight >= 5 && (
                      <p className="text-[9px] leading-none mt-0.5 opacity-70 truncate">{item.name}</p>
                    )}
                    <p className="text-[10px] font-semibold mt-1">{changeText(item.change)}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Panel detalle */}
      {selected && (
        <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm font-mono font-bold text-white">{selected.ticker}</span>
              <span className="text-xs text-zinc-400 ml-2">{selected.name}</span>
            </div>
            {selected.price && (
              <span className="text-sm font-mono text-white">{selected.price}</span>
            )}
            <span className={`text-sm font-bold ${selected.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {changeText(selected.change)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/grafico?symbol=${selected.ticker}`}
              className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              Graficar →
            </a>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-400 text-lg">×</button>
          </div>
        </div>
      )}
    </div>
  )
}
