import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Noticias',
}

export default function NoticiasPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Noticias</h1>
      <div className="rounded-lg border border-border/40 p-8 text-center text-muted-foreground mt-8">
        En construcción...
      </div>
    </div>
  )
}
