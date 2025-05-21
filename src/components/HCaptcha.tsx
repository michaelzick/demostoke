
import { useState, useEffect } from 'react';

interface HCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    hcaptcha: any;
    onloadHcaptchaCallback: () => void;
  }
}

const HCaptcha = ({ siteKey, onVerify }: HCaptchaProps) => {
  const [loaded, setLoaded] = useState(false);

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
          window.hcaptcha.render('h-captcha-container', {
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
        } catch (error) {
          console.error('hCaptcha rendering error:', error);
        }
      }
    }
  }, [loaded, siteKey, onVerify]);

  return <div id="h-captcha-container" className="mt-4"></div>;
};

export default HCaptcha;
