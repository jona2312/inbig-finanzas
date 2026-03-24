// ─── Tiers / Planes ────────────────────────────────────────────────────────
export type PlanTier = 'free' | 'basic' | 'pro' | 'pro_plus'

export interface Plan {
  id: PlanTier
  name: string
  price: number
  currency: 'USD' | 'ARS'
  features: string[]
}

// ─── Usuario ────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: PlanTier
  plan_expires_at: string | null
  created_at: string
}

// ─── Mercados ────────────────────────────────────────────────────────────────
export interface MarketAsset {
  symbol: string
  name: string
  price: number
  change: number
  change_percent: number
  volume: number
  market_cap?: number
  currency: string
}

export interface CryptoAsset extends MarketAsset {
  rank: number
  circulating_supply: number
  total_supply: number
}

export interface ExchangeRate {
  pair: string      // e.g. 'USD/ARS'
  rate: number
  bid: number
  ask: number
  source: string
  updated_at: string
}

// ─── Noticias ────────────────────────────────────────────────────────────────
export interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  image_url: string | null
  published_at: string
  category: NewsCategory
  tags: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export type NewsCategory =
  | 'mercados'
  | 'economia'
  | 'crypto'
  | 'empresas'
  | 'latam'
  | 'internacional'

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

// ─── Glosario ─────────────────────────────────────────────────────────────────
export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  category: string
  related_terms: string[]
}
