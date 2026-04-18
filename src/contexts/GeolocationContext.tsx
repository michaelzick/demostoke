import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const CACHE_KEY = 'userLocation';
const CACHE_TTL_MS = 300_000; // 5 minutes

interface CachedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
  permissionState: 'idle' | 'loading' | 'granted' | 'denied';
}

interface GeolocationContextValue extends GeolocationState {
  requestLocation: () => void;
}

function readCache(): CachedLocation | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedLocation = JSON.parse(raw);
    if (
      Number.isFinite(parsed.latitude) &&
      Number.isFinite(parsed.longitude) &&
      Number.isFinite(parsed.timestamp) &&
      Date.now() - parsed.timestamp <= CACHE_TTL_MS
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeCache(latitude: number, longitude: number): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ latitude, longitude, timestamp: Date.now() }));
  } catch {
    // silently ignore
  }
}

const GeolocationContext = createContext<GeolocationContextValue | null>(null);

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GeolocationState>(() => {
    if (typeof window !== 'undefined') {
      const cached = readCache();
      if (cached) {
        return {
          latitude: cached.latitude,
          longitude: cached.longitude,
          error: null,
          loading: false,
          permissionDenied: false,
          permissionState: 'granted',
        };
      }
    }
    return {
      latitude: null,
      longitude: null,
      error: null,
      loading: false,
      permissionDenied: false,
      permissionState: 'idle',
    };
  });

  // Re-check cache after hydration (handles SSR)
  useEffect(() => {
    if (state.permissionState !== 'idle') return;
    const cached = readCache();
    if (cached) {
      setState({
        latitude: cached.latitude,
        longitude: cached.longitude,
        error: null,
        loading: false,
        permissionDenied: false,
        permissionState: 'granted',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false,
        permissionState: 'denied',
        permissionDenied: true,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, permissionState: 'loading' }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        writeCache(latitude, longitude);
        setState({
          latitude,
          longitude,
          error: null,
          loading: false,
          permissionDenied: false,
          permissionState: 'granted',
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied';
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location timeout';
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
          permissionState: permissionDenied ? 'denied' : 'idle',
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: CACHE_TTL_MS,
      }
    );
  }, []);

  return (
    <GeolocationContext.Provider value={{ ...state, requestLocation }}>
      {children}
    </GeolocationContext.Provider>
  );
};

export const useGeolocationContext = (): GeolocationContextValue => {
  const ctx = useContext(GeolocationContext);
  if (!ctx) throw new Error('useGeolocationContext must be used within GeolocationProvider');
  return ctx;
};
