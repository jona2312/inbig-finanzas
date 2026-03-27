import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

/**
 * Layout del Command Center — solo accesible con is_admin = true
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, full_name, email, tier')
    .eq('id', user.id)
    .single() as { data: any }

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <AdminSidebar user={{ name: profile.full_name ?? profile.email ?? '', email: profile.email ?? '' }} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
