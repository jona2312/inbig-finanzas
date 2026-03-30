# DASHBOARD_PAGE_SPEC.md — INbig Cockpit V1

## Objetivo
Crear `src/app/dashboard/page.tsx` como la primera pantalla real del cockpit de trading.
El dashboard integra datos, TV en vivo, copiloto, gráfico y diario en una sola vista.

---

## Layout general

```
┌─────────────────────────────────────────────────────────┐
│  TOP BAR: Logo + estado mercado + usuario               │
├─────────────────────────────────────────────────────────┤
│  HERO BRIEFING (ancho completo)                         │
│  "Buenos días, Jona. El mercado abre en 2h."            │
├───────────────────────┬─────────────────────────────────┤
│  MAIN (2/3)           │  SIDEBAR (1/3)                  │
│  ─────────────────    │  ─────────────────              │
│  Watchlist + sparkl.  │  TV en vivo (LiveChannelPlayer) │
│  Copiloto             │  ─────────────────              │
│  Gráfico principal    │  Acceso rápido al terminal      │
│  Diario / CTA         │                                 │
└───────────────────────┴─────────────────────────────────┘
```

---

## Componentes requeridos

### 1. TopBar
- Logo INbig (izquierda)
- Badge de estado de mercado: PRE-MARKET / ABIERTO / CERRADO / FIN DE SEMANA
  - Lógica basada en UTC-3 (Buenos Aires): NYSE abre 10:30am, cierra 5:00pm
  - Color: amarillo / verde pulsante / rojo / gris
- Avatar/email del usuario (derecha) + link a /settings

### 2. HeroBriefing
**Tipo:** Server Component  
**Props:** `{ user: User, marketState: MarketState }`

Mensajes dinámicos según estado:
| Estado | Mensaje |
|--------|---------|
| `pre-market` | "Buenos días, {nombre}. El mercado abre a las {hora}." |
| `in-session` | "Mercado abierto. Quedan {horas}h {min}m de sesión." |
| `post-session` | "La sesión terminó. Revisá tu diario antes de cerrar." |
| `weekend` | "Fin de semana. Buen momento para revisar tu estrategia." |

### 3. CockpitHome (existente)
**Ubicación:** `src/components/cockpit/CockpitHome.tsx`  
**Uso:** Importar directamente sin props. Se autogestiona (fetches propios).  
**Incluye:** stats, copiloto, checkin, trades recientes.

### 4. LiveChannelPlayer (existente)
**Ubicación:** `src/components/live/LiveChannelPlayer.tsx`  
**Modo:** compact sidebar — altura ~300px  
**Comportamiento:** misma lógica de fallback, sin selector de canal en sidebar.

### 5. TerminalQuickAccess
Card simple con:
- Título "Terminal"
- Watchlist mini (3 símbolos: SPY, BTC, GGAL.BA)
- Botón "Abrir terminal →" → link a `/grafico`

---

## Implementación — `src/app/dashboard/page.tsx`

```tsx
// Server Component — auth ya validada por dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server'
import dynamic from 'next/dynamic'
import CockpitHome from '@/components/cockpit/CockpitHome'

const LiveChannelPlayer = dynamic(
  () => import('@/components/live/LiveChannelPlayer').then(m => m.LiveChannelPlayer),
  { ssr: false }
)

type MarketState = 'pre-market' | 'in-session' | 'post-session' | 'weekend'

function getMarketState(): MarketState {
  const now = new Date()
  const day = now.getUTCDay() // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return 'weekend'
  // UTC-3 = Buenos Aires
  const hoursUTC = now.getUTCHours() + now.getUTCMinutes() / 60
  // NYSE: 13:30-20:00 UTC
  if (hoursUTC < 13.5) return 'pre-market'
  if (hoursUTC < 20) return 'in-session'
  return 'post-session'
}

function getMarketBadge(state: MarketState) {
  const config = {
    'pre-market': { label: 'PRE-MARKET', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    'in-session': { label: 'ABIERTO', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', pulse: true },
    'post-session': { label: 'CERRADO', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    'weekend': { label: 'FIN DE SEMANA', color: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30' },
  }
  return config[state]
}

function getHeroMessage(state: MarketState, name: string): string {
  const hour = new Date().toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires'
  })
  const messages: Record<MarketState, string> = {
    'pre-market': `Buenos días, ${name}. El mercado abre a las 10:30 hs.`,
    'in-session': `Mercado abierto, ${name}. Operar con disciplina.`,
    'post-session': `La sesión terminó. Revisá tu diario antes de cerrar.`,
    'weekend': `Fin de semana. Buen momento para revisar estrategia.`,
  }
  return messages[state]
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const name = user?.email?.split('@')[0] ?? 'Trader'
  const marketState = getMarketState()
  const badge = getMarketBadge(marketState)
  const heroMessage = getHeroMessage(marketState, name)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* TOP BAR */}
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-tight text-white">IN<span className="text-emerald-400">big</span></span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color} ${badge.pulse ? 'animate-pulse' : ''}`}>
            {badge.label}
          </span>
        </div>
        <div className="text-xs text-zinc-500 truncate max-w-[160px]">{user?.email}</div>
      </header>

      {/* HERO BRIEFING */}
      <div className="border-b border-zinc-800/50 bg-zinc-900/30 px-4 py-3">
        <p className="text-sm text-zinc-300">{heroMessage}</p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto">
        {/* Main content — CockpitHome */}
        <div className="lg:col-span-2 space-y-4">
          <CockpitHome />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* TV en vivo */}
          <div className="rounded-xl overflow-hidden border border-zinc-800">
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">TV en vivo</span>
            </div>
            <LiveChannelPlayer />
          </div>

          {/* Terminal quick access */}
          <a
            href="/grafico"
            className="block rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-emerald-500/30 hover:bg-zinc-900/60 transition-all p-4 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-300">Terminal</span>
              <span className="text-emerald-400 text-xs group-hover:translate-x-0.5 transition-transform">↗ Abrir</span>
            </div>
            <div className="flex gap-2">
              {['SPY', 'BTC', 'GGAL'].map(sym => (
                <span key={sym} className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400 font-mono">{sym}</span>
              ))}
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
```

---

## Acceptance criteria

- [ ] `dashboard/page.tsx` es Server Component; no tiene 'use client'
- [ ] Auth delegada a `dashboard/layout.tsx` (no duplicar redirect)
- [ ] `CockpitHome` se renderiza sin props
- [ ] `LiveChannelPlayer` cargado con `dynamic({ ssr: false })`
- [ ] Badge de mercado refleja horario real Buenos Aires
- [ ] Hero message cambia según estado del mercado
- [ ] Build pasa sin errores en Vercel
- [ ] No hay parallel route collision con otras rutas

---

## Notas de implementación

- `CockpitHome` ya maneja su propio estado, fetches y copiloto — no reimplementar
- `LiveChannelPlayer` ya tiene fallback ante canales offline — no necesita prop especial
- El dashboard NO reemplaza `/terminal` ni `/grafico` — los complementa con links
- Próximo paso: conectar watchlist con precios reales (WebSocket o polling)
