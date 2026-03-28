/**
 * / — Landing page principal de INBIG Finanzas
 * "El Netflix Financiero de LATAM"
 *
 * Server Component — incluye Navbar + MarketTicker directamente
 * (no está dentro del grupo (public) para evitar conflicto de rutas)
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { MarketTicker } from '@/components/market/market-ticker'
import { getDollarRates, getTopCrypto } from '@/services/market'

export const metadata: Metadata = {
  title: 'INBIG Finanzas — El Netflix Financiero de LATAM',
  description: 'Noticias en vivo, terminal Bloomberg, IA financiera y comunidad de traders. Gratis para empezar.',
}

export const revalidate = 300

const FEATURES = [
  {
    icon: '📰',
    title: 'Noticiero en vivo',
    desc: 'Noticias financieras de LATAM y el mundo, briefings IA diarios, dólar y cripto al instante.',
    href: '/al-dia',
    tag: 'Gratis',
  },
  {
    icon: '📊',
    title: 'Terminal Bloomberg',
    desc: 'TradingView charts avanzados, watchlist propia, screener IA, indicadores técnicos completos.',
    href: '/terminal',
    tag: 'Plus',
  },
  {
    icon: '🌍',
    title: 'Bolsas del mundo',
    desc: '23 mercados globales en tiempo real. Sabé qué bolsas están abiertas ahora mismo.',
    href: '/mercados',
    tag: 'Basic',
  },
  {
    icon: '🤖',
    title: 'Copilot IA',
    desc: '¿Qué está pasando con el Merval hoy? Preguntá lo que quieras. Respuestas en segundos.',
    href: '/al-dia',
    tag: 'Gratis',
  },
  {
    icon: '💱',
    title: 'Dólar · Cripto · Forex',
    desc: 'Blue, MEP, CCL, BTC, ETH, EUR/USD. Datos en tiempo real, sin delays.',
    href: '/divisas',
    tag: 'Gratis',
  },
  {
    icon: '👥',
    title: 'Comunidad de traders',
    desc: 'Mirá qué están operando otros traders en tiempo real. Mini trading floor bancario.',
    href: '/terminal',
    tag: 'Plus',
  },
]

const TESTIMONIALS = [
  {
    text: 'Es como tener Bloomberg en el celular, pero en español y sin pagar una fortuna.',
    user: 'Rodrigo V.',
    role: 'Trader independiente · Buenos Aires',
  },
  {
    text: 'El copilot IA me ahorra horas de investigación todos los días.',
    user: 'Camila M.',
    role: 'Gestora de carteras · México',
  },
  {
    text: 'Por fin una plataforma pensada para LATAM. Los datos del dólar blue en tiempo real son clave.',
    user: 'Diego F.',
    role: 'Inversor retail · Colombia',
  },
]

const TAG_COLORS: Record<string, string> = {
  'Gratis': 'bg-zinc-800 text-zinc-400 border-zinc-700',
  'Basic':  'bg-blue-500/10 text-blue-400 border-blue-700/40',
  'Plus':   'bg-emerald-500/10 text-emerald-400 border-emerald-700/40',
}

export default async function LandingPage() {
  const [dollar, crypto] = await Promise.allSettled([
    getDollarRates(),
    getTopCrypto(3),
  ])

  const dollarData = dollar.status === 'fulfilled' ? dollar.value : null
  const cryptoData = crypto.status === 'fulfilled' ? crypto.value : []

  const blueRate = dollarData?.find(d => d.nombre?.toLowerCase().includes('blue'))
  const btcPrice = cryptoData.find(c => c.symbol === 'BTC' || c.id === 'bitcoin')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <MarketTicker />
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-800/40 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            El Netflix Financiero de LATAM — Gratis para empezar
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-none">
            Tu terminal financiera,<br />
            <span className="text-emerald-400">hecha a tu medida</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Noticias en vivo · Mercados en tiempo real · IA que te asesora · Comunidad de traders.
            <br className="hidden sm:block" />
            Todo en un lugar. Empezá gratis hoy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95">
              Empezar gratis →
            </Link>
            <Link href="/terminal" className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-colors border border-zinc-700">
              Ver la terminal →
            </Link>
          </div>

          {/* Live data pills */}
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            {blueRate && (
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
                <span className="text-zinc-500">🇦🇷 Blue</span>
                <span className="font-mono font-bold text-white">${blueRate.venta?.toLocaleString('es-AR') ?? '—'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            )}
            {btcPrice && (
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
                <span className="text-zinc-500">₿ BTC</span>
                <span className="font-mono font-bold text-white">
                  ${btcPrice.price?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'}
                </span>
                <span className={`text-xs font-medium ${(btcPrice.change24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(btcPrice.change24h ?? 0) >= 0 ? '+' : ''}{btcPrice.change24h?.toFixed(2) ?? '0'}%
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2">
              <span className="text-zinc-500">🌍 Bolsas</span>
              <span className="font-medium text-white">En vivo ahora</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Todo lo que necesitás en un solo lugar</h2>
          <p className="text-zinc-400">Desde el noticiero gratis hasta la terminal Pro — escalá cuando quieras.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <Link key={f.title} href={f.href}
              className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{f.icon}</span>
                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${TAG_COLORS[f.tag]}`}>{f.tag}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── TERMINAL PREVIEW ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-4 pb-20">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Mock header */}
          <div className="border-b border-zinc-800 px-5 py-3 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-xs font-mono text-zinc-500">INBIG Terminal · Plus</span>
            </div>
            <span className="text-[10px] text-zinc-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
            </span>
          </div>

          <div className="grid grid-cols-12 divide-x divide-zinc-800" style={{ height: '260px' }}>
            {/* Watchlist */}
            <div className="col-span-2 p-3">
              <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-2">Watchlist</p>
              {[
                { sym:'GGAL', p:'$3.80', c:'+2.4%', pos:true },
                { sym:'MELI', p:'$2,180', c:'+1.1%', pos:true },
                { sym:'XAUUSD', p:'$3,120', c:'-0.3%', pos:false },
                { sym:'BTCUSD', p:'$84.2k', c:'+3.2%', pos:true },
                { sym:'SPY', p:'$562', c:'-0.8%', pos:false },
              ].map(s => (
                <div key={s.sym} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50">
                  <span className="text-[10px] font-mono font-bold text-white">{s.sym}</span>
                  <span className={`text-[9px] font-mono ${s.pos ? 'text-emerald-400' : 'text-red-400'}`}>{s.c}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="col-span-7 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono font-bold text-white">GGAL</span>
                <span className="text-xs text-zinc-500">Galicia · BYMA</span>
                <span className="ml-auto text-xs text-emerald-400 font-mono">$3.80 +2.4%</span>
              </div>
              <svg viewBox="0 0 400 160" className="flex-1 w-full">
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[40,80,120].map(y => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#27272a" strokeWidth="0.5" />
                ))}
                <path d="M 0,120 C 20,110 40,90 60,95 S 100,80 120,85 S 160,70 180,65 S 220,50 240,55 S 280,40 300,45 S 340,30 360,25 L 400,20 L 400,160 L 0,160 Z" fill="url(#cg)" />
                <path d="M 0,120 C 20,110 40,90 60,95 S 100,80 120,85 S 160,70 180,65 S 220,50 240,55 S 280,40 300,45 S 340,30 360,25 L 400,20" fill="none" stroke="#10b981" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Panel */}
            <div className="col-span-3 p-3 space-y-3">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">🤖 Copilot IA</p>
                <div className="bg-zinc-800 rounded-lg p-2 text-[10px] text-zinc-300 leading-relaxed">
                  &ldquo;GGAL subió +2.4% hoy. El sector bancario AR reacciona positivamente a la baja del riesgo país...&rdquo;
                </div>
              </div>
              <div>
                <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">👥 Comunidad</p>
                {[
                  { u:'R***o', a:'ve', s:'XAUUSD', f:'🇦🇷' },
                  { u:'C***a', a:'graficó', s:'NVDA', f:'🇲🇽' },
                  { u:'J***s', a:'ve', s:'MELI', f:'🇧🇷' },
                ].map((x,i) => (
                  <div key={i} className="text-[9px] text-zinc-500 py-0.5">
                    {x.f} <span className="text-white">{x.u}</span> {x.a} <span className="text-emerald-400 font-mono">{x.s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 px-5 py-4 flex items-center justify-between bg-zinc-950/50">
            <p className="text-sm text-zinc-400">
              Esta es tu terminal. <span className="text-white font-medium">Personalizala con tu trading plan.</span>
            </p>
            <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
              Empezar gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-8 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Lo que dicen los traders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <p className="text-sm font-semibold text-white">{t.user}</p>
              <p className="text-xs text-zinc-500">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING CTA ──────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-emerald-500/10 via-zinc-900 to-zinc-900 border border-emerald-800/30 rounded-2xl p-12 text-center">
          <p className="text-emerald-400 text-sm font-semibold mb-3 uppercase tracking-wider">Empezá hoy</p>
          <h2 className="text-3xl font-bold text-white mb-4">
            Gratis para siempre.<br />Pro cuando estés listo.
          </h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            Sin tarjeta para empezar. Escalá a Basic ($8), Plus ($18) o Premium ($35) cuando necesites más.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 text-lg">
              Crear cuenta gratis →
            </Link>
            <Link href="/planes" className="border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg">
              Ver planes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer mini */}
      <div className="border-t border-zinc-800 py-8 text-center">
        <p className="text-zinc-600 text-sm">
          © 2026 INBIG Finanzas · Buenos Aires, Argentina ·{' '}
          <Link href="/planes" className="hover:text-zinc-400 transition-colors">Planes</Link>
          {' · '}
          <Link href="/terminal" className="hover:text-zinc-400 transition-colors">Terminal</Link>
          {' · '}
          <Link href="/al-dia" className="hover:text-zinc-400 transition-colors">Noticiero</Link>
        </p>
      </div>
    </div>
  )
}
