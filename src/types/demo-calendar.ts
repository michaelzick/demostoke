
export interface DemoEvent {
  id: string;
  title: string;
  gear_category: 'snowboards' | 'skis' | 'surfboards' | 'mountain-bikes';
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  equipment_available: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  company: string;
  external_event_id: string | null;
  source_primary_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface DemoEventInput {
  title: string;
  gear_category: 'snowboards' | 'skis' | 'surfboards' | 'mountain-bikes';
  event_date?: string | null;
  event_time?: string | null;
  location?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  equipment_available?: string | null;
  thumbnail_url?: string | null;
  is_featured?: boolean;
  company: string;
  external_event_id?: string | null;
  source_primary_url?: string | null;
}

export interface CategoryFilter {
  category: 'snowboards' | 'skis' | 'surfboards' | 'mountain-bikes';
  name: string;
  color: string;
  enabled: boolean;
}
