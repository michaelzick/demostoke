
import { useEffect } from 'react';
import { initializeAmplitudeClickTracking } from "@/utils/amplitudeClickTracking";

export const ClientOnlyAmplitudeInit = () => {
  useEffect(() => {
    initializeAmplitudeClickTracking();
  }, []);

  return null;
};
