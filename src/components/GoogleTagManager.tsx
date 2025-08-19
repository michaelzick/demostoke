
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Pushes a `page_view` event to Google Tag Manager whenever the route changes.
 * This ensures that single page app navigations are tracked as page views,
 * which is the recommended approach for GTM with SPAs.
 */
const GoogleTagManager = () => {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.pathname + location.search + location.hash;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_location: window.location.href,
      page_path: pagePath,
      page_title: document.title,
    });
  }, [location]);

  return null;
};

export default GoogleTagManager;
