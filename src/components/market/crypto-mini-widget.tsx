import { getTopCrypto } from '@/services/market'
import { cn } from '@/lib/utils'
import { Bitcoin } from 'lucide-react'

export async function CryptoMiniWidget() {
  const coins = await getTopCrypto(5)

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Bitcoin className="h-4 w-4 text-yellow-400" />
        <h3 className="font-semibold text-sm">Crypto top 5</h3>
        <span className="ml-auto text-xs text-muted-foreground">USD</span>
      </div>
      <div className="space-y-2.5">
        {coins.map((coin) => (
          <div key={coin.id} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium w-12">{coin.symbol}</span>
            <span className="tabular-nums text-foreground text-xs">
              ${coin.price.toLocaleString('en-US', {
                minimumFractionDigits: coin.price < 1 ? 4 : 0,
                maximumFractionDigits: coin.price < 1 ? 4 : 2,
              })}
            </span>
            <span className={cn(
              'text-xs tabular-nums w-14 text-right',
              coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
            )}>
              {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
