export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
          status: Database["public"]["Enums"]["payout_status"]
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
          status?: Database["public"]["Enums"]["payout_status"]
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
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          amount: number
          commission_amount: number
          commission_percent: number
          converted_at: string
          created_at: string
          id: string
          metadata: Json | null
          referred_user_id: string | null
          source: string | null
          subscription_id: string | null
        }
        Insert: {
          affiliate_id: string
          amount: number
          commission_amount: number
          commission_percent: number
          converted_at?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          referred_user_id?: string | null
          source?: string | null
          subscription_id?: string | null
        }
        Update: {
          affiliate_id?: string
          amount?: number
          commission_amount?: number
          commission_percent?: number
          converted_at?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          referred_user_id?: string | null
          source?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          approved_at: string | null
          commission_tier: number
          created_at: string
          id: string
          notes: string | null
          payment_details: Json | null
          payment_method: string | null
          referral_code: string
          status: Database["public"]["Enums"]["affiliate_status"]
          total_earned: number
          total_sales: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          commission_tier?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          referral_code: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earned?: number
          total_sales?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          commission_tier?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_details?: Json | null
          payment_method?: string | null
          referral_code?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_earned?: number
          total_sales?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          active: boolean | null
          condition: Database["public"]["Enums"]["alert_condition"]
          created_at: string
          id: string
          symbol: string
          trigger_value: number
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          condition: Database["public"]["Enums"]["alert_condition"]
          created_at?: string
          id?: string
          symbol: string
          trigger_value: number
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          condition?: Database["public"]["Enums"]["alert_condition"]
          created_at?: string
          id?: string
          symbol?: string
          trigger_value?: number
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      assistant_usage: {
        Row: {
          answer: string | null
          button_type: string | null
          context: string
          created_at: string | null
          id: string
          model_used: string | null
          query: string | null
          response_time_ms: number | null
          session_id: string | null
          sources: Json | null
          tier: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          answer?: string | null
          button_type?: string | null
          context?: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          query?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          sources?: Json | null
          tier?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          answer?: string | null
          button_type?: string | null
          context?: string
          created_at?: string | null
          id?: string
          model_used?: string | null
          query?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          sources?: Json | null
          tier?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
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
      copilot_memory: {
        Row: {
          confidence: number | null
          content: string
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          memory_type: string
          source: string | null
          source_id: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          content: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          memory_type: string
          source?: string | null
          source_id?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          content?: string
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          memory_type?: string
          source?: string | null
          source_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "copilot_memory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          instructor: string | null
          min_tier: Database["public"]["Enums"]["user_tier"]
          slug: string
          sort_order: number | null
          status: Database["public"]["Enums"]["course_status"]
          tags: Json | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor?: string | null
          min_tier?: Database["public"]["Enums"]["user_tier"]
          slug: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor?: string | null
          min_tier?: Database["public"]["Enums"]["user_tier"]
          slug?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["course_status"]
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          confidence: number | null
          created_at: string
          daily_goal: string | null
          date: string
          end_of_day_notes: string | null
          focus_level: number | null
          followed_plan: boolean | null
          id: string
          max_loss_usd: number | null
          max_trades: number | null
          mood: number | null
          notes: string | null
          trading_today: boolean | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          daily_goal?: string | null
          date?: string
          end_of_day_notes?: string | null
          focus_level?: number | null
          followed_plan?: boolean | null
          id?: string
          max_loss_usd?: number | null
          max_trades?: number | null
          mood?: number | null
          notes?: string | null
          trading_today?: boolean | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          daily_goal?: string | null
          date?: string
          end_of_day_notes?: string | null
          focus_level?: number | null
          followed_plan?: boolean | null
          id?: string
          max_loss_usd?: number | null
          max_trades?: number | null
          mood?: number | null
          notes?: string | null
          trading_today?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          progress: number | null
          started_at: string
          status: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          progress?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          progress?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          created_at: string
          email: string | null
          id: string
          message: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          message: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          last_position_seconds: number | null
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position_seconds?: number | null
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "live_config_active_session_id_fkey"
            columns: ["active_session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "live_sessions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "live_sources"
            referencedColumns: ["id"]
          },
        ]
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
      market_activity: {
        Row: {
          action: string
          country: string
          created_at: string
          flag: string
          id: string
          symbol: string
          user_hash: string | null
        }
        Insert: {
          action?: string
          country?: string
          created_at?: string
          flag?: string
          id?: string
          symbol: string
          user_hash?: string | null
        }
        Update: {
          action?: string
          country?: string
          created_at?: string
          flag?: string
          id?: string
          symbol?: string
          user_hash?: string | null
        }
        Relationships: []
      }
      market_cache: {
        Row: {
          change: number | null
          change_percent: number | null
          data: Json | null
          id: string
          last_updated: string
          price: number | null
          symbol: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          data?: Json | null
          id?: string
          last_updated?: string
          price?: number | null
          symbol: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          data?: Json | null
          id?: string
          last_updated?: string
          price?: number | null
          symbol?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          buy_date: string
          buy_price: number
          created_at: string
          id: string
          notes: string | null
          quantity: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buy_date: string
          buy_price: number
          created_at?: string
          id?: string
          notes?: string | null
          quantity: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buy_date?: string
          buy_price?: number
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scenario_sessions: {
        Row: {
          asset_type: string | null
          copilot_questions: Json | null
          created_at: string
          current_price: number | null
          direction: string | null
          educational_note: string | null
          expires_at: string | null
          id: string
          linked_trade_id: string | null
          macro_events: Json | null
          outcome_notes: string | null
          risk_size: number | null
          scenario_base: Json | null
          scenario_bear: Json | null
          scenario_bull: Json | null
          status: string | null
          symbol: string
          technical_bias: string | null
          timeframe: string | null
          updated_at: string
          user_id: string
          volatility_note: string | null
        }
        Insert: {
          asset_type?: string | null
          copilot_questions?: Json | null
          created_at?: string
          current_price?: number | null
          direction?: string | null
          educational_note?: string | null
          expires_at?: string | null
          id?: string
          linked_trade_id?: string | null
          macro_events?: Json | null
          outcome_notes?: string | null
          risk_size?: number | null
          scenario_base?: Json | null
          scenario_bear?: Json | null
          scenario_bull?: Json | null
          status?: string | null
          symbol: string
          technical_bias?: string | null
          timeframe?: string | null
          updated_at?: string
          user_id: string
          volatility_note?: string | null
        }
        Update: {
          asset_type?: string | null
          copilot_questions?: Json | null
          created_at?: string
          current_price?: number | null
          direction?: string | null
          educational_note?: string | null
          expires_at?: string | null
          id?: string
          linked_trade_id?: string | null
          macro_events?: Json | null
          outcome_notes?: string | null
          risk_size?: number | null
          scenario_base?: Json | null
          scenario_bear?: Json | null
          scenario_bull?: Json | null
          status?: string | null
          symbol?: string
          technical_bias?: string | null
          timeframe?: string | null
          updated_at?: string
          user_id?: string
          volatility_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_sessions_linked_trade_id_fkey"
            columns: ["linked_trade_id"]
            isOneToOne: false
            referencedRelation: "trade_journal"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scenario_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_journal: {
        Row: {
          asset_type: string | null
          closed_at: string | null
          created_at: string
          direction: string | null
          emotion_after: string | null
          emotion_before: string | null
          emotion_during: string | null
          entry_price: number | null
          entry_reason: string | null
          exit_price: number | null
          exit_reason: string | null
          followed_plan: boolean | null
          id: string
          lesson: string | null
          leverage: number | null
          lot_size: number | null
          macro_context: Json | null
          opened_at: string
          outcome: string | null
          pnl: number | null
          pnl_pct: number | null
          risk_reward: number | null
          screenshot_url: string | null
          session: string | null
          status: string | null
          stop_loss: number | null
          strategy: string | null
          symbol: string
          tags: string[] | null
          take_profit: number | null
          timeframe: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type?: string | null
          closed_at?: string | null
          created_at?: string
          direction?: string | null
          emotion_after?: string | null
          emotion_before?: string | null
          emotion_during?: string | null
          entry_price?: number | null
          entry_reason?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          followed_plan?: boolean | null
          id?: string
          lesson?: string | null
          leverage?: number | null
          lot_size?: number | null
          macro_context?: Json | null
          opened_at?: string
          outcome?: string | null
          pnl?: number | null
          pnl_pct?: number | null
          risk_reward?: number | null
          screenshot_url?: string | null
          session?: string | null
          status?: string | null
          stop_loss?: number | null
          strategy?: string | null
          symbol: string
          tags?: string[] | null
          take_profit?: number | null
          timeframe?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string | null
          closed_at?: string | null
          created_at?: string
          direction?: string | null
          emotion_after?: string | null
          emotion_before?: string | null
          emotion_during?: string | null
          entry_price?: number | null
          entry_reason?: string | null
          exit_price?: number | null
          exit_reason?: string | null
          followed_plan?: boolean | null
          id?: string
          lesson?: string | null
          leverage?: number | null
          lot_size?: number | null
          macro_context?: Json | null
          opened_at?: string
          outcome?: string | null
          pnl?: number | null
          pnl_pct?: number | null
          risk_reward?: number | null
          screenshot_url?: string | null
          session?: string | null
          status?: string | null
          stop_loss?: number | null
          strategy?: string | null
          symbol?: string
          tags?: string[] | null
          take_profit?: number | null
          timeframe?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_journal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_profile: {
        Row: {
          avg_pnl: number | null
          avg_rr: number | null
          best_assets: string[] | null
          consecutive_losses: number | null
          copilot_notes: string | null
          created_at: string
          detected_patterns: Json | null
          id: string
          last_analysis_at: string | null
          max_drawdown_streak: number | null
          preferred_session: string | null
          preferred_strategy: string | null
          preferred_timeframe: string | null
          strong_points: string[] | null
          total_trades: number | null
          updated_at: string
          user_id: string
          weak_points: string[] | null
          win_rate: number | null
        }
        Insert: {
          avg_pnl?: number | null
          avg_rr?: number | null
          best_assets?: string[] | null
          consecutive_losses?: number | null
          copilot_notes?: string | null
          created_at?: string
          detected_patterns?: Json | null
          id?: string
          last_analysis_at?: string | null
          max_drawdown_streak?: number | null
          preferred_session?: string | null
          preferred_strategy?: string | null
          preferred_timeframe?: string | null
          strong_points?: string[] | null
          total_trades?: number | null
          updated_at?: string
          user_id: string
          weak_points?: string[] | null
          win_rate?: number | null
        }
        Update: {
          avg_pnl?: number | null
          avg_rr?: number | null
          best_assets?: string[] | null
          consecutive_losses?: number | null
          copilot_notes?: string | null
          created_at?: string
          detected_patterns?: Json | null
          id?: string
          last_analysis_at?: string | null
          max_drawdown_streak?: number | null
          preferred_session?: string | null
          preferred_strategy?: string | null
          preferred_timeframe?: string | null
          strong_points?: string[] | null
          total_trades?: number | null
          updated_at?: string
          user_id?: string
          weak_points?: string[] | null
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_plans: {
        Row: {
          assets: Json | null
          created_at: string
          generated: boolean | null
          id: string
          info_needs: string[] | null
          markets: string[] | null
          notes: string | null
          risk_profile: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assets?: Json | null
          created_at?: string
          generated?: boolean | null
          id?: string
          info_needs?: string[] | null
          markets?: string[] | null
          notes?: string | null
          risk_profile?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assets?: Json | null
          created_at?: string
          generated?: boolean | null
          id?: string
          info_needs?: string[] | null
          markets?: string[] | null
          notes?: string | null
          risk_profile?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_briefings: {
        Row: {
          activos_clave: Json | null
          alertas: Json | null
          briefing_id: string | null
          copilot_message: string | null
          created_at: string
          date: string
          id: string
          read_at: string | null
          resumen: string | null
          sent_at: string | null
          session: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          activos_clave?: Json | null
          alertas?: Json | null
          briefing_id?: string | null
          copilot_message?: string | null
          created_at?: string
          date?: string
          id?: string
          read_at?: string | null
          resumen?: string | null
          sent_at?: string | null
          session?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          activos_clave?: Json | null
          alertas?: Json | null
          briefing_id?: string | null
          copilot_message?: string | null
          created_at?: string
          date?: string
          id?: string
          read_at?: string | null
          resumen?: string | null
          sent_at?: string | null
          session?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_briefings_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_briefings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      user_preferences: {
        Row: {
          created_at: string
          default_symbol: string | null
          id: string
          language: string | null
          notifications: Json | null
          sidebar_tabs: string[] | null
          terminal_layout: string | null
          theme: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_symbol?: string | null
          id?: string
          language?: string | null
          notifications?: Json | null
          sidebar_tabs?: string[] | null
          terminal_layout?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_symbol?: string | null
          id?: string
          language?: string | null
          notifications?: Json | null
          sidebar_tabs?: string[] | null
          terminal_layout?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
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
      watchlist: {
        Row: {
          added_at: string
          asset_type: string | null
          id: string
          name: string | null
          symbol: string
          user_id: string
        }
        Insert: {
          added_at?: string
          asset_type?: string | null
          id?: string
          name?: string | null
          symbol: string
          user_id: string
        }
        Update: {
          added_at?: string
          asset_type?: string | null
          id?: string
          name?: string | null
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      affiliate_status: "pending" | "active" | "suspended" | "inactive"
      alert_condition: "above" | "below"
      article_category:
        | "macro"
        | "mercados"
        | "empresas"
        | "crypto"
        | "divisas"
        | "argentina"
        | "opinion"
      course_status: "draft" | "published" | "archived"
      enrollment_status: "active" | "completed" | "cancelled"
      payout_status: "pending" | "approved" | "paid" | "rejected"
      user_tier: "lector" | "in_basic" | "in_pro" | "in_pro_plus"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      affiliate_status: ["pending", "active", "suspended", "inactive"],
      alert_condition: ["above", "below"],
      article_category: [
        "macro",
        "mercados",
        "empresas",
        "crypto",
        "divisas",
        "argentina",
        "opinion",
      ],
      course_status: ["draft", "published", "archived"],
      enrollment_status: ["active", "completed", "cancelled"],
      payout_status: ["pending", "approved", "paid", "rejected"],
      user_tier: ["lector", "in_basic", "in_pro", "in_pro_plus"],
    },
  },
} as const

// ============================================================
// Convenience type aliases (Row / Insert / Update per table)
// ============================================================

// Row types
export type AffiliatePayoutsRow = Database["public"]["Tables"]["affiliate_payouts"]["Row"]
export type AffiliatePayoutRow = Database["public"]["Tables"]["affiliate_payouts"]["Row"]
export type AffiliateReferralsRow = Database["public"]["Tables"]["affiliate_referrals"]["Row"]
export type AffiliateReferralRow = Database["public"]["Tables"]["affiliate_referrals"]["Row"]
export type AffiliatesRow = Database["public"]["Tables"]["affiliates"]["Row"]
export type AffiliateRow = Database["public"]["Tables"]["affiliates"]["Row"]
export type AlertsRow = Database["public"]["Tables"]["alerts"]["Row"]
export type AlertRow = Database["public"]["Tables"]["alerts"]["Row"]
export type ArticlesRow = Database["public"]["Tables"]["articles"]["Row"]
export type ArticleRow = Database["public"]["Tables"]["articles"]["Row"]
export type AssistantUsageRow = Database["public"]["Tables"]["assistant_usage"]["Row"]
export type AuditLogsRow = Database["public"]["Tables"]["audit_logs"]["Row"]
export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"]
export type BriefingsRow = Database["public"]["Tables"]["briefings"]["Row"]
export type BriefingRow = Database["public"]["Tables"]["briefings"]["Row"]
export type CopilotMemoryRow = Database["public"]["Tables"]["copilot_memory"]["Row"]
export type CoursesRow = Database["public"]["Tables"]["courses"]["Row"]
export type CourseRow = Database["public"]["Tables"]["courses"]["Row"]
export type DailyCheckinsRow = Database["public"]["Tables"]["daily_checkins"]["Row"]
export type DailyCheckinRow = Database["public"]["Tables"]["daily_checkins"]["Row"]
export type EnrollmentsRow = Database["public"]["Tables"]["enrollments"]["Row"]
export type EnrollmentRow = Database["public"]["Tables"]["enrollments"]["Row"]
export type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"]
export type LessonProgressRow = Database["public"]["Tables"]["lesson_progress"]["Row"]
export type LessonsRow = Database["public"]["Tables"]["lessons"]["Row"]
export type LessonRow = Database["public"]["Tables"]["lessons"]["Row"]
export type LiveConfigRow = Database["public"]["Tables"]["live_config"]["Row"]
export type LiveSessionsRow = Database["public"]["Tables"]["live_sessions"]["Row"]
export type LiveSessionRow = Database["public"]["Tables"]["live_sessions"]["Row"]
export type LiveSourcesRow = Database["public"]["Tables"]["live_sources"]["Row"]
export type LiveSourceRow = Database["public"]["Tables"]["live_sources"]["Row"]
export type MarketActivityRow = Database["public"]["Tables"]["market_activity"]["Row"]
export type MarketCacheRow = Database["public"]["Tables"]["market_cache"]["Row"]
export type PortfolioRow = Database["public"]["Tables"]["portfolio"]["Row"]
export type ScenarioSessionsRow = Database["public"]["Tables"]["scenario_sessions"]["Row"]
export type ScenarioSessionRow = Database["public"]["Tables"]["scenario_sessions"]["Row"]
export type SubscriptionsRow = Database["public"]["Tables"]["subscriptions"]["Row"]
export type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"]
export type TradeJournalRow = Database["public"]["Tables"]["trade_journal"]["Row"]
export type TraderProfileRow = Database["public"]["Tables"]["trader_profile"]["Row"]
export type TradingPlansRow = Database["public"]["Tables"]["trading_plans"]["Row"]
export type TradingPlanRow = Database["public"]["Tables"]["trading_plans"]["Row"]
export type UserBriefingsRow = Database["public"]["Tables"]["user_briefings"]["Row"]
export type UserBriefingRow = Database["public"]["Tables"]["user_briefings"]["Row"]
export type UserEventsRow = Database["public"]["Tables"]["user_events"]["Row"]
export type UserEventRow = Database["public"]["Tables"]["user_events"]["Row"]
export type UserPreferencesRow = Database["public"]["Tables"]["user_preferences"]["Row"]
export type UserPreferenceRow = Database["public"]["Tables"]["user_preferences"]["Row"]
export type UsersRow = Database["public"]["Tables"]["users"]["Row"]
export type UserRow = Database["public"]["Tables"]["users"]["Row"]
export type WatchlistRow = Database["public"]["Tables"]["watchlist"]["Row"]

// Insert types
export type AffiliatePayoutsInsert = Database["public"]["Tables"]["affiliate_payouts"]["Insert"]
export type AffiliatePayoutInsert = Database["public"]["Tables"]["affiliate_payouts"]["Insert"]
export type AffiliateReferralsInsert = Database["public"]["Tables"]["affiliate_referrals"]["Insert"]
export type AffiliateReferralInsert = Database["public"]["Tables"]["affiliate_referrals"]["Insert"]
export type AffiliatesInsert = Database["public"]["Tables"]["affiliates"]["Insert"]
export type AffiliateInsert = Database["public"]["Tables"]["affiliates"]["Insert"]
export type AlertsInsert = Database["public"]["Tables"]["alerts"]["Insert"]
export type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"]
export type ArticlesInsert = Database["public"]["Tables"]["articles"]["Insert"]
export type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"]
export type AssistantUsageInsert = Database["public"]["Tables"]["assistant_usage"]["Insert"]
export type AuditLogsInsert = Database["public"]["Tables"]["audit_logs"]["Insert"]
export type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"]
export type BriefingsInsert = Database["public"]["Tables"]["briefings"]["Insert"]
export type BriefingInsert = Database["public"]["Tables"]["briefings"]["Insert"]
export type CopilotMemoryInsert = Database["public"]["Tables"]["copilot_memory"]["Insert"]
export type CoursesInsert = Database["public"]["Tables"]["courses"]["Insert"]
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"]
export type DailyCheckinsInsert = Database["public"]["Tables"]["daily_checkins"]["Insert"]
export type DailyCheckinInsert = Database["public"]["Tables"]["daily_checkins"]["Insert"]
export type EnrollmentsInsert = Database["public"]["Tables"]["enrollments"]["Insert"]
export type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"]
export type FeedbackInsert = Database["public"]["Tables"]["feedback"]["Insert"]
export type LessonProgressInsert = Database["public"]["Tables"]["lesson_progress"]["Insert"]
export type LessonsInsert = Database["public"]["Tables"]["lessons"]["Insert"]
export type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"]
export type LiveConfigInsert = Database["public"]["Tables"]["live_config"]["Insert"]
export type LiveSessionsInsert = Database["public"]["Tables"]["live_sessions"]["Insert"]
export type LiveSessionInsert = Database["public"]["Tables"]["live_sessions"]["Insert"]
export type LiveSourcesInsert = Database["public"]["Tables"]["live_sources"]["Insert"]
export type LiveSourceInsert = Database["public"]["Tables"]["live_sources"]["Insert"]
export type MarketActivityInsert = Database["public"]["Tables"]["market_activity"]["Insert"]
export type MarketCacheInsert = Database["public"]["Tables"]["market_cache"]["Insert"]
export type PortfolioInsert = Database["public"]["Tables"]["portfolio"]["Insert"]
export type ScenarioSessionsInsert = Database["public"]["Tables"]["scenario_sessions"]["Insert"]
export type ScenarioSessionInsert = Database["public"]["Tables"]["scenario_sessions"]["Insert"]
export type SubscriptionsInsert = Database["public"]["Tables"]["subscriptions"]["Insert"]
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"]
export type TradeJournalInsert = Database["public"]["Tables"]["trade_journal"]["Insert"]
export type TraderProfileInsert = Database["public"]["Tables"]["trader_profile"]["Insert"]
export type TradingPlansInsert = Database["public"]["Tables"]["trading_plans"]["Insert"]
export type TradingPlanInsert = Database["public"]["Tables"]["trading_plans"]["Insert"]
export type UserBriefingsInsert = Database["public"]["Tables"]["user_briefings"]["Insert"]
export type UserBriefingInsert = Database["public"]["Tables"]["user_briefings"]["Insert"]
export type UserEventsInsert = Database["public"]["Tables"]["user_events"]["Insert"]
export type UserEventInsert = Database["public"]["Tables"]["user_events"]["Insert"]
export type UserPreferencesInsert = Database["public"]["Tables"]["user_preferences"]["Insert"]
export type UserPreferenceInsert = Database["public"]["Tables"]["user_preferences"]["Insert"]
export type UsersInsert = Database["public"]["Tables"]["users"]["Insert"]
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"]
export type WatchlistInsert = Database["public"]["Tables"]["watchlist"]["Insert"]

// Update types
export type AffiliatePayoutsUpdate = Database["public"]["Tables"]["affiliate_payouts"]["Update"]
export type AffiliatePayoutUpdate = Database["public"]["Tables"]["affiliate_payouts"]["Update"]
export type AffiliateReferralsUpdate = Database["public"]["Tables"]["affiliate_referrals"]["Update"]
export type AffiliateReferralUpdate = Database["public"]["Tables"]["affiliate_referrals"]["Update"]
export type AffiliatesUpdate = Database["public"]["Tables"]["affiliates"]["Update"]
export type AffiliateUpdate = Database["public"]["Tables"]["affiliates"]["Update"]
export type AlertsUpdate = Database["public"]["Tables"]["alerts"]["Update"]
export type AlertUpdate = Database["public"]["Tables"]["alerts"]["Update"]
export type ArticlesUpdate = Database["public"]["Tables"]["articles"]["Update"]
export type ArticleUpdate = Database["public"]["Tables"]["articles"]["Update"]
export type AssistantUsageUpdate = Database["public"]["Tables"]["assistant_usage"]["Update"]
export type AuditLogsUpdate = Database["public"]["Tables"]["audit_logs"]["Update"]
export type AuditLogUpdate = Database["public"]["Tables"]["audit_logs"]["Update"]
export type BriefingsUpdate = Database["public"]["Tables"]["briefings"]["Update"]
export type BriefingUpdate = Database["public"]["Tables"]["briefings"]["Update"]
export type CopilotMemoryUpdate = Database["public"]["Tables"]["copilot_memory"]["Update"]
export type CoursesUpdate = Database["public"]["Tables"]["courses"]["Update"]
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"]
export type DailyCheckinsUpdate = Database["public"]["Tables"]["daily_checkins"]["Update"]
export type DailyCheckinUpdate = Database["public"]["Tables"]["daily_checkins"]["Update"]
export type EnrollmentsUpdate = Database["public"]["Tables"]["enrollments"]["Update"]
export type EnrollmentUpdate = Database["public"]["Tables"]["enrollments"]["Update"]
export type FeedbackUpdate = Database["public"]["Tables"]["feedback"]["Update"]
export type LessonProgressUpdate = Database["public"]["Tables"]["lesson_progress"]["Update"]
export type LessonsUpdate = Database["public"]["Tables"]["lessons"]["Update"]
export type LessonUpdate = Database["public"]["Tables"]["lessons"]["Update"]
export type LiveConfigUpdate = Database["public"]["Tables"]["live_config"]["Update"]
export type LiveSessionsUpdate = Database["public"]["Tables"]["live_sessions"]["Update"]
export type LiveSessionUpdate = Database["public"]["Tables"]["live_sessions"]["Update"]
export type LiveSourcesUpdate = Database["public"]["Tables"]["live_sources"]["Update"]
export type LiveSourceUpdate = Database["public"]["Tables"]["live_sources"]["Update"]
export type MarketActivityUpdate = Database["public"]["Tables"]["market_activity"]["Update"]
export type MarketCacheUpdate = Database["public"]["Tables"]["market_cache"]["Update"]
export type PortfolioUpdate = Database["public"]["Tables"]["portfolio"]["Update"]
export type ScenarioSessionsUpdate = Database["public"]["Tables"]["scenario_sessions"]["Update"]
export type ScenarioSessionUpdate = Database["public"]["Tables"]["scenario_sessions"]["Update"]
export type SubscriptionsUpdate = Database["public"]["Tables"]["subscriptions"]["Update"]
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"]
export type TradeJournalUpdate = Database["public"]["Tables"]["trade_journal"]["Update"]
export type TraderProfileUpdate = Database["public"]["Tables"]["trader_profile"]["Update"]
export type TradingPlansUpdate = Database["public"]["Tables"]["trading_plans"]["Update"]
export type TradingPlanUpdate = Database["public"]["Tables"]["trading_plans"]["Update"]
export type UserBriefingsUpdate = Database["public"]["Tables"]["user_briefings"]["Update"]
export type UserBriefingUpdate = Database["public"]["Tables"]["user_briefings"]["Update"]
export type UserEventsUpdate = Database["public"]["Tables"]["user_events"]["Update"]
export type UserEventUpdate = Database["public"]["Tables"]["user_events"]["Update"]
export type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"]
export type UserPreferenceUpdate = Database["public"]["Tables"]["user_preferences"]["Update"]
export type UsersUpdate = Database["public"]["Tables"]["users"]["Update"]
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"]
export type WatchlistUpdate = Database["public"]["Tables"]["watchlist"]["Update"]

