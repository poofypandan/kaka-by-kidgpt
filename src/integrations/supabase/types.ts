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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
