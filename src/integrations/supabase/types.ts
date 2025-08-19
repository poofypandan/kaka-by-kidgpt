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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          actor: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      child_sessions: {
        Row: {
          child_id: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          last_activity: string | null
          safety_alerts_count: number | null
          started_at: string
        }
        Insert: {
          child_id: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          last_activity?: string | null
          safety_alerts_count?: number | null
          started_at?: string
        }
        Update: {
          child_id?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          last_activity?: string | null
          safety_alerts_count?: number | null
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birthdate: string | null
          created_at: string
          daily_limit_min: number
          daily_minutes_limit: number
          detected_grade: number | null
          final_grade: number | null
          first_name: string
          grade: number
          grade_override: number | null
          id: string
          last_usage_reset_date: string
          minutes_used_today: number
          parent_id: string
          streak_days: number
          updated_at: string
          used_today_min: number
          user_id: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          daily_limit_min?: number
          daily_minutes_limit?: number
          detected_grade?: number | null
          final_grade?: number | null
          first_name: string
          grade: number
          grade_override?: number | null
          id?: string
          last_usage_reset_date?: string
          minutes_used_today?: number
          parent_id: string
          streak_days?: number
          updated_at?: string
          used_today_min?: number
          user_id: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          daily_limit_min?: number
          daily_minutes_limit?: number
          detected_grade?: number | null
          final_grade?: number | null
          first_name?: string
          grade?: number
          grade_override?: number | null
          id?: string
          last_usage_reset_date?: string
          minutes_used_today?: number
          parent_id?: string
          streak_days?: number
          updated_at?: string
          used_today_min?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_filter_settings: {
        Row: {
          child_id: string
          created_at: string
          custom_blocked_words: string[] | null
          filter_level: string | null
          id: string
          log_all_conversations: boolean | null
          parent_notification_threshold: number | null
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          custom_blocked_words?: string[] | null
          filter_level?: string | null
          id?: string
          log_all_conversations?: boolean | null
          parent_notification_threshold?: number | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          custom_blocked_words?: string[] | null
          filter_level?: string | null
          id?: string
          log_all_conversations?: boolean | null
          parent_notification_threshold?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_filter_settings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_logs: {
        Row: {
          child_id: string | null
          created_at: string
          filter_reason: string | null
          filtered_content: boolean | null
          id: string
          message_content: string
          message_type: string
          safety_score: number | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          filter_reason?: string | null
          filtered_content?: boolean | null
          id?: string
          message_content: string
          message_type: string
          safety_score?: number | null
        }
        Update: {
          child_id?: string | null
          created_at?: string
          filter_reason?: string | null
          filtered_content?: boolean | null
          id?: string
          message_content?: string
          message_type?: string
          safety_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          child_id: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversations_child"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          invite_code: string | null
          invite_expires_at: string | null
          name: string
          primary_parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          name: string
          primary_parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string | null
          invite_expires_at?: string | null
          name?: string
          primary_parent_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      family_conversations: {
        Row: {
          child_id: string
          created_at: string
          family_id: string
          flag_reason: string | null
          flagged: boolean | null
          id: string
          message_content: string
          parent_reviewed: boolean | null
          safety_score: number | null
          sender: string
          session_id: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          family_id: string
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          message_content: string
          parent_reviewed?: boolean | null
          safety_score?: number | null
          sender: string
          session_id?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          family_id?: string
          flag_reason?: string | null
          flagged?: boolean | null
          id?: string
          message_content?: string
          parent_reviewed?: boolean | null
          safety_score?: number | null
          sender?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_conversations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_conversations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "child_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          age: number | null
          content_filter_level: string | null
          created_at: string
          daily_time_limit: number | null
          family_id: string
          id: string
          islamic_content_enabled: boolean | null
          name: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          content_filter_level?: string | null
          created_at?: string
          daily_time_limit?: number | null
          family_id: string
          id?: string
          islamic_content_enabled?: boolean | null
          name: string
          phone?: string | null
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          content_filter_level?: string | null
          created_at?: string
          daily_time_limit?: number | null
          family_id?: string
          id?: string
          islamic_content_enabled?: boolean | null
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_notifications: {
        Row: {
          child_id: string | null
          created_at: string
          family_id: string
          id: string
          message: string
          notification_type: string
          read_by_primary: boolean | null
          read_by_secondary: boolean | null
          severity: string | null
          title: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          family_id: string
          id?: string
          message: string
          notification_type: string
          read_by_primary?: boolean | null
          read_by_secondary?: boolean | null
          severity?: string | null
          title: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          family_id?: string
          id?: string
          message?: string
          notification_type?: string
          read_by_primary?: boolean | null
          read_by_secondary?: boolean | null
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_notifications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_notifications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_settings: {
        Row: {
          created_at: string
          default_child_time_limit: number | null
          emergency_contacts: Json | null
          family_id: string
          family_pin: string | null
          id: string
          notification_preferences: Json | null
          updated_at: string
          whatsapp_notifications: boolean | null
        }
        Insert: {
          created_at?: string
          default_child_time_limit?: number | null
          emergency_contacts?: Json | null
          family_id: string
          family_pin?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          whatsapp_notifications?: boolean | null
        }
        Update: {
          created_at?: string
          default_child_time_limit?: number | null
          emergency_contacts?: Json | null
          family_id?: string
          family_pin?: string | null
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          whatsapp_notifications?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "family_settings_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          child_id: string
          content: string
          conversation_id: string | null
          created_at: string
          flag_reason: string | null
          flag_type: string | null
          flagged: boolean
          id: string
          metadata: Json | null
          role: string
          sender: string | null
          status: string
        }
        Insert: {
          child_id: string
          content: string
          conversation_id?: string | null
          created_at?: string
          flag_reason?: string | null
          flag_type?: string | null
          flagged?: boolean
          id?: string
          metadata?: Json | null
          role: string
          sender?: string | null
          status?: string
        }
        Update: {
          child_id?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          flag_reason?: string | null
          flag_type?: string | null
          flagged?: boolean
          id?: string
          metadata?: Json | null
          role?: string
          sender?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_consents: {
        Row: {
          consent_given: boolean
          consent_text: string | null
          consent_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          parent_id: string
          user_agent: string | null
        }
        Insert: {
          consent_given?: boolean
          consent_text?: string | null
          consent_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          parent_id: string
          user_agent?: string | null
        }
        Update: {
          consent_given?: boolean
          consent_text?: string | null
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          parent_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_parent_consents_parent"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_notifications: {
        Row: {
          child_id: string
          conversation_log_id: string | null
          created_at: string
          id: string
          message: string
          notification_type: string
          parent_id: string
          read_at: string | null
          severity: string | null
        }
        Insert: {
          child_id: string
          conversation_log_id?: string | null
          created_at?: string
          id?: string
          message: string
          notification_type: string
          parent_id: string
          read_at?: string | null
          severity?: string | null
        }
        Update: {
          child_id?: string
          conversation_log_id?: string | null
          created_at?: string
          id?: string
          message?: string
          notification_type?: string
          parent_id?: string
          read_at?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_notifications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_notifications_conversation_log_id_fkey"
            columns: ["conversation_log_id"]
            isOneToOne: false
            referencedRelation: "conversation_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_notifications_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parents"
            referencedColumns: ["id"]
          },
        ]
      }
      parents: {
        Row: {
          consent_at: string | null
          consent_meta: Json | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_at?: string | null
          consent_meta?: Json | null
          created_at?: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_at?: string | null
          consent_meta?: Json | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          child_grade: number | null
          child_name: string | null
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          child_grade?: number | null
          child_name?: string | null
          created_at?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          child_grade?: number | null
          child_name?: string | null
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          children_limit: number | null
          created_at: string
          email: string
          id: string
          last_message_reset_date: string | null
          messages_used_current_month: number | null
          monthly_messages_limit: number | null
          parent_accounts_limit: number | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          children_limit?: number | null
          created_at?: string
          email: string
          id?: string
          last_message_reset_date?: string | null
          messages_used_current_month?: number | null
          monthly_messages_limit?: number | null
          parent_accounts_limit?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          children_limit?: number | null
          created_at?: string
          email?: string
          id?: string
          last_message_reset_date?: string | null
          messages_used_current_month?: number | null
          monthly_messages_limit?: number | null
          parent_accounts_limit?: number | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          child_id: string | null
          created_at: string
          id: string
          usage_count: number | null
          usage_date: string
          usage_type: string
          user_id: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          id?: string
          usage_count?: number | null
          usage_date?: string
          usage_type: string
          user_id?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string
          id?: string
          usage_count?: number | null
          usage_date?: string
          usage_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_user_id: string
          created_at: string
          email: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          email?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_child_to_family: {
        Args: {
          p_age: number
          p_child_name: string
          p_daily_time_limit?: number
          p_family_id: string
        }
        Returns: string
      }
      check_subscription_limits: {
        Args: { p_limit_type: string; p_user_id: string }
        Returns: Json
      }
      create_child_profile: {
        Args: {
          p_birthdate: string
          p_daily_limit_min?: number
          p_first_name: string
          p_grade: number
        }
        Returns: string
      }
      create_family_account: {
        Args: {
          p_family_name: string
          p_parent_name: string
          p_parent_phone: string
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      join_family_with_code: {
        Args: {
          p_invite_code: string
          p_parent_name: string
          p_parent_phone: string
        }
        Returns: string
      }
      reset_monthly_message_counters: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "PARENT" | "CHILD" | "ADMIN"
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
      user_role: ["PARENT", "CHILD", "ADMIN"],
    },
  },
} as const
