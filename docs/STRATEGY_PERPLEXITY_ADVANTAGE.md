# INBIG vs Perplexity Finance — Estrategia de Ventaja Competitiva

> Documento estratégico | Marzo 2026 | Uso interno
> Originado en: análisis directo de perplexity.ai/finance

---

## El Gap que Perplexity no cierra (y INBIG sí)

Perplexity Finance es un agregador de datos de mercado USA con LLM encima.
Excelente producto. Cero cobertura LATAM. Cero contexto editorial en español.
Cero comunidad. Cero briefings. Cero live. Cero educación.

**Ese vacío es el mercado de INBIG.**

| Feature | Perplexity Finance | INBIG Finanzas |
|---------|-------------------|----------------|
| Mercados USA (NYSE/NASDAQ) | ✅ | ✅ vía FMP |
| Mercados LATAM (BYMA/BMV/B3/BVC) | ❌ | ✅ vía FMP |
| Dólar blue / CCL / MEP | ❌ | ✅ DolarAPI |
| Editorial en español | ❌ | ✅ Newsroom 3 pilares |
| Briefings 3x/día | ❌ | ✅ WF3 Gemini Flash |
| Asistente IA con contexto LATAM | ❌ | ✅ News Copilot + Research Copilot |
| Live / Broadcast | ❌ | ✅ Broadcast Desk |
| Educación (Campus) | ❌ | ✅ INBIG Campus |
| Comunidad hispanohablante | ❌ | ✅ |
| Screener NLP en español | ❌ | ✅ → implementar |
| Mercados de predicción LATAM | ❌ | ✅ → implementar vía Polymarket |

---

## Las 4 Palancas — Cómo usar Perplexity a nuestro favor

### Palanca 1 — Perplexity Sonar API (motor de búsqueda web en tiempo real)

**Qué es:** API de Perplexity con modelos `sonar` que hacen búsqueda web antes de responder.
Responden con fuentes reales del día. Es como Groq pero con internet integrado.

**Cómo lo usamos:**
- Motor del News Copilot (consultas sobre noticias del día, declaraciones de bancos centrales, etc.)
- Complementa el RAG interno de INBIG con búsqueda externa verificada
- Fallback cuando el corpus propio no tiene cobertura de un tema

**Modelo recomendado:** `sonar` (balanced) o `sonar-pro` (profundidad)
**Costo estimado:** ~$1 por 1000 queries. Para MVP: casi cero.
**Endpoint:** `https://api.perplexity.ai/chat/completions` (compatible OpenAI format)

```typescript
// Integración en /api/chat — compatible con el cliente OpenAI existente
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai'
})

// Para queries de noticias del día → sonar
// Para análisis profundo → sonar-pro + contexto RAG INBIG
```

**Routing decision:**
- Pregunta sobre noticias del día → Perplexity sonar (web real-time)
- Análisis de datos macro/fundamentales → Gemini Flash + RAG
- Resumen rápido de activo → Groq + FMP data

---

### Palanca 2 — Financial Modeling Prep API (misma fuente de datos que Perplexity Finance)

**Qué es:** La API que alimenta Perplexity Finance. Cubre NYSE, NASDAQ, BYMA, BMV, B3, BVC, commodities, forex, crypto, ETFs, fundamentales, earnings.

**Por qué es clave para INBIG:**
- Misma calidad de datos que Perplexity, pero con LATAM
- Un solo proveedor cubre acciones argentinas, mexicanas, brasileñas + USA
- Screener programático: queries como "acciones BYMA con volumen > X y P/E < 10"
- Earnings calendar, financials, ratios fundamentales

**Endpoints clave para INBIG:**
```
GET /v3/quote/{symbol}              → precio en tiempo real (ej: GGAL.BA, AMZN)
GET /v3/stock-screener              → screener con filtros dinámicos
GET /v3/financial-statements/{sym} → balances, income statement
GET /v3/historical-price-full/{sym}→ histórico OHLCV
GET /v3/economic_calendar          → calendario económico LATAM+USA
GET /v3/forex/list                 → todos los pares de divisas
```

**Costo:** Free tier = 250 requests/día. Plan Starter $19/mes = 300 req/min. Para MVP: free tier alcanza.

**Dónde vive en INBIG:**
- `/mercados` → precios BYMA + screener
- Panel Pro → fundamentales por empresa
- Research Copilot → datos estructurados como contexto para Gemini Flash

---

### Palanca 3 — Polymarket API (mercados de predicción para LATAM)

**Qué es:** Plataforma de mercados de predicción descentralizada. Perplexity los integró para USA. INBIG los puede integrar con foco LATAM.

**Casos de uso para INBIG:**
- ¿El BCRA sube/baja/mantiene tasa este mes? (% de probabilidad en tiempo real)
- ¿El Merval cierra el trimestre arriba o abajo?
- ¿Habrá acuerdo FMI este año?
- ¿Bitcoin supera $100K antes de fin de año?
- ¿Cuántos recortes de la Fed en 2026?

**Por qué genera engagement brutal:**
La gente vota con plata real. Las probabilidades cambian en tiempo real. Genera conversación, shareable content, y una razón para volver al sitio todos los días.

**Integración:** Widget en home + sección `/predicciones` en Panel Pro
**API:** Polymarket Gamma API (pública, sin auth para lectura)

---

### Palanca 4 — Posicionamiento directo (marketing)

Mensaje de marketing explícito:

> *"Todo lo que Perplexity Finance tiene. Más el dólar blue, el Merval, el IPC mexicano, y el análisis que ningún algoritmo gringo entiende."*

INBIG no compite con Perplexity globalmente. INBIG **gana** en el segmento que Perplexity ignora: los 650 millones de hispanohablantes que necesitan inteligencia financiera en su idioma y con su contexto.

---

## Stack Resultante (actualizado con estas palancas)

```
┌─────────────────────────────────────────────────────┐
│                    USUARIO FINAL                     │
└─────────────┬───────────────────────┬───────────────┘
              │                       │
    Pregunta al asistente      Navega en mercados
              │                       │
    ┌─────────▼──────────┐   ┌────────▼────────────┐
    │   ROUTING ENGINE    │   │    FMP API           │
    │ (por tipo de query) │   │ BYMA + NYSE + LATAM  │
    └──┬──────┬───────┬──┘   └────────┬────────────┘
       │      │       │               │
  Noticias  Análisis  Datos      Screener NLP
  del día   profundo  LATAM      (Gemini Flash)
       │      │       │
  Perplexity  Gemini  FMP
  Sonar API   Flash  Service
       │      │       │
       └──────┴───────┘
              │
    Compliance Templates (siempre)
              │
    ┌─────────▼──────────┐
    │   RESPUESTA FINAL   │
    │ + Disclaimer INBIG  │
    └────────────────────┘
```

---

## Implementación — Orden de Prioridad

### Sprint 1 — Fundamentos (esta semana)
1. ✅ Migración SQL (profiles, user_events, live_config, live_sources, live_sessions)
2. ✅ pgvector extension habilitada
3. FMP API key → `.env.local` → `/src/services/fmp.ts`
4. Perplexity API key → `.env.local` → routing en `/api/chat`

### Sprint 2 — Producto visible (semana 2)
5. `/mercados` completo: TradingView + FMP quotes BYMA/NYSE + screener básico
6. `/divisas` completo: DolarAPI 7 tipos + historial chart
7. Briefing visible para usuarios Pro (frontend /briefings)

### Sprint 3 — Panel Pro / Command Center (semana 3)
8. `/admin` layout con auth guard (is_admin en profiles)
9. `/admin/dashboard` → usuarios, tiers, MRR, últimos eventos
10. `/admin/content` → gestión de artículos y briefings
11. `/admin/workflows` → estado WF1-WF6

### Sprint 4 — Diferenciadores (semana 4)
12. Polymarket widget en home → sección predicciones LATAM
13. Screener NLP completo con FMP + Gemini Flash
14. Price alerts (tabla alerts + Brevo email)

### Fase 2 (mes 2)
15. Perplexity sonar como motor del News Copilot Pro
16. Financial Research Copilot Pro+ (4 capas completas)
17. mem0 para usuarios Pro+

---

## Variables de entorno a agregar

```bash
# Perplexity API
PERPLEXITY_API_KEY=pplx-...

# Financial Modeling Prep
FMP_API_KEY=...

# Polymarket (Gamma API — no requiere auth para lectura, pero útil para writes)
# POLYMARKET_API_KEY=
```

---

## Decisión registrada

**DEC-009 · Stack de datos de mercado: FMP como proveedor principal**

| Campo | Valor |
|-------|-------|
| Decisión | Financial Modeling Prep como API central de datos de mercado (acciones, fundamentales, screener) |
| Razón | Misma fuente que Perplexity Finance. Cubre LATAM (BYMA, BMV, B3). Un solo proveedor simplifica integración. Free tier para MVP. |
| Descartado | Yahoo Finance (inestable, ToS), Alpha Vantage (sin LATAM), Bloomberg API ($24k/año) |

**DEC-010 · News Copilot: Perplexity Sonar API para búsqueda web en tiempo real**

| Campo | Valor |
|-------|-------|
| Decisión | Perplexity sonar como capa de búsqueda web del News Copilot, complementando RAG interno |
| Razón | Respuestas con fuentes reales del día. Compatible con formato OpenAI. Costo casi cero en MVP. |
| Descartado | Web scraping propio (mantenimiento alto), Tavily (más caro), solo RAG interno (sin cobertura de noticias del día) |
