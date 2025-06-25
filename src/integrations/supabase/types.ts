export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      equipment: {
        Row: {
          category: string
          created_at: string
          damage_deposit: number | null
          description: string | null
          has_multiple_images: boolean | null
          id: string
          image_url: string | null
          location_lat: number | null
          location_lng: number | null
          location_zip: string | null
          material: string | null
          name: string
          price_per_day: number
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
          image_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_zip?: string | null
          material?: string | null
          name: string
          price_per_day: number
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
          image_url?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_zip?: string | null
          material?: string | null
          name?: string
          price_per_day?: number
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
          role: string
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
          role?: string
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
          role?: string
          website?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          show_mock_data: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_mock_data?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          show_mock_data?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
        Args: { user_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
