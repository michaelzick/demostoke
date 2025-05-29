
// Helper function to generate random locations near a center point
export function generateRandomLocation(centerLat: number, centerLng: number, radiusInKm = 5) {
  const R = 6371; // Earth's radius in kilometers
  const radiusInDeg = radiusInKm / R; // Convert radius from kilometers to degrees
  const angle = Math.random() * Math.PI * 2; // Random angle
  const distance = Math.random() * radiusInDeg; // Random distance within the radius
  const dx = distance * Math.cos(angle);
  const dy = distance * Math.sin(angle);

  // Convert to decimal degrees
  const newLat = centerLat + (dy * 180) / Math.PI;
  const newLng = centerLng + (dx * 180) / Math.PI / Math.cos((centerLat * Math.PI) / 180);

  return { lat: newLat, lng: newLng };
}

// Names of locations based on Los Angeles neighborhoods
export const losAngelesLocations = [
  "Hollywood", "Downtown LA", "Santa Monica", "Venice",
  "Beverly Hills", "Westwood", "Silver Lake", "Echo Park",
  "Koreatown", "Culver City", "Brentwood", "Bel Air",
  "Pasadena", "Glendale", "Burbank"
];

// Los Angeles center coordinates
export const losAngelesLat = 34.0522;
export const losAngelesLng = -118.2437;
