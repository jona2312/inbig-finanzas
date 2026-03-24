import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MarketTicker } from '@/components/market/market-ticker'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketTicker />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
