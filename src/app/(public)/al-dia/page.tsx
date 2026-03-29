/**
 * /al-dia — Home page de INBIG Finanzas
 *
 * Layout Bloomberg-style: ticker strip → hero → col principal + sidebar
 * Datos en tiempo real: dólar, crypto, US markets, briefings IA, noticias Supabase
 * Revalidar cada 5 minutos (ISR)
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getLatestArticles } from '@/services/articles'
import { getDollarRates, getTopCrypto, getUSMarkets } from '@/services/market'
import type { USMarketQuote } from '@/services/market'
import { CopilotBox } from '@/components/copilot/copilot-box'
import { ArticleCard } from '@/components/news/article-card'
import { PolymarketWidget } from '@/components/market/polymarket-widget'
import { LiveChannelPlayer } from '@/components/live/LiveChannelPlayer'
import {
  TrendingUp, TrendingDown, Zap, Newspaper, BarChart2,
  ArrowRight, Radio, Clock
} from 'lucide-react'
import type { BriefingRow } from '@/types/database'

// ─── ISR ───────────────────────────────────────────────────────────────────

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Al Día — INBIG Finanzas',
  description: 'Tu briefing financiero diario para LATAM. Noticias, mercados, dólar y IA en un solo lugar.',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function pct(n: number | null | undefined) {
  if (n == null) return null
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

function formatPrice(n: number | null | undefined, prefix = '') {
  if (n == null) return '—'
  return `${prefix}${n.toLocaleString('es-AR')}`
}

// ─── Sub-components ────────────────────────────────────────────────────────

function TickerStrip({
  dollar,
  crypto,
  usMarkets,
}: {
  dollar: { nombre: string; venta: number | null }[]
  crypto: { symbol: string; price: number; change24h: number }[]
  usMarkets: USMarketQuote[]
}) {
  const dollarItems = dollar.slice(0, 3).map(d => ({
    label: `USD ${d.nombre}`,
    value: formatPrice(d.venta, '$'),
    change: null as number | null,
  }))

  const cryptoItems = crypto.slice(0, 2).map(c => ({
    label: c.symbol,
    value: `$${c.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
    change: c.change24h,
  }))

  const usItems = usMarkets.map(m => {
    const isForex = m.symbol === 'EURUSD=X'
    const decimals = isForex ? 4 : m.price > 1000 ? 0 : 2
    return {
      label: m.label,
      value: isForex
        ? m.price.toFixed(4)
        : `$${m.price.toLocaleString('en-US', { maximumFractionDigits: decimals })}`,
      change: m.changePercent,
    }
  })

  const items = [...dollarItems, ...usItems, ...cryptoItems]

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-3 py-2 bg-amber-500/10 border-r border-zinc-800 shrink-0">
          <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Live</span>
        </div>
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 border-r border-zinc-800/60 shrink-0"
          >
            <span className="text-[11px] text-zinc-500 font-medium">{item.label}</span>
            <span className="text-[11px] text-white font-semibold tabular-nums">{item.value}</span>
            {item.change != null && (
              <span className={`text-[10px] font-medium tabular-nums ${item.change >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function MacroCard({
  label,
  value,
  sub,
  change,
  accent = false,
}: {
  label: string
  value: string
  sub?: string
  change?: number | null
  accent?: boolean
}) {
  const positive = change != null && change >= 0

  return (
    <div className={`rounded-xl border p-4 ${accent ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900'}`}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? 'text-amber-400' : 'text-white'}`}>
        {value}
      </p>
      {change != null ? (
        <div className={`flex items-center gap-1 mt-1 text-xs ${positive ? 'text-amber-400' : 'text-red-400'}`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{pct(change)}</span>
          {sub && <span className="text-zinc-600 ml-1">{sub}</span>}
        </div>
      ) : sub ? (
        <p className="text-xs text-zinc-500 mt-1">{sub}</p>
      ) : null}
    </div>
  )
}

function BriefingCard({ briefing }: { briefing: Pick<BriefingRow, 'id' | 'titulo' | 'tipo' | 'created_at' | 'drivers'> }) {
  const drivers = briefing.drivers as string[] | null

  return (
    <div className="p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {briefing.tipo}
            </span>
          </div>
          <p className="text-sm font-medium text-white leading-snug line-clamp-2">
            {briefing.titulo ?? `Briefing ${briefing.tipo}`}
          </p>
          {drivers && Array.isArray(drivers) && drivers.length > 0 && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
              {drivers[0]}
            </p>
          )}
        </div>
        <p className="text-[10px] text-zinc-600 shrink-0 mt-1">
          {briefing.created_at
            ? new Date(briefing.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
            : '—'
          }
        </p>
      </div>
    </div>
  )
}

function CategoryPill({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all group"
    >
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
    </a>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function AlDiaPage() {
  const supabase = createClient()
  const now = new Date()

  const [
    { data: briefings },
    latest,
    dollar,
    crypto,
    usMarkets,
  ] = await Promise.all([
    supabase
      .from('briefings')
      .select('id, titulo, tipo, created_at, drivers')
      .order('created_at', { ascending: false })
      .limit(5),
    getLatestArticles(18),
    getDollarRates(),
    getTopCrypto(6),
    getUSMarkets(['^GSPC', '^NDX', 'GC=F', 'CL=F', 'EURUSD=X']),
  ])

  const blue = dollar.find(d => d.nombre === 'Blue')
  const mep = dollar.find(d => d.nombre === 'MEP') ?? dollar.find(d => d.nombre === 'Bolsa')
  const oficial = dollar.find(d => d.nombre === 'Oficial')
  const btc = crypto[0]
  const eth = crypto[1]

  const brecha =
    blue?.venta && oficial?.venta
      ? (((blue.venta - oficial.venta) / oficial.venta) * 100)
      : null

  const dateStr = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const featured = latest.slice(0, 3)
  const feed = latest.slice(3)

  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ── Ticker strip ── */}
      <TickerStrip dollar={dollar} crypto={crypto} usMarkets={usMarkets} />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                INBIG Finanzas
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Al Día</h1>
            <p className="text-sm text-zinc-500 mt-0.5 capitalize">{dateStr}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Actualizado a las{' '}
              {now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* ── Macro pills — LATAM (dólar + crypto) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {blue && (
            <MacroCard label="Dólar Blue" value={formatPrice(blue.venta, '$')} sub="venta" accent />
          )}
          {mep && (
            <MacroCard label="Dólar MEP" value={formatPrice(mep.venta, '$')} sub="venta" />
          )}
          {brecha != null && (
            <MacroCard label="Brecha Blue/Oficial" value={`${brecha.toFixed(1)}%`} sub="vs oficial" change={brecha} />
          )}
          {btc && (
            <MacroCard label="Bitcoin" value={`$${btc.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} change={btc.change24h} sub="24h" />
          )}
          {eth && (
            <MacroCard label="Ethereum" value={`$${eth.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} change={eth.change24h} sub="24h" />
          )}
        </div>

        {/* ── Macro pills — US Markets ── */}
        {usMarkets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {usMarkets.map(m => {
              const isForex = m.symbol === 'EURUSD=X'
              const decimals = isForex ? 4 : m.price > 1000 ? 0 : 2
              const formatted = isForex
                ? m.price.toFixed(4)
                : `$${m.price.toLocaleString('en-US', { maximumFractionDigits: decimals })}`
              return (
                <MacroCard key={m.symbol} label={m.label} value={formatted} change={m.changePercent} sub="24h" />
              )
            })}
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Canal en vivo — Bloomberg / CNBC / INBIG */}
            <LiveChannelPlayer />

            {/* Copiloto financiero IA */}
            <CopilotBox
              context="noticias"
              placeholder="¿Qué pasó hoy en los mercados de LATAM?"
              suggestions={[
                '¿Qué pasó hoy en Argentina?',
                'Situación del dólar esta semana',
                'Impacto de la Fed en mercados LATAM',
                'Bitcoin hoy — análisis rápido',
              ]}
            />

            {/* Briefings IA del día */}
            {briefings && briefings.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-purple-400" />
                    <h2 className="text-sm font-semibold text-white">Briefings IA del día</h2>
                    <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                      Generado por WF3
                    </span>
                  </div>
                </div>
                <div>
                  {(briefings as Pick<BriefingRow, 'id' | 'titulo' | 'tipo' | 'created_at' | 'drivers'>[]).map(b => (
                    <BriefingCard key={b.id} briefing={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Noticias destacadas */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <h2 className="text-sm font-semibold text-white">Destacadas</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featured.slice(0, 2).map(article => (
                    <ArticleCard key={article.id} article={article} variant="featured" />
                  ))}
                </div>
              </section>
            )}

            {/* Feed de noticias */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-semibold text-white">Últimas noticias</h2>
                </div>
                <a href="/noticias" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Ver todas <ArrowRight className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
                {feed.length > 0 ? (
                  feed.map(article => (
                    <ArticleCard key={article.id} article={article} variant="compact" />
                  ))
                ) : (
                  <div className="px-5 py-12 text-center text-zinc-500 text-sm">
                    Sin noticias aún. WF1 genera contenido cada 30 min.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">

            {/* Tipos de dólar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Tipos de dólar</h3>
                <a href="/divisas" className="text-xs text-amber-400 hover:underline">Ver análisis →</a>
              </div>
              <div className="divide-y divide-zinc-800">
                {dollar.slice(0, 7).map(d => (
                  <div key={d.nombre} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{d.nombre}</span>
                    <div className="flex gap-3 tabular-nums">
                      <span className="text-xs text-zinc-500">
                        {d.compra != null ? `$${d.compra.toLocaleString('es-AR')}` : '—'}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {d.venta != null ? `$${d.venta.toLocaleString('es-AR')}` : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top crypto */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Crypto</h3>
                <a href="/crypto" className="text-xs text-amber-400 hover:underline">Ver más →</a>
              </div>
              <div className="divide-y divide-zinc-800">
                {crypto.slice(0, 6).map(c => (
                  <div key={c.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white">{c.symbol}</span>
                      <span className="text-[10px] text-zinc-500 ml-1.5">{c.name}</span>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="text-xs font-semibold text-white">
                        ${c.price.toLocaleString('en-US', { maximumFractionDigits: c.price < 1 ? 4 : 0 })}
                      </p>
                      <p className={`text-[10px] ${c.change24h >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                        {c.change24h >= 0 ? '▲' : '▼'} {Math.abs(c.change24h).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Polymarket */}
            <Suspense fallback={<div className="h-48 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />}>
              <PolymarketWidget />
            </Suspense>

            {/* Navegación rápida */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Explorar</h3>
              <div className="space-y-1.5">
                <CategoryPill label="Mercados" href="/mercados" color="text-orange-400" />
                <CategoryPill label="Crypto" href="/crypto" color="text-yellow-400" />
                <CategoryPill label="Divisas" href="/divisas" color="text-amber-400" />
                <CategoryPill label="Noticias" href="/noticias" color="text-blue-400" />
                <CategoryPill label="Finanzas" href="/finanzas" color="text-purple-400" />
                <CategoryPill label="Glosario" href="/glosario" color="text-pink-400" />
              </div>
            </div>

            {/* Banner upgrade */}
            <div className="bg-gradient-to-br from-amber-900/20 to-zinc-900 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">IN Pro</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Copiloto IA completo, fuentes en tiempo real, alertas de mercado y análisis profundo para inversores LATAM.
              </p>
              <a href="/planes" className="inline-block mt-3 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg transition-colors w-full text-center">
                Ver planes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
