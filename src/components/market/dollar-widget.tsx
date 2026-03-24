import { getDollarRates } from '@/services/market'
import { cn } from '@/lib/utils'
import { DollarSign } from 'lucide-react'

export async function DollarWidget() {
  const rates = await getDollarRates()
  const priority = ['Oficial', 'Blue', 'MEP', 'CCL', 'Cripto']
  const sorted = priority
    .map(name => rates.find(r => r.nombre === name))
    .filter(Boolean) as typeof rates

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-4 w-4 text-emerald-400" />
        <h3 className="font-semibold text-sm">Dólar hoy</h3>
        <span className="ml-auto text-xs text-muted-foreground">ARS</span>
      </div>
      <div className="space-y-2.5">
        {sorted.map((rate) => (
          <div key={rate.nombre} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground w-16">{rate.nombre}</span>
            <div className="flex gap-4 tabular-nums">
              <span className="text-xs text-muted-foreground">
                C: <span className="text-foreground">${rate.compra?.toLocaleString('es-AR') ?? '—'}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                V: <span className={cn(
                  'font-medium',
                  rate.nombre === 'Blue' ? 'text-emerald-400' : 'text-foreground'
                )}>${rate.venta?.toLocaleString('es-AR') ?? '—'}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
