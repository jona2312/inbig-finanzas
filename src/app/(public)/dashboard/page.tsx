import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CockpitHome from '@/components/cockpit/CockpitHome'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cockpit | INbig Finanzas',
  description: 'Tu panel de control de trading',
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <CockpitHome />
}
