
import { useState, useEffect } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  action: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onloadRecaptchaCallback: () => void;
  }
}

const ReCaptchaV3 = ({ siteKey, action, onVerify }: ReCaptchaProps) => {
  const [loaded, setLoaded] = useState(false);

  // Load the reCAPTCHA script once
  useEffect(() => {
    if (!document.querySelector('script[src*="recaptcha"]')) {
      // Define the callback function
      window.onloadRecaptchaCallback = () => {
        setLoaded(true);
      };

      // Create and append the script
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}&onload=onloadRecaptchaCallback`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.grecaptcha && window.grecaptcha.execute) {
      setLoaded(true);
    }
  }, [siteKey]);

  // Execute reCAPTCHA when the script is loaded
  useEffect(() => {
    if (loaded && window.grecaptcha) {
      const executeReCaptcha = async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, { action });
          onVerify(token);
        } catch (error) {
          console.error('reCAPTCHA execution error:', error);
          onVerify('');
        }
      };
      
      executeReCaptcha();
      
      // Set up a refresh interval (tokens expire after 2 minutes)
      const refreshInterval = setInterval(executeReCaptcha, 110000); // refresh slightly before 2 minutes
      
      return () => clearInterval(refreshInterval);
    }
  }, [loaded, siteKey, action, onVerify]);

  // No visible UI for v3
  return null;
};

export default ReCaptchaV3;
