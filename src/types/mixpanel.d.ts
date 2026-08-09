// Ambient type for the Mixpanel client created by the official embed snippet,
// which only runs inside the consent-gated __loadAnalytics() bootstrap in
// index.html — window.mixpanel never exists pre-consent. Identity is UUID-only
// by design (no people.set of name/email or other PII), so no `people` methods
// are declared here.
interface Mixpanel {
  init: (token: string, config?: Record<string, unknown>) => void;
  track: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string) => void;
  reset: () => void;
  opt_out_tracking: () => void;
}

interface Window {
  mixpanel?: Mixpanel;
}
