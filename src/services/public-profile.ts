import type { Database } from '@/integrations/supabase/types';

type Row = Database['public']['Views']['public_profiles']['Row'];

export type PublicProfile = Omit<Row, 'id' | 'name' | 'member_since' | 'created_at'> & {
  id: string;
  name: string;
  member_since: string;
  created_at: string;
  displayRole: string | null;
  is_hidden: false;
};
