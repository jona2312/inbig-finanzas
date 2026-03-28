'use client'

/**
 * CopilotBox — Caja del Copiloto Financiero IA
 *
 * Componente reutilizable para /al-dia, /noticias, /mercados, /crypto.
 * Llama a POST /api/copilot y muestra la respuesta en tiempo real.
 * Incluye tier gate: fuentes solo para Pro, CTA upgrade para free.
 */

import { useState } from 'react'
import { Sparkles, Send, X, ExternalLink, Lock, RotateCcw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type CopilotContext = 'noticias' | 'mercados' | 'crypto' | 'divisas' | 'general'

interface CopilotBoxProps {
  context?: CopilotContext
  placeholder?: string
  suggestions?: string[]
  compact?: boolean
}

interface CopilotResponse {
  answer: string
  sources: string[]
  tier_limited: boolean
  model: string
}

// ─── Sugerencias por defecto según contexto ────────────────────────────────

const DEFAULT_SUGGESTIONS: Record<CopilotContext, string[]> = {
  noticias: [
    '¿Qué pasó hoy en los mercados?',
    '¿Cómo afecta la Fed a Argentina?',
    'Resumen macro de la semana',
  ],
  mercados: [
    '¿Por qué cae el Merval?',
    'CEDEARs recomendados hoy',
    'Situación del S&P 500',
  ],
  crypto: [
    '¿Por qué sube Bitcoin?',
    'Ethereum vs Solana en 2025',
    'Crypto y el dólar blue',
  ],
  divisas: [
    '¿A cuánto está el dólar blue hoy?',
    'Diferencia MEP vs CCL',
    'Brecha cambiaria actual',
  ],
  general: [
    '¿Cómo proteger mis ahorros?',
    'CEDEARs vs bonos vs plazos fijos',
    'Situación económica de Argentina',
  ],
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CopilotBox({
  context = 'general',
  placeholder,
  suggestions,
  compact = false,
}: CopilotBoxProps) {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<CopilotResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [asked, setAsked] = useState(false)

  const activeSuggestions = suggestions ?? DEFAULT_SUGGESTIONS[context]

  const handleSubmit = async (q?: string) => {
    const finalQuery = (q ?? query).trim()
    if (!finalQuery || loading) return

    setLoading(true)
    setError(null)
    setResponse(null)
    setAsked(true)

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery, context }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al consultar el copiloto.')
        return
      }

      const data: CopilotResponse = await res.json()
      setResponse(data)
    } catch {
      setError('Sin conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (s: string) => {
    setQuery(s)
    handleSubmit(s)
  }

  const handleReset = () => {
    setQuery('')
    setResponse(null)
    setError(null)
    setAsked(false)
  }

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden ${compact ? 'p-4' : 'p-5'}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Copiloto Financiero</p>
            {!compact && (
              <p className="text-xs text-zinc-500 mt-0.5">IA con fuentes en tiempo real</p>
            )}
          </div>
        </div>
        {asked && (
          <button
            onClick={handleReset}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Nueva pregunta"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Input */}
      {!asked && (
        <>
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus-within:border-emerald-500/50 transition-colors">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={placeholder ?? 'Preguntá sobre mercados, noticias, crypto...'}
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
              maxLength={500}
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleSubmit()}
              disabled={!query.trim()}
              className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {activeSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 hover:text-emerald-400 border border-zinc-700 rounded-full px-3 py-1 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
            </div>
            <span className="text-xs text-zinc-400">Consultando fuentes en tiempo real...</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-zinc-800 rounded animate-pulse w-full" />
            <div className="h-3 bg-zinc-800 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-zinc-800 rounded animate-pulse w-4/6" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={handleReset} className="text-xs text-zinc-400 hover:text-zinc-200 mt-1 underline">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Response */}
      {response && !loading && (
        <div className="mt-2 space-y-4">
          {/* Query recap */}
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <span className="font-medium text-zinc-400">Pregunta:</span>
            <span className="italic">{query || '...'}</span>
          </div>

          {/* Answer */}
          <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {response.answer}
          </div>

          {/* Sources — solo Pro */}
          {response.sources && response.sources.length > 0 && (
            <div className="border-t border-zinc-800 pt-3">
              <p className="text-xs text-zinc-500 mb-2 font-medium">Fuentes</p>
              <div className="space-y-1">
                {response.sources.slice(0, 4).map((url, i) => {
                  let domain = url
                  try { domain = new URL(url).hostname.replace('www.', '') } catch { /* */ }
                  return (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{domain}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tier limited — upgrade CTA */}
          {response.tier_limited && (
            <div className="border-t border-zinc-800 pt-3 flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-zinc-400">
                  Suscribite a <span className="text-emerald-400 font-semibold">IN Pro</span> para ver fuentes en tiempo real, respuestas completas y acceso a{' '}
                  <span className="text-purple-400 font-semibold">sonar-pro</span>.
                </p>
                <a
                  href="/planes"
                  className="inline-block mt-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline"
                >
                  Ver planes →
                </a>
              </div>
            </div>
          )}

          {/* Model badge */}
          <div className="text-right">
            <span className="text-[10px] text-zinc-600">
              {response.model === 'sonar-pro' ? '⚡ sonar-pro' : '◦ sonar'} · Perplexity
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
