import type { Metadata } from 'next'
import { getDollarRates } from '@/services/market'
import { DivisaCard } from '@/components/market/divisa-card'
import { SpreadIndicator } from '@/components/market/spread-indicator'
import { TradingViewWidget } from '@/components/market/tradingview-widget'

export const metadata: Metadata = { title: 'Divisas — INBIG Finanzas' }
export const revalidate = 300 // 5 min

// Íconos y colores por tipo de dólar
const DOLLAR_META: Record<string, { icon: string; desc: string; color: string }> = {
  oficial:    { icon: '🏦', desc: 'Tipo de cambio regulado por el BCRA',             color: 'blue'   },
  blue:       { icon: '💵', desc: 'Mercado informal. Referencia del mercado real',    color: 'green'  },
  mep:        { icon: '📈', desc: 'Dólar bolsa. Operado en mercado de capitales',     color: 'purple' },
  contadoconliquidacion: { icon: '🌐', desc: 'Para girar fondos al exterior',         color: 'orange' },
  cripto:     { icon: '₿',  desc: 'Implícito en operaciones con stablecoins',         color: 'yellow' },
  mayorista:  { icon: '🏭', desc: 'Para importadores y exportadores',                 color: 'cyan'   },
  tarjeta:    { icon: '💳', desc: 'Oficial + impuesto PAIS + percepción AFIP',        color: 'red'    },
}

function normalize(nombre: string): string {
  return nombre.toLowerCase().replace(/\s/g, '').replace('con liquidación', 'contadoconliquidacion')
}

export default async function DivisasPage() {
  const rates = await getDollarRates()

  // Blue como referencia para spreads
  const blue = rates.find(r => normalize(r.nombre) === 'blue')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Divisas</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              7 tipos de cambio · Actualización cada 5 minutos
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En vivo — DolarAPI
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

        {/* Grid de tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rates.map((rate) => {
            const key  = normalize(rate.nombre)
            const meta = DOLLAR_META[key] ?? { icon: '💱', desc: '', color: 'zinc' }
            return (
              <DivisaCard
                key={rate.nombre}
                nombre={rate.nombre}
                compra={rate.compra}
                venta={rate.venta}
                icon={meta.icon}
                desc={meta.desc}
                color={meta.color}
              />
            )
          })}
        </div>

        {/* Spreads vs Blue */}
        {blue?.venta && (
          <section>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
              Brecha con el Dólar Oficial
            </h2>
            <SpreadIndicator rates={rates} />
          </section>
        )}

        {/* Chart TradingView USD/ARS */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">
            USD/ARS — Histórico
          </h2>
          <TradingViewWidget symbol="FX_IDC:USDARS" height={400} />
        </section>

        {/* Contexto educativo */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: '¿Qué es el dólar Blue?',
              body:  'El tipo de cambio informal que se opera fuera del sistema bancario oficial. Es la referencia más usada en Argentina para medir el valor real del peso.',
            },
            {
              title: '¿Qué es el MEP?',
              body:  'Dólar Mercado Electrónico de Pagos. Se obtiene comprando un bono en pesos y vendiéndolo en dólares en la bolsa. Es legal y accesible para cualquier persona.',
            },
            {
              title: '¿Qué es el CCL?',
              body:  'Contado con liquidación. Similar al MEP pero el bono se vende en el mercado exterior. Permite transferir dólares a cuentas en el extranjero.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  )
}
