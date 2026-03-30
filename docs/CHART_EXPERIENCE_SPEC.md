# CHART EXPERIENCE — Spec Técnica
## INbig Finanzas · v1.0 · 2026-03-30

---

## 1. Objetivo

Transformar el chart de la Terminal de una visualización básica de TradingView
a una experiencia premium percibida como tecnológica y profesional.
Diferenciador clave: el chart debe comunicar que INbig es una herramienta seria.

---

## 2. Stack técnico

| Herramienta | Uso |
|---|---|
| TradingView Advanced Chart (embed) | Chart principal interactivo — ya implementado |
| `lightweight-charts` (TradingView OSS) | Sparklines en watchlist + mini charts |
| Tailwind CSS | Animaciones CSS (pulse, glow, fade) |
| CSS custom properties | Tema consistente zinc/emerald/amber |
| Framer Motion (opcional) | Transiciones entre assets/timeframes |

---

## 3. Componente `TradingViewChart` — mejoras

### 3.1 Skeleton loader

Mostrar skeleton animado mientras el widget de TradingView carga:

```tsx
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div style={{ height }} className="w-full bg-zinc-950 animate-pulse relative overflow-hidden">
      {/* Línea de chart simulada */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <polyline
          points="0,60% 15%,55% 30%,40% 45%,45% 60%,30% 75%,35% 100%,20%"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />
      </svg>
      <div className="absolute bottom-8 left-4 right-4 h-px bg-zinc-800" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-zinc-700 text-xs font-mono">Cargando chart...</div>
      </div>
    </div>
  )
}
```

### 3.2 Glow en el header del símbolo activo

Agregar un efecto de glow sutil al nombre del activo en el header del chart:

```tsx
<span className="font-mono text-sm font-bold text-white drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">
  {activeSymbol}
</span>
```

### 3.3 Badge LIVE pulsante

Mostrar un badge "● VIVO" cuando el mercado está abierto:

```tsx
function MarketStatus({ symbol }: { symbol: string }) {
  const isOpen = isMarketOpen(symbol) // helper por timezone
  return isOpen ? (
    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      VIVO
    </span>
  ) : (
    <span className="text-[10px] text-zinc-600">CERRADO</span>
  )
}
```

---

## 4. Watchlist — mejoras

### 4.1 Sparklines con `lightweight-charts`

Cada item de la watchlist muestra un mini sparkline de las últimas 20 velas:

```tsx
import { createChart, IChartApi } from 'lightweight-charts'

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current || data.length === 0) return
    const chart = createChart(ref.current, {
      width: 60, height: 28,
      layout: { background: { color: 'transparent' }, textColor: 'transparent' },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      crosshair: { mode: 0 },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      handleScroll: false, handleScale: false,
    })
    const series = chart.addLineSeries({
      color: positive ? '#10b981' : '#ef4444',
      lineWidth: 1.5,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    })
    series.setData(data.map((v, i) => ({ time: i as any, value: v })))
    return () => chart.remove()
  }, [data, positive])
  return <div ref={ref} style={{ width: 60, height: 28, pointerEvents: 'none' }} />
}
```

### 4.2 Precio y cambio % animado

Mostrar precio con animación verde/rojo al actualizar:

```tsx
function PriceDisplay({ price, change }: { price: number; change: number }) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevPrice = useRef(price)
  
  useEffect(() => {
    if (price > prevPrice.current) setFlash('up')
    else if (price < prevPrice.current) setFlash('down')
    prevPrice.current = price
    const id = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(id)
  }, [price])
  
  return (
    <div className={[
      'transition-colors duration-300',
      flash === 'up' ? 'text-emerald-300' : flash === 'down' ? 'text-red-300' : ''
    ].join(' ')}>
      <p className="text-[11px] font-mono font-semibold">{price.toFixed(2)}</p>
      <p className={change >= 0 ? 'text-emerald-400' : 'text-red-400'} style={{fontSize: 10}}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </p>
    </div>
  )
}
```

### 4.3 Layout watchlist item actualizado

```
┌──────────────────────────────────┐
│ ● GGAL        [sparkline 60px]   │
│   Galicia     $4.21  +1.3%       │
└──────────────────────────────────┘
```

---

## 5. Panel de contexto del activo

Un panel colapsable debajo del header del chart que muestra contexto del asset seleccionado.
Visible solo en tier `in_pro` y `in_pro_plus`.

### Estructura

```
┌──────────────────────────────────────────────────────┐
│  GGAL — Banco Galicia   │ Riesgo día: ●●○○○ BAJO     │
├──────────────────────────────────────────────────────┤
│  Macro: BCRA reunión hoy │ Escenario base: lateral    │
│  Bull: +5% si quiebra 4.50 │ Bear: -3% si pierde 4.00│
├──────────────────────────────────────────────────────┤
│  🤖 Copilot: Analizá GGAL → [CTA button]            │
└──────────────────────────────────────────────────────┘
```

### Fuente de datos del contexto

```typescript
interface AssetContext {
  symbol: string
  name: string
  dayRisk: 1 | 2 | 3 | 4 | 5       // 1 = bajo, 5 = extremo
  macroEvent: string | null          // "BCRA reunión", "CPI EEUU", etc.
  baseScenario: string               // "lateral en rango 4.00-4.50"
  bullCase: string                   // "+5% si quiebra 4.50"
  bearCase: string                   // "-3% si pierde 4.00"
  copilotPrompt: string              // Prompt pre-cargado para el copilot
}
```

La data viene de:
1. Tabla `asset_context` en Supabase (actualizable por admin)
2. Fallback: generado por el copilot en tiempo real

---

## 6. Transiciones entre assets

Al cambiar de activo en la watchlist, el chart hace una transición suave:

```tsx
// Estado con transición
const [isTransitioning, setIsTransitioning] = useState(false)

function handleSymbolChange(symbol: string) {
  setIsTransitioning(true)
  setTimeout(() => {
    setActiveSymbol(symbol)
    setIsTransitioning(false)
  }, 150)
}

// En el JSX del chart
<div className={`flex-1 transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
  <TradingViewChart symbol={activeSymbol} height={chartHeight} />
</div>
```

---

## 7. Página `/grafico` — especificación

### Ruta
`src/app/grafico/page.tsx`

### Comportamiento
- Ruta pública (no requiere auth)
- Muestra el chart de TradingView con símbolo por query param: `/grafico?s=GGAL`
- Si no hay param, símbolo default: `GGAL`
- Skeleton loader mientras carga
- Fallback garantizado: si TradingView falla → mensaje de error con botón retry
- Meta tags para SEO: "Gráfico de {symbol} en tiempo real — INbig Finanzas"

### Layout
```
┌─────────────────────────────────────────────────────┐
│ INbig logo   GGAL — Banco Galicia   ● Abierto       │
├─────────────────────────────────────────────────────┤
│                                                     │
│         TradingView Advanced Chart                  │
│              (100vh - header)                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│ 🤖 Analizar con Copilot → │ Ir a Terminal →        │
└─────────────────────────────────────────────────────┘
```

---

## 8. Criterios de aceptación

- [ ] Chart muestra skeleton loader mientras TradingView carga (min. 1.5s visible)
- [ ] Glow sutil en el símbolo activo del header
- [ ] Badge LIVE/CERRADO con estado real del mercado
- [ ] Sparklines visibles en cada item de la watchlist (datos estáticos ok para MVP)
- [ ] Precios con animación flash al actualizar (verde/rojo)
- [ ] Panel de contexto visible en plan Pro+ con al menos: nombre, riesgo, escenarios
- [ ] Transición suave (150ms fade) al cambiar de activo
- [ ] `/grafico` carga correctamente con y sin query param
- [ ] `/grafico` nunca muestra pantalla en blanco — siempre skeleton o chart o fallback
- [ ] Mobile: chart ocupa 100vw, watchlist se oculta (sidebar colapsable)
