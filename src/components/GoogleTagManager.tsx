
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

interface PageMetadataAppliedDetail {
  canonicalUrl?: string;
  pagePath?: string;
  title?: string;
}

/**
 * Pushes a `page_view` event to Google Tag Manager whenever the route changes.
 * This ensures that single page app navigations are tracked as page views,
 * which is the recommended approach for GTM with SPAs.
 */
const GoogleTagManager = () => {
  const location = useLocation();
  const lastTrackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const pagePath = location.pathname + location.search + location.hash;
    let isActive = true;

    const pushPageView = (pageTitle: string) => {
      if (!isActive || lastTrackedPathRef.current === pagePath) {
        return;
      }

      lastTrackedPathRef.current = pagePath;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'page_view',
        page_location: window.location.href,
        page_path: pagePath,
        page_title: pageTitle || document.title,
      });
    };

    const handleMetadataApplied = (event: Event) => {
      const detail: PageMetadataAppliedDetail | null =
        event instanceof CustomEvent && event.detail && typeof event.detail === 'object'
          ? (event.detail as PageMetadataAppliedDetail)
          : null;

      if (detail?.pagePath && detail.pagePath !== pagePath) {
        return;
      }

      pushPageView(
        typeof detail?.title === 'string' && detail.title.trim().length > 0
          ? detail.title
          : document.title,
      );
    };

    window.addEventListener('page_metadata_applied', handleMetadataApplied as EventListener);

    const fallbackTimeout = window.setTimeout(() => {
      pushPageView(document.title);
    }, 2500);

    return () => {
      isActive = false;
      window.clearTimeout(fallbackTimeout);
      window.removeEventListener('page_metadata_applied', handleMetadataApplied as EventListener);
    };
  }, [location]);

  return null;
};

export default GoogleTagManager;
