import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });

export async function geocodeLocation(location: string) {
  if (!location) return null;
  const response = await geocodingClient
    .forwardGeocode({
      query: location,
      limit: 1,
    })
    .send();

  const match = response.body.features[0];
  if (match) {
    return {
      lat: match.center[1],
      lng: match.center[0],
      place_name: match.place_name,
    };
  }
  return null;
}
