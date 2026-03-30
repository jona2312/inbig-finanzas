'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DiarioTrader } from '@/components/journal/DiarioTrader'

/**
 * /dashboard/journal/[id]
 * Página del diario de un trade específico.
 * Usa DiarioTrader para el flujo antes/durante/después.
 */
export default function TradeDiaryPage() {
  const params = useParams()
  const tradeId = params.id as string

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back nav */}
        <Link
          href="/dashboard/journal"
          className="text-zinc-500 hover:text-zinc-300 text-sm mb-5 block transition-colors"
        >
          ← Volver al diario
        </Link>

        {/* Trade diary component */}
        <DiarioTrader
          tradeId={tradeId}
          onClose={() => { window.history.back() }}
        />

        {/* Footer hint */}
        <p className="text-center text-xs text-zinc-700 mt-6">
          El copiloto lee este diario para personalizar tu entrenamiento — no para juzgarte.
        </p>
      </div>
    </div>
  )
}
