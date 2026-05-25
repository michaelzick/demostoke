import { useEffect, useMemo, useRef, useState } from 'react';
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

function serializeAutoSaveData<T>(data: T): string {
  try {
    return JSON.stringify(data) ?? "";
  } catch (_error) {
    return String(data);
  }
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
  const dataKey = useMemo(() => serializeAutoSaveData(data), [data]);
  const debouncedDataKey = useDebounce(dataKey, delay);
  const initialized = useRef(false);
  const lastSavedDataKey = useRef<string | null>(null);
  const savingDataKey = useRef<string | null>(null);
  const latestData = useRef(data);
  const latestDataKey = useRef(dataKey);
  const latestOnSave = useRef(onSave);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    latestData.current = data;
    latestDataKey.current = dataKey;
    latestOnSave.current = onSave;
  }, [data, dataKey, onSave]);

  useEffect(() => {
    if (!enabled) return;

    // Treat the first enabled value as already persisted. This prevents edit
    // screens from auto-saving their empty pre-load state over the real draft.
    if (!initialized.current) {
      initialized.current = true;
      lastSavedDataKey.current = dataKey;
      return;
    }

    if (dataKey !== debouncedDataKey) return;
    if (lastSavedDataKey.current === debouncedDataKey) return;
    if (savingDataKey.current === debouncedDataKey) return;

    const keyToSave = debouncedDataKey;
    const dataToSave = latestData.current;
    savingDataKey.current = keyToSave;

    const save = async () => {
      try {
        if (mounted.current) {
          setIsSaving(true);
          setError(null);
        }
        await latestOnSave.current(dataToSave);
        if (latestDataKey.current === keyToSave) {
          lastSavedDataKey.current = keyToSave;
        }
        if (mounted.current) {
          setLastSaved(new Date());
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
        if (mounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to auto-save');
        }
      } finally {
        if (savingDataKey.current === keyToSave) {
          savingDataKey.current = null;
        }
        if (mounted.current) {
          setIsSaving(false);
        }
      }
    };

    save();
  }, [dataKey, debouncedDataKey, enabled]);

  return { isSaving, lastSaved, error };
}
