'use client'

/**
 * SMCScanner — Smart Money Concepts Scanner
 *
 * Detecta Fair Value Gaps (FVG) y Order Blocks (OB) en tiempo real.
 * Disponible exclusivamente para planes Pro y Pro+.
 * Datos: Yahoo Finance daily candles via /api/market/smc
 */

import { useState, useEffect, useCallback } from 'react'
import { Zap, Lock, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react'
import type { SMCSignal, FairValueGap, OrderBlock } from '@/app/api/market/smc/route'

function formatPrice(price: number, symbol: string): string {
  if (symbol === 'EURUSD=X') return price.toFixed(4)
  if (price > 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price > 10)   return price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return price.toFixed(4)
}
function formatPct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

function FVGRow({ fvg, symbol }: { fvg: FairValueGap; symbol: string }) {
  const isBull = fvg.type === 'bullish'
  return (
    <div className={`flex items-center justify-between py-1 px-2 rounded text-[10px] ${isBull ? 'bg-emerald-950/40' : 'bg-red-950/40'}`}>
      <div className="flex items-center gap-1.5">
        {isBull ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
        <span className={isBull ? 'text-emerald-400' : 'text-red-400'}>FVG {isBull ? 'Bull' : 'Bear'}</span>
        {fvg.active && <span className="bg-amber-500/20 text-amber-400 px-1 rounded text-[9px]">Activo</span>}
      </div>
      <div className="text-right text-zinc-400">
        <span>{formatPrice(fvg.bottom, symbol)} – {formatPrice(fvg.top, symbol)}</span>
        <span className="text-zinc-600 ml-1">({fvg.sizePercent.toFixed(2)}%)</span>
      </div>
    </div>
  )
}

function OBRow({ ob, symbol }: { ob: OrderBlock; symbol: string }) {
  const isBull = ob.type === 'bullish'
  return (
    <div className={`flex items-center justify-between py-1 px-2 rounded text-[10px] ${isBull ? 'bg-emerald-950/40' : 'bg-red-950/40'}`}>
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-sm ${isBull ? 'bg-emerald-500/60' : 'bg-red-500/60'}`} />
        <span className={isBull ? 'text-emerald-400' : 'text-red-400'}>OB {isBull ? 'Bull' : 'Bear'}</span>
        {ob.active && <span className="bg-amber-500/20 text-amber-400 px-1 rounded text-[9px]">Activo</span>}
      </div>
      <div className="text-right text-zinc-400">
        <span>{formatPrice(ob.bottom, symbol)} – {formatPrice(ob.top, symbol)}</span>
        <span className="text-zinc-600 ml-1">({ob.strengthPercent.toFixed(1)}%)</span>
      </div>
    </div>
  )
}

function AssetCard({ signal }: { signal: SMCSignal }) {
  const isPositive = signal.change24h >= 0
  const activeFVGs = signal.fvgs.filter(f => f.active)
  const activeOBs  = signal.orderBlocks.filter(o => o.active)
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-white">{signal.label}</p>
          <p className="text-[10px] text-zinc-500">{signal.symbol} · {signal.timeframe}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white tabular-nums">{formatPrice(signal.price, signal.symbol)}</p>
          <p className={`text-[10px] font-medium tabular-nums ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{formatPct(signal.change24h)}</p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {activeFVGs.length > 0 && <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{activeFVGs.length} FVG{activeFVGs.length > 1 ? 's' : ''} activo{activeFVGs.length > 1 ? 's' : ''}</span>}
        {activeOBs.length > 0 && <span className="text-[9px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full">{activeOBs.length} OB{activeOBs.length > 1 ? 's' : ''} activo{activeOBs.length > 1 ? 's' : ''}</span>}
        {activeFVGs.length === 0 && activeOBs.length === 0 && <span className="text-[9px] text-zinc-600">Sin señales activas</span>}
      </div>
      {signal.fvgs.length > 0 && (
        <div className="space-y-1">
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">Fair Value Gaps</p>
          {signal.fvgs.map((fvg, i) => <FVGRow key={i} fvg={fvg} symbol={signal.symbol} />)}
        </div>
      )}
      {signal.orderBlocks.length > 0 && (
        <div className="space-y-1">
          <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-medium">Order Blocks</p>
          {signal.orderBlocks.map((ob, i) => <OBRow key={i} ob={ob} symbol={signal.symbol} />)}
        </div>
      )}
    </div>
  )
}

function ProGate({ reason }: { reason: 'unauthenticated' | 'upgrade' }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-white">SMC Scanner</h2>
        <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full font-semibold">PRO</span>
      </div>
      <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <Lock className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1">{reason === 'unauthenticated' ? 'Inicia sesión para acceder' : 'Función exclusiva Pro'}</h3>
          <p className="text-sm text-zinc-400 max-w-xs">{reason === 'unauthenticated' ? 'Detecta FVGs y Order Blocks en tiempo real. Inicia sesión para continuar.' : 'El SMC Scanner detecta Fair Value Gaps y Order Blocks institucionales en BTC, ETH, S&P500, Oro y más.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full max-w-sm text-left">
          {['Fair Value Gaps (FVG)', 'Order Blocks (OB)', '6 activos en tiempo real', 'Activos vs mitigados'].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <a href="/planes" className="mt-2 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
          {reason === 'unauthenticated' ? 'Iniciar sesión' : 'Ver planes Pro'}
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  )
}

type State = { status: 'idle' } | { status: 'loading' } | { status: 'unauthenticated' } | { status: 'upgrade_required' } | { status: 'error'; message: string } | { status: 'success'; signals: SMCSignal[]; scannedAt: string }

export function SMCScanner() {
  const [state, setState] = useState<State>({ status: 'idle' })
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const scan = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/market/smc', { cache: 'no-store' })
      if (res.status === 401) { setState({ status: 'unauthenticated' }); return }
      if (res.status === 403) { setState({ status: 'upgrade_required' }); return }
      if (!res.ok) throw new Error('Error al escanear')
      const data = await res.json()
      setState({ status: 'success', signals: data.signals, scannedAt: data.scannedAt })
      setLastRefresh(new Date())
    } catch {
      setState({ status: 'error', message: 'No se pudo conectar al scanner' })
    }
  }, [])

  useEffect(() => { scan() }, [scan])

  if (state.status === 'unauthenticated') return <ProGate reason="unauthenticated" />
  if (state.status === 'upgrade_required') return <ProGate reason="upgrade" />

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">SMC Scanner</h2>
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full font-semibold">PRO</span>
          {state.status === 'loading' && <span className="text-[10px] text-zinc-500 animate-pulse">escaneando…</span>}
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && <span className="text-[10px] text-zinc-600">{lastRefresh.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button onClick={scan} disabled={state.status === 'loading'} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40" title="Refrescar">
            <RefreshCw className={`w-3.5 h-3.5 ${state.status === 'loading' ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="p-4">
        {(state.status === 'idle' || state.status === 'loading') ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-zinc-800/50 rounded-xl h-44 animate-pulse" />)}
          </div>
        ) : state.status === 'error' ? (
          <div className="flex items-center gap-2 text-zinc-500 py-6 justify-center text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />{state.message}
          </div>
        ) : state.status === 'success' ? (
          <>
            <div className="flex items-center gap-4 mb-4 text-[10px] text-zinc-500">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span>Bullish</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><span>Bearish</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /><span>Activo = sin mitigar</span></div>
              <span className="ml-auto text-zinc-700">1D · 3 meses</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.signals.map(signal => <AssetCard key={signal.symbol} signal={signal} />)}
            </div>
            <p className="text-[10px] text-zinc-700 mt-4 text-center">Análisis algorítmico educativo. No constituye asesoramiento financiero.</p>
          </>
        ) : null}
      </div>
    </div>
  )
}
