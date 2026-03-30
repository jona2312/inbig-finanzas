'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Channel {
  channel_key: string
  label: string
  youtube_channel_url: string | null
  current_video_id: string | null
  embed_allowed: boolean
  status: 'live' | 'offline' | 'unknown'
  description: string | null
  logo_url: string | null
}

// ─── Fallback defaults (last-resort if Supabase is unreachable) ───────────────

const DEFAULT_CHANNELS: Channel[] = [
  {
    channel_key: 'cnn_espanol',
    label: 'CNN Español',
    youtube_channel_url: 'https://www.youtube.com/@CNNenEspanol',
    current_video_id: null,
    embed_allowed: false,
    status: 'unknown',
    description: 'Noticias económicas en español',
    logo_url: null,
  },
  {
    channel_key: 'bloomberg',
    label: 'Bloomberg',
    youtube_channel_url: 'https://www.youtube.com/@Bloomberg',
    current_video_id: null,
    embed_allowed: false,
    status: 'unknown',
    description: 'Mercados globales en tiempo real',
    logo_url: null,
  },
  {
    channel_key: 'infobae',
    label: 'Infobae',
    youtube_channel_url: 'https://www.youtube.com/@infobae',
    current_video_id: null,
    embed_allowed: false,
    status: 'unknown',
    description: 'Economía y finanzas Argentina',
    logo_url: null,
  },
]

// ─── YouTube IFrame API loader (singleton) ────────────────────────────────────

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  destroy: () => void
}

let _ytApiState: 'idle' | 'loading' | 'ready' = 'idle'
const _ytCallbacks: Array<() => void> = []

function loadYouTubeAPI(cb: () => void) {
  if (typeof window === 'undefined') return
  if (_ytApiState === 'ready' && window.YT?.Player) { cb(); return }
  _ytCallbacks.push(cb)
  if (_ytApiState === 'loading') return
  _ytApiState = 'loading'
  const script = document.createElement('script')
  script.src = 'https://www.youtube.com/iframe_api'
  script.async = true
  document.head.appendChild(script)
  window.onYouTubeIframeAPIReady = () => {
    _ytApiState = 'ready'
    _ytCallbacks.splice(0).forEach((fn) => fn())
  }
}

// ─── ChannelFallback ──────────────────────────────────────────────────────────

function ChannelFallback({ channel }: { channel: Channel }) {
  const statusLabel =
    channel.status === 'offline'
      ? 'Canal offline'
      : channel.status === 'live'
      ? 'No embebible — disponible en YouTube'
      : 'No disponible para embed'

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-8 min-h-[200px] bg-zinc-900">
      <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-2xl select-none">
        {channel.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={channel.logo_url} alt={channel.label} className="w-10 h-10 object-contain rounded-full" />
        ) : (
          '📺'
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-zinc-200">{channel.label}</p>
        {channel.description && (
          <p className="text-xs text-zinc-500 leading-relaxed">{channel.description}</p>
        )}
        <p className="text-xs text-zinc-600 pt-1">{statusLabel}</p>
      </div>

      {channel.youtube_channel_url && (
        <a
          href={channel.youtube_channel_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 transition-colors text-xs font-semibold text-white"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 7a2.5 2.5 0 0 0-1.76-1.77C16.25 5 12 5 12 5s-4.25 0-5.83.27A2.5 2.5 0 0 0 4.41 7 26 26 0 0 0 4 12a26 26 0 0 0 .41 5 2.5 2.5 0 0 0 1.76 1.77C7.75 19 12 19 12 19s4.25 0 5.83-.27A2.5 2.5 0 0 0 19.59 17 26 26 0 0 0 20 12a26 26 0 0 0-.41-5zM10 15V9l5.2 3-5.2 3z" />
          </svg>
          Abrir en YouTube
        </a>
      )}
    </div>
  )
}

// ─── YouTubePlayer — uses IFrame API, NEVER trusts onLoad ─────────────────────

type EmbedStatus = 'loading' | 'playing' | 'error'

function YouTubePlayer({
  channel,
  onError,
}: {
  channel: Channel
  onError: () => void
}) {
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const [embedStatus, setEmbedStatus] = useState<EmbedStatus>('loading')
  const destroyed = useRef(false)

  const handleError = useCallback(() => {
    if (!destroyed.current) {
      setEmbedStatus('error')
      onError()
    }
  }, [onError])

  useEffect(() => {
    destroyed.current = false

    if (!channel.current_video_id || !channel.embed_allowed) {
      handleError()
      return
    }

    const videoId = channel.current_video_id

    loadYouTubeAPI(() => {
      if (destroyed.current || !mountRef.current || !window.YT?.Player) return

      playerRef.current = new window.YT.Player(mountRef.current, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: () => {
            if (!destroyed.current) setEmbedStatus('playing')
          },
          onStateChange: (evt: { data: number }) => {
            if (evt.data === 0 && !destroyed.current) {
              setEmbedStatus('error')
              onError()
            }
          },
          onError: (evt: { data: number }) => {
            // 2=invalid id, 5=html5 error, 100=not found, 101/150=embed blocked
            console.warn('[LiveChannelPlayer] YT error', evt.data, 'for', channel.channel_key)
            handleError()
          },
        },
      })
    })

    return () => {
      destroyed.current = true
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch { /* ignore */ }
        playerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.current_video_id, channel.embed_allowed, channel.channel_key])

  if (!channel.current_video_id || !channel.embed_allowed) {
    return <ChannelFallback channel={channel} />
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
      {embedStatus === 'loading' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {embedStatus === 'error' && (
        <div className="absolute inset-0 z-20">
          <ChannelFallback channel={channel} />
        </div>
      )}
      <div
        ref={mountRef}
        className="w-full h-full"
        style={{ visibility: embedStatus === 'error' ? 'hidden' : 'visible' }}
      />
    </div>
  )
}

// ─── LiveChannelPlayer (exported) ─────────────────────────────────────────────

export function LiveChannelPlayer() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeKey, setActiveKey] = useState<string>('')
  const [fallbackSet, setFallbackSet] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChannels() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('live_channels')
          .select('channel_key, label, youtube_channel_url, current_video_id, embed_allowed, status, description, logo_url')
          .order('channel_key')

        if (error || !data || data.length === 0) {
          setChannels(DEFAULT_CHANNELS)
          setActiveKey(DEFAULT_CHANNELS[0].channel_key)
        } else {
          setChannels(data as Channel[])
          const liveChannel = data.find((c) => c.status === 'live')
          setActiveKey((liveChannel ?? data[0]).channel_key)
        }
      } catch (err) {
        console.error('[LiveChannelPlayer] Supabase fetch failed:', err)
        setChannels(DEFAULT_CHANNELS)
        setActiveKey(DEFAULT_CHANNELS[0].channel_key)
      } finally {
        setLoading(false)
      }
    }

    fetchChannels()
  }, [])

  const activeChannel = channels.find((c) => c.channel_key === activeKey)

  const handleChannelError = useCallback((key: string) => {
    setFallbackSet((prev) => new Set([...prev, key]))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-zinc-900 rounded-b-xl">
        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!channels.length || !activeChannel) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-zinc-900 rounded-b-xl text-xs text-zinc-600">
        Sin canales disponibles
      </div>
    )
  }

  const showFallback =
    !activeChannel.embed_allowed ||
    !activeChannel.current_video_id ||
    fallbackSet.has(activeChannel.channel_key)

  return (
    <div className="bg-zinc-900 rounded-b-xl overflow-hidden">
      {channels.length > 1 && (
        <div className="flex overflow-x-auto border-b border-zinc-800 bg-zinc-950 scrollbar-none">
          {channels.map((ch) => {
            const isActive = activeKey === ch.channel_key
            const isLive = ch.status === 'live'
            return (
              <button
                key={ch.channel_key}
                onClick={() => setActiveKey(ch.channel_key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'text-white border-red-500 bg-zinc-900'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                {isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                )}
                {ch.label}
              </button>
            )
          })}
        </div>
      )}

      {showFallback ? (
        <ChannelFallback channel={activeChannel} />
      ) : (
        <YouTubePlayer
          key={activeChannel.channel_key}
          channel={activeChannel}
          onError={() => handleChannelError(activeChannel.channel_key)}
        />
      )}
    </div>
  )
}

export default LiveChannelPlayer
