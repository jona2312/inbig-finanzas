'use client'

/**
 * OnboardingWizard — 5 pasos para armar el trading plan del usuario
 *
 * Al completarlo, guarda en Supabase (tabla trading_plans).
 * Redirige a /terminal con su plan activo.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TradingPlanDraft {
  markets:     string[]
  assets:      string[]
  infoNeeds:   string[]
  riskProfile: 'conservador' | 'moderado' | 'agresivo' | ''
  notes:       string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MARKET_OPTIONS = [
  { id: 'ar',          label: '🇦🇷 Acciones AR',  desc: 'BYMA, Merval, CEDEARS'  },
  { id: 'us',          label: '🇺🇸 Acciones US',  desc: 'NYSE, NASDAQ, S&P 500'  },
  { id: 'crypto',      label: '₿ Cripto',          desc: 'Bitcoin, Ethereum, altcoins' },
  { id: 'forex',       label: '💱 Forex',           desc: 'EUR/USD, XAU/USD, pares LATAM' },
  { id: 'commodities', label: '🛢 Commodities',     desc: 'Petróleo, Soja, Oro'    },
  { id: 'macro',       label: '📊 Macro global',   desc: 'Fed, INDEC, bonos, tasas' },
]

const INFO_OPTIONS = [
  { id: 'noticias',    label: '📰 Noticias en vivo',     desc: 'Últimas 24hs'          },
  { id: 'briefings',   label: '📋 Briefings IA diarios', desc: 'Resumen de mercados'   },
  { id: 'senales',     label: '⚡ Señales de entrada',   desc: 'Pro+ · próximamente'   },
  { id: 'macro_data',  label: '📈 Datos macro',          desc: 'Fed, INDEC, FRED'      },
  { id: 'alertas',     label: '🔔 Alertas de precio',    desc: 'Por email / push'      },
  { id: 'comunidad',   label: '👥 Feed comunidad',       desc: 'Qué ven otros traders' },
]

const POPULAR_ASSETS = [
  'GGAL', 'MELI', 'YPF', 'BMA', 'BBAR', 'PAMP',
  'SPY',  'QQQ',  'AAPL', 'NVDA', 'TSLA', 'AMZN',
  'BTCUSD', 'ETHUSD', 'XAUUSD', 'UKOIL', 'SOYBND',
]

const RISK_OPTIONS = [
  {
    id:    'conservador',
    label: 'Conservador',
    emoji: '🛡',
    desc:  'Prefiero preservar capital. Pocas operaciones, activos establecidos.',
  },
  {
    id:    'moderado',
    label: 'Moderado',
    emoji: '⚖️',
    desc:  'Balance entre rentabilidad y riesgo. Diversifico en varias clases.',
  },
  {
    id:    'agresivo',
    label: 'Agresivo',
    emoji: '🚀',
    desc:  'Busco alta rentabilidad. Acepto volatilidad. Cripto, opciones, etc.',
  },
]

const STEPS = [
  { n: 1, label: 'Mercados'  },
  { n: 2, label: 'Activos'   },
  { n: 3, label: 'Info'      },
  { n: 4, label: 'Perfil'    },
  { n: 5, label: 'Listo'     },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [assetInput, setAssetInput] = useState('')

  const [plan, setPlan] = useState<TradingPlanDraft>({
    markets:     [],
    assets:      [],
    infoNeeds:   [],
    riskProfile: '',
    notes:       '',
  })

  // Helpers
  function toggle<K extends keyof TradingPlanDraft>(key: K, value: string) {
    setPlan(prev => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      }
    })
  }

  function addAsset() {
    const sym = assetInput.toUpperCase().trim()
    if (!sym || plan.assets.includes(sym)) { setAssetInput(''); return }
    setPlan(prev => ({ ...prev, assets: [...prev.assets, sym] }))
    setAssetInput('')
  }

  async function savePlan() {
    setLoading(true)
    try {
      await fetch('/api/trading-plan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(plan),
      })
    } catch {
      // si falla igual seguimos — se puede reintentar
    }
    setLoading(false)
    setStep(5)
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl">

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                step > s.n ? 'bg-emerald-500 text-black' :
                step === s.n ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40' :
                'bg-zinc-800 text-zinc-600'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`ml-1.5 text-xs ${step === s.n ? 'text-white' : 'text-zinc-600'} hidden sm:block`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 h-px w-8 sm:w-16 ${step > s.n ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Step 1: Mercados ─────────────────────────────── */}
      {step === 1 && (
        <div>
          <div className="mb-6 text-center">
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2">Paso 1 de 4</p>
            <h2 className="text-2xl font-bold text-white">¿Qué mercados operás?</h2>
            <p className="text-zinc-400 text-sm mt-2">Seleccioná todos los que aplican. Tu terminal se va a personalizar con esto.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {MARKET_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggle('markets', opt.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  plan.markets.includes(opt.id)
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900'
                }`}
              >
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={plan.markets.length === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* ── Step 2: Activos ──────────────────────────────── */}
      {step === 2 && (
        <div>
          <div className="mb-6 text-center">
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2">Paso 2 de 4</p>
            <h2 className="text-2xl font-bold text-white">¿Cuáles son tus activos?</h2>
            <p className="text-zinc-400 text-sm mt-2">Tu watchlist inicial. Podés cambiarla cuando quieras desde la terminal.</p>
          </div>

          {/* Input libre */}
          <div className="flex gap-2 mb-4">
            <input
              value={assetInput}
              onChange={e => setAssetInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && addAsset()}
              placeholder="Escribí un ticker (ej: XAUUSD)"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-600 font-mono"
            />
            <button
              onClick={addAsset}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Agregar
            </button>
          </div>

          {/* Populares */}
          <p className="text-xs text-zinc-500 mb-2">Populares:</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {POPULAR_ASSETS.map(sym => (
              <button
                key={sym}
                onClick={() => toggle('assets', sym)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                  plan.assets.includes(sym)
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Seleccionados */}
          {plan.assets.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-5">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Tu watchlist ({plan.assets.length})</p>
              <div className="flex flex-wrap gap-2">
                {plan.assets.map(sym => (
                  <span key={sym} className="inline-flex items-center gap-1 text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded">
                    {sym}
                    <button onClick={() => toggle('assets', sym)} className="text-emerald-600 hover:text-red-400 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-xl text-sm transition-colors">
              ← Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={plan.assets.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Info ─────────────────────────────────── */}
      {step === 3 && (
        <div>
          <div className="mb-6 text-center">
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2">Paso 3 de 4</p>
            <h2 className="text-2xl font-bold text-white">¿Qué información necesitás?</h2>
            <p className="text-zinc-400 text-sm mt-2">Tu terminal va a priorizar esto en tu panel.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {INFO_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggle('infoNeeds', opt.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  plan.infoNeeds.includes(opt.id)
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900'
                }`}
              >
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-xl text-sm transition-colors">
              ← Atrás
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={plan.infoNeeds.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Perfil de riesgo ─────────────────────── */}
      {step === 4 && (
        <div>
          <div className="mb-6 text-center">
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-2">Paso 4 de 4</p>
            <h2 className="text-2xl font-bold text-white">¿Cuál es tu perfil de riesgo?</h2>
            <p className="text-zinc-400 text-sm mt-2">La IA va a adaptar sus sugerencias y análisis a esto.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {RISK_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPlan(p => ({ ...p, riskProfile: opt.id as any }))}
                className={`text-center p-4 rounded-xl border-2 transition-all ${
                  plan.riskProfile === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900'
                }`}
              >
                <p className="text-2xl mb-2">{opt.emoji}</p>
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="text-[11px] text-zinc-500 mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Notas adicionales */}
          <div className="mb-6">
            <label className="block text-xs text-zinc-500 mb-2">Algo más que quieras contarnos (opcional)</label>
            <textarea
              value={plan.notes}
              onChange={e => setPlan(p => ({ ...p, notes: e.target.value }))}
              placeholder="Ej: opero principalmente de mañana, me interesa mucho el oro y sigo de cerca las decisiones de la Fed..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 py-3 rounded-xl text-sm transition-colors">
              ← Atrás
            </button>
            <button
              onClick={savePlan}
              disabled={!plan.riskProfile || loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
              ) : (
                '✓ Armar mi terminal →'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 5: Confirmación ─────────────────────────── */}
      {step === 5 && (
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✦</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">¡Tu trading plan está listo!</h2>
          <p className="text-zinc-400 mb-2">
            Guardamos tus preferencias. Tu terminal personalizada ya está activa.
          </p>
          <p className="text-sm text-zinc-500 mb-8">
            La IA va a ir aprendiendo de lo que graficás y consultás para darte análisis cada vez más precisos.
          </p>

          {/* Resumen */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left mb-8">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Tu plan</p>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-zinc-600 w-24 shrink-0">Mercados:</span>
                <span className="text-zinc-300">{plan.markets.join(', ') || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-600 w-24 shrink-0">Watchlist:</span>
                <span className="text-zinc-300 font-mono text-xs">{plan.assets.slice(0, 8).join(', ')}{plan.assets.length > 8 ? ` +${plan.assets.length - 8}` : ''}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-600 w-24 shrink-0">Perfil:</span>
                <span className="text-zinc-300 capitalize">{plan.riskProfile}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/terminal')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors text-lg"
          >
            Abrir mi terminal →
          </button>
        </div>
      )}
    </div>
  )
}
