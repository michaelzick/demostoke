
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface HCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  shouldReset?: boolean;
}

declare global {
  interface Window {
    hcaptcha: {
      render: (...args: unknown[]) => string;
      reset: (id: string) => void;
    } | undefined;
    onloadHcaptchaCallback: () => void;
  }
}

const HCaptcha = forwardRef<{ reset: () => void }, HCaptchaProps>(({ siteKey, onVerify, shouldReset }, ref) => {
  const [loaded, setLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      resetCaptcha();
    }
  }));

  const resetCaptcha = () => {
    if (window.hcaptcha && widgetId) {
      window.hcaptcha.reset(widgetId);
      onVerify(''); // Clear the token
    }
  };

  // Handle reset from parent component
  useEffect(() => {
    if (shouldReset && window.hcaptcha && widgetId) {
      resetCaptcha();
    }
  }, [shouldReset, widgetId]);

  // Load the hCaptcha script once
  useEffect(() => {
    // Only load the script if it's not already loaded
    if (!document.querySelector('script[src*="hcaptcha"]')) {
      // Define the callback function
      window.onloadHcaptchaCallback = () => {
        setLoaded(true);
      };

      // Create and append the script
      const script = document.createElement('script');
      script.src = `https://js.hcaptcha.com/1/api.js?onload=onloadHcaptchaCallback&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.hcaptcha) {
      // If the script is already loaded, set loaded to true
      setLoaded(true);
    }
  }, []);

  // Render hCaptcha when the script is loaded
  useEffect(() => {
    if (loaded && !document.querySelector('.h-captcha iframe')) {
      const container = document.getElementById('h-captcha-container');
      if (container) {
        try {
          const id = window.hcaptcha.render('h-captcha-container', {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token);
            },
            'expired-callback': () => {
              onVerify('');
            },
            'error-callback': () => {
              console.error('hCaptcha error');
              onVerify('');
            }
          });
          setWidgetId(id);
        } catch (error) {
          console.error('hCaptcha rendering error:', error);
        }
      }
    }
  }, [loaded, siteKey, onVerify]);

  return <div id="h-captcha-container" className="mt-4"></div>;
});

HCaptcha.displayName = 'HCaptcha';

export default HCaptcha;
