import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // Métricas en paralelo
  const [
    { count: totalUsers },
    { count: proUsers },
    { count: proPlusUsers },
    { count: totalArticles },
    { count: totalBriefings },
    { data: recentEventsData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'in_pro'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tier', 'in_pro_plus'),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('briefings').select('*', { count: 'exact', head: true }),
    supabase.from('user_events')
      .select('event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const metrics = [
    { label: 'Usuarios totales',  value: totalUsers  ?? 0, color: 'text-blue-400',    icon: '👥' },
    { label: 'IN Pro',            value: proUsers    ?? 0, color: 'text-yellow-400',  icon: '⭐' },
    { label: 'IN Pro+',           value: proPlusUsers?? 0, color: 'text-purple-400',  icon: '💎' },
    { label: 'Artículos',         value: totalArticles?? 0,color: 'text-emerald-400', icon: '📰' },
    { label: 'Briefings',         value: totalBriefings??0, color: 'text-orange-400', icon: '📊' },
  ]

  // Agrupar eventos por tipo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentEvents = (recentEventsData ?? []) as any[]
  const eventCounts = recentEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.event_type] = (acc[e.event_type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Command Center</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Panel de control — INBIG Finanzas</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-2xl mb-1">{m.icon}</div>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value.toLocaleString()}</p>
            <p className="text-xs text-zinc-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Eventos recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos 20 eventos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-zinc-300 mb-4">Últimos eventos de usuario</h2>
          {recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-2">
              {recentEvents.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-300 font-mono bg-zinc-800 px-2 py-0.5 rounded text-xs">
                    {e.event_type}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {new Date(e.created_at).toLocaleTimeString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Sin eventos aún. El tracking comienza cuando lleguen usuarios.</p>
          )}
        </div>

        {/* Distribución de eventos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-zinc-300 mb-4">Distribución de eventos (últimos 20)</h2>
          {Object.keys(eventCounts).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(eventCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(count / 20) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-24 truncate">{type}</span>
                    <span className="text-xs text-zinc-500 w-4 text-right">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Sin datos de eventos aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
