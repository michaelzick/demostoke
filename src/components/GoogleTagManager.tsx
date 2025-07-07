
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

    console.log('GTM initialized on page load');
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

    console.log('GTM page view tracked:', location.pathname + location.search);
  }, [location]);

  return null;
};

export default GoogleTagManager;
