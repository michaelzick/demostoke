
import { useState, useEffect, useRef } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

declare global {
  interface Window {
    grecaptcha: any;
    onloadCallback: () => void;
  }
}

const ReCaptcha = ({ siteKey, onVerify }: ReCaptchaProps) => {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useEffect(() => {
    // Only add the script once
    if (!document.querySelector('script[src*="recaptcha"]')) {
      window.onloadCallback = () => {
        setLoaded(true);
      };

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.grecaptcha && window.grecaptcha.render) {
      setLoaded(true);
    }

    return () => {
      // Reset when component unmounts
      if (widgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loaded && containerRef.current && !widgetId.current) {
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'expired-callback': () => onVerify(''),
      });
    }
  }, [loaded, siteKey, onVerify]);

  return <div ref={containerRef} className="g-recaptcha mt-4 flex justify-center" />;
};

export default ReCaptcha;
