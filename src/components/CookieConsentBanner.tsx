import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  expireAnalyticsCookies,
  getStoredConsent,
  hasAnalyticsConsent,
  isGpcEnabled,
  setConsent,
  subscribeToPreferencesOpen,
} from "@/utils/cookieConsent";

const CookieConsentBanner = () => {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [doNotSell, setDoNotSell] = useState(false);
  const [gpcDetected, setGpcDetected] = useState(false);

  const syncTogglesFromStored = () => {
    const stored = getStoredConsent();
    setAnalyticsEnabled(stored ? stored.analytics : !isGpcEnabled());
    setDoNotSell(stored ? stored.doNotSell : isGpcEnabled());
  };

  useEffect(() => {
    setBannerVisible(getStoredConsent() === null);
    setGpcDetected(isGpcEnabled());

    // Trackers can rewrite their cookies during the revocation reload's
    // unload phase; sweep them again whenever analytics is off.
    if (!hasAnalyticsConsent()) {
      expireAnalyticsCookies();
    }

    return subscribeToPreferencesOpen(() => {
      syncTogglesFromStored();
      setPreferencesOpen(true);
    });
  }, []);

  const handleChoice = (analytics: boolean, sell: boolean) => {
    setConsent(analytics, sell);
    setPreferencesOpen(false);
    setBannerVisible(false);
  };

  const openPreferences = () => {
    syncTogglesFromStored();
    setPreferencesOpen(true);
  };

  return (
    <>
      {bannerVisible && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed bottom-0 inset-x-0 z-[200] border-t bg-background p-4 shadow-lg"
        >
          <div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              We use essential cookies to make DemoStoke work, and analytics
              cookies to understand how the site is used. You can opt out or
              tell us not to sell or share your information anytime. See our{" "}
              <Link
                to="/privacy-policy#cookies"
                className="underline hover:text-foreground"
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={openPreferences}>
                Manage Preferences
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleChoice(false, true)}
              >
                Reject All
              </Button>
              <Button size="sm" onClick={() => handleChoice(true, false)}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="z-[210]">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which cookies DemoStoke can use. Essential cookies are
              required for the site to function and cannot be turned off. You
              can change these choices anytime from Cookie Settings in the
              footer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Essential</p>
                <p className="text-sm text-muted-foreground">
                  Authentication, security, theme, and your consent choice.
                  Always on.
                </p>
              </div>
              <Switch checked disabled aria-label="Essential cookies (always on)" />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-sm text-muted-foreground">
                  Google Analytics, Google Tag Manager, and Amplitude
                  (including session replay) to help us improve DemoStoke. On
                  by default; opt out anytime.
                </p>
                {gpcDetected && (
                  <p className="text-sm text-muted-foreground mt-1">
                    We detected a Global Privacy Control signal, so analytics
                    is off by default.
                  </p>
                )}
              </div>
              <Switch
                checked={analyticsEnabled}
                onCheckedChange={(checked) => {
                  setAnalyticsEnabled(checked);
                  if (checked) {
                    setDoNotSell(false);
                  }
                }}
                aria-label="Analytics cookies"
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  Do Not Sell or Share My Information
                </p>
                <p className="text-sm text-muted-foreground">
                  We never sell your data for money. Turning this on also
                  stops sharing with our analytics providers, which disables
                  analytics cookies.
                </p>
              </div>
              <Switch
                checked={doNotSell}
                onCheckedChange={(checked) => {
                  setDoNotSell(checked);
                  if (checked) {
                    setAnalyticsEnabled(false);
                  }
                }}
                aria-label="Do not sell or share my information"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => handleChoice(analyticsEnabled, doNotSell)}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsentBanner;
