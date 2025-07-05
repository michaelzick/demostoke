
export interface Database {
  public: {
    Tables: {
      equipment: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          id: string;
          image_url: string;
          location_lat: number;
          location_lng: number;
          location_zip: string;
          material: string;
          name: string;
          price_per_day: number;
          rating: number;
          size: string;
          status: string;
          user_id: string;
          weight: string;
          view_count: number;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_url?: string;
          location_lat?: number;
          location_lng?: number;
          location_zip?: string;
          material?: string;
          name: string;
          price_per_day: number;
          rating?: number;
          size?: string;
          status?: string;
          user_id?: string;
          weight?: string;
          view_count?: number;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_url?: string;
          location_lat?: number;
          location_lng?: number;
          location_zip?: string;
          material?: string;
          name?: string;
          price_per_day?: number;
          rating?: number;
          size?: string;
          status?: string;
          user_id?: string;
          weight?: string;
          view_count?: number;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          show_mock_data: boolean;
          use_ai_search: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          show_mock_data?: boolean;
          use_ai_search?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          show_mock_data?: boolean;
          use_ai_search?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          avatar_url: string;
          role: string;
          about: string;
          phone: string;
          address: string;
          hero_image_url: string;
          member_since: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          avatar_url?: string;
          role?: string;
          about?: string;
          phone?: string;
          address?: string;
          hero_image_url?: string;
          member_since?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          avatar_url?: string;
          role?: string;
          about?: string;
          phone?: string;
          address?: string;
          hero_image_url?: string;
          member_since?: string;
        };
      };
      pricing_options: {
        Row: {
          id: string;
          equipment_id: string;
          duration: number;
          price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          equipment_id: string;
          duration: number;
          price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          equipment_id?: string;
          duration?: number;
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      demo_calendar: {
        Row: {
          id: string;
          title: string;
          gear_category: string;
          event_date: string | null;
          event_time: string | null;
          location: string | null;
          equipment_available: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          gear_category: string;
          event_date?: string | null;
          event_time?: string | null;
          location?: string | null;
          equipment_available?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Update: {
          id?: string;
          title?: string;
          gear_category?: string;
          event_date?: string | null;
          event_time?: string | null;
          location?: string | null;
          equipment_available?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
