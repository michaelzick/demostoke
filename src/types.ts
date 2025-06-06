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
          duration?: string;
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

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url: string;
  price_per_day: number;
  rating: number;
  review_count: number;
  owner: Owner;
  location: Location;
  distance: number;
  specifications: Specifications;
  availability: Availability;
  pricing_options: PricingOption[];
  status: string;
}

export interface Owner {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  responseRate: number;
}

export interface Location {
  lat: number;
  lng: number;
  zip: string;
}

export interface Specifications {
  size: string;
  weight: string;
  material: string;
  suitable: string;
}

export interface Availability {
  available: boolean;
}

export interface PricingOption {
  id: string;
  price: number;
  duration: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: string;
  about?: string;
}
