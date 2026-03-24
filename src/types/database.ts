// ─────────────────────────────────────────────────────────────────────────────
// INbig Finanzas — Database Types (sincronizado con Supabase sa-east-1)
// ─────────────────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type SubscriptionTier = 'free' | 'inbasico' | 'pro' | 'pro_plus'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type BriefingTipo = 'pre_market' | 'midday' | 'recap'
export type AssetType = 'stock' | 'crypto' | 'forex' | 'commodity' | 'bond'

export interface Database {
  public: {
    Tables: {

      // ─── Articles (151 rows — noticias reales) ──────────────────────────
      articles: {
        Row: {
          id: string
          title: string
          content: string | null
          excerpt: string | null
          summary: string | null
          category: string
          source: string | null
          image_url: string | null
          author: string | null
          published_at: string
          created_at: string
          updated_at: string
          is_featured: boolean
          view_count: number
          external_url: string | null
          slug: string | null
          urgency_level: string | null
          frontend_tag: string | null
        }
        Insert: Omit<Database['public']['Tables']['articles']['Row'], 'id' | 'created_at' | 'updated_at' | 'view_count'>
        Update: Partial<Database['public']['Tables']['articles']['Insert']>
      }

      // ─── Users ──────────────────────────────────────────────────────────
      users: {
        Row: {
          id: string
          email: string
          tier: SubscriptionTier
          full_name: string | null
          avatar_url: string | null
          portfolio_value: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          phone: string | null
          country: string | null
          preferences: Json | null
          onboarding_completed: boolean
          source: string | null
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }

      // ─── Subscriptions ──────────────────────────────────────────────────
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: SubscriptionTier
          status: SubscriptionStatus
          started_at: string
          expires_at: string | null
          stripe_subscription_id: string | null
          mp_subscription_id: string | null
          stripe_customer_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }

      // ─── Briefings (IA — 3 cortes diarios) ──────────────────────────────
      briefings: {
        Row: {
          id: string
          tipo: BriefingTipo
          titulo: string
          drivers: Json | null       // array de drivers del mercado
          regime: string | null       // régimen de mercado (risk-on/off)
          top_movers: Json | null     // activos más movidos
          que_vigilar: Json | null    // alertas/watchlist editorial
          agenda: Json | null         // agenda macro del día
          fuentes: Json | null        // fuentes usadas
          modelo_usado: string | null
          published_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['briefings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['briefings']['Insert']>
      }

      // ─── Market Cache ────────────────────────────────────────────────────
      market_cache: {
        Row: {
          id: string
          symbol: string
          price: number | null
          change: number | null
          change_percent: number | null
          volume: number | null
          last_updated: string | null
          data: Json | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['market_cache']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['market_cache']['Insert']>
      }

      // ─── Watchlist ───────────────────────────────────────────────────────
      watchlist: {
        Row: {
          id: string
          user_id: string
          symbol: string
          name: string | null
          asset_type: AssetType | null
          added_at: string
        }
        Insert: Omit<Database['public']['Tables']['watchlist']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['watchlist']['Insert']>
      }

      // ─── Alerts ──────────────────────────────────────────────────────────
      alerts: {
        Row: {
          id: string
          user_id: string
          symbol: string
          condition: string
          trigger_value: number
          active: boolean
          triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['alerts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['alerts']['Insert']>
      }

      // ─── Portfolio ───────────────────────────────────────────────────────
      portfolio: {
        Row: {
          id: string
          user_id: string
          symbol: string
          quantity: number
          buy_price: number
          buy_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['portfolio']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['portfolio']['Insert']>
      }

      // ─── Assistant Usage ─────────────────────────────────────────────────
      assistant_usage: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          button_type: string | null
          query: string | null
          answer: string | null
          model_used: string | null
          tokens_used: number | null
          tier: SubscriptionTier | null
          sources: Json | null
          response_time_ms: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['assistant_usage']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['assistant_usage']['Insert']>
      }

      // ─── Feedback ────────────────────────────────────────────────────────
      feedback: {
        Row: {
          id: string
          user_id: string | null
          type: string
          message: string
          email: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['feedback']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>
      }

      // ─── Audit Logs ──────────────────────────────────────────────────────
      audit_logs: {
        Row: {
          id: string
          event_type: string
          entity_type: string | null
          entity_id: string | null
          user_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      subscription_tier: SubscriptionTier
      subscription_status: SubscriptionStatus
    }
  }
}

// ─── Convenience types ────────────────────────────────────────────────────────
export type Article = Database['public']['Tables']['articles']['Row']
export type UserProfile = Database['public']['Tables']['users']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Briefing = Database['public']['Tables']['briefings']['Row']
export type MarketCache = Database['public']['Tables']['market_cache']['Row']
export type WatchlistItem = Database['public']['Tables']['watchlist']['Row']
export type Alert = Database['public']['Tables']['alerts']['Row']
export type PortfolioItem = Database['public']['Tables']['portfolio']['Row']
