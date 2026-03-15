# Requirements Document

## Introduction

Currently, gear cards throughout the site automatically request browser geolocation permission on page load to display distance information (e.g., "89.4mi away"). This creates a poor user experience by triggering a browser permission prompt before the user has expressed any intent to share their location.

This feature replaces the automatic geolocation request with an explicit user-initiated "Calculate Distance" CTA button. The button appears on all gear card variants (`EquipmentCard`, `CompactEquipmentCard`, and any future card variants) in place of the "Calculating distance..." placeholder. When clicked, it requests browser location permission, calculates the distance, and displays the result — or handles denial gracefully.

## Glossary

- **DistanceDisplay**: The React component (`src/components/DistanceDisplay.tsx`) responsible for rendering distance text on gear cards.
- **useGeolocation**: The React hook (`src/hooks/useGeolocation.ts`) that manages browser geolocation state and permission requests.
- **useDynamicDistance**: The React hook (`src/hooks/useDynamicDistance.ts`) that computes the distance between the user and a piece of equipment using `useGeolocation`.
- **EquipmentCard**: The standard gear card component (`src/components/EquipmentCard.tsx`) used in featured and explore sections.
- **CompactEquipmentCard**: The compact gear card component (`src/components/CompactEquipmentCard.tsx`) used in list and profile views.
- **Calculate_Distance_CTA**: The outline button rendered on gear cards that, when clicked, initiates the browser geolocation permission request.
- **Permission_State**: One of three states — `idle` (not yet requested), `granted` (user accepted), or `denied` (user declined).
- **Gear_Card**: Any card component that renders equipment data and includes a `DistanceDisplay`, including `EquipmentCard` and `CompactEquipmentCard`.

## Requirements

### Requirement 1: Replace Automatic Geolocation with User-Initiated CTA

**User Story:** As a site visitor, I want to choose when to share my location, so that I am not prompted for browser permissions before I have expressed any intent.

#### Acceptance Criteria

1. THE `useGeolocation` Hook SHALL NOT call `navigator.geolocation.getCurrentPosition` on page load or component mount.
2. WHEN the user has no cached location and has not yet clicked the Calculate_Distance_CTA, THE `DistanceDisplay` Component SHALL render the Calculate_Distance_CTA button instead of "Calculating distance...".
3. WHEN the user clicks the Calculate_Distance_CTA, THE `useGeolocation` Hook SHALL call `navigator.geolocation.getCurrentPosition` to request browser location permission.
4. THE Calculate_Distance_CTA SHALL be styled as an outline button consistent with the "View All" button variant used in the `FeaturedGearSection` component (`variant="outline"`).

---

### Requirement 2: Display Distance After Permission Granted

**User Story:** As a site visitor, I want to see the distance to a gear listing after I share my location, so that I can make informed rental decisions.

#### Acceptance Criteria

1. WHEN the user grants location permission after clicking the Calculate_Distance_CTA, THE `DistanceDisplay` Component SHALL display the calculated distance in the format `{value}mi away` (e.g., "89.4mi away").
2. WHEN the user grants location permission, THE `useGeolocation` Hook SHALL cache the resolved coordinates in `localStorage` under the key `userLocation` with a `timestamp` field.
3. WHEN a valid non-stale cached location exists in `localStorage` (less than 5 minutes old), THE `useGeolocation` Hook SHALL use the cached coordinates without requesting browser permission again.
4. WHEN a cached location is loaded from `localStorage`, THE `DistanceDisplay` Component SHALL display the calculated distance without showing the Calculate_Distance_CTA.

---

### Requirement 3: Handle Permission Denial Gracefully

**User Story:** As a site visitor, I want a clear indication when distance cannot be calculated, so that I understand why no distance is shown.

#### Acceptance Criteria

1. WHEN the user denies location permission after clicking the Calculate_Distance_CTA, THE `DistanceDisplay` Component SHALL display the text "Distance not available".
2. WHEN the Permission_State is `denied`, THE `DistanceDisplay` Component SHALL NOT render the Calculate_Distance_CTA again.
3. IF `navigator.geolocation` is not supported by the browser, THEN THE `DistanceDisplay` Component SHALL display the text "Distance not available" and SHALL NOT render the Calculate_Distance_CTA.

---

### Requirement 4: Apply CTA to All Gear Card Variants

**User Story:** As a site visitor, I want a consistent experience across all gear cards on the site, so that distance behavior is predictable regardless of which page I am on.

#### Acceptance Criteria

1. THE `EquipmentCard` Component SHALL render the `DistanceDisplay` Component with the Calculate_Distance_CTA behavior.
2. THE `CompactEquipmentCard` Component SHALL render the `DistanceDisplay` Component with the Calculate_Distance_CTA behavior.
3. WHEN a new Gear_Card variant is introduced that renders distance information, THE new variant SHALL use the `DistanceDisplay` Component to ensure consistent Calculate_Distance_CTA behavior.
4. THE Calculate_Distance_CTA SHALL appear in the same position within each Gear_Card where the distance text currently appears.

---

### Requirement 5: Preserve Existing Distance Calculation Logic

**User Story:** As a developer, I want the distance calculation algorithm to remain unchanged, so that displayed distances are accurate and consistent with the current implementation.

#### Acceptance Criteria

1. WHEN user coordinates and equipment coordinates are both valid, THE `useDynamicDistance` Hook SHALL calculate distance using the existing `calculateDistance` utility from `@/utils/distanceCalculation`.
2. THE `useDynamicDistance` Hook SHALL return a `distance` value rounded to one decimal place in miles.
3. WHEN the calculated distance is less than 0.1 miles, THE `DistanceDisplay` Component SHALL display "< 0.1mi away".
4. FOR ALL valid coordinate pairs, the distance value returned by `useDynamicDistance` SHALL be a non-negative number.
