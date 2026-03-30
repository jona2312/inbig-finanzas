import { Suspense } from 'react'
import { Metadata } from 'next'
import GraficoClient from './grafico-client'

interface Props {
  searchParams: Promise<{ s?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const symbol = params.s?.toUpperCase() || 'GGAL'
  return {
    title: `Gráfico de ${symbol} en tiempo real — INbig Finanzas`,
    description: `Analizá el gráfico de ${symbol} con herramientas profesionales. Indicadores técnicos, tendencias y análisis con IA.`,
  }
}

export default async function GraficoPage({ searchParams }: Props) {
  const params = await searchParams
  const symbol = params.s?.toUpperCase() || 'GGAL'

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header compacto */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-black tracking-tight">
            <span className="text-white">IN</span>
            <span className="text-amber-400">BIG</span>
          </a>
          <span className="text-zinc-700">·</span>
          <span className="font-mono text-sm font-bold text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            {symbol}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/terminal?s=${symbol}`}
            className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800/40 hover:border-emerald-600/60 px-3 py-1.5 rounded-lg transition-all"
          >
            Ir a Terminal →
          </a>
        </div>
      </header>

      {/* Chart */}
      <div className="flex-1">
        <Suspense fallback={<ChartSkeleton />}>
          <GraficoClient symbol={symbol} />
        </Suspense>
      </div>

      {/* Footer CTA */}
      <footer className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/60 shrink-0">
        <a
          href={`/terminal?s=${symbol}`}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <span>🤖</span>
          Analizar {symbol} con Copilot →
        </a>
        <a href="/planes" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          Ver planes
        </a>
      </footer>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="w-full h-full bg-zinc-950 animate-pulse flex items-center justify-center" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-zinc-600 text-xs font-mono">Cargando chart...</p>
      </div>
    </div>
  )
}
