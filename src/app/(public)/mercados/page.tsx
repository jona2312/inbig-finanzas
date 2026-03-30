import type { Metadata } from 'next'
import { getBymaTop, getCedearsTop, getIndices, formatChangePercent, isPositive } from '@/services/fmp'
import { getCommodityQuotes } from '@/services/commodities'
import { getFearGreedIndex } from '@/services/fear-greed'
import { LightweightChart } from '@/components/market/lightweight-chart'
import { ScreenerNLP } from '@/components/market/screener-nlp'
import { MarketTable } from '@/components/market/market-table'
import { CommoditiesWidget } from '@/components/market/commodities-widget'
import { FearGreedWidget } from '@/components/market/fear-greed-widget'
import { CopilotBox } from '@/components/copilot/copilot-box'
import { SectorHeatmap } from '@/components/market/sector-heatmap'
import { SMCScanner } from '@/components/market/SMCScanner'

export const metadata: Metadata = { title: 'Mercados — INBIG Finanzas' }
export const revalidate = 60

export default async function MercadosPage() {
  const [byma, cedears, indices, commodities, fearGreed] = await Promise.allSettled([
    getBymaTop(),
    getCedearsTop(),
    getIndices(),
    getCommodityQuotes(),
    getFearGreedIndex(),
  ])

  const bymaData        = byma.status       === 'fulfilled' ? byma.value       : []
  const cedearsData     = cedears.status    === 'fulfilled' ? cedears.value    : []
  const indicesData     = indices.status    === 'fulfilled' ? indices.value    : []
  const commoditiesData = commodities.status=== 'fulfilled' ? commodities.value: []
  const fearGreedData   = fearGreed.status  === 'fulfilled' ? fearGreed.value  : null

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Mercados</h1>
            <p className="text-sm text-zinc-400 mt-0.5">BYMA · CEDEARs · Índices · Commodities · Sentiment</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/grafico" className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 hover:border-emerald-600 px-3 py-1.5 rounded-full transition-colors">
              📈 Graficar gratis →
            </a>
            <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">Live · 60s</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">

          {/* Main */}
          <div className="flex-1 min-w-0 space-y-8">

            <section>
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Terminal</h2>
              <LightweightChart defaultSymbol="GGAL" defaultTimeframe="3M" height={440} />
            </section>

            {/* SMC Scanner PRO */}
            <section>
              <SMCScanner />
            </section>

            <section>
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Mapa de calor — Sectores</h2>
              <SectorHeatmap />
            </section>

            <section>
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Screener inteligente</h2>
              <ScreenerNLP />
            </section>

            <section>
              <CopilotBox context="mercados" placeholder="¿Qué sectores lideran hoy? ¿Cómo está el Merval vs S&P?" />
            </section>

            {indicesData.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Índices globales</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {indicesData.map((q) => (
                    <div key={q.symbol} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-zinc-600 transition-colors">
                      <p className="text-xs text-zinc-500 truncate">{q.name || q.symbol}</p>
                      <p className="text-lg font-semibold mt-1">{q.price?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p>
                      <p className={`text-sm font-medium ${isPositive(q.changesPercentage) ? 'text-emerald-400' : 'text-red-400'}`}>{formatChangePercent(q.changesPercentage)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {commoditiesData.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Commodities</h2>
                <CommoditiesWidget commodities={commoditiesData} />
              </section>
            )}

            {bymaData.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">BYMA — Acciones argentinas</h2>
                <MarketTable data={bymaData} />
              </section>
            )}

            {cedearsData.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">CEDEARs</h2>
                <MarketTable data={cedearsData} />
              </section>
            )}

            {bymaData.length === 0 && cedearsData.length === 0 && indicesData.length === 0 && (
              <div className="text-center py-16 text-zinc-500">
                <p className="text-lg mb-2">Conectá tu FMP API key</p>
                <p className="text-sm">Agregá <code className="text-zinc-300">FMP_API_KEY</code> en tu <code className="text-zinc-300">.env.local</code></p>
                <a href="https://financialmodelingprep.com/developer/docs" target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-400 hover:text-blue-300 text-sm underline">
                  Obtener API key gratuita →
                </a>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-72 shrink-0 space-y-4">
            {fearGreedData && <FearGreedWidget data={fearGreedData} />}
            {commoditiesData.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center text-zinc-500 text-xs">Commodities no disponibles</div>
            )}
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-800/40 rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-white mb-1">📈 Graficá cualquier activo</p>
              <p className="text-[11px] text-zinc-400 mb-3">Acciones, ETFs, CEDEARs, cripto — gratis, sin login</p>
              <a href="/grafico" className="inline-block w-full text-center text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 transition-colors">
                Abrir terminal →
              </a>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Fuentes</p>
              <div className="space-y-1.5 text-[10px] text-zinc-600">
                <div className="flex justify-between"><span>BYMA / CEDEARs</span><span className="text-zinc-500">FMP · 60s</span></div>
                <div className="flex justify-between"><span>Commodities</span><span className="text-zinc-500">FMP · 5min</span></div>
                <div className="flex justify-between"><span>Fear & Greed</span><span className="text-zinc-500">Alternative.me · 6h</span></div>
                <div className="flex justify-between"><span>SMC Scanner</span><span className="text-zinc-500">Yahoo · 5min</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
