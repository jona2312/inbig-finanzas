-- ============================================================
-- INBIG Finanzas — Migración: Tablas pendientes del Documento Maestro v1
-- Fecha: 2026-03-27
-- Tablas: user_events, live_sources, live_sessions, live_config, profiles
-- ============================================================

-- ----------------------------------------
-- 1. profiles — Perfil de usuario por tier
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  full_name     TEXT,
  avatar_url    TEXT,
  tier          TEXT NOT NULL DEFAULT 'basico' CHECK (tier IN ('basico', 'pro', 'pro_plus')),
  pais          TEXT DEFAULT 'AR',                     -- AR | MX | US | ES | Global
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  subscription_status     TEXT DEFAULT 'inactive',     -- active | inactive | canceled | past_due
  preferences   JSONB DEFAULT '{}',                    -- { temas: [], mercados: [], notificaciones: {} }
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: cada usuario solo ve y edita su propio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfil propio — select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Perfil propio — insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Perfil propio — update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al hacer signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ----------------------------------------
-- 2. user_events — Product Intelligence (señal de negocio)
-- ----------------------------------------
-- Esta tabla se implementa desde el día 1. Costo casi cero. Valor enorme.
-- Con suficientes datos, un análisis semanal con LLM responde:
-- ¿qué quieren los usuarios? ¿qué los retiene? ¿qué los empuja a upgrade?

CREATE TABLE IF NOT EXISTS public.user_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id  TEXT,                   -- anon session para usuarios no logueados
  event_type  TEXT NOT NULL,          -- Ver categorías abajo
  properties  JSONB DEFAULT '{}',     -- metadata flexible por evento
  page_path   TEXT,                   -- /noticias, /mercados, etc.
  referrer    TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para queries analíticas frecuentes
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON public.user_events(created_at DESC);

-- RLS: insert público (anon puede loguear eventos), select solo service_role
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_events — insert anonimo" ON public.user_events
  FOR INSERT WITH CHECK (true);  -- Cualquiera puede insertar (frontend tracking)

CREATE POLICY "user_events — select propio" ON public.user_events
  FOR SELECT USING (auth.uid() = user_id);

-- Categorías de eventos (documentadas para el equipo):
-- Cuenta:    signup | login | logout | upgrade_started | upgrade_completed | upgrade_abandoned | downgrade
-- Contenido: article_click | article_read | briefing_open | briefing_read | radar_click
-- Terminal:  terminal_open | terminal_asset_view | watchlist_add
-- Asistente: assistant_query | assistant_upgrade_prompt
-- Live:      live_watch_start | live_watch_duration | live_cta_click


-- ----------------------------------------
-- 3. live_sources — Fuentes de streaming autorizadas
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.live_sources (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre              TEXT NOT NULL,          -- 'INBIG Oficial', 'INBIG México'
  pais                TEXT DEFAULT 'AR',       -- AR | MX | US | Global
  categoria           TEXT DEFAULT 'general',  -- apertura | petróleo | FX | macro | general
  tipo_fuente         TEXT NOT NULL CHECK (tipo_fuente IN ('youtube_live', 'rtmp', 'hls', 'replay')),
  youtube_channel_id  TEXT,                   -- UCxxxx
  stream_url          TEXT,                   -- URL del stream (HLS/RTMP)
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'suspended')),
  priority            INT DEFAULT 2,          -- 1=oficial, 2=secundario, 3=aliado
  metadata            JSONB DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solo admins pueden ver/editar fuentes
ALTER TABLE public.live_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_sources — service_role only" ON public.live_sources
  USING (auth.role() = 'service_role');


-- ----------------------------------------
-- 4. live_sessions — Registro de cada emisión en vivo
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id       UUID REFERENCES public.live_sources(id),
  titulo          TEXT NOT NULL,       -- 'Apertura Wall Street · Lunes 24'
  subtitulo       TEXT,
  pais            TEXT DEFAULT 'AR',
  categoria       TEXT DEFAULT 'general',
  mercado         TEXT,                -- 'Renta Variable', 'FX', 'Cripto', etc.
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  replay_url      TEXT,               -- URL del replay post-emisión
  viewers_peak    INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'error')),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON public.live_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_sessions_started_at ON public.live_sessions(started_at DESC);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Lectura pública (para el frontend mostrar info del live)
CREATE POLICY "live_sessions — select público" ON public.live_sessions
  FOR SELECT USING (true);

-- Solo service_role puede insertar/modificar
CREATE POLICY "live_sessions — write service_role" ON public.live_sessions
  FOR ALL USING (auth.role() = 'service_role');


-- ----------------------------------------
-- 5. live_config — Estado global del sistema live (1 sola fila)
-- ----------------------------------------
-- Esta tabla usa Supabase Realtime: cuando live_mode cambia a true,
-- todos los clientes conectados entran en modo LIVE instantáneamente.

CREATE TABLE IF NOT EXISTS public.live_config (
  id                    INT PRIMARY KEY DEFAULT 1,   -- Siempre 1, tabla de 1 fila
  live_mode             BOOLEAN NOT NULL DEFAULT false,
  active_session_id     UUID REFERENCES public.live_sessions(id),
  fallback_type         TEXT DEFAULT 'carousel' CHECK (fallback_type IN ('carousel', 'replay', 'top_stories')),
  auto_detect_youtube   BOOLEAN DEFAULT false,        -- Si true, detecta vivos via YouTube Data API cada 60s
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by            UUID REFERENCES auth.users(id),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insertar fila inicial
INSERT INTO public.live_config (id, live_mode) VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Habilitar Realtime para live_config (propagación instantánea)
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_config;

-- Lectura pública (el frontend necesita saber si hay live)
ALTER TABLE public.live_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "live_config — select público" ON public.live_config
  FOR SELECT USING (true);

CREATE POLICY "live_config — write service_role" ON public.live_config
  FOR ALL USING (auth.role() = 'service_role');


-- ----------------------------------------
-- 6. Trigger updated_at automático (helper reutilizable)
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_live_sources_updated_at
  BEFORE UPDATE ON public.live_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_live_config_updated_at
  BEFORE UPDATE ON public.live_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
