import { createServerClient } from '@/lib/supabase/server'

export default async function AdminContentPage() {
  const supabase = await createServerClient()

  const [{ data: articles }, { data: briefings }] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, category, published_at, source_name, created_at')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('briefings')
      .select('id, title, tipo, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Contenido</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          {articles?.length ?? 0} artículos · {briefings?.length ?? 0} briefings recientes
        </p>
      </div>

      {/* Briefings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
          <span>📊</span> Briefings — WF3
        </h2>
        {briefings && briefings.length > 0 ? (
          <div className="space-y-2">
            {briefings.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm text-white">{b.title || `Briefing ${b.tipo}`}</p>
                  <p className="text-xs text-zinc-500">{b.tipo}</p>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(b.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">Sin briefings aún. WF3 genera 3 por día.</p>
        )}
      </div>

      {/* Artículos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <span>📰</span> Artículos — WF1
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-3">Título</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Categoría</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Fuente</th>
              <th className="text-left px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {articles?.map((a) => (
              <tr key={a.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white text-sm line-clamp-1">{a.title}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {a.category || '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs hidden md:table-cell">
                  {a.source_name || '—'}
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                  {new Date(a.created_at ?? a.published_at).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
            {(!articles || articles.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-zinc-500">
                  Sin artículos. WF1 genera contenido cada 30 minutos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
