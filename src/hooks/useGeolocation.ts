
import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionDenied: false,
  });

  const [mounted, setMounted] = useState(false);

  // Set mounted state to track when component is hydrated
  useEffect(() => {
    setMounted(true);
  }, []);

  const getCurrentLocation = () => {
    // Only proceed if we're in a browser environment
    if (!mounted || typeof window === "undefined" || !navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionDenied: false,
        });
        
        // Cache location in localStorage only if available
        if (typeof window !== "undefined" && window.localStorage) {
          try {
            localStorage.setItem('userLocation', JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: Date.now(),
            }));
          } catch (error) {
            console.error('Error saving location to localStorage:', error);
          }
        }
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

        // Only log errors in development to reduce console noise
        if (process.env.NODE_ENV === 'development') {
          console.warn('Geolocation error:', error.message);
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permissionDenied,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Try to load cached location on mount, but only on client side
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    try {
      const cachedLocation = localStorage.getItem('userLocation');
      if (cachedLocation) {
        const parsed = JSON.parse(cachedLocation);
        const isStale = Date.now() - parsed.timestamp > 300000; // 5 minutes
        
        if (!isStale) {
          setState({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
            error: null,
            loading: false,
            permissionDenied: false,
          });
          return;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error parsing cached location:', error);
      }
    }

    // Only auto-request location if user hasn't previously denied permission
    if (!state.permissionDenied) {
      getCurrentLocation();
    }
  }, [mounted]);

  return {
    ...state,
    getCurrentLocation,
  };
};
