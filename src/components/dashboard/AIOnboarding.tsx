'use client'

/**
 * AIOnboarding — Onboarding conversacional con IA
 *
 * Flujo de 3 pasos tipo chat para configurar el dashboard personalizado.
 * Al completarlo, guarda en /api/trading-plan y redirige al dashboard.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ChevronRight, Check } from 'lucide-react'

// ─── Options ─────────────────────────────────────────────────────────────────

const MARKET_OPTIONS = [
  { id: 'ar',          emoji: '🇦🇷', label: 'Acciones AR',   desc: 'BYMA · Merval · CEDEARs' },
  { id: 'us',          emoji: '🇺🇸', label: 'Acciones US',   desc: 'NYSE · NASDAQ · S&P 500' },
  { id: 'crypto',      emoji: '₿',   label: 'Cripto',         desc: 'BTC · ETH · altcoins'    },
  { id: 'forex',       emoji: '💱',  label: 'Forex',          desc: 'EUR/USD · XAU/USD · ARS' },
  { id: 'commodities', emoji: '🛢',  label: 'Commodities',    desc: 'Petróleo · Soja · Oro'   },
]

const RISK_OPTIONS = [
  { id: 'conservador', emoji: '🛡',  label: 'Conservador', desc: 'Preservar capital. Poco riesgo.' },
  { id: 'moderado',    emoji: '⚖️',  label: 'Moderado',    desc: 'Balance rentabilidad / riesgo.'  },
  { id: 'agresivo',    emoji: '🚀',  label: 'Agresivo',    desc: 'Alta rentabilidad. Acepto vol.'  },
]

const ASSET_SUGGESTIONS = [
  'GGAL', 'MELI', 'YPF', 'PAMP', 'BMA',
  'AAPL', 'NVDA', 'TSLA', 'AMZN', 'MSFT',
  'BTC',  'ETH',  'SOL',  'GOLD', 'OIL',
]

// ─── Step types ───────────────────────────────────────────────────────────────

type Step = 'markets' | 'risk' | 'assets' | 'saving' | 'done'

interface Draft {
  markets:     string[]
  riskProfile: string
  assets:      string[]
}

// ─── Messages component ───────────────────────────────────────────────────────

function BotMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm">
        <p className="text-sm text-zinc-200 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-amber-500/20 border border-amber-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs">
        <p className="text-sm text-amber-100">{text}</p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('markets')
  const [draft, setDraft] = useState<Draft>({ markets: [], riskProfile: '', assets: [] })
  const [assetInput, setAssetInput] = useState('')
  const [error, setError] = useState('')

  const toggleMarket = (id: string) => {
    setDraft(d => ({
      ...d,
      markets: d.markets.includes(id) ? d.markets.filter(m => m !== id) : [...d.markets, id],
    }))
  }

  const toggleAsset = (sym: string) => {
    const upper = sym.toUpperCase()
    setDraft(d => ({
      ...d,
      assets: d.assets.includes(upper) ? d.assets.filter(a => a !== upper) : [...d.assets, upper],
    }))
  }

  const addAssetFromInput = () => {
    const sym = assetInput.trim().toUpperCase()
    if (sym && !draft.assets.includes(sym)) {
      setDraft(d => ({ ...d, assets: [...d.assets, sym] }))
    }
    setAssetInput('')
  }

  const handleSave = async () => {
    setStep('saving')
    try {
      const res = await fetch('/api/trading-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markets:     draft.markets,
          assets:      draft.assets,
          riskProfile: draft.riskProfile,
          infoNeeds:   ['briefings', 'noticias'],
        }),
      })
      if (!res.ok) throw new Error('Error al guardar')
      setStep('done')
      setTimeout(() => router.refresh(), 1200)
    } catch {
      setError('Error al guardar. Intentá de nuevo.')
      setStep('assets')
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {['markets', 'risk', 'assets'].map((s, i) => {
          const steps = ['markets', 'risk', 'assets']
          const idx   = steps.indexOf(step)
          const done  = i < idx || step === 'saving' || step === 'done'
          const curr  = s === step
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                done ? 'bg-amber-500 text-black' :
                curr ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400' :
                'bg-zinc-800 border border-zinc-700 text-zinc-600'
              }`}>
                {done ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-px ${i < idx ? 'bg-amber-500' : 'bg-zinc-700'}`} />}
            </div>
          )
        })}
      </div>

      {/* Chat messages */}
      <div className="space-y-4 mb-6">
        <BotMessage text="¡Hola! Soy INbot, tu asistente financiero 🎯 Te haré 3 preguntas para personalizar tu dashboard. ¿Arrancamos?" />

        <BotMessage text="1/3 — ¿En qué mercados operás o te interesa operar? (podés elegir varios)" />

        {step !== 'markets' && draft.markets.length > 0 && (
          <UserMessage text={draft.markets.map(m => MARKET_OPTIONS.find(o => o.id === m)?.label).join(', ')} />
        )}

        {['risk', 'assets', 'saving', 'done'].includes(step) && (
          <>
            <BotMessage text="2/3 — ¿Cuál es tu perfil de riesgo?" />
            {step !== 'risk' && draft.riskProfile && (
              <UserMessage text={RISK_OPTIONS.find(o => o.id === draft.riskProfile)?.label ?? draft.riskProfile} />
            )}
          </>
        )}

        {['assets', 'saving', 'done'].includes(step) && (
          <>
            <BotMessage text="3/3 — ¿Cuáles son tus activos favoritos? Seleccioná o escribí tus tickers." />
            {step !== 'assets' && draft.assets.length > 0 && (
              <UserMessage text={draft.assets.join(', ')} />
            )}
          </>
        )}

        {(step === 'saving' || step === 'done') && (
          <BotMessage text={
            step === 'done'
              ? '¡Perfecto! Tu dashboard personalizado está listo. Cargando...'
              : 'Generando tu dashboard personalizado...'
          } />
        )}
      </div>

      {/* Input area */}
      {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}

      {step === 'markets' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {MARKET_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggleMarket(opt.id)}
                className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  draft.markets.includes(opt.id)
                    ? 'bg-amber-500/10 border-amber-500/50 text-white'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                <span className="text-lg leading-none mt-0.5">{opt.emoji}</span>
                <div>
                  <p className="text-xs font-semibold">{opt.label}</p>
                  <p className="text-[10px] text-zinc-500">{opt.desc}</p>
                </div>
                {draft.markets.includes(opt.id) && (
                  <Check className="w-3.5 h-3.5 text-amber-400 ml-auto flex-shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => draft.markets.length > 0 && setStep('risk')}
            disabled={draft.markets.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 'risk' && (
        <div className="space-y-3">
          <div className="space-y-2">
            {RISK_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  setDraft(d => ({ ...d, riskProfile: opt.id }))
                  setTimeout(() => setStep('assets'), 400)
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  draft.riskProfile === opt.id
                    ? 'bg-amber-500/10 border-amber-500/50'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{opt.label}</p>
                  <p className="text-xs text-zinc-400">{opt.desc}</p>
                </div>
                {draft.riskProfile === opt.id && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'assets' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ASSET_SUGGESTIONS.map(sym => (
              <button
                key={sym}
                onClick={() => toggleAsset(sym)}
                className={`text-xs px-2.5 py-1 rounded-full border font-mono transition-all ${
                  draft.assets.includes(sym)
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={assetInput}
              onChange={e => setAssetInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAssetFromInput()}
              placeholder="Agregar ticker (ej: GGAL, MSFT...)"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50"
            />
            <button
              onClick={addAssetFromInput}
              className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors"
            >
              +
            </button>
          </div>
          {draft.assets.length > 0 && (
            <p className="text-[11px] text-zinc-500">Seleccionados: {draft.assets.join(', ')}</p>
          )}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Crear mi dashboard →
          </button>
        </div>
      )}

      {(step === 'saving' || step === 'done') && (
        <div className="text-center py-4">
          <div className="w-8 h-8 border-2 border-amber-500/40 border-t-amber-500 rounded-full animate-spin mx-auto" />
        </div>
      )}
    </div>
  )
}
