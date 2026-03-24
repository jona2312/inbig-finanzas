import type { Metadata } from 'next'
import { getFeaturedArticles, getLatestArticles } from '@/services/articles'
import { getDollarRates, getTopCrypto } from '@/services/market'
import { ArticleCard } from '@/components/news/article-card'
import { DollarWidget } from '@/components/market/dollar-widget'
import { CryptoMiniWidget } from '@/components/market/crypto-mini-widget'
import { Newspaper, TrendingUp, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Al Día — Tu resumen financiero de hoy',
  description: 'Noticias, mercados y briefing IA del día para el inversor latinoamericano.',
}

// Revalidar cada 5 minutos
export const revalidate = 300

export default async function AlDiaPage() {
  const [featured, latest, dollar, crypto] = await Promise.all([
    getFeaturedArticles(3),
    getLatestArticles(15),
    getDollarRates(),
    getTopCrypto(5),
  ])

  const now = new Date()
  const timeStr = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Dólar blue destacado
  const blue = dollar.find(d => d.nombre === 'Blue')
  const oficial = dollar.find(d => d.nombre === 'Oficial')

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">

      {/* Header del día */}
      <div className="mb-6">
        <p className="text-muted-foreground text-sm capitalize">{dateStr} · {timeStr}</p>
        <h1 className="text-2xl font-bold mt-1">Al Día</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tu resumen financiero del día para LATAM
        </p>
      </div>

      {/* Macro pills — datos clave arriba */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {blue && (
          <div className="rounded-xl border border-border/40 bg-card p-3">
            <p className="text-xs text-muted-foreground">Dólar Blue</p>
            <p className="text-xl font-bold tabular-nums text-emerald-400">
              ${blue.venta?.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-muted-foreground">venta</p>
          </div>
        )}
        {oficial && (
          <div className="rounded-xl border border-border/40 bg-card p-3">
            <p className="text-xs text-muted-foreground">Dólar Oficial</p>
            <p className="text-xl font-bold tabular-nums">
              ${oficial.venta?.toLocaleString('es-AR')}
            </p>
            <p className="text-xs text-muted-foreground">venta</p>
          </div>
        )}
        {crypto[0] && (
          <div className="rounded-xl border border-border/40 bg-card p-3">
            <p className="text-xs text-muted-foreground">Bitcoin</p>
            <p className="text-xl font-bold tabular-nums">
              ${crypto[0].price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className={`text-xs ${crypto[0].change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {crypto[0].change24h >= 0 ? '▲' : '▼'} {Math.abs(crypto[0].change24h).toFixed(2)}%
            </p>
          </div>
        )}
        {crypto[1] && (
          <div className="rounded-xl border border-border/40 bg-card p-3">
            <p className="text-xs text-muted-foreground">Ethereum</p>
            <p className="text-xl font-bold tabular-nums">
              ${crypto[1].price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className={`text-xs ${crypto[1].change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {crypto[1].change24h >= 0 ? '▲' : '▼'} {Math.abs(crypto[1].change24h).toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Briefing IA — placeholder por ahora */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">INbig Intelligence · Briefing del día</span>
            </div>
            <p className="text-sm text-muted-foreground">
              El mercado opera con cautela tras la señal hawkish de la Fed.
              El riesgo país argentino retrocede levemente. Bitcoin consolida sobre los $64K.
              Agenda clave: datos de empleo EE.UU. el jueves.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              IA disponible para suscriptores IN Pro · <span className="text-emerald-400 cursor-pointer hover:underline">Ver planes</span>
            </p>
          </div>

          {/* Noticias destacadas */}
          {featured.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <h2 className="font-semibold text-sm">Destacadas</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featured.slice(0, 2).map(article => (
                  <ArticleCard key={article.id} article={article} variant="featured" />
                ))}
              </div>
            </section>
          )}

          {/* Feed de últimas noticias */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Últimas noticias</h2>
              </div>
              <a href="/noticias" className="text-xs text-emerald-400 hover:underline">
                Ver todas →
              </a>
            </div>
            <div className="space-y-2">
              {latest.map(article => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <DollarWidget />
          <CryptoMiniWidget />

          {/* Categorías rápidas */}
          <div className="rounded-xl border border-border/40 bg-card p-4">
            <h3 className="font-semibold text-sm mb-3">Secciones</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Mercados', href: '/mercados', color: 'text-orange-400' },
                { label: 'Crypto', href: '/crypto', color: 'text-yellow-400' },
                { label: 'Divisas', href: '/divisas', color: 'text-emerald-400' },
                { label: 'Empresas', href: '/noticias?cat=empresas', color: 'text-purple-400' },
                { label: 'Argentina', href: '/noticias?cat=argentina', color: 'text-sky-400' },
                { label: 'Glosario', href: '/glosario', color: 'text-pink-400' },
              ].map(({ label, href, color }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm py-2 px-3 rounded-lg border border-border/40 hover:bg-accent transition-colors text-center"
                >
                  <span className={color}>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
