'use client'

import { useState, useEffect } from 'react'
import { Radio, Tv2, ExternalLink, Lock } from 'lucide-react'

// ─── Canales ───────────────────────────────────────────────────────────────
const CHANNELS = [
  {
    id: 'bloomberg',
    label: 'Bloomberg',
    color: 'text-blue-400',
    dot: 'bg-blue-400',
    youtubeId: 'dp8PhLsUcFE',
    live: true,
  },
  {
    id: 'cnbc',
    label: 'CNBC',
    color: 'text-blue-300',
    dot: 'bg-blue-300',
    youtubeId: '16aqpuB0S9M',
    live: true,
  },
  {
    id: 'dw',
    label: 'DW Español',
    color: 'text-red-400',
    dot: 'bg-red-400',
    youtubeId: 'I2NRFuXvCak',
    live: true,
  },
  {
    id: 'ln',
    label: 'LN+',
    color: 'text-zinc-300',
    dot: 'bg-zinc-300',
    youtubeId: 'N_dUrRHQKJU',
    live: true,
  },
  {
    id: 'neura',
    label: 'Neura Media',
    color: 'text-purple-400',
    dot: 'bg-purple-400',
    youtubeId: 'h9YDm7VTpfk',
    live: true,
  },
  {
    id: 'inbig',
    label: 'INBIG',
    color: 'text-amber-400',
    dot: 'bg-amber-400',
    youtubeId: null,
    live: false,
  },
]

function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums font-mono text-xs text-zinc-400">{time}</span>
}

export function LiveChannelPlayer() {
  const [active, setActive] = useState('bloomberg')
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1200)
    return () => clearInterval(id)
  }, [])

  const channel = CHANNELS.find(c => c.id === active)!

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <Tv2 className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Canal en Vivo</span>
          {channel.live && (
            <span className={`flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase ${pulse ? 'opacity-100' : 'opacity-40'} transition-opacity duration-500`}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              EN VIVO
            </span>
          )}
        </div>
        <LiveClock />
      </div>

      <div className="flex items-center gap-0 overflow-x-auto border-b border-zinc-800 bg-zinc-950/50">
        {CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActive(ch.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold shrink-0 border-b-2 transition-all ${
              active === ch.id
                ? `border-current ${ch.color} bg-zinc-800/40`
                : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20'
            }`}
          >
            {ch.live && (
              <span className={`w-1.5 h-1.5 rounded-full ${ch.dot} ${active === ch.id ? 'opacity-100' : 'opacity-40'}`} />
            )}
            {ch.label}
            {ch.id === 'inbig' && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-700/40 px-1 py-0.5 rounded-full">
                PRONTO
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        {channel.youtubeId ? (
          <iframe
            key={channel.youtubeId}
            src={`https://www.youtube.com/embed/${channel.youtubeId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950">
            <div className="absolute inset-0 bg-amber-500/5 blur-2xl pointer-events-none" />
            <div className="relative flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 mb-1">
                <Radio className="w-6 h-6 text-amber-400 animate-pulse" />
                <span className="text-3xl font-black tracking-tight">
                  <span className="text-white">IN</span>
                  <span className="text-amber-400">BIG</span>
                </span>
              </div>
              <p className="text-zinc-400 text-sm">Canal propio · Próximamente</p>
              <p className="text-zinc-600 text-xs">inbigfinanzas.com</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 border border-zinc-800 rounded-lg px-3 py-2">
                <Lock className="w-3 h-3" />
                Transmisión exclusiva en desarrollo
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-950/50">
        <span className="text-[10px] text-zinc-600">
          {channel.live ? `Transmitiendo: ${channel.label}` : 'Canal INBIG en desarrollo'}
        </span>
        {channel.youtubeId && (
          <a
            href={`https://www.youtube.com/watch?v=${channel.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Abrir en YouTube
          </a>
        )}
      </div>
    </div>
  )
}
