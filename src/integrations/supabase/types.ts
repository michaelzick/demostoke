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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_privacy_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          author_id: string
          category: string
          content: string
          created_at: string
          excerpt: string
          hero_image: string | null
          id: string
          is_featured: boolean | null
          published_at: string
          read_time: number
          slug: string | null
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string
          video_embed: string | null
        }
        Insert: {
          author: string
          author_id: string
          category: string
          content: string
          created_at?: string
          excerpt: string
          hero_image?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string
          read_time?: number
          slug?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          video_embed?: string | null
        }
        Update: {
          author?: string
          author_id?: string
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          hero_image?: string | null
          id?: string
          is_featured?: boolean | null
          published_at?: string
          read_time?: number
          slug?: string | null
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          video_embed?: string | null
        }
        Relationships: []
      }
      demo_calendar: {
        Row: {
          company: string
          created_at: string
          created_by: string
          equipment_available: string | null
          event_date: string | null
          event_time: string | null
          gear_category: string
          id: string
          is_featured: boolean
          location: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          created_by?: string
          equipment_available?: string | null
          event_date?: string | null
          event_time?: string | null
          gear_category: string
          id?: string
          is_featured?: boolean
          location?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          created_by?: string
          equipment_available?: string | null
          event_date?: string | null
          event_time?: string | null
          gear_category?: string
          id?: string
          is_featured?: boolean
          location?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      downloaded_images: {
        Row: {
          created_at: string
          downloaded_size: number | null
          downloaded_url: string
          file_type: string | null
          id: string
          original_size: number | null
          original_url: string
          source_column: string
          source_record_id: string | null
          source_table: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          downloaded_size?: number | null
          downloaded_url: string
          file_type?: string | null
          id?: string
          original_size?: number | null
          original_url: string
          source_column: string
          source_record_id?: string | null
          source_table: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          downloaded_size?: number | null
          downloaded_url?: string
          file_type?: string | null
          id?: string
          original_size?: number | null
          original_url?: string
          source_column?: string
          source_record_id?: string | null
          source_table?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          category: string
          created_at: string
          damage_deposit: number | null
          description: string | null
          has_multiple_images: boolean | null
          id: string
          is_featured: boolean
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          material: string | null
          name: string
          price_per_day: number
          price_per_hour: number | null
          price_per_week: number | null
          rating: number | null
          review_count: number | null
          size: string | null
          status: string | null
          subcategory: string | null
          suitable_skill_level: string | null
          updated_at: string
          user_id: string
          view_count: number | null
          visible_on_map: boolean
          weight: string | null
        }
        Insert: {
          category: string
          created_at?: string
          damage_deposit?: number | null
          description?: string | null
          has_multiple_images?: boolean | null
          id?: string
          is_featured?: boolean
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          material?: string | null
          name: string
          price_per_day: number
          price_per_hour?: number | null
          price_per_week?: number | null
          rating?: number | null
          review_count?: number | null
          size?: string | null
          status?: string | null
          subcategory?: string | null
          suitable_skill_level?: string | null
          updated_at?: string
          user_id: string
          view_count?: number | null
          visible_on_map?: boolean
          weight?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          damage_deposit?: number | null
          description?: string | null
          has_multiple_images?: boolean | null
          id?: string
          is_featured?: boolean
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          material?: string | null
          name?: string
          price_per_day?: number
          price_per_hour?: number | null
          price_per_week?: number | null
          rating?: number | null
          review_count?: number | null
          size?: string | null
          status?: string | null
          subcategory?: string | null
          suitable_skill_level?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number | null
          visible_on_map?: boolean
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_images: {
        Row: {
          created_at: string
          display_order: number
          equipment_id: string
          id: string
          image_url: string
          is_primary: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          equipment_id: string
          id?: string
          image_url: string
          is_primary?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          equipment_id?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_reviews: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_reviews_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_views: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          user_id: string | null
          viewed_at: string
          viewer_ip: string | null
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          user_id?: string | null
          viewed_at?: string
          viewer_ip?: string | null
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          user_id?: string | null
          viewed_at?: string
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_views_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      jpeg_images: {
        Row: {
          created_at: string
          id: string
          jpeg_height: number | null
          jpeg_size: number | null
          jpeg_url: string
          jpeg_width: number | null
          original_height: number | null
          original_size: number | null
          original_url: string
          original_width: number | null
          source_column: string
          source_record_id: string | null
          source_table: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          jpeg_height?: number | null
          jpeg_size?: number | null
          jpeg_url: string
          jpeg_width?: number | null
          original_height?: number | null
          original_size?: number | null
          original_url: string
          original_width?: number | null
          source_column: string
          source_record_id?: string | null
          source_table: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          jpeg_height?: number | null
          jpeg_size?: number | null
          jpeg_url?: string
          jpeg_width?: number | null
          original_height?: number | null
          original_size?: number | null
          original_url?: string
          original_width?: number | null
          source_column?: string
          source_record_id?: string | null
          source_table?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_options: {
        Row: {
          created_at: string
          duration: string
          equipment_id: string
          id: string
          price: number
        }
        Insert: {
          created_at?: string
          duration: string
          equipment_id: string
          id?: string
          price: number
        }
        Update: {
          created_at?: string
          duration?: string
          equipment_id?: string
          id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_options_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_images: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          original_format: string | null
          original_height: number | null
          original_size: number | null
          original_url: string
          original_width: number | null
          processed_format: string | null
          processed_height: number | null
          processed_size: number | null
          processed_url: string
          processed_width: number | null
          source_column: string
          source_record_id: string | null
          source_table: string
          updated_at: string
          was_resized: boolean | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          original_format?: string | null
          original_height?: number | null
          original_size?: number | null
          original_url: string
          original_width?: number | null
          processed_format?: string | null
          processed_height?: number | null
          processed_size?: number | null
          processed_url: string
          processed_width?: number | null
          source_column: string
          source_record_id?: string | null
          source_table: string
          updated_at?: string
          was_resized?: boolean | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          original_format?: string | null
          original_height?: number | null
          original_size?: number | null
          original_url?: string
          original_width?: number | null
          processed_format?: string | null
          processed_height?: number | null
          processed_size?: number | null
          processed_url?: string
          processed_width?: number | null
          source_column?: string
          source_record_id?: string | null
          source_table?: string
          updated_at?: string
          was_resized?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: string | null
          address: string | null
          avatar_url: string | null
          created_at: string
          hero_image_url: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          member_since: string | null
          name: string | null
          phone: string | null
          privacy_acknowledgment: boolean | null
          show_address: boolean | null
          show_location: boolean | null
          show_phone: boolean | null
          show_website: boolean | null
          website: string | null
        }
        Insert: {
          about?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          hero_image_url?: string | null
          id: string
          location_lat?: number | null
          location_lng?: number | null
          member_since?: string | null
          name?: string | null
          phone?: string | null
          privacy_acknowledgment?: boolean | null
          show_address?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
          show_website?: boolean | null
          website?: string | null
        }
        Update: {
          about?: string | null
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          member_since?: string | null
          name?: string | null
          phone?: string | null
          privacy_acknowledgment?: boolean | null
          show_address?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
          show_website?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      temp_images: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          original_url: string
          status: string | null
          temp_file_path: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          original_url: string
          status?: string | null
          temp_file_path?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          original_url?: string
          status?: string | null
          temp_file_path?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          display_role: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          display_role?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          display_role?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webp_images: {
        Row: {
          created_at: string
          id: string
          original_height: number | null
          original_size: number | null
          original_url: string
          original_width: number | null
          source_column: string
          source_record_id: string | null
          source_table: string
          updated_at: string
          webp_height: number | null
          webp_size: number | null
          webp_url: string
          webp_width: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          original_height?: number | null
          original_size?: number | null
          original_url: string
          original_width?: number | null
          source_column: string
          source_record_id?: string | null
          source_table: string
          updated_at?: string
          webp_height?: number | null
          webp_size?: number | null
          webp_url: string
          webp_width?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          original_height?: number | null
          original_size?: number | null
          original_url?: string
          original_width?: number | null
          source_column?: string
          source_record_id?: string | null
          source_table?: string
          updated_at?: string
          webp_height?: number | null
          webp_size?: number | null
          webp_url?: string
          webp_width?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_unused_downloaded_images: {
        Args: Record<PropertyKey, never>
        Returns: {
          deleted_files: number
          deleted_records: number
        }[]
      }
      find_unused_downloaded_images: {
        Args: Record<PropertyKey, never>
        Returns: {
          downloaded_url: string
          file_path: string
          reason: string
        }[]
      }
      get_app_setting: {
        Args: { key: string }
        Returns: Json
      }
      get_trending_equipment: {
        Args: { limit_count?: number }
        Returns: {
          equipment_id: string
          view_count: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      increment_equipment_view_count: {
        Args: { equipment_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      log_security_event: {
        Args: {
          action_type: string
          new_values?: Json
          old_values?: Json
          record_id?: string
          table_name?: string
        }
        Returns: undefined
      }
      refresh_performance_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
