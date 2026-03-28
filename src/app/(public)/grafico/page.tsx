/**
 * /grafico — Terminal de graficación pública (sin login requerido)
 *
 * Cualquier usuario puede graficar cualquier activo: acciones BYMA,
 * CEDEARs, ETFs, índices, cripto — gratis, usando FMP data.
 *
 * Server Component wrapper → el LightweightChart es Client Component.
 */

import type { Metadata } from 'next'
import { GraficoTerminal } from '@/components/market/grafico-terminal'

export const metadata: Metadata = {
  title: 'Graficador gratis — INBIG Finanzas',
  description: 'Graficá cualquier acción, CEDEAR, ETF o criptomoneda en tiempo real. Gratis, sin registro.',
}

// Lista de símbolos sugeridos para el search
const SUGGESTED_SYMBOLS = [
  // BYMA / CEDEARs populares
  { symbol: 'GGAL',  label: 'Galicia',       type: 'BYMA'  },
  { symbol: 'YPF',   label: 'YPF',           type: 'NYSE'  },
  { symbol: 'MELI',  label: 'MercadoLibre',  type: 'NASDAQ'},
  { symbol: 'BMA',   label: 'Macro',         type: 'BYMA'  },
  { symbol: 'BBAR',  label: 'Francés',       type: 'BYMA'  },
  { symbol: 'PAMP',  label: 'Pampa',         type: 'BYMA'  },
  { symbol: 'TXAR',  label: 'Ternium',       type: 'BYMA'  },
  { symbol: 'ALUA',  label: 'Aluar',         type: 'BYMA'  },
  // US
  { symbol: 'AAPL',  label: 'Apple',         type: 'NASDAQ'},
  { symbol: 'TSLA',  label: 'Tesla',         type: 'NASDAQ'},
  { symbol: 'NVDA',  label: 'NVIDIA',        type: 'NASDAQ'},
  { symbol: 'AMZN',  label: 'Amazon',        type: 'NASDAQ'},
  { symbol: 'MSFT',  label: 'Microsoft',     type: 'NASDAQ'},
  { symbol: 'SPY',   label: 'S&P 500 ETF',   type: 'ETF'   },
  { symbol: 'QQQ',   label: 'Nasdaq ETF',    type: 'ETF'   },
  // Cripto
  { symbol: 'BTCUSD',label: 'Bitcoin',       type: 'Cripto'},
  { symbol: 'ETHUSD',label: 'Ethereum',      type: 'Cripto'},
]

export default function GraficoPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">

      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              📈 Terminal de Graficación
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Graficá cualquier activo — gratis, sin registro, datos reales
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-800/40 px-3 py-1 rounded-full">
              ✓ 100% gratuito
            </span>
            <a
              href="/mercados"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              ← Volver a mercados
            </a>
          </div>
        </div>
      </div>

      {/* Terminal — ocupa el resto del viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        <GraficoTerminal suggestions={SUGGESTED_SYMBOLS} />

        {/* Educativo / CTA Pro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-300 mb-1">📊 ¿Qué estás viendo?</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Velas japonesas (OHLCV) con datos históricos reales de FMP. Podés cambiar símbolo y período en tiempo real.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-zinc-300 mb-1">🔎 Buscá cualquier símbolo</p>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              BYMA, CEDEARs, NYSE, NASDAQ, ETFs o cripto. Escribí el ticker (ej: GGAL, MELI, BTCUSD).
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-800/40 rounded-xl p-4">
            <p className="text-xs font-semibold text-white mb-1">🚀 Suscribite a Pro</p>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
              Indicadores técnicos, alertas de precio, portfolio tracking y análisis IA.
            </p>
            <a
              href="/planes"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Ver planes →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
