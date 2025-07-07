// Registers a global click listener to send element information to Amplitude

declare global {
  interface Window {
    amplitude?: {
      getInstance: () => { track: (eventName: string, data?: Record<string, unknown>) => void };
    };
  }
}

const TRACKED_CLASSES = [
  'profile-address',
  'profile-phone',
  'profile-website',
  'contact-owner-button',
  'owner-name-button',
  'view-profile-link',
];

function getMatchedElement(element: HTMLElement): { el: HTMLElement; cls: string } | null {
  for (const cls of TRACKED_CLASSES) {
    const match = element.closest(`.${cls}`);
    if (match) {
      return { el: match as HTMLElement, cls };
    }
  }
  return null;
}

function handleClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const match = getMatchedElement(target);
  if (!match) return;

  const id = match.el.id;
  if (!id) return;

  if (window.amplitude && typeof window.amplitude.getInstance === 'function') {
    window.amplitude.getInstance().track('element_click', {
      elementClass: match.cls,
      elementId: id,
    });
  }
}

document.addEventListener('click', handleClick, true);

export {}; // Ensures this file is treated as a module
