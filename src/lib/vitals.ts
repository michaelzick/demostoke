import { onCLS, onINP, onLCP } from 'web-vitals';

function sendToGA4(metric: { name: string; value: number; id: string }) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'web_vitals',
    metric_name: metric.name,
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
  });
}

function sendToAmplitude(metric: { name: string; value: number; id: string }) {
  if (window.amplitude?.track) {
    window.amplitude.track('web_vitals', {
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
  onCLS(sendToAmplitude);
  onINP(sendToAmplitude);
  onLCP(sendToAmplitude);
}
