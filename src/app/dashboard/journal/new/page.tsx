'use client'

/**
 * /dashboard/journal/new
 * Formulario para registrar un nuevo trade en el diario.
 * Flujo: Info básica → Psicología (antes) → Review + guardar
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'trade' | 'psico' | 'review'

interface FormData {
  // Trade
  symbol:       string
  direction:    'long' | 'short'
  asset_type:   string
  timeframe:    string
  strategy:     string
  entry_price:  string
  stop_loss:    string
  take_profit:  string
  lot_size:     string
  session:      string
  // Psicología antes
  emotion_before: string
  entry_reason:   string
  followed_plan:  boolean | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOTIONS = [
  { value: 'calm',       label: 'Calmo',       emoji: '😌' },
  { value: 'focused',    label: 'Enfocado',    emoji: '🎯' },
  { value: 'confident',  label: 'Confiado',    emoji: '💪' },
  { value: 'excited',    label: 'Eufórico',    emoji: '🔥' },
  { value: 'anxious',    label: 'Ansioso',     emoji: '😰' },
  { value: 'fear',       label: 'Con miedo',   emoji: '😨' },
  { value: 'frustrated', label: 'Frustrado',   emoji: '😤' },
  { value: 'revenge',    label: 'Vengativo',   emoji: '💢' },
]

const TIMEFRAMES = ['1m','5m','15m','30m','1h','4h','D','W']
const SESSIONS   = ['Asia','Londres','Nueva York','Overlap Londres/NY','Pre-market','After-market']
const ASSET_TYPES = ['Acción','CEDEAR','Crypto','Forex','Futuros','Opciones','Bono','ETF']

const INITIAL: FormData = {
  symbol: '', direction: 'long', asset_type: 'Acción', timeframe: '1h',
  strategy: '', entry_price: '', stop_loss: '', take_profit: '',
  lot_size: '', session: 'Nueva York',
  emotion_before: '', entry_reason: '', followed_plan: null,
}

// ─── Helper: auto-calcular R:R ────────────────────────────────────────────────

function calcRR(entry: string, sl: string, tp: string, dir: 'long' | 'short') {
  const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp)
  if (!e || !s || !t) return null
  const risk   = dir === 'long' ? e - s : s - e
  const reward = dir === 'long' ? t - e : e - t
  if (risk <= 0 || reward <= 0) return null
  return (reward / risk).toFixed(2)
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function Steps({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'trade', label: '1. Trade' },
    { key: 'psico', label: '2. Psicología' },
    { key: 'review', label: '3. Confirmar' },
  ]
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          {i > 0 && <div className="h-px w-8 bg-zinc-800" />}
          <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors
            ${current === s.key
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : steps.indexOf(steps.find(x => x.key === current)!) > i
              ? 'text-emerald-400'
              : 'text-zinc-600'}`}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewTradePage() {
  const router = useRouter()
  const [step, setStep]       = useState<Step>('trade')
  const [form, setForm]       = useState<FormData>(INITIAL)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const set = (key: keyof FormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const rr = calcRR(form.entry_price, form.stop_loss, form.take_profit, form.direction)

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          entry_price:  form.entry_price  ? parseFloat(form.entry_price)  : undefined,
          stop_loss:    form.stop_loss    ? parseFloat(form.stop_loss)    : undefined,
          take_profit:  form.take_profit  ? parseFloat(form.take_profit)  : undefined,
          lot_size:     form.lot_size     ? parseFloat(form.lot_size)     : undefined,
          status: 'open',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar')
      router.push(`/dashboard/journal/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-xl mx-auto">

        {/* Nav */}
        <Link href="/dashboard/journal"
          className="text-zinc-500 hover:text-zinc-300 text-sm mb-5 block transition-colors">
          ← Volver al diario
        </Link>
        <h1 className="text-xl font-bold text-white mb-1">Registrar trade</h1>
        <p className="text-zinc-500 text-sm mb-6">Capturá el setup y tu estado mental antes de entrar.</p>

        <Steps current={step} />

        {/* ── STEP 1: Trade info ───────────────────────────────────────────── */}
        {step === 'trade' && (
          <div className="space-y-5">

            {/* Symbol + direction */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Activo *</label>
                <input
                  type="text"
                  placeholder="BTC, GGAL, AAPL..."
                  value={form.symbol}
                  onChange={e => set('symbol', e.target.value.toUpperCase())}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-600 focus:border-cyan-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Tipo de activo</label>
                <select value={form.asset_type} onChange={e => set('asset_type', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors">
                  {ASSET_TYPES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Dirección *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['long', 'short'] as const).map(d => (
                  <button key={d} onClick={() => set('direction', d)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-colors border
                      ${form.direction === d
                        ? d === 'long'
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                    {d === 'long' ? '▲ LONG' : '▼ SHORT'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'entry_price', label: 'Entrada *', placeholder: '0.00' },
                { key: 'stop_loss',   label: 'Stop Loss',  placeholder: '0.00' },
                { key: 'take_profit', label: 'Take Profit', placeholder: '0.00' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">{f.label}</label>
                  <input type="number" step="any" placeholder={f.placeholder}
                    value={form[f.key as keyof FormData] as string}
                    onChange={e => set(f.key as keyof FormData, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white text-sm placeholder-zinc-700 focus:border-cyan-500/50 focus:outline-none transition-colors" />
                </div>
              ))}
            </div>

            {/* R:R preview */}
            {rr && (
              <div className={`text-center text-sm py-2 rounded-xl border ${parseFloat(rr) >= 1.5 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                R:R calculado: <strong>{rr}R</strong>
                {parseFloat(rr) < 1 && ' — ratio bajo, revisá el setup'}
              </div>
            )}

            {/* Lot size + leverage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Tamaño de posición</label>
                <input type="number" step="any" placeholder="Ej: 100 acciones"
                  value={form.lot_size} onChange={e => set('lot_size', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-700 focus:border-cyan-500/50 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Sesión</label>
                <select value={form.session} onChange={e => set('session', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-colors">
                  {SESSIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Timeframe + Strategy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Timeframe</label>
                <div className="flex flex-wrap gap-1.5">
                  {TIMEFRAMES.map(tf => (
                    <button key={tf} onClick={() => set('timeframe', tf)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border
                        ${form.timeframe === tf
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                          : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Estrategia</label>
                <input type="text" placeholder="Ej: Breakout, VWAP bounce..."
                  value={form.strategy} onChange={e => set('strategy', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-zinc-700 focus:border-cyan-500/50 focus:outline-none transition-colors" />
              </div>
            </div>

            <button
              onClick={() => setStep('psico')}
              disabled={!form.symbol || !form.entry_price}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
              Siguiente →
            </button>
          </div>
        )}

        {/* ── STEP 2: Psicología antes ─────────────────────────────────────── */}
        {step === 'psico' && (
          <div className="space-y-6">

            {/* Emoción antes */}
            <div>
              <label className="block text-sm font-semibold text-white mb-1">¿Cómo te sentís antes de entrar? *</label>
              <p className="text-xs text-zinc-500 mb-3">Sé honesto. Esta info entrena al copiloto.</p>
              <div className="grid grid-cols-4 gap-2">
                {EMOTIONS.map(e => (
                  <button key={e.value} onClick={() => set('emotion_before', e.value)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs transition-colors
                      ${form.emotion_before === e.value
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'}`}>
                    <span className="text-2xl">{e.emoji}</span>
                    <span>{e.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Razón de entrada */}
            <div>
              <label className="block text-sm font-semibold text-white mb-1">¿Por qué entrás? *</label>
              <p className="text-xs text-zinc-500 mb-2">Describí el setup, confluencias y la tesis del trade.</p>
              <textarea
                rows={4}
                placeholder="Ej: Rompió resistencia clave en 4h con volumen, esperé pullback al nivel, entrada en 1h con vela de confirmación. Stop debajo del swing low..."
                value={form.entry_reason}
                onChange={e => set('entry_reason', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:border-cyan-500/50 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('trade')}
                className="flex-1 py-3 border border-zinc-800 hover:border-zinc-600 text-zinc-400 font-medium rounded-xl transition-colors">
                ← Atrás
              </button>
              <button
                onClick={() => setStep('review')}
                disabled={!form.emotion_before || !form.entry_reason.trim()}
                className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
                Revisar →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Review ───────────────────────────────────────────────── */}
        {step === 'review' && (
          <div className="space-y-5">

            {/* Summary card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-white">{form.symbol}</span>
                  <span className={`ml-3 px-2.5 py-1 rounded-lg text-sm font-semibold
                    ${form.direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {form.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                  </span>
                </div>
                <span className="text-zinc-500 text-sm">{form.asset_type} · {form.timeframe}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
                {[
                  { label: 'Entrada', value: form.entry_price || '—' },
                  { label: 'Stop Loss', value: form.stop_loss || '—' },
                  { label: 'Take Profit', value: form.take_profit || '—' },
                ].map(f => (
                  <div key={f.label} className="text-center">
                    <p className="text-xs text-zinc-600 mb-0.5">{f.label}</p>
                    <p className="text-white font-mono font-medium">{f.value}</p>
                  </div>
                ))}
              </div>

              {rr && (
                <div className={`text-center text-sm py-2 rounded-xl
                  ${parseFloat(rr) >= 1.5 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  R:R: <strong>{rr}R</strong>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{EMOTIONS.find(e => e.value === form.emotion_before)?.emoji}</span>
                  <span className="text-sm text-zinc-300">{EMOTIONS.find(e => e.value === form.emotion_before)?.label} antes de entrar</span>
                </div>
                {form.entry_reason && (
                  <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded-xl p-3 leading-relaxed">
                    {form.entry_reason}
                  </p>
                )}
              </div>

              {form.session && (
                <p className="text-xs text-zinc-600">Sesión: {form.session}</p>
              )}
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setStep('psico')}
                className="flex-1 py-3 border border-zinc-800 hover:border-zinc-600 text-zinc-400 font-medium rounded-xl transition-colors">
                ← Atrás
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold rounded-xl transition-colors">
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : '📓 Registrar trade'}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-700">
              El trade queda en estado <strong>abierto</strong>. Cerralo desde el diario cuando salgas.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
