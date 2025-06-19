
import mapboxgl from 'mapbox-gl';

export const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'snowboards':
      return 'bg-fuchsia-600';
    case 'skis':
      return 'bg-lime-600';
    case 'surfboards':
      return 'bg-blue-600';
    case 'sups':
      return 'bg-violet-600';
    case 'mountain-bikes':
    case 'mountain-bike':  // Handle both variations
      return 'bg-red-600';
    default:
      return 'bg-black';
  }
};

export const getUserRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'shop':
      return 'bg-emerald-600';
    case 'private-party':
      return 'bg-orange-600';
    default:
      return 'bg-gray-600';
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

export const createUserLocationMarkerElement = (role: string): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'flex items-center justify-center';

  const markerIcon = document.createElement('div');
  markerIcon.className = `p-1 rounded-full ${getUserRoleColor(role)}`;

  const icon = document.createElement('div');
  icon.className = 'text-white';
  
  // Different icons for shops vs private parties
  if (role === 'shop') {
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  } else {
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
  }

  markerIcon.appendChild(icon);
  el.appendChild(markerIcon);

  return el;
};

export const createPopupContent = (item: { id: string; name: string; category: string; price_per_day: number }): string => {
  return `
    <div>
      <h3 class="text-sm font-medium">${item.name}</h3>
      <p class="text-xs text-gray-500">${item.category}</p>
      <p class="text-xs mt-1">$${item.price_per_day}/day</p>
      <button
        class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        onclick="window.location.href='/equipment/${item.id}'"
      >
        View Details
      </button>
    </div>
  `;
};

export const createUserLocationPopupContent = (user: { id: string; name: string; role: string; address: string }): string => {
  const roleDisplay = user.role === 'shop' ? 'Shop' : 'Private Party';
  return `
    <div>
      <h3 class="text-sm font-medium">${user.name}</h3>
      <p class="text-xs text-gray-500">${roleDisplay}</p>
      <p class="text-xs mt-1">${user.address}</p>
      <button
        class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        onclick="window.location.href='/user/${user.id}'"
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
    center: [-118.2437, 34.0522], // Los Angeles coordinates
    zoom: 11
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

export const fitMapBounds = (map: mapboxgl.Map, locations: Array<{ location: { lat: number; lng: number } }>, isSingleView: boolean = false): void => {
  if (locations.length === 0) {
    map.setCenter([-118.2437, 34.0522]);
    map.setZoom(11);
    return;
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
