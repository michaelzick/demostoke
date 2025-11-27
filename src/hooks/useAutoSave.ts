import { useEffect, useRef, useState } from 'react';
import { useDebounce } from './useDebounce';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 30000, // 30 seconds
  enabled = true
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debouncedData = useDebounce(data, delay);
  const initialRender = useRef(true);

  useEffect(() => {
    // Skip first render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    if (!enabled) return;

    const save = async () => {
      try {
        setIsSaving(true);
        setError(null);
        await onSave(debouncedData);
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to auto-save');
      } finally {
        setIsSaving(false);
      }
    };

    save();
  }, [debouncedData, enabled]);

  return { isSaving, lastSaved, error };
}
