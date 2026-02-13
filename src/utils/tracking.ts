export const buildEquipmentTrackingFrom = (equipment: {
  owner: { name: string };
  name: string;
}) => `${equipment.owner.name} - ${equipment.name}`;

export const getAttributionFromUrl = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");

  const attribution: Record<string, string> = {};
  if (utmSource) attribution.utm_source = utmSource;
  if (utmMedium) attribution.utm_medium = utmMedium;
  if (utmCampaign) attribution.utm_campaign = utmCampaign;

  return attribution;
};

export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  const eventProperties = {
    ...properties,
    ...getAttributionFromUrl(),
  };

  // GA4 via dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventProperties,
  });

  // Amplitude
  if (window.amplitude?.track) {
    window.amplitude.track(eventName, eventProperties);
  }
};
