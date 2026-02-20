import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches IDs of hidden users (is_hidden = true) from profiles table.
 * Used to filter out equipment belonging to hidden users.
 */
export const getHiddenUserIds = async (): Promise<Set<string>> => {
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('is_hidden', true);

  if (error) {
    console.error('Error fetching hidden users:', error);
    return new Set();
  }

  return new Set((data || []).map((p: any) => p.id));
};

/**
 * Filters an array of items that have a user_id property,
 * removing any belonging to hidden users.
 */
export const filterHiddenUsers = <T extends { user_id: string }>(
  items: T[],
  hiddenUserIds: Set<string>
): T[] => {
  if (hiddenUserIds.size === 0) return items;
  return items.filter(item => !hiddenUserIds.has(item.user_id));
};
