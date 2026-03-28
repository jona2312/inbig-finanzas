/**
 * Fear & Greed Index — Alternative.me API
 *
 * 100% gratuito, sin API key, sin límite práctico.
 * Mide el sentimiento del mercado crypto en una escala 0-100.
 * Categorías: Extreme Fear / Fear / Neutral / Greed / Extreme Greed
 *
 * URL: https://api.alternative.me/fng/
 * Cache: 6 horas (el índice se actualiza 1x por día)
 */

export interface FearGreedData {
  value:              number        // 0-100
  valueText:          string        // 'Fear', 'Greed', etc.
  valueTextEs:        string        // En español
  timestamp:          string        // ISO date
  previousValue:      number | null
  previousValueText:  string | null
  change:             number | null // diferencia con ayer
  color:              string        // hex color para UI
  emoji:              string
}

// ─── Mapa de clasificación ────────────────────────────────────────────────────

function classify(value: number): { text: string; textEs: string; color: string; emoji: string } {
  if (value <= 24)  return { text: 'Extreme Fear', textEs: 'Miedo extremo', color: '#ef4444', emoji: '😱' }
  if (value <= 44)  return { text: 'Fear',         textEs: 'Miedo',         color: '#f97316', emoji: '😨' }
  if (value <= 54)  return { text: 'Neutral',      textEs: 'Neutral',       color: '#eab308', emoji: '😐' }
  if (value <= 74)  return { text: 'Greed',        textEs: 'Codicia',       color: '#84cc16', emoji: '😏' }
  return                   { text: 'Extreme Greed', textEs: 'Codicia extrema', color: '#10b981', emoji: '🤑' }
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function buildFallback(): FearGreedData {
  const cls = classify(50)
  return {
    value:             50,
    valueText:         cls.text,
    valueTextEs:       cls.textEs,
    timestamp:         new Date().toISOString(),
    previousValue:     null,
    previousValueText: null,
    change:            null,
    color:             cls.color,
    emoji:             cls.emoji,
  }
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function getFearGreedIndex(): Promise<FearGreedData> {
  try {
    const res = await fetch(
      'https://api.alternative.me/fng/?limit=2&format=json',
      { next: { revalidate: 21600 } } // cache 6 horas
    )

    if (!res.ok) return buildFallback()

    const data = await res.json()
    const items = data?.data ?? []

    if (!items.length) return buildFallback()

    const latest   = items[0]
    const previous = items[1] ?? null

    const value         = parseInt(latest.value, 10)
    const previousValue = previous ? parseInt(previous.value, 10) : null
    const cls           = classify(value)

    return {
      value,
      valueText:         cls.text,
      valueTextEs:       cls.textEs,
      timestamp:         new Date(parseInt(latest.timestamp, 10) * 1000).toISOString(),
      previousValue,
      previousValueText: previousValue != null ? classify(previousValue).textEs : null,
      change:            previousValue != null ? value - previousValue : null,
      color:             cls.color,
      emoji:             cls.emoji,
    }
  } catch (e) {
    console.error('[fear-greed]', e)
    return buildFallback()
  }
}
