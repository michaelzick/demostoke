
export interface DemoEvent {
  id: string;
  title: string;
  gear_category: 'snowboards' | 'skis' | 'surfboards' | 'mountain-bikes';
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  equipment_available: string | null;
  company: string | null;
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
  equipment_available?: string | null;
  company?: string | null;
}

export interface CategoryFilter {
  category: 'snowboards' | 'skis' | 'surfboards' | 'mountain-bikes';
  name: string;
  color: string;
  enabled: boolean;
}
