'use client'

/**
 * WorldMarketsMap — Mapa de calor interactivo de bolsas mundiales
 *
 * Muestra en tiempo real qué bolsas están ABIERTAS ahora mismo,
 * cuáles están CERRADAS y qué performance tienen (color por cambio%).
 *
 * 100% gratis — sin API externa. Usa horarios de bolsas + Date().
 * Para los precios de índices, ya los tenemos vía FMP /api/chart-data.
 */

import { useState, useEffect, useCallback } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Exchange {
  id:         string
  name:       string
  country:    string
  flag:       string
  timezone:   string        // IANA timezone
  openHour:   number        // hora local apertura
  openMin:    number
  closeHour:  number        // hora local cierre
  closeMin:   number
  days:       number[]      // 1=Lunes, 5=Viernes
  index:      string        // nombre del índice
  fmpSymbol?: string        // símbolo para FMP (opcional)
  change?:    number | null // % cambio del día (se llena async)
  x:          number        // % posición en el mapa (left)
  y:          number        // % posición en el mapa (top)
  size:       'sm' | 'md' | 'lg'
}

// ─── Bolsas del mundo (horarios en hora LOCAL de cada bolsa) ──────────────────

const EXCHANGES: Exchange[] = [
  // América
  { id:'nyse',    name:'NYSE',         country:'Estados Unidos', flag:'🇺🇸', timezone:'America/New_York',  openHour:9,  openMin:30, closeHour:16, closeMin:0,  days:[1,2,3,4,5], index:'S&P 500',    fmpSymbol:'SPY',   x:22, y:42, size:'lg' },
  { id:'nasdaq',  name:'NASDAQ',       country:'Estados Unidos', flag:'🇺🇸', timezone:'America/New_York',  openHour:9,  openMin:30, closeHour:16, closeMin:0,  days:[1,2,3,4,5], index:'QQQ',        fmpSymbol:'QQQ',   x:19, y:44, size:'md' },
  { id:'tsx',     name:'TSX',          country:'Canadá',         flag:'🇨🇦', timezone:'America/Toronto',   openHour:9,  openMin:30, closeHour:16, closeMin:0,  days:[1,2,3,4,5], index:'TSX Comp.',  x:20, y:32, size:'sm' },
  { id:'byma',    name:'BYMA',         country:'Argentina',      flag:'🇦🇷', timezone:'America/Argentina/Buenos_Aires', openHour:11, openMin:0, closeHour:17, closeMin:0, days:[1,2,3,4,5], index:'Merval', fmpSymbol:'GGAL', x:30, y:72, size:'md' },
  { id:'b3',      name:'B3',           country:'Brasil',         flag:'🇧🇷', timezone:'America/Sao_Paulo', openHour:10, openMin:0, closeHour:17, closeMin:30, days:[1,2,3,4,5], index:'Ibovespa',   x:32, y:65, size:'md' },
  { id:'bmv',     name:'BMV',          country:'México',         flag:'🇲🇽', timezone:'America/Mexico_City',openHour:8, openMin:30, closeHour:15, closeMin:0, days:[1,2,3,4,5], index:'IPC México', x:18, y:52, size:'sm' },
  { id:'bvc',     name:'BVC',          country:'Colombia',       flag:'🇨🇴', timezone:'America/Bogota',    openHour:9,  openMin:30, closeHour:16, closeMin:0, days:[1,2,3,4,5],  index:'COLCAP',    x:27, y:58, size:'sm' },
  { id:'bvl',     name:'BVL',          country:'Perú',           flag:'🇵🇪', timezone:'America/Lima',      openHour:9,  openMin:0,  closeHour:16, closeMin:0,  days:[1,2,3,4,5], index:'S&P/BVL',   x:26, y:64, size:'sm' },
  // Europa
  { id:'lse',     name:'LSE',          country:'Reino Unido',    flag:'🇬🇧', timezone:'Europe/London',     openHour:8,  openMin:0,  closeHour:16, closeMin:30, days:[1,2,3,4,5], index:'FTSE 100',  fmpSymbol:'EWU',   x:46, y:28, size:'lg' },
  { id:'frankfurt',name:'Xetra',       country:'Alemania',       flag:'🇩🇪', timezone:'Europe/Berlin',     openHour:9,  openMin:0,  closeHour:17, closeMin:30, days:[1,2,3,4,5], index:'DAX',       fmpSymbol:'EWG',   x:49, y:26, size:'lg' },
  { id:'euronext', name:'Euronext',    country:'Francia',        flag:'🇫🇷', timezone:'Europe/Paris',      openHour:9,  openMin:0,  closeHour:17, closeMin:30, days:[1,2,3,4,5], index:'CAC 40',    x:48, y:29, size:'md' },
  { id:'bme',     name:'BME',          country:'España',         flag:'🇪🇸', timezone:'Europe/Madrid',     openHour:9,  openMin:0,  closeHour:17, closeMin:30, days:[1,2,3,4,5], index:'IBEX 35',   x:46, y:33, size:'sm' },
  { id:'sia',     name:'SIX',          country:'Suiza',          flag:'🇨🇭', timezone:'Europe/Zurich',     openHour:9,  openMin:0,  closeHour:17, closeMin:30, days:[1,2,3,4,5], index:'SMI',       x:50, y:29, size:'sm' },
  { id:'borsa',   name:'Borsa Italiana',country:'Italia',        flag:'🇮🇹', timezone:'Europe/Rome',       openHour:9,  openMin:0,  closeHour:17, closeMin:30, days:[1,2,3,4,5], index:'FTSE MIB',  x:51, y:32, size:'sm' },
  // Asia-Pacífico
  { id:'tse',     name:'TSE',          country:'Japón',          flag:'🇯🇵', timezone:'Asia/Tokyo',        openHour:9,  openMin:0,  closeHour:15, closeMin:30, days:[1,2,3,4,5], index:'Nikkei 225',fmpSymbol:'EWJ',   x:78, y:38, size:'lg' },
  { id:'sse',     name:'SSE',          country:'China',          flag:'🇨🇳', timezone:'Asia/Shanghai',     openHour:9,  openMin:30, closeHour:15, closeMin:0,  days:[1,2,3,4,5], index:'SSE Comp.', fmpSymbol:'FXI',   x:74, y:38, size:'lg' },
  { id:'hkex',    name:'HKEX',         country:'Hong Kong',      flag:'🇭🇰', timezone:'Asia/Hong_Kong',    openHour:9,  openMin:30, closeHour:16, closeMin:0,  days:[1,2,3,4,5], index:'Hang Seng', fmpSymbol:'EWH',   x:76, y:44, size:'md' },
  { id:'bse',     name:'BSE',          country:'India',          flag:'🇮🇳', timezone:'Asia/Kolkata',      openHour:9,  openMin:15, closeHour:15, closeMin:30, days:[1,2,3,4,5], index:'SENSEX',    x:67, y:46, size:'md' },
  { id:'krx',     name:'KRX',          country:'Corea del Sur',  flag:'🇰🇷', timezone:'Asia/Seoul',        openHour:9,  openMin:0,  closeHour:15, closeMin:30, days:[1,2,3,4,5], index:'KOSPI',     x:79, y:37, size:'sm' },
  { id:'asx',     name:'ASX',          country:'Australia',      flag:'🇦🇺', timezone:'Australia/Sydney',  openHour:10, openMin:0,  closeHour:16, closeMin:0,  days:[1,2,3,4,5], index:'ASX 200',   fmpSymbol:'EWA',   x:80, y:68, size:'md' },
  { id:'sgx',     name:'SGX',          country:'Singapur',       flag:'🇸🇬', timezone:'Asia/Singapore',    openHour:9,  openMin:0,  closeHour:17, closeMin:0,  days:[1,2,3,4,5], index:'STI',       x:76, y:54, size:'sm' },
  // Medio Oriente / África
  { id:'tadawul', name:'Tadawul',      country:'Arabia Saudita', flag:'🇸🇦', timezone:'Asia/Riyadh',       openHour:10, openMin:0,  closeHour:15, closeMin:0,  days:[0,1,2,3,4], index:'Tadawul',   x:60, y:46, size:'sm' },
  { id:'jse',     name:'JSE',          country:'Sudáfrica',      flag:'🇿🇦', timezone:'Africa/Johannesburg',openHour:9, openMin:0,  closeHour:17, closeMin:0,  days:[1,2,3,4,5], index:'JSE Top 40',x:54, y:68, size:'sm' },
]

// ─── Helpers de tiempo ────────────────────────────────────────────────────────

function isMarketOpen(ex: Exchange): boolean {
  const now = new Date()

  // Día de la semana en la timezone de la bolsa
  const localStr  = now.toLocaleString('en-US', { timeZone: ex.timezone })
  const localDate = new Date(localStr)
  const dayOfWeek = localDate.getDay() // 0=Dom, 1=Lun, ..., 6=Sab

  if (!ex.days.includes(dayOfWeek)) return false

  const h = localDate.getHours()
  const m = localDate.getMinutes()
  const totalMin = h * 60 + m
  const openMin  = ex.openHour  * 60 + ex.openMin
  const closeMin = ex.closeHour * 60 + ex.closeMin

  return totalMin >= openMin && totalMin < closeMin
}

function getLocalTime(timezone: string): string {
  return new Date().toLocaleTimeString('es-AR', {
    timeZone: timezone,
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function minutesToOpen(ex: Exchange): number {
  const now      = new Date()
  const localStr = now.toLocaleString('en-US', { timeZone: ex.timezone })
  const local    = new Date(localStr)
  const h = local.getHours(), m = local.getMinutes()
  const cur  = h * 60 + m
  const open = ex.openHour * 60 + ex.openMin
  if (cur < open) return open - cur
  // ya cerró — abre mañana
  return (24 * 60 - cur) + open
}

// dotColor: usada en el SVG para determinar fill de cada círculo
function dotOpen(open: boolean, change: number | null | undefined): string {
  if (!open)          return '#3f3f46'
  if (change == null) return '#10b981'
  if (change > 0)     return '#10b981'
  return '#ef4444'
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function WorldMarketsMap() {
  const [exchanges,  setExchanges]  = useState<Exchange[]>(EXCHANGES)
  const [selected,   setSelected]   = useState<Exchange | null>(null)
  const [nowStr,     setNowStr]     = useState('')
  const [openCount,  setOpenCount]  = useState(0)

  // Recalcular estados cada minuto
  const recalc = useCallback(() => {
    setNowStr(new Date().toLocaleTimeString('es-AR', { hour:'2-digit', minute:'2-digit', hour12:false }) + ' (hora ARG)')
    const updated = EXCHANGES.map(ex => ({ ...ex }))
    const open = updated.filter(ex => isMarketOpen(ex)).length
    setOpenCount(open)
    setExchanges(updated)
  }, [])

  useEffect(() => {
    recalc()
    const interval = setInterval(recalc, 60_000)
    return () => clearInterval(interval)
  }, [recalc])

  const selectedOpen = selected ? isMarketOpen(selected) : false

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            🌍 Bolsas del mundo
            <span className="text-[10px] font-normal text-zinc-500">{nowStr}</span>
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            <span className={`font-semibold ${openCount > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>{openCount}</span>
            &nbsp;bolsas abiertas ahora · {EXCHANGES.length - openCount} cerradas
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Abierta</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500    inline-block" /> Baja</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-600  inline-block" /> Cerrada</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="relative w-full" style={{ paddingTop: '50%' }}>
        {/* Fondo SVG simplificado del mundo */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 50"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Cuadrícula de latitudes/longitudes */}
          {[10,20,30,40].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#27272a" strokeWidth="0.2" />
          ))}
          {[10,20,30,40,50,60,70,80,90].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="50" stroke="#27272a" strokeWidth="0.2" />
          ))}

          {/* Continentes simplificados — paths */}
          {/* América del Norte */}
          <path d="M 5,12 L 28,12 L 30,25 L 24,32 L 20,40 L 15,38 L 8,28 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.3" />
          {/* América del Sur */}
          <path d="M 20,42 L 30,40 L 36,50 L 30,50 L 22,50 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.3" />
          {/* Europa */}
          <path d="M 42,18 L 55,18 L 56,28 L 50,32 L 44,30 L 42,24 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.3" />
          {/* África */}
          <path d="M 44,32 L 56,30 L 58,50 L 50,50 L 42,50 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.3" />
          {/* Asia */}
          <path d="M 55,15 L 90,15 L 88,45 L 78,50 L 60,50 L 56,40 L 55,28 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.3" />
          {/* Australia */}
          <path d="M 76,58 L 90,56 L 92,50 L 82,48 L 76,50 Z" fill="#27272a" stroke="#3f3f46" strokeWidth="0.3" />

          {/* Dots de bolsas */}
          {exchanges.map(ex => {
            const open = isMarketOpen(ex)
            const r = ex.size === 'lg' ? 1.2 : ex.size === 'md' ? 0.9 : 0.65

            return (
              <g
                key={ex.id}
                onClick={() => setSelected(selected?.id === ex.id ? null : ex)}
                style={{ cursor: 'pointer' }}
              >
                {/* Halo pulsante si está abierta */}
                {open && (
                  <circle
                    cx={ex.x}
                    cy={ex.y}
                    r={r + 0.8}
                    fill="none"
                    stroke={ex.change != null && ex.change < 0 ? '#ef4444' : '#10b981'}
                    strokeWidth="0.3"
                    opacity="0.4"
                  />
                )}
                <circle
                  cx={ex.x}
                  cy={ex.y}
                  r={r}
                  fill={dotOpen(open, ex.change)}
                  stroke={selected?.id === ex.id ? '#fff' : 'transparent'}
                  strokeWidth="0.4"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Lista debajo del mapa — las abiertas ahora primero */}
      <div className="px-5 py-4 border-t border-zinc-800">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {[...exchanges]
            .sort((a, b) => {
              const aOpen = isMarketOpen(a) ? 1 : 0
              const bOpen = isMarketOpen(b) ? 1 : 0
              return bOpen - aOpen
            })
            .slice(0, 12)
            .map(ex => {
              const open      = isMarketOpen(ex)
              const localTime = getLocalTime(ex.timezone)

              return (
                <button
                  key={ex.id}
                  onClick={() => setSelected(selected?.id === ex.id ? null : ex)}
                  className={`text-left p-2.5 rounded-xl border transition-colors ${
                    selected?.id === ex.id
                      ? 'border-white/30 bg-zinc-800'
                      : 'border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-emerald-400' : 'bg-zinc-600'} shrink-0`} />
                    <span className="text-[10px] font-bold text-white">{ex.flag} {ex.name}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">{ex.index}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{localTime} · {open ? '🟢 Abierta' : '⚫ Cerrada'}</p>
                  {!open && (
                    <p className="text-[9px] text-zinc-600">
                      Abre en {Math.floor(minutesToOpen(ex) / 60)}h {minutesToOpen(ex) % 60}min
                    </p>
                  )}
                </button>
              )
            })}
        </div>
      </div>

      {/* Panel detalle — bolsa seleccionada */}
      {selected && (
        <div className="px-5 py-4 border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-white">{selected.flag} {selected.name} — {selected.country}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{selected.index}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className={selectedOpen ? 'text-emerald-400' : 'text-zinc-500'}>
                  {selectedOpen ? '🟢 Abierta ahora' : '⚫ Cerrada'}
                </span>
                <span className="text-zinc-600">
                  Horario: {selected.openHour.toString().padStart(2,'0')}:{selected.openMin.toString().padStart(2,'0')} — {selected.closeHour.toString().padStart(2,'0')}:{selected.closeMin.toString().padStart(2,'0')} (hora local)
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Hora local ahora: <span className="text-white font-mono">{getLocalTime(selected.timezone)}</span>
              </p>
              {!selectedOpen && (
                <p className="text-xs text-zinc-500 mt-1">
                  Próxima apertura en: <span className="text-white">{Math.floor(minutesToOpen(selected) / 60)}h {minutesToOpen(selected) % 60}min</span>
                </p>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-400 text-lg leading-none">×</button>
          </div>
        </div>
      )}
    </div>
  )
}
