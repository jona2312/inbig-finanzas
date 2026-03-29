'use client'

import { useState, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TradeStatus = 'open' | 'closed' | 'cancelled'
type TradeDirection = 'long' | 'short'

interface Trade {
  id: string
  symbol: string
  direction: TradeDirection
  status: TradeStatus
  entry_price?: number
  stop_loss?: number
  take_profit?: number
  exit_price?: number
  pnl?: number
  pnl_pct?: number
  risk_reward?: number
  // Diary fields
  emotion_before?: string
  emotion_after?: string
  plan?: string
  setup?: string
  notes?: string
  reflection?: string
  quality_score?: number
  followed_plan?: boolean
  risk_reward_planned?: number
  created_at?: string
  closed_at?: string
}

type DiaryPhase = 'antes' | 'durante' | 'despues'

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

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function PhaseTab({
    label,
  active,
  completed,
  disabled,
  onClick,
}: {
  phase: DiaryPhase
  label: string
  active: boolean
  completed: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all
        ${active
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
          : completed
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : disabled
          ? 'opacity-40 cursor-not-allowed text-zinc-600 border border-zinc-800'
          : 'text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
        }`}
    >
      {completed && !active ? '✓ ' : ''}{label}
    </button>
  )
}

function EmotionPicker({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-2">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {EMOTIONS.map((e) => (
          <button
            key={e.value}
            onClick={() => onChange(e.value)}
            className={`p-2 rounded-lg border text-center transition-all
              ${value === e.value
                ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500'
              }`}
          >
            <div className="text-lg">{e.emoji}</div>
            <div className="text-xs mt-0.5">{e.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function QualitySlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const getColor = (v: number) => {
    if (v >= 8) return 'text-emerald-400'
    if (v >= 5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getLabel = (v: number) => {
    if (v >= 9) return 'Excelente'
    if (v >= 7) return 'Bueno'
    if (v >= 5) return 'Regular'
    if (v >= 3) return 'Malo'
    return 'Muy malo'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs text-zinc-400">Calidad del trade (1-10)</label>
        <span className={`text-sm font-bold ${getColor(value)}`}>
          {value} — {getLabel(value)}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
      <div className="flex justify-between text-xs text-zinc-600 mt-1">
        <span>1 · Desastre</span>
        <span>5 · Regular</span>
        <span>10 · Perfecto</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

interface DiarioTraderProps {
  tradeId: string
  onClose?: () => void
  onSaved?: (trade: Trade) => void
}

export function DiarioTrader({ tradeId, onClose, onSaved }: DiarioTraderProps) {
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activePhase, setActivePhase] = useState<DiaryPhase>('antes')
  const [saved, setSaved] = useState(false)

  // Form state — Antes
  const [emotionBefore, setEmotionBefore] = useState('')
  const [plan, setPlan] = useState('')
  const [setup, setSetup] = useState('')
  const [rrPlanned, setRrPlanned] = useState('')

  // Form state — Durante
  const [notes, setNotes] = useState('')

  // Form state — Después
  const [emotionAfter, setEmotionAfter] = useState('')
  const [reflection, setReflection] = useState('')
  const [qualityScore, setQualityScore] = useState(5)
  const [followedPlan, setFollowedPlan] = useState<boolean | null>(null)

  // Load trade
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/journal/${tradeId}/diary`)
        const json = await res.json()
        if (json.data) {
          const t = json.data as Trade
          setTrade(t)
          // Populate fields
          setEmotionBefore(t.emotion_before ?? '')
          setPlan(t.plan ?? '')
          setSetup(t.setup ?? '')
          setRrPlanned(t.risk_reward_planned?.toString() ?? '')
          setNotes(t.notes ?? '')
          setEmotionAfter(t.emotion_after ?? '')
          setReflection(t.reflection ?? '')
          setQualityScore(t.quality_score ?? 5)
          setFollowedPlan(t.followed_plan ?? null)
          // Set initial phase based on status
          if (t.status === 'closed') setActivePhase('despues')
          else if (t.status === 'open' && t.emotion_before) setActivePhase('durante')
          else setActivePhase('antes')
        }
      } catch (e) {
        console.error('Error loading trade diary:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tradeId])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      const payload: Record<string, unknown> = {}

      if (activePhase === 'antes') {
        if (emotionBefore) payload.emotion_before = emotionBefore
        if (plan) payload.plan = plan
        if (setup) payload.setup = setup
        if (rrPlanned) payload.risk_reward_planned = Number(rrPlanned)
      } else if (activePhase === 'durante') {
        if (notes) payload.notes = notes
      } else if (activePhase === 'despues') {
        if (emotionAfter) payload.emotion_after = emotionAfter
        if (reflection) payload.reflection = reflection
        payload.quality_score = qualityScore
        if (followedPlan !== null) payload.followed_plan = followedPlan
      }

      if (Object.keys(payload).length === 0) return

      const res = await fetch(`/api/journal/${tradeId}/diary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (json.data) {
        setTrade(json.data)
        setSaved(true)
        onSaved?.(json.data)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (e) {
      console.error('Error saving diary:', e)
    } finally {
      setSaving(false)
    }
  }, [activePhase, emotionBefore, plan, setup, rrPlanned, notes, emotionAfter, reflection, qualityScore, followedPlan, tradeId, onSaved])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="animate-pulse">Cargando diario...</div>
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Trade no encontrado
      </div>
    )
  }

  const isOpen = trade.status === 'open'
  const isClosed = trade.status === 'closed'
  const antesCompleted = !!(trade.emotion_before && trade.plan)
  const duranteCompleted = !!trade.notes
  const despuesCompleted = !!(trade.emotion_after && trade.reflection)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-white">{trade.symbol}</div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium
            ${trade.direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {trade.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs
            ${trade.status === 'open' ? 'bg-cyan-500/20 text-cyan-400'
            : trade.status === 'closed' ? 'bg-zinc-700 text-zinc-400'
            : 'bg-red-500/20 text-red-400'}`}>
            {trade.status === 'open' ? 'Abierto' : trade.status === 'closed' ? 'Cerrado' : 'Cancelado'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isClosed && trade.pnl !== undefined && (
            <span className={`text-sm font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} ({trade.pnl_pct?.toFixed(1)}%)
            </span>
          )}
          {onClose && (
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 p-4 border-b border-zinc-800">
        <PhaseTab phase="antes" label="Antes del trade" active={activePhase === 'antes'}
          completed={antesCompleted} disabled={false}
          onClick={() => setActivePhase('antes')} />
        <PhaseTab phase="durante" label="Durante" active={activePhase === 'durante'}
          completed={duranteCompleted} disabled={!antesCompleted && !isOpen}
          onClick={() => setActivePhase('durante')} />
        <PhaseTab phase="despues" label="Después" active={activePhase === 'despues'}
          completed={despuesCompleted} disabled={!isClosed}
          onClick={() => setActivePhase('despues')} />
      </div>

      {/* Phase content */}
      <div className="p-5 space-y-5">

        {/* ── ANTES ── */}
        {activePhase === 'antes' && (
          <>
            <EmotionPicker
              label="¿Cómo te sentís ANTES de entrar?"
              value={emotionBefore}
              onChange={setEmotionBefore}
            />

            <div>
              <label className="block text-xs text-zinc-400 mb-2">Plan del trade — ¿qué tiene que pasar para que sea válido?</label>
              <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Ej: Ruptura del nivel 4500 con volumen, SL debajo del mínimo previo..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Setup / patrón</label>
                <input
                  type="text"
                  value={setup}
                  onChange={(e) => setSetup(e.target.value)}
                  placeholder="Ej: Breakout, pullback, divergencia..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">R:R planeado</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={rrPlanned}
                  onChange={(e) => setRrPlanned(e.target.value)}
                  placeholder="Ej: 2.5"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Copilot nudge */}
            {!antesCompleted && (
              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3">
                <p className="text-xs text-cyan-300/70">
                  💡 Completar el plan antes de entrar es la diferencia entre un trade y una apuesta.
                  El copiloto analiza este texto para entrenarte en consistencia.
                </p>
              </div>
            )}
          </>
        )}

        {/* ── DURANTE ── */}
        {activePhase === 'durante' && (
          <>
            {/* Trade stats */}
            <div className="grid grid-cols-3 gap-3">
              {trade.entry_price && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Entrada</div>
                  <div className="text-sm font-mono font-bold text-white">{trade.entry_price}</div>
                </div>
              )}
              {trade.stop_loss && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Stop Loss</div>
                  <div className="text-sm font-mono font-bold text-red-400">{trade.stop_loss}</div>
                </div>
              )}
              {trade.take_profit && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">Take Profit</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{trade.take_profit}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-2">Notas durante el trade</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Qué está pasando? ¿El precio respeta tu plan? ¿Sentís impulso de cerrar antes?"
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Plan reminder */}
            {trade.plan && (
              <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Tu plan original</div>
                <p className="text-sm text-zinc-300">{trade.plan}</p>
              </div>
            )}
          </>
        )}

        {/* ── DESPUÉS ── */}
        {activePhase === 'despues' && (
          <>
            {/* PnL summary */}
            {trade.pnl !== undefined && (
              <div className={`rounded-lg p-4 border ${
                trade.pnl >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-400">Resultado</div>
                    <div className={`text-2xl font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </div>
                  </div>
                  {trade.risk_reward !== undefined && (
                    <div className="text-right">
                      <div className="text-xs text-zinc-400">R realizado</div>
                      <div className="text-xl font-bold text-zinc-200">{trade.risk_reward.toFixed(1)}R</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <EmotionPicker
              label="¿Cómo te sentís DESPUÉS del trade?"
              value={emotionAfter}
              onChange={setEmotionAfter}
            />

            <div>
              <label className="block text-xs text-zinc-400 mb-2">Reflexión — ¿qué aprendiste?</label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="¿Qué salió bien? ¿Qué cambiarías? ¿Seguiste tu plan?"
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <QualitySlider value={qualityScore} onChange={setQualityScore} />

            <div>
              <label className="block text-xs text-zinc-400 mb-3">¿Seguiste tu plan original?</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setFollowedPlan(true)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                    ${followedPlan === true
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                >
                  ✓ Sí, lo seguí
                </button>
                <button
                  onClick={() => setFollowedPlan(false)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all
                    ${followedPlan === false
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                >
                  ✕ Lo desvié
                </button>
              </div>
            </div>
          </>
        )}

        {/* Save button */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">
            El copiloto lee este diario para entrenarte — no para juzgarte.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50'
              }`}
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
