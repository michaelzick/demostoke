// Re-exports the shared geolocation state from GeolocationContext.
// All consumers get the same singleton state — clicking "Calculate Distance"
// on any card triggers the permission request and updates every card at once.
export { useGeolocationContext as useGeolocation } from '@/contexts/GeolocationContext';
