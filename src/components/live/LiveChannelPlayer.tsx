'use client'

import { useState, useEffect, useRef } from 'react'
import { Radio, Tv2, ExternalLink, Lock, AlertCircle, RefreshCw } from 'lucide-react'

// ─── Canales ───────────────────────────────────────────────────────────────────
// IMPORTANT: youtube_id values EXPIRE when a live stream resets.
// Source of truth should be Supabase table `live_channels` (see LIVE_TV_HOME_SPEC.md).
// These are fallback defaults only.
const CHANNELS = [
  {
    id: 'bloomberg',
    label: 'Bloomberg',
    description: 'Mercados financieros globales 24/7',
    color: 'text-blue-400',
    dot: 'bg-blue-400',
    youtubeId: 'dp8PhLsUcFE',       // ← update via Supabase, expires on stream reset
    youtubeChannelUrl: 'https://www.youtube.com/@BloombergTelevision/live',
    live: true,
  },
  {
    id: 'cnbc',
    label: 'CNBC',
    description: 'Noticias económicas y de negocios',
    color: 'text-blue-300',
    dot: 'bg-blue-300',
    youtubeId: '16aqpuB0S9M',
    youtubeChannelUrl: 'https://www.youtube.com/@CNBCtelevision/live',
    live: true,
  },
  {
    id: 'dw',
    label: 'DW Español',
    description: 'Noticias internacionales en español',
    color: 'text-red-400',
    dot: 'bg-red-400',
    youtubeId: 'I2NRFuXvCak',
    youtubeChannelUrl: 'https://www.youtube.com/@DWEspanol/live',
    live: true,
  },
  {
    id: 'ln',
    label: 'LN+',
    description: 'La Nación+ · Actualidad argentina',
    color: 'text-zinc-300',
    dot: 'bg-zinc-300',
    youtubeId: 'N_dUrRHQKJU',
    youtubeChannelUrl: 'https://www.youtube.com/@lnmas/live',
    live: true,
  },
  {
    id: 'neura',
    label: 'Neura Media',
    description: 'Análisis político y económico',
    color: 'text-purple-400',
    dot: 'bg-purple-400',
    youtubeId: 'h9YDm7VTpfk',
    youtubeChannelUrl: 'https://www.youtube.com/@NeuraMedia/live',
    live: true,
  },
  {
    id: 'inbig',
    label: 'INBIG',
    description: 'Canal propio · Próximamente',
    color: 'text-amber-400',
    dot: 'bg-amber-400',
    youtubeId: null,
    youtubeChannelUrl: 'https://inbigfinanzas.com',
    live: false,
  },
]

type ChannelStatus = 'loading' | 'playing' | 'error' | 'offline'

// ─── Reloj en vivo ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums font-mono text-xs text-zinc-400">{time}</span>
}

// ─── Fallback card (cuando el iframe falla o el canal está offline) ──────────────
function ChannelFallback({
  channel,
  reason,
  onRetry,
}: {
  channel: typeof CHANNELS[0]
  reason: 'offline' | 'error' | 'loading'
  onRetry?: () => void
}) {
  if (reason === 'loading') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs">Conectando con {channel.label}...</p>
        </div>
      </div>
    )
  }

  if (channel.id === 'inbig') {
    // Special card for own channel
    return (
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
          <p className="text-zinc-400 text-sm">{channel.description}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 border border-zinc-800 rounded-lg px-3 py-2">
            <Lock className="w-3 h-3" />
            Transmisión exclusiva en desarrollo
          </div>
        </div>
      </div>
    )
  }

  // Generic fallback for broken/offline streams
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950">
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <AlertCircle className="w-8 h-8 text-zinc-600" />
        <div>
          <p className={`text-base font-semibold mb-0.5 ${channel.color}`}>{channel.label}</p>
          <p className="text-zinc-500 text-xs">{channel.description}</p>
        </div>
        <p className="text-zinc-600 text-xs">
          {reason === 'error'
            ? 'Transmisión no disponible en este momento'
            : 'Canal sin stream activo'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </button>
          )}
          <a
            href={channel.youtubeChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg transition-all ${
              channel.color
            } border-current opacity-70 hover:opacity-100`}
          >
            <ExternalLink className="w-3 h-3" />
            Abrir {channel.label} en YouTube
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Player con manejo de estados ──────────────────────────────────────────────
function ChannelPlayer({ channel }: { channel: typeof CHANNELS[0] }) {
  const [status, setStatus] = useState<ChannelStatus>(
    channel.youtubeId ? 'loading' : 'offline'
  )
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [embedKey, setEmbedKey] = useState(0) // force re-mount on retry

  useEffect(() => {
    if (!channel.youtubeId) {
      setStatus('offline')
      return
    }
    setStatus('loading')
    // Timeout: if no load event in 10s → show fallback
    timeoutRef.current = setTimeout(() => {
      setStatus(prev => (prev === 'loading' ? 'error' : prev))
    }, 10_000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [channel.youtubeId, embedKey])

  function handleLoad() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('playing')
  }

  function handleError() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('error')
  }

  function handleRetry() {
    setEmbedKey(k => k + 1)
  }

  // Never render a broken iframe — show fallback instead
  if (!channel.youtubeId || status === 'offline') {
    return <ChannelFallback channel={channel} reason="offline" />
  }
  if (status === 'error') {
    return <ChannelFallback channel={channel} reason="error" onRetry={handleRetry} />
  }

  return (
    <>
      {status === 'loading' && (
        <ChannelFallback channel={channel} reason="loading" />
      )}
      <iframe
        key={embedKey + '-' + channel.youtubeId}
        src={`https://www.youtube.com/embed/${channel.youtubeId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full h-full transition-opacity duration-500 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  )
}

// ─── Componente principal ───────────────────────────────────────────────────────
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
        <div className="flex items-center gap-2">
          <Tv2 className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Canal en Vivo
          </span>
          {channel.live && (
            <span
              className={`flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase ${
                pulse ? 'opacity-100' : 'opacity-40'
              } transition-opacity duration-500`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              EN VIVO
            </span>
          )}
        </div>
        <LiveClock />
      </div>

      {/* Channel tabs */}
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
              <span
                className={`w-1.5 h-1.5 rounded-full ${ch.dot} ${
                  active === ch.id ? 'opacity-100' : 'opacity-40'
                }`}
              />
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

      {/* Video area */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        <ChannelPlayer key={active} channel={channel} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 bg-zinc-950/50">
        <span className="text-[10px] text-zinc-600">
          {channel.live ? `Transmitiendo: ${channel.label}` : 'Canal INBIG en desarrollo'}
        </span>
        {channel.youtubeChannelUrl && channel.id !== 'inbig' && (
          <a
            href={channel.youtubeChannelUrl}
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
