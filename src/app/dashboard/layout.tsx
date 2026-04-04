import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { UserTier } from '@/types/database'

/**
 * Layout del Cockpit del Trader
 * Requiere autenticación + tier de pago (in_basic, in_pro, in_pro_plus).
 * Usuarios lector son redirigidos a /planes para que elijan un plan.
 */

const PAID_TIERS: UserTier[] = ['in_basic', 'in_pro', 'in_pro_plus']

const NAV_LINKS = [
  { href: '/dashboard/journal', label: 'Diario' },
  { href: '/dashboard/copilot', label: 'Copilot ✦' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch tier del perfil del usuario
  const { data: profile } = await (supabase as any)
    .from('users')
    .select('tier')
    .eq('id', user.id)
    .single()

  const tier = (profile?.tier ?? 'lector') as UserTier

  if (!PAID_TIERS.includes(tier)) {
    redirect('/planes?upgrade=required')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Top nav bar */}
      <nav className="border-b border-zinc-800 px-6 py-3 flex items-center gap-6">
        <span className="text-sm font-bold text-white tracking-wide mr-4">INbig</span>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}
