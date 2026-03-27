import { getPolymarketEvents, formatVolume } from '@/services/polymarket'

/**
 * Widget Polymarket — Mercados de predicción relevantes para LATAM/finanzas globales
 * Server Component — se renderiza en el servidor con datos reales
 */
export async function PolymarketWidget() {
  const events = await getPolymarketEvents(4)

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-zinc-300">Mercados de predicción</h2>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
            Polymarket
          </span>
        </div>
        <a
          href="https://polymarket.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Ver todos →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {events.map((event) => {
          const topOutcome = event.outcomes.reduce((a, b) => a.price > b.price ? a : b, event.outcomes[0])
          const pct = topOutcome ? Math.round(topOutcome.price * 100) : null

          return (
            <a
              key={event.id}
              href={`https://polymarket.com/event/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-colors group block"
            >
              {/* Título */}
              <p className="text-sm text-white font-medium leading-snug mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
                {event.title}
              </p>

              {/* Outcomes */}
              {event.outcomes.length >= 2 && (
                <div className="space-y-1.5 mb-3">
                  {event.outcomes.slice(0, 2).map((o) => {
                    const pct = Math.round(o.price * 100)
                    return (
                      <div key={o.title} className="flex items-center gap-2">
                        <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${pct >= 50 ? 'bg-emerald-500' : 'bg-zinc-600'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-mono w-8 text-right ${pct >= 50 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {pct}%
                        </span>
                        <span className="text-xs text-zinc-500 truncate w-12">{o.title}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>Vol: {formatVolume(event.volume)}</span>
                <span>
                  {event.endDate
                    ? `Cierra ${new Date(event.endDate).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`
                    : ''}
                </span>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
