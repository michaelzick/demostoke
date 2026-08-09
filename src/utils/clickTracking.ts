let isInitialized = false;

export const initializeClickTracking = () => {
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

      // Consent gating is implicit: window.mixpanel only exists after the
      // consent-gated __loadAnalytics() bootstrap in index.html has run.
      if (matchedClass && window.mixpanel?.track) {
        window.mixpanel.track('element_clicked', {
          element_class: matchedClass,
          element_id: matchedElement.id,
          element_type: matchedElement.tagName.toLowerCase()
        });
      }
    }
  });
};
