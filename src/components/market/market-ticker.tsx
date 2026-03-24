'use client'

// Ticker superior con datos en tiempo real (placeholder — conectar con API)
const TICKER_ITEMS = [
  { symbol: 'BTC', price: 64200, change: 2.4 },
  { symbol: 'ETH', price: 3100, change: 1.8 },
  { symbol: 'USD/ARS', price: 1045, change: 0.3 },
  { symbol: 'MERVAL', price: 1820000, change: 1.1 },
  { symbol: 'S&P500', price: 5280, change: -0.4 },
  { symbol: 'EUR/USD', price: 1.085, change: -0.2 },
]

export function MarketTicker() {
  return (
    <div className="bg-zinc-900 border-b border-border/40 overflow-hidden py-1">
      <div className="flex animate-marquee gap-8 whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">{item.symbol}</span>
            <span className="text-foreground">
              {item.price.toLocaleString('es-AR')}
            </span>
            <span
              className={
                item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }
            >
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
