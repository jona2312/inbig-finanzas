'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface AdminSidebarProps {
  user: { name: string; email: string }
}

const NAV = [
  { href: '/admin/dashboard',  label: 'Dashboard',   icon: '📊' },
  { href: '/admin/users',      label: 'Usuarios',     icon: '👥' },
  { href: '/admin/content',    label: 'Contenido',    icon: '📰' },
  { href: '/admin/workflows',  label: 'Workflows',    icon: '⚙️' },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <p className="text-white font-bold text-sm">INBIG</p>
        <p className="text-zinc-500 text-xs">Command Center</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${active
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }
              `}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Separador — link al sitio */}
      <div className="px-3 py-3 border-t border-zinc-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          <span>🌐</span> Ver sitio
        </Link>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <p className="text-xs text-white font-medium truncate">{user.name}</p>
        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        <span className="inline-block mt-1 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>
    </aside>
  )
}
