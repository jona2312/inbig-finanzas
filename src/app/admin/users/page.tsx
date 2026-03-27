import { createClient } from '@/lib/supabase/server'

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  lector:      { label: 'Lector',   color: 'text-zinc-400 bg-zinc-800' },
  in_basic:    { label: 'INBásico', color: 'text-blue-400 bg-blue-900/30' },
  in_pro:      { label: 'IN Pro',   color: 'text-yellow-400 bg-yellow-900/30' },
  in_pro_plus: { label: 'IN Pro+',  color: 'text-purple-400 bg-purple-900/30' },
}

export default async function AdminUsersPage() {
  const supabase = createClient()

  const { data: usersRaw } = await supabase
    .from('users')
    .select('id, email, full_name, tier, country, created_at, subscription_status, onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(100)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = usersRaw as any[]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Usuarios</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{users?.length ?? 0} usuarios registrados</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Usuario</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">País</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Estado suscripción</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Onboarding</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users?.map((u) => {
              const tierInfo = TIER_LABELS[u.tier] ?? { label: u.tier, color: 'text-zinc-400 bg-zinc-800' }
              return (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{u.full_name || '—'}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tierInfo.color}`}>
                      {tierInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {u.country || '—'}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.subscription_status === 'active'
                        ? 'text-emerald-400 bg-emerald-900/30'
                        : 'text-zinc-500 bg-zinc-800'
                    }`}>
                      {u.subscription_status || 'inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={u.onboarding_completed ? 'text-emerald-400' : 'text-zinc-600'}>
                      {u.onboarding_completed ? '✓' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden lg:table-cell">
                    {new Date(u.created_at).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              )
            })}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                  Sin usuarios aún. El primero en registrarse aparecerá aquí.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
