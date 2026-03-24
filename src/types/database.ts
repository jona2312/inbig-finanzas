// Auto-generado con: npx supabase gen types typescript --linked
// Por ahora definición manual hasta conectar el proyecto Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'basic' | 'pro' | 'pro_plus'
          plan_expires_at: string | null
          stripe_customer_id: string | null
          mp_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      news_articles: {
        Row: {
          id: string
          title: string
          summary: string
          content: string | null
          url: string
          source: string
          image_url: string | null
          published_at: string
          category: string
          tags: string[]
          sentiment: 'positive' | 'negative' | 'neutral' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['news_articles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['news_articles']['Insert']>
      }
      glossary_terms: {
        Row: {
          id: string
          term: string
          slug: string
          definition: string
          category: string
          related_terms: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['glossary_terms']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['glossary_terms']['Insert']>
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['chat_sessions']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      plan_tier: 'free' | 'basic' | 'pro' | 'pro_plus'
    }
  }
}
