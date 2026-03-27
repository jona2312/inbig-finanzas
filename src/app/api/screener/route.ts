import { NextRequest, NextResponse } from 'next/server'
import { getScreener, type ScreenerParams } from '@/services/fmp'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * POST /api/screener
 * Recibe una query en español, Gemini Flash la interpreta como parámetros FMP,
 * luego ejecuta el screener y devuelve los resultados.
 *
 * Body: { query: string }
 */
export async function POST(req: NextRequest) {
  const { query } = await req.json()

  if (!query?.trim()) {
    return NextResponse.json({ error: 'Query vacía' }, { status: 400 })
  }

  // ─── 1. Gemini Flash interpreta la query en español → parámetros FMP ─────────
  let screenerParams: ScreenerParams = { limit: 20 }
  let queryInterpreted = query

  if (process.env.GOOGLE_GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const prompt = `
Eres un intérprete de queries financieras para el screener de Financial Modeling Prep (FMP).
El usuario hace una búsqueda en español natural. Tu tarea es convertirla en parámetros JSON para la API de FMP.

Exchanges disponibles: BCBA (Buenos Aires), NYSE, NASDAQ, BMV (México), B3 (Brasil)
Países: AR, MX, BR, US, GB, EU

Query del usuario: "${query}"

Responde ÚNICAMENTE con un JSON válido con estos campos opcionales:
{
  "exchange": string | null,
  "country": string | null,
  "sector": string | null,
  "marketCapMoreThan": number | null,
  "marketCapLessThan": number | null,
  "priceMoreThan": number | null,
  "priceLessThan": number | null,
  "volumeMoreThan": number | null,
  "limit": number,
  "query_interpreted": string  // descripción breve de lo que entendiste
}

Ejemplos de mapeo:
- "acciones BYMA" → exchange: "BCBA"
- "sector tecnología" → sector: "Technology"
- "market cap mayor a 1 billón" → marketCapMoreThan: 1000000000
- "CEDEARs" → exchange: "BCBA", country: "US" (CEDEARs son acciones extranjeras listadas en BCBA)
- "acciones argentinas" → exchange: "BCBA"
- "empresas mexicanas" → exchange: "BMV"
`

      const result = await model.generateContent(prompt)
      const text   = result.response.text().trim()

      // Extraer JSON de la respuesta (puede venir con markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        queryInterpreted = parsed.query_interpreted ?? query
        delete parsed.query_interpreted
        // Limpiar nulls
        screenerParams = Object.fromEntries(
          Object.entries(parsed).filter(([, v]) => v !== null && v !== undefined)
        ) as ScreenerParams
        screenerParams.limit = screenerParams.limit ?? 20
      }
    } catch (e) {
      console.error('[screener] Gemini error:', e)
      // Fallback: usar BCBA si la query menciona Argentina/BYMA
      if (/byma|argentina|argentin|cedear/i.test(query)) {
        screenerParams.exchange = 'BCBA'
      }
    }
  } else {
    // Sin Gemini: fallback por keywords
    if (/byma|argentina|argentin/i.test(query))   screenerParams.exchange = 'BCBA'
    if (/mexico|méxico|bmv/i.test(query))          screenerParams.exchange = 'BMV'
    if (/brasil|brazil|b3|bovespa/i.test(query))   screenerParams.exchange = 'EURONEXT'
    if (/nasdaq/i.test(query))                     screenerParams.exchange = 'NASDAQ'
    if (/nyse/i.test(query))                       screenerParams.exchange = 'NYSE'
    if (/tecnolog/i.test(query))                   screenerParams.sector   = 'Technology'
    if (/energ/i.test(query))                      screenerParams.sector   = 'Energy'
    if (/financi/i.test(query))                    screenerParams.sector   = 'Financial Services'
  }

  // ─── 2. Ejecutar screener FMP ────────────────────────────────────────────────
  if (!process.env.FMP_API_KEY) {
    return NextResponse.json({
      results:           [],
      query_interpreted: queryInterpreted,
      error:             'FMP_API_KEY no configurada. Agregala en .env.local',
    })
  }

  try {
    const results = await getScreener(screenerParams)
    return NextResponse.json({ results, query_interpreted: queryInterpreted })
  } catch (e) {
    console.error('[screener] FMP error:', e)
    return NextResponse.json({
      results:           [],
      query_interpreted: queryInterpreted,
      error:             'Error al consultar FMP. Verificá tu API key.',
    }, { status: 500 })
  }
}
