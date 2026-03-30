'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { TrendingUp, Menu, X, Zap } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Al Día',   href: '/al-dia'   },
  { label: 'Mercados', href: '/mercados'  },
  { label: 'Crypto',   href: '/crypto'    },
  { label: 'Divisas',  href: '/divisas'   },
  { label: 'Noticias', href: '/noticias'  },
  { label: 'Gráficos', href: '/grafico'   },
  { label: '🔴 Sala',  href: '/sala'      },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Terminal es fullscreen — sin navbar
  if (pathname === '/terminal') return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            <span className="text-white">
              IN<span className="text-amber-500">big</span>
            </span>
            <span className="text-zinc-500 font-normal text-sm hidden sm:block">Finanzas</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className="w-px h-4 bg-zinc-800 mx-1" />

            {/* Terminal — destacado */}
            <Link
              href="/terminal"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Terminal
              <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-700/40 px-1.5 py-0.5 rounded-full">
                PRO
              </span>
            </Link>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/planes"
              className="hidden md:block text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1.5"
            >
              Planes
            </Link>
            <Link
              href="/login"
              className="hidden sm:block text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="text-sm bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              Gratis →
            </Link>
            <button
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-zinc-800 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/terminal"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-400 hover:bg-zinc-800 transition-colors"
            >
              <Zap className="h-4 w-4" />
              Terminal Pro
            </Link>
            <Link
              href="/planes"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Ver planes
            </Link>
            <div className="border-t border-zinc-800 pt-3 mt-2 flex gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm border border-zinc-700 rounded-xl px-3 py-2 text-zinc-400 hover:text-white transition-colors">
                Ingresar
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm bg-amber-600 hover:bg-amber-500 text-white rounded-xl px-3 py-2 font-semibold transition-colors">
                Empezar gratis →
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
