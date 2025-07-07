declare global {
  interface Window {
    amplitude: {
      track: (eventType: string, eventProperties?: any) => void;
    };
  }
}

let isInitialized = false;

export const initializeAmplitudeClickTracking = () => {
  if (isInitialized) return;

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupClickTracking);
  } else {
    setupClickTracking();
  }

  isInitialized = true;
};

const setupClickTracking = () => {
  const targetClasses = [
    'profile-address',
    'profile-phone',
    'profile-website',
    'contact-owner-button',
    'owner-name-button',
    'view-profile-link'
  ];

  // Add click event listener to document body
  document.body.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;

    // Check if clicked element has any of our target classes
    const matchedClass = targetClasses.find(className =>
      target.classList.contains(className)
    );

    if (matchedClass && target.id) {
      // Send tracking data to Amplitude
      if (window.amplitude && window.amplitude.track) {
        window.amplitude.track('element_clicked', {
          element_class: matchedClass,
          element_id: target.id,
          element_type: target.tagName.toLowerCase()
        });

        console.log('Amplitude tracking sent:', {
          element_class: matchedClass,
          element_id: target.id
        });
      }
    }
  });
};
