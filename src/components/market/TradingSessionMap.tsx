'use client'

/**
 * TradingSessionMap — Mapa mundial con sesiones de trading activas
 *
 * Muestra las 4 sesiones principales (Sydney, Tokyo, Londres, NY)
 * con detección en tiempo real de qué sesiones están activas.
 * Usa react-simple-maps + topojson world-atlas (CDN).
 */

import { useState, useEffect, useCallback } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { Globe, Clock, TrendingUp } from 'lucide-react'

// ─── Topojson world data (CDN, ~90kb) ─────────────────────────────────────────
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// ─── Sesiones de trading ──────────────────────────────────────────────────────
interface Session {
  id: string
  name: string
  city: string
  color: string
  colorClass: string
  dotClass: string
  utcOpen: number
  utcClose: number
  countries: string[]
  overlap?: string
}

const SESSIONS: Session[] = [
  {
    id: 'sydney',
    name: 'Asia-Pacífico',
    city: 'Sydney',
    color: '#60a5fa',
    colorClass: 'text-blue-400',
    dotClass: 'bg-blue-400',
    utcOpen: 22,
    utcClose: 7,
    countries: ['36','554','360','608','702','458','764','704','156','410','392','096','116','418','104'],
  },
  {
    id: 'tokyo',
    name: 'Tokio',
    city: 'Tokyo',
    color: '#f472b6',
    colorClass: 'text-pink-400',
    dotClass: 'bg-pink-400',
    utcOpen: 0,
    utcClose: 9,
    countries: ['392','156','410','496','158','344','446'],
    overlap: 'Sydney',
  },
  {
    id: 'london',
    name: 'Europa',
    city: 'Londres',
    color: '#a78bfa',
    colorClass: 'text-violet-400',
    dotClass: 'bg-violet-400',
    utcOpen: 8,
    utcClose: 17,
    countries: ['826','276','250','528','056','756','040','724','380','752','578','208','246','616',
                '203','348','642','300','620','372','643','804','703','705','191','442','352','233','428','440'],
    overlap: 'Tokyo',
  },
  {
    id: 'newyork',
    name: 'Nueva York',
    city: 'New York',
    color: '#34d399',
    colorClass: 'text-emerald-400',
    dotClass: 'bg-emerald-400',
    utcOpen: 13,
    utcClose: 22,
    countries: ['840','124','484','076','032','152','170','604','862','218','858','600','591','630','388','332','214','320','340','222','188','558','192','531'],
    overlap: 'Londres',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSessionActive(session: Session, utcHour: number): boolean {
  if (session.utcOpen < session.utcClose) {
    return utcHour >= session.utcOpen && utcHour < session.utcClose
  }
  return utcHour >= session.utcOpen || utcHour < session.utcClose
}

function getSessionCountdown(session: Session, utcHour: number, utcMin: number): string {
  const active = isSessionActive(session, utcHour)
  const targetHour = active ? session.utcClose : session.utcOpen
  let diff = (targetHour - utcHour + 24) % 24
  if (diff === 0 && utcMin > 0) diff = 24
  const mins = active ? (60 - utcMin) % 60 : 60 - utcMin
  return active
    ? `Cierra en ${diff}h${mins > 0 ? ` ${mins}m` : ''}`
    : `Abre en ${diff}h${mins > 0 ? ` ${mins}m` : ''}`
}

function utcToART(utcHour: number): string {
  const art = (utcHour - 3 + 24) % 24
  return `${art.toString().padStart(2, '0')}:00`
}

function getCountryColor(geoId: string, activeSessions: Session[]): string {
  const priority = ['newyork', 'london', 'tokyo', 'sydney']
  for (const sessionId of priority) {
    const session = activeSessions.find(s => s.id === sessionId)
    if (session?.countries.includes(geoId)) return session.color
  }
  for (const session of SESSIONS) {
    if (session.countries.includes(geoId)) return '#3f3f46'
  }
  return '#27272a'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TradingSessionMap() {
  const [utcNow, setUtcNow] = useState({ h: 0, m: 0, s: 0 })
  const [mounted, setMounted] = useState(false)

  const tick = useCallback(() => {
    const now = new Date()
    setUtcNow({ h: now.getUTCHours(), m: now.getUTCMinutes(), s: now.getUTCSeconds() })
  }, [])

  useEffect(() => {
    setMounted(true)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  const activeSessions = SESSIONS.filter(s => isSessionActive(s, utcNow.h))

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Sesiones de Trading</h2>
          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
            {activeSessions.length} activa{activeSessions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums font-mono">
            {mounted
              ? `UTC ${utcNow.h.toString().padStart(2, '0')}:${utcNow.m.toString().padStart(2, '0')}:${utcNow.s.toString().padStart(2, '0')}`
              : 'UTC --:--:--'}
          </span>
        </div>
      </div>

      {/* Mapa */}
      <div className="relative bg-zinc-950 px-1">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 145 }}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map(geo => {
                const color = mounted ? getCountryColor(String(geo.id), activeSessions) : '#27272a'
                const isActive = activeSessions.some(s => s.countries.includes(String(geo.id)))
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={color}
                    stroke="#18181b"
                    strokeWidth={0.3}
                    style={{
                      default: { outline: 'none', opacity: isActive ? 1 : 0.55 },
                      hover: { outline: 'none', opacity: 1, fill: isActive ? color : '#52525b' },
                      pressed: { outline: 'none' },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Leyenda */}
        <div className="absolute bottom-2 left-3 flex flex-wrap gap-2">
          {SESSIONS.map(s => {
            const active = isSessionActive(s, utcNow.h)
            return (
              <div key={s.id} className="flex items-center gap-1 bg-zinc-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px]">
                <div className={`w-2 h-2 rounded-full ${s.dotClass} ${active ? 'animate-pulse' : 'opacity-30'}`} />
                <span className={active ? s.colorClass : 'text-zinc-500'}>{s.city}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Session cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-zinc-800 border-t border-zinc-800">
        {SESSIONS.map(session => {
          const active = isSessionActive(session, utcNow.h)
          const countdown = mounted ? getSessionCountdown(session, utcNow.h, utcNow.m) : '...'
          return (
            <div key={session.id} className={`px-3 py-3 ${active ? 'bg-zinc-800/40' : ''}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${session.dotClass} ${active ? 'animate-pulse' : 'opacity-30'}`} />
                <span className={`text-[11px] font-semibold ${active ? session.colorClass : 'text-zinc-500'}`}>
                  {session.city}
                </span>
                {active && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: session.color + '25', color: session.color }}>
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-600 mb-0.5">
                {utcToART(session.utcOpen)} – {utcToART(session.utcClose)} ART
              </p>
              <p className={`text-[10px] ${active ? 'text-zinc-300' : 'text-zinc-600'}`}>{countdown}</p>
              {session.overlap && active && (
                <p className="text-[9px] text-amber-500/70 mt-0.5">⚡ Overlap {session.overlap}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Timeline 24h */}
      <div className="px-4 pb-4 pt-3 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-600 uppercase tracking-wider">24h — Hora Argentina (ART)</span>
          {activeSessions.length > 0 && (
            <div className="flex items-center gap-1 text-[10px]">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 font-medium">
                {activeSessions.length > 1
                  ? `Overlap: ${activeSessions.map(s => s.city).join(' + ')}`
                  : `${activeSessions[0].city} activa`}
              </span>
            </div>
          )}
        </div>
        <div className="relative h-5 bg-zinc-800 rounded-full overflow-hidden">
          {SESSIONS.map(session => {
            const artOpen = (session.utcOpen - 3 + 24) % 24
            const artClose = (session.utcClose - 3 + 24) % 24
            const active = isSessionActive(session, utcNow.h)
            const bg = active ? session.color : session.color + '35'

            if (artOpen < artClose) {
              return (
                <div key={session.id} className="absolute top-0 h-full rounded-sm"
                  style={{ left: `${(artOpen / 24) * 100}%`, width: `${((artClose - artOpen) / 24) * 100}%`, backgroundColor: bg }} />
              )
            }
            return (
              <div key={session.id}>
                <div className="absolute top-0 h-full rounded-sm"
                  style={{ left: `${(artOpen / 24) * 100}%`, width: `${((24 - artOpen) / 24) * 100}%`, backgroundColor: bg }} />
                <div className="absolute top-0 h-full rounded-sm"
                  style={{ left: '0%', width: `${(artClose / 24) * 100}%`, backgroundColor: bg }} />
              </div>
            )
          })}
          {mounted && (
            <div className="absolute top-0 w-0.5 h-full bg-white z-10"
              style={{ left: `${(((utcNow.h - 3 + 24) % 24 + utcNow.m / 60) / 24) * 100}%` }} />
          )}
        </div>
        <div className="flex justify-between mt-1">
          {['00', '06', '12', '18', ''].map((h, i) => (
            <span key={i} className="text-[9px] text-zinc-600">{h ? `${h}:00` : ''}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
