export type DemoEventCandidateStatus = "pending" | "approved" | "rejected";
export type DemoEventCandidateFilter = DemoEventCandidateStatus | "all";

export interface DemoEventCandidate {
  id: string;
  external_event_id: string;
  title: string;
  company: string;
  gear_category: "snowboards" | "skis" | "surfboards" | "mountain-bikes";
  event_date: string;
  event_time: string | null;
  location: string;
  location_lat: number | null;
  location_lng: number | null;
  equipment_available: string | null;
  thumbnail_url: string | null;
  status: DemoEventCandidateStatus;
  source_primary_url: string;
  source_domain: string | null;
  source_urls: string[];
  source_snippet: string | null;
  raw_payload: Record<string, unknown>;
  seen_count: number;
  first_seen_at: string;
  last_seen_at: string;
  admin_edited: boolean;
  admin_edited_at: string | null;
  admin_edited_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  approved_demo_event_id: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DemoEventDiscoveryRunStats {
  new_candidates: number;
  updated_pending: number;
  skipped_approved: number;
  skipped_rejected: number;
  skipped_missing_required: number;
  skipped_out_of_window: number;
  total_processed: number;
}

export interface DemoEventDiscoveryRunResult {
  success: boolean;
  source: "manual" | "cron";
  stats: DemoEventDiscoveryRunStats;
  scanned_urls: number;
  scraped_pages: number;
  unique_events_considered: number;
  processed_events: number;
  error?: string;
}
