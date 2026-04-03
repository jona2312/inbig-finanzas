# 🏗️ INBIG Finanzas — Log de Construcción

> **Propósito:** Registro permanente de todo lo que se construye, commitea y despliega.
> Cada sesión de build se apunta acá. Arkos (ChatGPT) planifica → Claude (Cowork) ejecuta.

---

## Stack de Producción

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | Next.js 14 App Router + React 18 + Tailwind | ✅ Live |
| Auth + DB | Supabase (sa-east-1) | ✅ Live |
| Pagos | Stripe Checkout + Webhooks | ✅ Live |
| Automatización | n8n self-hosted (n8n.inbigfinanzas.com / Coolify) | ✅ Live |
| Deploy | Vercel (inbig-finanzas.vercel.app) | ✅ Live |
| Monitoreo | Sentry | ✅ Configurado |
| Analytics | PostHog | 🔧 Conectado, por explotar |

---

## 📦 Módulos Construidos

### ✅ Auth & Usuarios
- Registro / Login via Supabase Auth
- Perfil en `public.users` con `tier: user_tier`
- Tiers: `lector | in_basic | in_pro | in_pro_plus`

### ✅ Pagos (Stripe)
- `POST /api/checkout` — crea Stripe Checkout Session
- `POST /api/webhooks/stripe` — actualiza tier en Supabase tras pago
- `UpgradeButton` component — cliente que inicia checkout
- `/planes` — pricing page con CTAs conectados al checkout
- **Planes activos:**
  - Basic → `price_1TG25q062oRFHCf3YWd2RXRy` → $8/mes → `in_basic`
  - Plus → `price_1TG25r062oRFHCf3oRmhLKRf` → $18/mes → `in_pro`
  - Premium → `price_1TG25s062oRFHCf3qcqGWsm6` → $35/mes → `in_pro_plus`
- Webhook endpoint: `we_1TIF4K062oRFHCf3Xa3iQvv4`

### ✅ Plan Gating
- `dashboard/layout.tsx` — requiere tier pagado (`in_basic`+)
- Lector users → redirect a `/planes?upgrade=required`
- Banner ámbar en `/planes` cuando viene de redirect

### ✅ Memory Layer (Supabase)
- `trade_journal` — Diario del Trader (trades, emociones, psicología)
- `trader_profile` — perfil computado por sistema
- `user_briefings` — briefings personalizados por usuario
- `scenario_sessions` — Motor de Escenarios
- `daily_checkins` — check-in psicológico diario
- `copilot_memory` — patrones e insights del copiloto
- Todas con RLS, índices, triggers `updated_at`

### ✅ Admin Dashboard (`/admin/dashboard`)
- Acceso: `is_admin = true` en `public.users`
- Sidebar con navegación (dashboard, users, content, workflows)
- Métricas: usuarios totales, IN Pro, IN Pro+, artículos, briefings
- Eventos de usuario recientes (últimos 20)

### ✅ n8n Automatización
- Instancia: `https://n8n.inbigfinanzas.com`
- Credential `supabase-inbig` (`GyF6nu2uSEKgvOGc`) — service_role real configurado
- Workflows: briefing diario, pipelines de noticias

---

## 🚧 En Construcción / Próximos

### 🔜 Admin Dashboard — Métricas Avanzadas
- [ ] Revenue: MRR, ARR, subs activas por plan (Stripe API)
- [ ] Costos LLM: estimado por queries de Copilot
- [ ] Usos: queries copilot/día, briefings generados, feature usage
- [ ] Churn: cancelaciones del mes

### 🔜 Cockpit HOME Dinámico
- Reemplazar home estática por estado contextual
- Calendario macro + sesión activa + perfil del trader

### 🔜 Briefing Diario Personalizado (n8n)
- Job a las 23:00 por usuario
- Genera resumen personalizado según perfil
- Envía por email / notificación push

### 🔜 Diario del Trader (UI)
- `/dashboard/journal` — ya existe ruta, falta UI completa
- Entrada de trades, emociones, aprendizajes
- Estadísticas y patrones

### 🔜 Copilot IA
- Integración LLM con memoria (`copilot_memory`)
- Límites por tier (5/día lector, 30/día basic, ∞ plus)

### 🔜 Migración a Coolify (post-scale)
- Cuando Vercel escale en costos, migrar a VPS self-hosted
- n8n ya está en Coolify en el VPS

---

## 📋 Variables de Entorno (Vercel Production)

| Variable | Estado |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | ✅ |
| `STRIPE_PRICE_BASIC_MONTHLY` | ✅ `price_1TG25q...` |
| `STRIPE_PRICE_PLUS_MONTHLY` | ✅ `price_1TG25r...` |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | ✅ `price_1TG25s...` |

---

## 🗂️ Commits Clave

| Commit | Descripción |
|---|---|
| `fde01f3` | feat(payments): Stripe checkout + webhook + UpgradeButton |
| `cde9a6f` | feat(planes): UpgradeButton en pricing page |
| `9eb44c3` | feat(auth): plan gating en dashboard layout |

---

## 🤝 Coordinación Arkos ↔ Claude

- **Arkos (ChatGPT)** = estrategia, specs, visión, roadmap
- **Claude (Cowork)** = implementación, commits, deploys
- **Jonatan** = luz verde, decisiones de producto, testing
- Branches separadas para features grandes, PRs con review
- Todo lo ejecutado se anota en este doc
