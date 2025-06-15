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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          show_mock_data?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          show_mock_data?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          username: string;
          avatar_url: string;
          website: string;
          about: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          username: string;
          avatar_url?: string;
          website?: string;
          about?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          username?: string;
          avatar_url?: string;
          website?: string;
          about?: string;
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
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
