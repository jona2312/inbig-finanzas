// ─────────────────────────────────────────────────────────────────────────────
// INbig Finanzas — Database Types (auto-generado desde Supabase MCP)
// No editar manualmente — regenerar con: supabase gen types typescript
// ─────────────────────────────────────────────────────────────────────────────

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          payment_reference: string | null
          period_end: string
          period_start: string
          referral_count: number
          status: string
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end: string
          period_start: string
          referral_count?: number
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          referral_count?: number
          status?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string | null
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at: string
          excerpt: string | null
          external_url: string | null
          frontend_tag: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          published_at: string | null
          slug: string | null
          source: string | null
          summary: string | null
          title: string
          updated_at: string
          urgency_level: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          category: Database["public"]["Enums"]["article_category"]
          content: string
          created_at?: string
          excerpt?: string | null
          external_url?: string | null
          frontend_tag?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          slug?: string | null
          source?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          urgency_level?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          category?: Database["public"]["Enums"]["article_category"]
          content?: string
          created_at?: string
          excerpt?: string | null
          external_url?: string | null
          frontend_tag?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          published_at?: string | null
          slug?: string | null
          source?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          urgency_level?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      briefings: {
        Row: {
          agenda: Json | null
          created_at: string | null
          drivers: Json | null
          fuentes: Json | null
          id: string
          modelo_usado: string | null
          published_at: string | null
          que_vigilar: Json | null
          regime: string | null
          tipo: string
          titulo: string | null
          top_movers: Json | null
        }
        Insert: {
          agenda?: Json | null
          created_at?: string | null
          drivers?: Json | null
          fuentes?: Json | null
          id?: string
          modelo_usado?: string | null
          published_at?: string | null
          que_vigilar?: Json | null
          regime?: string | null
          tipo: string
          titulo?: string | null
          top_movers?: Json | null
        }
        Update: {
          agenda?: Json | null
          created_at?: string | null
          drivers?: Json | null
          fuentes?: Json | null
          id?: string
          modelo_usado?: string | null
          published_at?: string | null
          que_vigilar?: Json | null
          regime?: string | null
          tipo?: string
          titulo?: string | null
          top_movers?: Json | null
        }
        Relationships: []
      }
      live_config: {
        Row: {
          active_session_id: string | null
          auto_detect_youtube: boolean | null
          fallback_type: string | null
          id: number
          live_mode: boolean
          updated_at: string
        }
        Insert: {
          active_session_id?: string | null
          auto_detect_youtube?: boolean | null
          fallback_type?: string | null
          id?: number
          live_mode?: boolean
          updated_at?: string
        }
        Update: {
          active_session_id?: string | null
          auto_detect_youtube?: boolean | null
          fallback_type?: string | null
          id?: number
          live_mode?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          categoria: string | null
          created_at: string
          ended_at: string | null
          id: string
          mercado: string | null
          metadata: Json | null
          pais: string | null
          replay_url: string | null
          source_id: string | null
          started_at: string | null
          status: string
          subtitulo: string | null
          titulo: string
          viewers_peak: number | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          mercado?: string | null
          metadata?: Json | null
          pais?: string | null
          replay_url?: string | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          subtitulo?: string | null
          titulo: string
          viewers_peak?: number | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          ended_at?: string | null
          id?: string
          mercado?: string | null
          metadata?: Json | null
          pais?: string | null
          replay_url?: string | null
          source_id?: string | null
          started_at?: string | null
          status?: string
          subtitulo?: string | null
          titulo?: string
          viewers_peak?: number | null
        }
        Relationships: []
      }
      live_sources: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          metadata: Json | null
          nombre: string
          pais: string | null
          priority: number | null
          status: string
          stream_url: string | null
          tipo_fuente: string
          updated_at: string
          youtube_channel_id: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          nombre: string
          pais?: string | null
          priority?: number | null
          status?: string
          stream_url?: string | null
          tipo_fuente: string
          updated_at?: string
          youtube_channel_id?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          nombre?: string
          pais?: string | null
          priority?: number | null
          status?: string
          stream_url?: string | null
          tipo_fuente?: string
          updated_at?: string
          youtube_channel_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          expires_at: string | null
          id: string
          mp_subscription_id: string | null
          started_at: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          mp_subscription_id?: string | null
          started_at?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          mp_subscription_id?: string | null
          started_at?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          page_path: string | null
          properties: Json | null
          referrer: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: number
          page_path?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: number
          page_path?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          onboarding_completed: boolean | null
          pais: string | null
          phone: string | null
          portfolio_value: number | null
          preferences: Json | null
          source: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          onboarding_completed?: boolean | null
          pais?: string | null
          phone?: string | null
          portfolio_value?: number | null
          preferences?: Json | null
          source?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          onboarding_completed?: boolean | null
          pais?: string | null
          phone?: string | null
          portfolio_value?: number | null
          preferences?: Json | null
          source?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      article_category:
        | "macro"
        | "mercados"
        | "empresas"
        | "crypto"
        | "divisas"
        | "argentina"
        | "opinion"
      user_tier: "lector" | "in_basic" | "in_pro" | "in_pro_plus"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]

// Helpers de uso frecuente
export type UserRow = Tables<"users">
export type ArticleRow = Tables<"articles">
export type BriefingRow = Tables<"briefings">
export type UserEventRow = Tables<"user_events">
export type SubscriptionRow = Tables<"subscriptions">
export type LiveConfigRow = Tables<"live_config">
export type UserTier = Enums<"user_tier">
export type ArticleCategory = Enums<"article_category">

// Alias de conveniencia para imports existentes
export type Article = ArticleRow
