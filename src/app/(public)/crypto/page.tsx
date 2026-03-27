import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  getTopCoins,
  getGlobalMarketData,
  getTrendingCoins,
  formatMarketCap,
  type CoinGeckoCoin,
} from '@/services/coingecko'
import CryptoTable from '@/components/market/crypto-table'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Crypto | INBIG Finanzas',
  description: 'Precios en tiempo real, market cap y volumen de las principales criptomonedas. Bitcoin, Ethereum y top 50 en USD.',
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'zinc' }: {
  label: string
  value: string
  sub?: string
  color?: 'zinc' | 'emerald' | 'red' | 'blue' | 'amber'
}) {
  const colors = {
    zinc:    'bg-zinc-900 border-zinc-800',
    emerald: 'bg-emerald-950/30 border-emerald-900/50',
    red:     'bg-red-950/30 border-red-900/50',
    blue:    'bg-blue-950/30 border-blue-900/50',
    amber:   'bg-amber-950/30 border-amber-900/50',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── Trending Section ─────────────────────────────────────────────────────────
function TrendingCoins({ trending }: { trending: Awaited<ReturnType<typeof getTrendingCoins>> }) {
  if (!trending.length) return null
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
        <span>🔥</span> Trending 24h
      </h3>
      <div className="space-y-2">
        {trending.slice(0, 5).map(({ item }) => {
          const change = item.data?.price_change_percentage_24h?.usd ?? 0
          const isUp = change >= 0
          return (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumb} alt={item.name} className="w-5 h-5 rounded-full" />
                <span className="text-sm text-zinc-200">{item.name}</span>
                <span className="text-xs text-zinc-500 uppercase">{item.symbol}</span>
              </div>
              <span className={`text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Dominance Bar ────────────────────────────────────────────────────────────
function DominanceBar({ dominance }: { dominance: Record<string, number> }) {
  const top = Object.entries(dominance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const colors = ['bg-amber-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500']

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3">Dominancia de Mercado</h3>
      <div className="flex h-3 rounded-full overflow-hidden gap-px mb-3">
        {top.map(([coin, pct], i) => (
          <div
            key={coin}
            className={`${colors[i]} transition-all`}
            style={{ width: `${pct}%` }}
            title={`${coin.toUpperCase()}: ${pct.toFixed(1)}%`}
          />
        ))}
        <div className="bg-zinc-700 flex-1" title="Otros" />
      </div>
      <div className="space-y-1">
        {top.map(([coin, pct], i) => (
          <div key={coin} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
              <span className="text-zinc-400 uppercase">{coin}</span>
            </div>
            <span className="text-zinc-300 font-mono">{pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Top Movers ───────────────────────────────────────────────────────────────
function TopMovers({ coins }: { coins: CoinGeckoCoin[] }) {
  const sorted = [...coins].sort(
    (a, b) => Math.abs(b.price_change_percentage_24h) - Math.abs(a.price_change_percentage_24h)
  ).slice(0, 5)

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <h3 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
        <span>⚡</span> Mayores Movimientos 24h
      </h3>
      <div className="space-y-2">
        {sorted.map(coin => {
          const isUp = coin.price_change_percentage_24h >= 0
          return (
            <div key={coin.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                <span className="text-sm text-zinc-200">{coin.symbol.toUpperCase()}</span>
              </div>
              <span className={`text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CryptoPage() {
  const [coins, globalData, trending] = await Promise.allSettled([
    getTopCoins(50),
    getGlobalMarketData(),
    getTrendingCoins(),
  ])

  const coinsData: CoinGeckoCoin[] = coins.status === 'fulfilled' ? coins.value : []
  const global = globalData.status === 'fulfilled' ? globalData.value : null
  const trendingData = trending.status === 'fulfilled' ? trending.value : []

  const totalMarketCap = global?.total_market_cap?.usd ?? 0
  const totalVolume = global?.total_volume?.usd ?? 0
  const btcDominance = global?.market_cap_percentage?.btc ?? 0
  const marketChange = global?.market_cap_change_percentage_24h_usd ?? 0
  const dominance = global?.market_cap_percentage ?? {}
  const isMarketUp = marketChange >= 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Tiempo real · CoinGecko</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">Mercado Cripto</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Top 50 criptomonedas por capitalización de mercado en USD
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Cap. Total del Mercado"
            value={formatMarketCap(totalMarketCap)}
            sub={`${isMarketUp ? '+' : ''}${marketChange.toFixed(2)}% 24h`}
            color={isMarketUp ? 'emerald' : 'red'}
          />
          <StatCard
            label="Volumen 24h"
            value={formatMarketCap(totalVolume)}
            color="blue"
          />
          <StatCard
            label="Dominancia BTC"
            value={`${btcDominance.toFixed(1)}%`}
            color="amber"
          />
          <StatCard
            label="Criptos Activas"
            value={(global?.active_cryptocurrencies ?? 0).toLocaleString('es-AR')}
            sub="en listado global"
          />
        </div>

        {/* TradingView Chart + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* BTC Chart */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-300">Bitcoin (BTC/USD)</span>
                <span className="text-xs text-zinc-500 font-mono">BITSTAMP:BTCUSD</span>
              </div>
              <div style={{ height: 380 }}>
                <iframe
                  src="https://s.tradingview.com/widgetembed/?frameElementId=tv_chart_crypto&symbol=BITSTAMP%3ABTCUSD&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=1a1a2e&studies=RSI%4014%400%2C%22MACD%22%4014%4026%409%400&theme=dark&style=1&timezone=America%2FArgentina%2FBuenos_Aires&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&locale=es_419"
                  style={{ width: '100%', height: '100%', border: 0 }}
                  allowTransparency={true}
                  allowFullScreen={true}
                  title="BTC/USD Chart"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Suspense fallback={<div className="h-40 bg-zinc-900 rounded-xl animate-pulse" />}>
              {trendingData.length > 0 && <TrendingCoins trending={trendingData} />}
            </Suspense>
            {coinsData.length > 0 && <TopMovers coins={coinsData} />}
            {Object.keys(dominance).length > 0 && <DominanceBar dominance={dominance} />}
          </div>
        </div>

        {/* Main Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Top 50 Criptomonedas</h2>
            <span className="text-xs text-zinc-500">ISR · actualización cada 60s</span>
          </div>

          {coinsData.length > 0 ? (
            <CryptoTable coins={coinsData} showSparkline={true} />
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <p className="text-zinc-400 text-sm">Datos temporalmente no disponibles (rate limit CoinGecko).</p>
              <p className="text-zinc-600 text-xs mt-2">
                Para producción: agregar COINGECKO_API_KEY en .env.local (plan Demo: 30 req/min gratis con cuenta).
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4 text-xs text-zinc-500">
          <strong className="text-zinc-400">Aviso:</strong> Datos provistos por CoinGecko, actualizados cada 60 segundos.
          No constituyen asesoramiento de inversión. Las criptomonedas son activos de alta volatilidad y riesgo.
        </div>
      </div>
    </div>
  )
}
