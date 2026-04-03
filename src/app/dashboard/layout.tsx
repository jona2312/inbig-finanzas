import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserTier } from '@/types/database'

/**
 * Layout del Cockpit del Trader
 * Requiere autenticación + tier de pago (in_basic, in_pro, in_pro_plus).
 * Usuarios lector son redirigidos a /planes para que elijan un plan.
 */

const PAID_TIERS: UserTier[] = ['in_basic', 'in_pro', 'in_pro_plus']

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
  const { data: profile } = await supabase
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
      {children}
    </div>
  )
}
