import { onCLS, onINP, onLCP } from 'web-vitals';
import { hasAnalyticsConsent } from '@/utils/cookieConsent';

function sendToGA4(metric: { name: string; value: number; id: string }) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'web_vitals',
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
  });
}

function sendToMixpanel(metric: { name: string; value: number; id: string }) {
  if (!hasAnalyticsConsent()) {
    return;
  }

  if (window.mixpanel?.track) {
    window.mixpanel.track('web_vitals', {
      metric_name: metric.name,
      metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
    });
  }
}

export function reportWebVitals() {
  onCLS(sendToGA4);
  onINP(sendToGA4);
  onLCP(sendToGA4);
  onCLS(sendToMixpanel);
  onINP(sendToMixpanel);
  onLCP(sendToMixpanel);
}
