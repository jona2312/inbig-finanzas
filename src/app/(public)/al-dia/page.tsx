import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Al Día — Resumen del Mercado',
}

export default function AlDiaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Al Día</h1>
      <p className="text-muted-foreground mb-8">
        Resumen del mercado, noticias destacadas y movimientos del día.
      </p>
      {/* TODO: MarketSummaryWidget, NewsHighlights, AIChatWidget */}
      <div className="rounded-lg border border-border/40 p-8 text-center text-muted-foreground">
        Próximamente: resumen de mercado + noticias + chat IA
      </div>
    </div>
  )
}
