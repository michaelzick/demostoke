
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const GoogleTagManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

  }, []);

  // Track page views on route changes
  useEffect(() => {
    // Push page view event to GTM dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: location.pathname + location.search,
      page_title: document.title,
    });

  }, [location]);

  return null;
};

export default GoogleTagManager;
