
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GoogleTagManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Initialize gtag function
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    // Configure Google Analytics
    gtag('js', new Date());
    gtag('config', 'G-KKQJ9P2ECC');

    console.log('GTM initialized on page load');
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', 'G-KKQJ9P2ECC', {
        page_path: location.pathname + location.search,
      });
      
      // Also push a page_view event to GTM
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'page_view',
        page_path: location.pathname + location.search,
        page_title: document.title,
      });

      console.log('GTM page view tracked:', location.pathname + location.search);
    }
  }, [location]);

  return null;
};

export default GoogleTagManager;
