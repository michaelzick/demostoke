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
    PostgrestVersion: "13.0.5"
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
          author: string | null
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          created_from_post_id: string | null
          excerpt: string | null
          hero_image: string | null
          id: string
          is_featured: boolean | null
          last_auto_saved_at: string | null
          published_at: string
          read_time: number
          scheduled_for: string | null
          slug: string | null
          status: string
          tags: string[] | null
          thumbnail: string | null
          title: string
          updated_at: string
          user_id: string | null
          video_embed: string | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_from_post_id?: string | null
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          is_featured?: boolean | null
          last_auto_saved_at?: string | null
          published_at?: string
          read_time?: number
          scheduled_for?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          thumbnail?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          video_embed?: string | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_from_post_id?: string | null
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          is_featured?: boolean | null
          last_auto_saved_at?: string | null
          published_at?: string
          read_time?: number
          scheduled_for?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          video_embed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_created_from_post_id_fkey"
            columns: ["created_from_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_calendar: {
        Row: {
          company: string
          created_at: string
          created_by: string
          equipment_available: string | null
          event_date: string | null
          event_time: string | null
          external_event_id: string | null
          gear_category: string
          id: string
          is_featured: boolean
          location: string | null
          location_lat: number | null
          location_lng: number | null
          source_primary_url: string | null
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
          external_event_id?: string | null
          gear_category: string
          id?: string
          is_featured?: boolean
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          source_primary_url?: string | null
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
          external_event_id?: string | null
          gear_category?: string
          id?: string
          is_featured?: boolean
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          source_primary_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_event_candidates: {
        Row: {
          admin_edited: boolean
          admin_edited_at: string | null
          admin_edited_by: string | null
          approved_at: string | null
          approved_by: string | null
          approved_demo_event_id: string | null
          company: string
          created_at: string
          equipment_available: string | null
          event_date: string
          event_time: string | null
          external_event_id: string
          first_seen_at: string
          gear_category: string
          id: string
          last_seen_at: string
          location: string
          location_lat: number | null
          location_lng: number | null
          raw_payload: Json
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          seen_count: number
          source_domain: string | null
          source_primary_url: string
          source_snippet: string | null
          source_urls: Json
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_edited?: boolean
          admin_edited_at?: string | null
          admin_edited_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_demo_event_id?: string | null
          company: string
          created_at?: string
          equipment_available?: string | null
          event_date: string
          event_time?: string | null
          external_event_id: string
          first_seen_at?: string
          gear_category: string
          id?: string
          last_seen_at?: string
          location: string
          location_lat?: number | null
          location_lng?: number | null
          raw_payload?: Json
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          seen_count?: number
          source_domain?: string | null
          source_primary_url: string
          source_snippet?: string | null
          source_urls?: Json
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_edited?: boolean
          admin_edited_at?: string | null
          admin_edited_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_demo_event_id?: string | null
          company?: string
          created_at?: string
          equipment_available?: string | null
          event_date?: string
          event_time?: string | null
          external_event_id?: string
          first_seen_at?: string
          gear_category?: string
          id?: string
          last_seen_at?: string
          location?: string
          location_lat?: number | null
          location_lng?: number | null
          raw_payload?: Json
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          seen_count?: number
          source_domain?: string | null
          source_primary_url?: string
          source_snippet?: string | null
          source_urls?: Json
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_event_candidates_approved_demo_event_id_fkey"
            columns: ["approved_demo_event_id"]
            isOneToOne: false
            referencedRelation: "demo_calendar"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_event_discovery_config: {
        Row: {
          created_at: string
          cron_secret: string
          enabled: boolean
          id: boolean
          last_cron_attempt_at: string | null
          max_candidates_per_run: number
          search_scope: string
          updated_at: string
          window_months: number
        }
        Insert: {
          created_at?: string
          cron_secret?: string
          enabled?: boolean
          id?: boolean
          last_cron_attempt_at?: string | null
          max_candidates_per_run?: number
          search_scope?: string
          updated_at?: string
          window_months?: number
        }
        Update: {
          created_at?: string
          cron_secret?: string
          enabled?: boolean
          id?: boolean
          last_cron_attempt_at?: string | null
          max_candidates_per_run?: number
          search_scope?: string
          updated_at?: string
          window_months?: number
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
          currency_code: string
          damage_deposit: number | null
          description: string | null
          external_source_endpoint_url: string | null
          external_source_item_id: string | null
          external_source_provider: string | null
          external_source_shop_slug: string | null
          external_source_synced_at: string | null
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
          currency_code?: string
          damage_deposit?: number | null
          description?: string | null
          external_source_endpoint_url?: string | null
          external_source_item_id?: string | null
          external_source_provider?: string | null
          external_source_shop_slug?: string | null
          external_source_synced_at?: string | null
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
          currency_code?: string
          damage_deposit?: number | null
          description?: string | null
          external_source_endpoint_url?: string | null
          external_source_item_id?: string | null
          external_source_provider?: string | null
          external_source_shop_slug?: string | null
          external_source_synced_at?: string | null
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
          {
            foreignKeyName: "equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_category_visible_top1500_mv"
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
          {
            foreignKeyName: "equipment_reviews_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_category_visible_top1500_mv"
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
          {
            foreignKeyName: "equipment_views_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_category_visible_top1500_mv"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_add_ons: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          price_per_day: number
          shop_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_per_day: number
          shop_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_per_day?: number
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_add_ons_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_bookings: {
        Row: {
          add_ons_price: number | null
          add_ons_snapshot: Json | null
          base_price: number
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          damage_deposit: number | null
          end_date: string
          equipment_id: string
          id: string
          notes: string | null
          num_days: number
          refunded_at: string | null
          service_fee: number | null
          shop_id: string
          start_date: string
          status: string | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          add_ons_price?: number | null
          add_ons_snapshot?: Json | null
          base_price: number
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          damage_deposit?: number | null
          end_date: string
          equipment_id: string
          id?: string
          notes?: string | null
          num_days: number
          refunded_at?: string | null
          service_fee?: number | null
          shop_id: string
          start_date: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          add_ons_price?: number | null
          add_ons_snapshot?: Json | null
          base_price?: number
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          damage_deposit?: number | null
          end_date?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          num_days?: number
          refunded_at?: string | null
          service_fee?: number | null
          shop_id?: string
          start_date?: string
          status?: string | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_bookings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "fleetops_equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleetops_bookings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_booqable_inventory_items: {
        Row: {
          base_price_in_cents: number
          booking_story: string
          created_at: string
          description: string | null
          group_name: string
          id: string
          location: Json | null
          mock_shop_id: string
          name: string
          owner_id: string
          photo_url: string
          pos_connection_id: string
          product_id: string
          product_type: string
          raw_payload: Json
          shop_id: string
          sku: string | null
          updated_at: string
        }
        Insert: {
          base_price_in_cents: number
          booking_story?: string
          created_at?: string
          description?: string | null
          group_name: string
          id?: string
          location?: Json | null
          mock_shop_id: string
          name: string
          owner_id: string
          photo_url: string
          pos_connection_id: string
          product_id: string
          product_type?: string
          raw_payload?: Json
          shop_id: string
          sku?: string | null
          updated_at?: string
        }
        Update: {
          base_price_in_cents?: number
          booking_story?: string
          created_at?: string
          description?: string | null
          group_name?: string
          id?: string
          location?: Json | null
          mock_shop_id?: string
          name?: string
          owner_id?: string
          photo_url?: string
          pos_connection_id?: string
          product_id?: string
          product_type?: string
          raw_payload?: Json
          shop_id?: string
          sku?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_booqable_inventory_items_pos_connection_id_fkey"
            columns: ["pos_connection_id"]
            isOneToOne: false
            referencedRelation: "fleetops_pos_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleetops_booqable_inventory_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_equipment: {
        Row: {
          availability: Json | null
          category: string
          created_at: string | null
          damage_deposit: number | null
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: Json | null
          name: string
          price_per_day: number
          price_per_hour: number | null
          price_per_week: number | null
          rating: number | null
          review_count: number | null
          shop_id: string
          specifications: Json | null
          status: string | null
          subcategory: string | null
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          availability?: Json | null
          category: string
          created_at?: string | null
          damage_deposit?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: Json | null
          name: string
          price_per_day: number
          price_per_hour?: number | null
          price_per_week?: number | null
          rating?: number | null
          review_count?: number | null
          shop_id: string
          specifications?: Json | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          availability?: Json | null
          category?: string
          created_at?: string | null
          damage_deposit?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: Json | null
          name?: string
          price_per_day?: number
          price_per_hour?: number | null
          price_per_week?: number | null
          rating?: number | null
          review_count?: number | null
          shop_id?: string
          specifications?: Json | null
          status?: string | null
          subcategory?: string | null
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_equipment_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_equipment_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          equipment_id: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          equipment_id: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          equipment_id?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "fleetops_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_lightspeed_inventory_items: {
        Row: {
          booking_story: string
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          item_id: string
          location: Json | null
          manufacturer: string | null
          mock_shop_id: string
          owner_id: string
          pos_connection_id: string
          price: number
          raw_payload: Json
          shop_id: string
          updated_at: string
        }
        Insert: {
          booking_story?: string
          category: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          item_id: string
          location?: Json | null
          manufacturer?: string | null
          mock_shop_id: string
          owner_id: string
          pos_connection_id: string
          price: number
          raw_payload?: Json
          shop_id: string
          updated_at?: string
        }
        Update: {
          booking_story?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          item_id?: string
          location?: Json | null
          manufacturer?: string | null
          mock_shop_id?: string
          owner_id?: string
          pos_connection_id?: string
          price?: number
          raw_payload?: Json
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_lightspeed_inventory_items_pos_connection_id_fkey"
            columns: ["pos_connection_id"]
            isOneToOne: false
            referencedRelation: "fleetops_pos_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleetops_lightspeed_inventory_items_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_pos_connections: {
        Row: {
          created_at: string | null
          credentials: Json | null
          field_mapping: Json | null
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          provider: string
          shop_id: string
        }
        Insert: {
          created_at?: string | null
          credentials?: Json | null
          field_mapping?: Json | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          provider: string
          shop_id: string
        }
        Update: {
          created_at?: string | null
          credentials?: Json | null
          field_mapping?: Json | null
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          provider?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_pos_connections_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_pos_inventory_seed_config: {
        Row: {
          created_at: string
          cron_secret: string
          enabled: boolean
          fleetops_function_url: string
          id: boolean
          last_cron_attempt_at: string | null
          last_queued_at: string | null
          last_request_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron_secret?: string
          enabled?: boolean
          fleetops_function_url?: string
          id?: boolean
          last_cron_attempt_at?: string | null
          last_queued_at?: string | null
          last_request_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron_secret?: string
          enabled?: boolean
          fleetops_function_url?: string
          id?: boolean
          last_cron_attempt_at?: string | null
          last_queued_at?: string | null
          last_request_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fleetops_pos_inventory_seed_runs: {
        Row: {
          booqable_inventory_item_id: string | null
          booqable_pos_connection_id: string | null
          booqable_product_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          generated_sequence: number
          id: string
          lightspeed_inventory_item_id: string | null
          lightspeed_item_id: string | null
          lightspeed_pos_connection_id: string | null
          mock_shop_id: string | null
          raw_result: Json
          source: string
          started_at: string
          status: string
          target_owner_id: string | null
          target_shop_id: string | null
          verification_counts: Json
        }
        Insert: {
          booqable_inventory_item_id?: string | null
          booqable_pos_connection_id?: string | null
          booqable_product_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generated_sequence: number
          id?: string
          lightspeed_inventory_item_id?: string | null
          lightspeed_item_id?: string | null
          lightspeed_pos_connection_id?: string | null
          mock_shop_id?: string | null
          raw_result?: Json
          source: string
          started_at?: string
          status: string
          target_owner_id?: string | null
          target_shop_id?: string | null
          verification_counts?: Json
        }
        Update: {
          booqable_inventory_item_id?: string | null
          booqable_pos_connection_id?: string | null
          booqable_product_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generated_sequence?: number
          id?: string
          lightspeed_inventory_item_id?: string | null
          lightspeed_item_id?: string | null
          lightspeed_pos_connection_id?: string | null
          mock_shop_id?: string | null
          raw_result?: Json
          source?: string
          started_at?: string
          status?: string
          target_owner_id?: string | null
          target_shop_id?: string | null
          verification_counts?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_pos_inventory_seed_r_lightspeed_inventory_item_id_fkey"
            columns: ["lightspeed_inventory_item_id"]
            isOneToOne: false
            referencedRelation: "fleetops_lightspeed_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleetops_pos_inventory_seed_r_lightspeed_pos_connection_id_fkey"
            columns: ["lightspeed_pos_connection_id"]
            isOneToOne: false
            referencedRelation: "fleetops_pos_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleetops_pos_inventory_seed_run_booqable_inventory_item_id_fkey"
            columns: ["booqable_inventory_item_id"]
            isOneToOne: false
            referencedRelation: "fleetops_booqable_inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleetops_pos_inventory_seed_run_booqable_pos_connection_id_fkey"
            columns: ["booqable_pos_connection_id"]
            isOneToOne: false
            referencedRelation: "fleetops_pos_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleetops_pos_inventory_seed_runs_target_shop_id_fkey"
            columns: ["target_shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_pricing_options: {
        Row: {
          created_at: string | null
          duration: string
          equipment_id: string
          id: string
          price: number
        }
        Insert: {
          created_at?: string | null
          duration: string
          equipment_id: string
          id?: string
          price: number
        }
        Update: {
          created_at?: string | null
          duration?: string
          equipment_id?: string
          id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_pricing_options_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "fleetops_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_shop_viewers: {
        Row: {
          id: string
          shop_id: string
          viewer_user_id: string
        }
        Insert: {
          id?: string
          shop_id: string
          viewer_user_id: string
        }
        Update: {
          id?: string
          shop_id?: string
          viewer_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleetops_shop_viewers_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "fleetops_shops"
            referencedColumns: ["id"]
          },
        ]
      }
      fleetops_shops: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          location: Json | null
          logo_url: string | null
          name: string
          owner_id: string
          slug: string
          stripe_account_id: string | null
          updated_at: string | null
          website_url: string | null
          widget_config: Json | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Json | null
          logo_url?: string | null
          name: string
          owner_id: string
          slug: string
          stripe_account_id?: string | null
          updated_at?: string | null
          website_url?: string | null
          widget_config?: Json | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Json | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          slug?: string
          stripe_account_id?: string | null
          updated_at?: string | null
          website_url?: string | null
          widget_config?: Json | null
        }
        Relationships: []
      }
      fleetops_user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["fleetops_app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["fleetops_app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["fleetops_app_role"]
          user_id?: string
        }
        Relationships: []
      }
      gear_review_blog_generation_config: {
        Row: {
          created_at: string
          cron_secret: string
          draft_owner_user_id: string | null
          enabled: boolean
          id: boolean
          last_cron_attempt_at: string | null
          last_success_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron_secret?: string
          draft_owner_user_id?: string | null
          enabled?: boolean
          id?: boolean
          last_cron_attempt_at?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron_secret?: string
          draft_owner_user_id?: string | null
          enabled?: boolean
          id?: boolean
          last_cron_attempt_at?: string | null
          last_success_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gear_review_blog_generation_runs: {
        Row: {
          blog_post_id: string | null
          created_at: string
          equipment_id: string | null
          error_message: string | null
          gear_category: string | null
          hidden_evidence: Json
          id: string
          reason: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          blog_post_id?: string | null
          created_at?: string
          equipment_id?: string | null
          error_message?: string | null
          gear_category?: string | null
          hidden_evidence?: Json
          id?: string
          reason?: string | null
          source: string
          status: string
          updated_at?: string
        }
        Update: {
          blog_post_id?: string | null
          created_at?: string
          equipment_id?: string | null
          error_message?: string | null
          gear_category?: string | null
          hidden_evidence?: Json
          id?: string
          reason?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gear_review_blog_generation_runs_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_review_blog_generation_runs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_review_blog_generation_runs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_category_visible_top1500_mv"
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
          {
            foreignKeyName: "pricing_options_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_category_visible_top1500_mv"
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
          favorite_equipment: Json | null
          hero_image_url: string | null
          id: string
          is_hidden: boolean
          location_lat: number | null
          location_lng: number | null
          member_since: string | null
          name: string | null
          phone: string | null
          privacy_acknowledgment: boolean | null
          recently_viewed_equipment: Json | null
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
          favorite_equipment?: Json | null
          hero_image_url?: string | null
          id: string
          is_hidden?: boolean
          location_lat?: number | null
          location_lng?: number | null
          member_since?: string | null
          name?: string | null
          phone?: string | null
          privacy_acknowledgment?: boolean | null
          recently_viewed_equipment?: Json | null
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
          favorite_equipment?: Json | null
          hero_image_url?: string | null
          id?: string
          is_hidden?: boolean
          location_lat?: number | null
          location_lng?: number | null
          member_since?: string | null
          name?: string | null
          phone?: string | null
          privacy_acknowledgment?: boolean | null
          recently_viewed_equipment?: Json | null
          show_address?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
          show_website?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      scraped_retailers: {
        Row: {
          address: string | null
          business_domain: string | null
          business_name: string
          business_url: string
          created_at: string
          detected_categories: string[] | null
          email: string | null
          equipment_inserted: boolean | null
          error_message: string | null
          generated_sql: string | null
          id: string
          last_scraped_at: string | null
          location_lat: number | null
          location_lng: number | null
          parsed_equipment: Json | null
          phone: string | null
          raw_html: string | null
          raw_markdown: string | null
          relevant_pages: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_domain?: string | null
          business_name: string
          business_url: string
          created_at?: string
          detected_categories?: string[] | null
          email?: string | null
          equipment_inserted?: boolean | null
          error_message?: string | null
          generated_sql?: string | null
          id?: string
          last_scraped_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          parsed_equipment?: Json | null
          phone?: string | null
          raw_html?: string | null
          raw_markdown?: string | null
          relevant_pages?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_domain?: string | null
          business_name?: string
          business_url?: string
          created_at?: string
          detected_categories?: string[] | null
          email?: string | null
          equipment_inserted?: boolean | null
          error_message?: string | null
          generated_sql?: string | null
          id?: string
          last_scraped_at?: string | null
          location_lat?: number | null
          location_lng?: number | null
          parsed_equipment?: Json | null
          phone?: string | null
          raw_html?: string | null
          raw_markdown?: string | null
          relevant_pages?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      shop_gear_feed_mappings: {
        Row: {
          created_at: string
          endpoint_url: string
          id: string
          include_hidden: boolean
          is_active: boolean
          profile_id: string
          provider: string
          shop_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          endpoint_url: string
          id?: string
          include_hidden?: boolean
          is_active?: boolean
          profile_id: string
          provider?: string
          shop_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          endpoint_url?: string
          id?: string
          include_hidden?: boolean
          is_active?: boolean
          profile_id?: string
          provider?: string
          shop_slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_gear_feed_mappings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_gear_feed_mappings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      equipment_category_visible_top1500_mv: {
        Row: {
          category: string | null
          created_at: string | null
          damage_deposit: number | null
          description: string | null
          external_source_endpoint_url: string | null
          external_source_item_id: string | null
          external_source_provider: string | null
          external_source_shop_slug: string | null
          external_source_synced_at: string | null
          has_multiple_images: boolean | null
          id: string | null
          is_featured: boolean | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          material: string | null
          name: string | null
          price_per_day: number | null
          price_per_hour: number | null
          price_per_week: number | null
          rating: number | null
          review_count: number | null
          size: string | null
          status: string | null
          subcategory: string | null
          suitable_skill_level: string | null
          updated_at: string | null
          user_id: string | null
          view_count: number | null
          visible_on_map: boolean | null
          weight: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_images_visible_top1500_mv: {
        Row: {
          created_at: string | null
          display_order: number | null
          equipment_id: string | null
          id: string | null
          image_url: string | null
          is_primary: boolean | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment_category_visible_top1500_mv"
            referencedColumns: ["id"]
          },
        ]
      }
      public_profiles: {
        Row: {
          about: string | null
          address: string | null
          avatar_url: string | null
          created_at: string | null
          hero_image_url: string | null
          id: string | null
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
          address?: never
          avatar_url?: string | null
          created_at?: string | null
          hero_image_url?: string | null
          id?: string | null
          location_lat?: never
          location_lng?: never
          member_since?: string | null
          name?: string | null
          phone?: never
          privacy_acknowledgment?: boolean | null
          show_address?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
          show_website?: boolean | null
          website?: never
        }
        Update: {
          about?: string | null
          address?: never
          avatar_url?: string | null
          created_at?: string | null
          hero_image_url?: string | null
          id?: string | null
          location_lat?: never
          location_lng?: never
          member_since?: string | null
          name?: string | null
          phone?: never
          privacy_acknowledgment?: boolean | null
          show_address?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
          show_website?: boolean | null
          website?: never
        }
        Relationships: []
      }
    }
    Functions: {
      approve_demo_event_candidate: {
        Args: { p_candidate_id: string }
        Returns: string
      }
      cleanup_unused_downloaded_images: {
        Args: never
        Returns: {
          deleted_files: number
          deleted_records: number
        }[]
      }
      find_unused_downloaded_images: {
        Args: never
        Returns: {
          downloaded_url: string
          file_path: string
          reason: string
        }[]
      }
      fleetops_is_admin: { Args: { target_user_id?: string }; Returns: boolean }
      fleetops_is_shop_viewer: {
        Args: { target_shop_id: string }
        Returns: boolean
      }
      get_app_setting: { Args: { key: string }; Returns: Json }
      get_public_generated_gear_review_metadata: {
        Args: { p_blog_post_ids: string[] }
        Returns: {
          blog_post_id: string
          equipment_id: string
          gear_category: string
        }[]
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
      ingest_demo_event_candidates_json: {
        Args: { p_payload: Json }
        Returns: Json
      }
      is_admin: { Args: { user_id?: string }; Returns: boolean }
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
      reject_demo_event_candidate: {
        Args: { p_candidate_id: string; p_reason?: string }
        Returns: undefined
      }
      trigger_demo_event_discovery_cron: { Args: never; Returns: Json }
      trigger_gear_review_blog_generation_cron: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
      fleetops_app_role: "shop" | "admin" | "guest"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
      fleetops_app_role: ["shop", "admin", "guest"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
