
import mapboxgl from 'mapbox-gl';
import { slugify } from '@/utils/slugify';

export const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'snowboards':
      return 'bg-rose-500';
    case 'skis':
      return 'bg-lime-300';
    case 'surfboards':
      return 'bg-sky-500';
    case 'mountain-bikes':
    case 'mountain-bike':  // Handle both variations
      return 'bg-orange-400';
    default:
      return 'bg-black';
  }
};

export const getUserRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'retail-store':
      return 'bg-lime-300';
    case 'builder':
      return 'bg-orange-400';
    case 'private-party':
      return 'bg-rose-500';
    default:
      return 'bg-gray-600';
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'retail-store':
      return 'Retail Store';
    case 'builder':
      return 'Builder';
    case 'private-party':
      return 'Private Party';
    default:
      return 'Unknown Role';
  }
};

export const createMarkerElement = (category: string): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'flex items-center justify-center';

  const markerIcon = document.createElement('div');
  markerIcon.className = `p-1 rounded-full ${getCategoryColor(category)}`;

  const icon = document.createElement('div');
  icon.className = 'text-white';
  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>';

  markerIcon.appendChild(icon);
  el.appendChild(markerIcon);

  return el;
};

export const createUserLocationMarkerElement = (role: string, activeCategory?: string): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'flex items-center justify-center';

  const markerIcon = document.createElement('div');

  // Use category color if active category is selected, otherwise use role color
  const backgroundColor = activeCategory ? getCategoryColor(activeCategory) : getUserRoleColor(role);
  markerIcon.className = `p-1 rounded-full ${backgroundColor}`;

  const icon = document.createElement('div');
  icon.className = role.toLowerCase() === 'private-party' ? 'text-white' : 'text-black';

  // Different icons for shops vs private parties
  if (role === 'private-party') {
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
  } else {
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  }

  markerIcon.appendChild(icon);
  el.appendChild(markerIcon);

  return el;
};

export const createPopupContent = (item: {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  ownerId: string;
  ownerName: string;
}): string => {
  return `
    <div>
      <h3 class="text-base font-medium">${item.name}</h3>
      <p class="text-sm text-gray-500">
        <a href="/user-profile/${slugify(item.ownerName)}" class="underline underline-offset-2 hover:text-blue-600">${item.ownerName}</a>
      </p>
      <p class="text-sm text-gray-500">${item.category}</p>
      <p class="text-sm mt-1">$${item.price_per_day}/day</p>
      <button
        class="mt-2 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        onclick="window.location.href='/${item.category}/${slugify(item.ownerName)}/${slugify(item.name)}'"
      >
        View Details
      </button>
    </div>
  `;
};

export const createUserLocationPopupContent = (user: { id: string; name: string; role: string; address: string; }): string => {
  const roleDisplay = getRoleDisplayName(user.role);
  return `
    <div>
      <h3 class="text-base font-medium">${user.name}</h3>
      <p class="text-sm text-gray-500">${roleDisplay}</p>
      <p class="text-sm mt-1">${user.address}</p>
      <button
        class="mt-2 px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        onclick="window.location.href='/user-profile/${slugify(user.name)}'"
      >
        View Profile
      </button>
    </div>
  `;
};

export const initializeMap = (container: HTMLDivElement, token: string): mapboxgl.Map => {
  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [0, 0], // Start centered on the world
    zoom: 2
  });

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }));

  return map;
};

export const fitMapBounds = (map: mapboxgl.Map, locations: Array<{ location: { lat: number; lng: number; }; }>, isSingleView: boolean = false): void => {
  if (locations.length === 0) {
    return; // Keep current view when no locations are provided
  }

  try {
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((item) => {
      if (item.location?.lat && item.location?.lng) {
        bounds.extend([item.location.lng, item.location.lat]);
      }
    });
    map.fitBounds(bounds, { padding: 50, maxZoom: isSingleView ? 15 : 12 });
  } catch (err) {
    console.error('Error fitting bounds:', err);
  }
};
