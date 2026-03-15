# Implementation Plan: Calculate Distance CTA

## Overview

Modify `useGeolocation`, `useDynamicDistance`, and `DistanceDisplay` to replace the automatic geolocation request with an explicit user-initiated CTA button. No changes are needed to `EquipmentCard` or `CompactEquipmentCard`.

## Tasks

- [x] 1. Modify `useGeolocation` hook to be passive by default
  - [x] 1.1 Update `useGeolocation` to initialize with `permissionState: 'idle'` and remove the `useEffect` that auto-calls `getCurrentPosition` on mount
    - Add `permissionState: 'idle' | 'loading' | 'granted' | 'denied'` to the hook's state
    - Expose `requestLocation()` as the sole trigger for `navigator.geolocation.getCurrentPosition`
    - On mount, check `localStorage` for a fresh cached location (< 300,000 ms old); if found, hydrate state to `granted` with cached coordinates without calling `getCurrentPosition`
    - If cache is stale or absent, start in `idle` state
    - After a successful geolocation call, write `{ latitude, longitude, timestamp: Date.now() }` to `localStorage` under key `userLocation`
    - Handle `localStorage` read/write failures silently
    - _Requirements: 1.1, 1.3, 2.2, 2.3, 2.4_

  - [x] 1.2 Write property test for no auto-request on mount (Property 1)
    - **Property 1: No auto-request on mount without cache**
    - **Validates: Requirements 1.1**

  - [x] 1.3 Write property test for fresh cache skips permission prompt (Property 6)
    - **Property 6: Fresh cache skips permission prompt**
    - **Validates: Requirements 2.3, 2.4**

  - [x] 1.4 Write property test for location cached after grant (Property 5)
    - **Property 5: Location cached after grant**
    - **Validates: Requirements 2.2**

- [x] 2. Update `useDynamicDistance` to pass through `requestLocation` and `permissionState`
  - [x] 2.1 Extend `DynamicDistanceResult` to include `permissionState` and `requestLocation`, forwarding them from `useGeolocation`
    - _Requirements: 1.3, 4.1, 4.2_

  - [x] 2.2 Write property test for distance calculation correctness (Property 9)
    - **Property 9: Distance calculation correctness (model-based)**
    - **Validates: Requirements 5.1**

  - [x] 2.3 Write property test for distance is always non-negative (Property 8)
    - **Property 8: Distance is always non-negative**
    - **Validates: Requirements 5.4**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Modify `DistanceDisplay` to render state-driven UI
  - [x] 4.1 Update `DistanceDisplay` to consume `permissionState` and `requestLocation` from `useDynamicDistance` and render the correct output per state
    - `idle` → render `<Button variant="outline">Calculate Distance</Button>` wired to `requestLocation`
    - `loading` → render `"Calculating distance..."`
    - `granted` → render `"{value}mi away"` or `"< 0.1mi away"` for distances below 0.1 miles
    - `denied` → render `"Distance not available"`, no CTA
    - `navigator.geolocation` unsupported → render `"Distance not available"`, no CTA
    - _Requirements: 1.2, 1.4, 2.1, 3.1, 3.2, 3.3, 5.3_

  - [x] 4.2 Write property test for CTA rendered in idle state (Property 2)
    - **Property 2: CTA rendered in idle state**
    - **Validates: Requirements 1.2**

  - [x] 4.3 Write property test for click triggers geolocation request (Property 3)
    - **Property 3: Click triggers geolocation request**
    - **Validates: Requirements 1.3**

  - [x] 4.4 Write property test for distance format after permission granted (Property 4)
    - **Property 4: Distance format after permission granted**
    - **Validates: Requirements 2.1, 5.2, 5.3**

  - [x] 4.5 Write property test for denial hides CTA and shows fallback text (Property 7)
    - **Property 7: Denial hides CTA and shows fallback text**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 4.6 Write unit tests for `DistanceDisplay`
    - Test renders CTA when `permissionState === 'idle'` and no cache
    - Test renders "Distance not available" when `navigator.geolocation` is undefined
    - Test renders "< 0.1mi away" for distances below 0.1 miles
    - Test CTA button has `variant="outline"`
    - _Requirements: 1.2, 1.4, 3.3, 5.3_

- [x] 5. Verify card components render `DistanceDisplay` correctly
  - [x] 5.1 Confirm `EquipmentCard` and `CompactEquipmentCard` already render `<DistanceDisplay equipment={equipment} />` with no changes needed; add unit tests asserting `DistanceDisplay` is present in each
    - _Requirements: 4.1, 4.2, 4.4_

- [x] 6. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Unit tests complement property tests by covering specific examples and edge cases
