import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getBymaTop, getCedearsTop, getIndices, formatChangePercent, isPositive } from '@/services/fmp'
import { TradingViewWidget } from '@/components/market/tradingview-widget'
import { ScreenerNLP } from '@/components/market/screener-nlp'
import { MarketTable } from '@/components/market/market-table'

export const metadata: Metadata = { title: 'Mercados — INBIG Finanzas' }
export const revalidate = 60

export default async function MercadosPage() {
  const [byma, cedears, indices] = await Promise.allSettled([
    getBymaTop(),
    getCedearsTop(),
    getIndices(),
  ])

  const bymaData    = byma.status    === 'fulfilled' ? byma.value    : []
  const cedearsData = cedears.status === 'fulfilled' ? cedears.value : []
  const indicesData = indices.status === 'fulfilled' ? indices.value : []

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Mercados</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              BYMA · CEDEARs · Índices globales · Datos en tiempo real
            </p>
          </div>
          <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
            Actualiza cada 60s
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

        {/* Terminal TradingView */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Terminal
          </h2>
          <Suspense fallback={<div className="h-[500px] bg-zinc-900 rounded-xl animate-pulse" />}>
            <TradingViewWidget symbol="BCBA:GGAL" height={500} />
          </Suspense>
        </section>

        {/* Screener NLP */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            Screener inteligente
          </h2>
          <ScreenerNLP />
        </section>

        {/* Índices globales */}
        {indicesData.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
              Índices
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {indicesData.map((q) => (
                <div
                  key={q.symbol}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-zinc-600 transition-colors"
                >
                  <p className="text-xs text-zinc-500 truncate">{q.name || q.symbol}</p>
                  <p className="text-lg font-semibold mt-1">
                    {q.price?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm font-medium ${isPositive(q.changesPercentage) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatChangePercent(q.changesPercentage)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* BYMA */}
        {bymaData.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
              BYMA — Acciones argentinas
            </h2>
            <MarketTable data={bymaData} />
          </section>
        )}

        {/* CEDEARs */}
        {cedearsData.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
              CEDEARs
            </h2>
            <MarketTable data={cedearsData} />
          </section>
        )}

        {/* Sin API key */}
        {bymaData.length === 0 && cedearsData.length === 0 && indicesData.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <p className="text-lg mb-2">Conectá tu FMP API key</p>
            <p className="text-sm">Agregá <code className="text-zinc-300">FMP_API_KEY</code> en tu <code className="text-zinc-300">.env.local</code></p>
            <a
              href="https://financialmodelingprep.com/developer/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Obtener API key gratuita →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
