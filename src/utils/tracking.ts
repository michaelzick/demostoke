export const buildEquipmentTrackingFrom = (equipment: {
  owner: { name: string };
  name: string;
}) => `${equipment.owner.name} - ${equipment.name}`;

export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  // GA4 via dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...properties,
  });

  // Amplitude
  if (window.amplitude?.track) {
    window.amplitude.track(eventName, properties);
  }
};
