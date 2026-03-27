const WORKFLOWS = [
  {
    id: 'WF1',
    name: 'Editor de Noticias RSS',
    llm: 'Groq llama-3.3-70b',
    schedule: 'Cada 30 min',
    status: 'active' as const,
    description: 'Lee feeds RSS, filtra y resume noticias con Groq. Guarda en tabla articles.',
    n8nUrl: 'https://n8n.inbigfinanzas.com',
  },
  {
    id: 'WF2',
    name: 'Deduplicación y Filtrado',
    llm: 'Groq llama-3.3-70b',
    schedule: 'Cada 30 min',
    status: 'warning' as const,
    description: 'Elimina duplicados y filtra contenido de baja calidad. Pendiente diagnóstico.',
    n8nUrl: 'https://n8n.inbigfinanzas.com',
  },
  {
    id: 'WF3',
    name: 'Briefing Premium 3x/día',
    llm: 'Gemini Flash gemini-2.0-flash',
    schedule: '9:30 · 15:30 · 21:30 ART',
    status: 'active' as const,
    description: 'Genera briefings editoriales en 3 cortes del día con contexto macro LATAM.',
    n8nUrl: 'https://n8n.inbigfinanzas.com',
  },
  {
    id: 'WF4',
    name: 'Asistente Básico IN Pro',
    llm: 'Groq llama-3.3-70b',
    schedule: 'On-demand',
    status: 'pending' as const,
    description: 'Webhook para queries del asistente de usuarios Pro. Fase 1.',
    n8nUrl: 'https://n8n.inbigfinanzas.com',
  },
  {
    id: 'WF5',
    name: 'Financial Research Copilot',
    llm: 'Gemini Flash + RAG + FinBERT',
    schedule: 'On-demand',
    status: 'fase2' as const,
    description: 'Stack 4 capas: OpenBB + FinBERT + pgvector + Gemini Flash. Pro+ exclusivo.',
    n8nUrl: 'https://n8n.inbigfinanzas.com',
  },
  {
    id: 'WF6',
    name: 'Reportes Especiales',
    llm: 'Gemini Flash gemini-2.0-flash',
    schedule: 'Manual / cron',
    status: 'fase2' as const,
    description: 'Reportes semanales y especiales. Análisis profundo con contexto histórico.',
    n8nUrl: 'https://n8n.inbigfinanzas.com',
  },
]

const STATUS_CONFIG = {
  active:  { label: 'Activo',    color: 'text-emerald-400 bg-emerald-900/30', dot: 'bg-emerald-400' },
  warning: { label: 'Alerta',    color: 'text-yellow-400 bg-yellow-900/30',   dot: 'bg-yellow-400 animate-pulse' },
  pending: { label: 'Pendiente', color: 'text-blue-400 bg-blue-900/30',       dot: 'bg-blue-400' },
  fase2:   { label: 'Fase 2',    color: 'text-zinc-400 bg-zinc-800',          dot: 'bg-zinc-600' },
}

export default function AdminWorkflowsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Workflows n8n</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Estado de los 6 pipelines de automatización</p>
        </div>
        <a
          href="https://n8n.inbigfinanzas.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 px-4 py-2 rounded-lg transition-colors"
        >
          Abrir n8n →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {WORKFLOWS.map((wf) => {
          const s = STATUS_CONFIG[wf.status]
          return (
            <div
              key={wf.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-xs font-mono bg-zinc-800 px-2 py-0.5 rounded">
                    {wf.id}
                  </span>
                  <h3 className="text-white font-medium text-sm">{wf.name}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>
                    {s.label}
                  </span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm mb-4">{wf.description}</p>

              <div className="flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-3">
                  <span className="bg-zinc-800 px-2 py-1 rounded font-mono">{wf.llm}</span>
                </div>
                <span>{wf.schedule}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
