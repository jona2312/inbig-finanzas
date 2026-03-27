# INBIG Finanzas — Architecture Reference

> Documento de referencia técnica extraído del Documento Maestro v1 + Financial Copilot Architecture v1
> Versión: Marzo 2026 | Uso interno

---

## Vision

**INBIG no es un blog de finanzas ni una app de inversión.**
Es la capa de inteligencia que convierte el ruido del mercado en señal útil — en español, con contexto latinoamericano, en tiempo real.

Objetivo: Reemplazar Bloomberg Intelligence para el usuario de $20-60/mes, no el modelo, sino la **metodología**: datos reales + pipeline de scoring + narrativa profesional + terminal de distribución.

---

## Stack Completo

| Capa | Tecnología | Rol |
|------|-----------|-----|
| Frontend | Next.js 14 App Router | SSR/SSG para SEO, UI del producto |
| Base de datos | Supabase Postgres | Tablas principales + RLS |
| Tiempo real | Supabase Realtime | live_mode + market state |
| Vector store | Supabase pgvector | RAG: búsqueda semántica |
| Auth | Supabase Auth | Email + OAuth Google, RLS por tier |
| Edge Functions | Supabase Edge Fn | Cron jobs, YouTube API polling |
| Automatización | n8n (self-hosted) | Pipelines de noticias y briefings |
| LLM velocidad | Groq llama-3.3-70b | Noticias, resúmenes, asistente básico |
| LLM profundidad | Gemini Flash gemini-2.0-flash | Briefings premium, RAG, reportes |
| Compliance | Templates + regex | Disclaimers determinísticos, NUNCA LLM |
| Pagos | Stripe | Checkout, webhooks, gestión de tiers |
| Email | Brevo | Transaccionales y newsletters |
| Charts | TradingView Widgets | Terminal y home |
| Memoria usuario | mem0 + pgvector | Fase 2 — Pro y Pro+ únicamente |
| Clasificación | FinBERT (Hugging Face) | Sentimiento financiero — Fase 2 |
| Datos macro | OpenBB + FRED + BLS + SEC | Financial Research Copilot — Fase 2 |

---

## Tiers del Producto

| Feature | INBásico (Free) | IN Pro (Paid) | IN Pro+ (Paid) |
|---------|----------------|--------------|---------------|
| Noticias del día | Últimas 24h | Completas | Completas + archivo 90d |
| Briefing diario | Versión reducida | 3 cortes completos | 3 cortes + análisis profundo |
| Terminal de mercados | No | Sí | Sí + watchlist avanzada |
| Radar | Básico | Completo | Completo + sentimiento FinBERT |
| Asistente IA | No | Groq básico (WF4) | Financial Research Copilot (WF5) |
| Memoria de usuario | Preferencias simples | Memoria ligera | Memoria completa (mem0) |
| Live / Broadcast | Sí | Sí | Sí + acceso prioritario |
| Alertas | No | Email | Email + Push + WhatsApp (opt-in) |

---

## Workflows n8n

| Workflow | Función | LLM | Modelo | Estado |
|---------|---------|-----|--------|--------|
| WF1 | Editor de noticias RSS | Groq | llama-3.3-70b | ✅ Activo (reparado) |
| WF2 | Deduplicación y filtrado | Groq | llama-3.3-70b | ⚠️ Pendiente diagnóstico |
| WF3 | Briefing premium 3x/día (9:30/15:30/21:30 ART) | Gemini Flash | gemini-2.0-flash | ✅ Activo |
| WF4 | Asistente básico IN Pro | Groq | llama-3.3-70b | Fase 1 |
| WF5 | Financial Research Copilot | Gemini Flash | gemini-2.0-flash | Fase 2 |
| WF6 | Reportes especiales | Gemini Flash | gemini-2.0-flash | Fase 2 |
| Compliance | Disclaimers | **Ninguno** | Templates + regex | Siempre activo |

---

## Base de Datos — Tablas Supabase

| Tabla | Descripción | Estado |
|-------|-------------|--------|
| `articles` | Noticias procesadas por WF1 | ✅ Activa |
| `briefings` | Informes 3x/día generados por WF3 | ✅ Activa |
| `market_data` | Series FRED y datos de mercado | En progreso |
| `profiles` | Perfil del usuario: tier, país, preferencias | Pendiente verificar |
| `user_events` | Eventos de comportamiento por usuario | **Pendiente crear** |
| `live_sources` | Fuentes de streaming autorizadas | **Pendiente crear** |
| `live_sessions` | Registro completo de cada emisión | **Pendiente crear** |
| `live_config` | Estado global del sistema live (1 fila) | **Pendiente crear** |
| `sentiment_scores` | Scores FinBERT por artículo | Fase 2 |
| `user_memories` | Memoria conversacional con pgvector | Fase 2 |

---

## Variables de Entorno

| Variable | Servicio | Estado |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | ✅ Configurada |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | ✅ Configurada |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | ✅ Configurada |
| `STRIPE_SECRET_KEY` | Stripe | ⚠️ Pendiente |
| `STRIPE_WEBHOOK_SECRET` | Stripe | ⚠️ Pendiente |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | ⚠️ Pendiente |
| `BREVO_API_KEY` | Brevo | ⚠️ Pendiente |
| `GROQ_API_KEY` | Groq | ✅ En n8n |
| `GOOGLE_GEMINI_API_KEY` | Gemini Flash | ✅ En n8n |
| `YOUTUBE_DATA_API_KEY` | YouTube API | Fase 2 |

---

## Financial Copilot — Los 2 Asistentes

### Asistente 1: News Copilot
- **Audiencia**: Todos los tiers
- **Motor**: Groq llama-3.3-70b, latencia <1s
- **Stack**: Groq + RAG básico (Supabase articles/briefings) + Compliance templates
- **Workflow**: WF4

### Asistente 2: Financial Research Copilot
- **Audiencia**: IN Pro+ exclusivo
- **Motor**: OpenBB + FinBERT + RAG + Gemini Flash, latencia 3-8s
- **Workflow**: WF5

**Las 4 capas del Research Copilot:**

| Capa | Stack | Función |
|------|-------|---------|
| 1 — Datos | FRED, BLS, Treasury, SEC, CoinGecko, OpenBB | Datos reales trazables |
| 2 — Sentimiento | FinBERT (BERT fine-tuned en textos financieros) | Clasificador positivo/negativo/neutro |
| 3 — RAG + LLM | pgvector + Gemini Flash 200K context | Síntesis con contexto editorial INBIG |
| 4 — Compliance | Templates predefinidos + regex | Disclaimers determinísticos, 100% auditable |

---

## Decision Log (Decisiones Cerradas)

Ninguna decisión se modifica sin justificación documentada y nueva entrada en este log.

| ID | Decisión | Razón | Descartado |
|----|---------|-------|-----------|
| DEC-001 | Stack: Next.js + Supabase + n8n | SEO crítico (Next.js), DB+Auth+Realtime en una infra (Supabase), automatización sin código (n8n) | Firebase, Hasura, Zapier |
| DEC-002 | Dual LLM: Groq (velocidad) + Gemini Flash (profundidad) | Groq <1s para batch; Gemini 200K tokens para RAG; Compliance no puede alucinarse | GPT-4o (costo), Claude único (latencia), Mistral |
| DEC-003 | Compliance = templates + regex, NUNCA LLM | LLMs alucinan en contexto financiero. Riesgo legal > costo de templates | LLM con prompt de compliance |
| DEC-004 | Newsroom 3 pilares: Groq automático + Jonathan (humano) + INBIG Intelligence | Separa velocidad, autoridad humana y profundidad analítica | Solo automatización, solo humano |
| DEC-005 | Financial Copilot = stack 4 capas | Ningún modelo solo da precisión financiera suficiente. FinBERT da señal sin costo de tokens | ChatGPT + browsing, Bloomberg API ($24k/año) |
| DEC-006 | Live System = Broadcast Desk con Supabase Realtime | Opción A (embed simple) no resuelve multi-fuente ni fallback inteligente | Embed directo YouTube, Brightcove ($499+/mes) |
| DEC-007 | Memoria organizacional = Obsidian + Git | Costo $0, portable, versionable, markdown ideal para RAG | Notion (vendor lock-in), Confluence |
| DEC-008 | Memoria de usuario = gradual por tier | Evita complejidad donde no se capitaliza. La memoria completa justifica el tier más alto | Memoria completa para todos desde día 1 |

---

## user_events — Eventos a Trackear desde Día 1

| Categoría | Eventos |
|-----------|---------|
| Cuenta | `signup`, `login`, `logout`, `upgrade_started`, `upgrade_completed`, `upgrade_abandoned`, `downgrade` |
| Contenido | `article_click`, `article_read` (>30s), `briefing_open`, `briefing_read` (>80% scroll), `radar_click` |
| Terminal | `terminal_open`, `terminal_asset_view`, `watchlist_add` |
| Asistente IA | `assistant_query`, `assistant_upgrade_prompt` |
| Live | `live_watch_start`, `live_watch_duration`, `live_cta_click` |

---

## Roadmap

### Fase 0 — Encender (bloqueadores del primer usuario real)

| Item | Estado | Prioridad |
|------|--------|-----------|
| Auth funcional con tiers y RLS | Pendiente verificación | 🔴 Crítico |
| Home con datos en tiempo real | En progreso | 🔴 Crítico |
| Briefing visible para Pro (WF3 ya genera) | Pendiente frontend | 🔴 Crítico |
| Stripe: products, prices, webhooks, toggle tier | Pendiente implementación | 🔴 Crítico |
| user_events tabla + tracking básico | Pendiente crear | 🟡 Alta |
| Brevo: emails transaccionales | Pendiente | 🟡 Alta |
| Live block básico en home (embed simple MVP) | Pendiente | 🟡 Alta |
| Google OAuth en Supabase | Pendiente Jonathan | 🟡 Alta |

### Fase 1 — Primeros usuarios (semanas 1-4 post-lanzamiento)
- Asistente IA Pro básico (Groq + memoria ligera)
- Notificaciones email al publicar briefing
- user_events dashboard interno

### Fase 2 — Profundizar (mes 2-3)
- Financial Research Copilot completo (RAG + Gemini + FinBERT)
- Broadcast Desk MVP completo
- mem0 para Pro+

### Fase 3 — Escalar (mes 4+)
- FinBERT en producción
- API access para Pro+
- White-label para instituciones (B2B)
- Voice Agent (ElevenLabs + RAG)
- Multi-canal live, Mux/Cloudflare Stream

---

## Regla de Oro

> **Lanzar el mínimo que genera señal → leer la señal (user_events) → construir lo que la señal pide.**
> No construir lo que asumimos que van a pedir.
