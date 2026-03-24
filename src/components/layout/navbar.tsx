'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TrendingUp, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Al Día',      href: '/al-dia' },
  { label: 'Mercados',    href: '/mercados' },
  { label: 'Crypto',      href: '/crypto' },
  { label: 'Divisas',     href: '/divisas' },
  { label: 'Noticias',    href: '/noticias' },
  { label: 'Finanzas',    href: '/finanzas' },
  { label: 'Herramientas',href: '/herramientas' },
  { label: 'Glosario',    href: '/glosario' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <span className="text-white">
              IN<span className="text-emerald-500">big</span>
            </span>
            <span className="text-muted-foreground font-normal text-sm hidden sm:block">
              Finanzas
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Auth buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="hidden sm:block text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Empezar gratis
            </Link>
            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-border/40 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-border/40 pt-3 mt-2 flex gap-2">
              <Link href="/login" className="flex-1 text-center text-sm border border-border rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">
                Ingresar
              </Link>
              <Link href="/registro" className="flex-1 text-center text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-md px-3 py-2 font-medium">
                Empezar gratis
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
