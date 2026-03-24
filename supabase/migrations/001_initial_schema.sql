-- ─────────────────────────────────────────────────────────────────────────────
-- INbig Finanzas — Schema inicial
-- ─────────────────────────────────────────────────────────────────────────────

-- Enums
CREATE TYPE plan_tier AS ENUM ('free', 'basic', 'pro', 'pro_plus');
CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral');

-- ─── Profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  plan            plan_tier NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  stripe_customer_id  TEXT UNIQUE,
  mp_customer_id      TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-crear profile cuando se registra usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── News Articles ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS news_articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL,
  content      TEXT,
  url          TEXT NOT NULL UNIQUE,
  source       TEXT NOT NULL,
  image_url    TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  category     TEXT NOT NULL DEFAULT 'mercados',
  tags         TEXT[] NOT NULL DEFAULT '{}',
  sentiment    sentiment_type,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_category ON news_articles(category);

-- ─── Glossary ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS glossary_terms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  definition    TEXT NOT NULL,
  category      TEXT NOT NULL DEFAULT 'general',
  related_terms TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_glossary_slug ON glossary_terms(slug);
CREATE INDEX idx_glossary_category ON glossary_terms(category);

CREATE TRIGGER glossary_updated_at
  BEFORE UPDATE ON glossary_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Chat Sessions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  messages   JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_user ON chat_sessions(user_id);

CREATE TRIGGER chat_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Watchlists ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT 'Mi Lista',
  symbols    TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_watchlist_user ON watchlists(user_id);

-- ─── RLS Policies ─────────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- Profiles: usuario solo ve/edita su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Chat: solo acceso propio
CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions FOR ALL USING (auth.uid() = user_id);

-- Watchlists: solo acceso propio
CREATE POLICY "Users can manage own watchlists"
  ON watchlists FOR ALL USING (auth.uid() = user_id);

-- News: público para todos
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News is public"
  ON news_articles FOR SELECT USING (true);

-- Glossary: público para todos
ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Glossary is public"
  ON glossary_terms FOR SELECT USING (true);
