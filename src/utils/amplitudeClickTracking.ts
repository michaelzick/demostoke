declare global {
  interface Window {
    amplitude: {
      track: (eventType: string, eventProperties?: Record<string, unknown>) => void;
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

    // Use closest to ensure we capture clicks on child elements (e.g. icons, spans) inside our target
    const selector = targetClasses.map(c => `.${c}`).join(', ');
    const matchedElement = target.closest(selector) as HTMLElement | null;

    if (matchedElement && matchedElement.id) {
      // Find which specific target class was matched
      const matchedClass = targetClasses.find(className =>
        matchedElement.classList.contains(className)
      );

      // Send tracking data to Amplitude
      if (matchedClass && window.amplitude && window.amplitude.track) {
        window.amplitude.track('element_clicked', {
          element_class: matchedClass,
          element_id: matchedElement.id,
          element_type: matchedElement.tagName.toLowerCase()
        });

        console.log('Amplitude tracking sent:', {
          element_class: matchedClass,
          element_id: matchedElement.id,
          element_type: matchedElement.tagName.toLowerCase()
        });
      }
    }
  });
};
