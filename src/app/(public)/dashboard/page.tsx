/**
 * /dashboard — Dashboard personalizado del usuario
 *
 * Server component:
 * - Si no está autenticado → redirect a /login
 * - Si no tiene trading plan → muestra AIOnboarding
 * - Si tiene plan → muestra PersonalDashboard
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AIOnboarding } from '@/components/dashboard/AIOnboarding'
import { PersonalDashboard } from '@/components/dashboard/PersonalDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi Dashboard — INBIG Finanzas' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile + trading plan in parallel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profileRes, planRes] = await Promise.all([
    (supabase as any).from('profiles').select('full_name, tier').eq('id', user.id).single(),
    (supabase as any).from('trading_plans').select('*').eq('user_id', user.id).single(),
  ])

  const profile = profileRes.data as { full_name: string | null; tier: string } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan = planRes.data as any

  // If no plan yet → conversational onboarding
  if (!plan) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Configurá tu dashboard</h1>
            <p className="text-zinc-400 text-sm">
              Personalizamos tu experiencia en base a tus mercados y perfil de riesgo.
            </p>
          </div>
          <AIOnboarding />
        </div>
      </div>
    )
  }

  // Plan exists → render personalized dashboard
  return (
    <PersonalDashboard
      plan={plan}
      userName={profile?.full_name ?? null}
    />
  )
}
