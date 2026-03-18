# Implementation Plan: gear-quiz-db-results

## Overview

Ground the gear quiz AI recommendations in real DB inventory by: creating shared types, updating the edge function to select from real candidates, wiring the page to fetch candidates and pass them down, and updating QuizResults to render matched items with a mini map. Finish by resolving all TypeScript/ESLint errors so the build is clean.

## Tasks

- [x] 1. Create shared quiz types in `src/types/quiz.ts`
  - Define `GearCandidate`, `QuizAnalysisResult`, and `QuizRecommendation` interfaces as specified in the design
  - Export all three types from the new file
  - _Requirements: 5.3_

- [x] 2. Update `gear-quiz-analysis` edge function to accept `availableGear` and return `matchedIds`
  - [x] 2.1 Extend the `QuizData` interface to include `availableGear?: GearCandidate[]`
    - Import or inline the `GearCandidate` type definition in the Deno function
    - _Requirements: 2.1, 5.4_

  - [x] 2.2 Add `filterMatchedIds` helper that removes IDs not present in `availableGear`
    - Takes `rawIds: string[]` and `validIds: Set<string>` and returns filtered array
    - _Requirements: 2.5_

  - [ ]* 2.3 Write property test for `filterMatchedIds` — Property 2: matchedIds are a subset of availableGear IDs
    - **Property 2: matchedIds are a subset of availableGear IDs**
    - **Validates: Requirements 2.2, 2.5**

  - [ ]* 2.4 Write property test for `filterMatchedIds` — Property 3: Empty availableGear yields empty matchedIds
    - **Property 3: Empty availableGear yields empty matchedIds**
    - **Validates: Requirements 2.3, 1.3**

  - [x] 2.5 Update the OpenAI system prompt to include the `availableGear` list when non-empty and ask the AI to return `matchedIds`
    - When `availableGear` is non-empty, replace the generic recommendations prompt with a selection prompt listing candidates and requesting `matchedIds`
    - When `availableGear` is empty or absent, keep existing generic recommendations behavior and return `matchedIds: []`
    - _Requirements: 2.1, 2.3_

  - [x] 2.6 Apply `filterMatchedIds` to the parsed AI response before returning, and ensure `matchedIds` is always present in the response alongside the existing advice fields
    - _Requirements: 2.2, 2.4, 2.5_

  - [ ]* 2.7 Write property test for advice field preservation — Property 6: Advice fields are preserved
    - **Property 6: Advice fields are preserved**
    - **Validates: Requirements 2.4, 3.5**

- [x] 3. Update `GearQuizPage.tsx` to fetch DB candidates and pass them to the edge function and `QuizResults`
  - [x] 3.1 Add `fetchDbCandidates(category: string): Promise<GearCandidate[]>` function
    - Use a targeted Supabase query selecting `id, name, description, suitable_skill_level, price_per_day, location_lat, location_lng, location_address` where `category=?`, `status='available'`, `visible_on_map=true`
    - Do not use `fetchEquipmentFromSupabase` (avoids full join + image processing)
    - _Requirements: 1.1, 1.2_

  - [ ]* 3.2 Write property test for `fetchDbCandidates` — Property 1: DB candidates are category-scoped
    - **Property 1: DB candidates are category-scoped**
    - **Validates: Requirements 1.1**

  - [x] 3.3 Add `dbCandidates` state (`useState<GearCandidate[]>`) to `GearQuizPage`
    - _Requirements: 1.4_

  - [x] 3.4 Update `submitQuiz()` to call `fetchDbCandidates` before invoking the edge function, pass `availableGear: dbCandidates` in the request body, and store the result in `dbCandidates` state
    - If the DB query fails, show the existing error toast and do not call the edge function
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 3.5 Pass `dbCandidates` as a new prop to `<QuizResults>` in the `renderCurrentStep` case 7
    - _Requirements: 3.1_

- [ ] 4. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update `QuizResults.tsx` to use `matchedIds` + `dbCandidates`, remove old gear fetching, and add mini map
  - [x] 5.1 Update `QuizResultsProps` to accept `dbCandidates: GearCandidate[]` and type `results` as `QuizAnalysisResult | null`
    - Remove the `quizData` prop's use for fetching (keep it for category/skillLevel display only)
    - _Requirements: 3.1, 3.2, 5.3_

  - [x] 5.2 Remove the `useEffect` that calls `fetchEquipmentFromSupabase`, and remove `recommendedGear` and `loadingGear` state
    - _Requirements: 3.2_

  - [x] 5.3 Derive `matchedEquipment: Equipment[]` inline by mapping `results?.matchedIds` → look up in `dbCandidates` → convert to `Equipment` shape using the mapping defined in the design
    - Use safe defaults for `Equipment` fields not present in `GearCandidate` (`image_url: ""`, `rating: 0`, etc.)
    - _Requirements: 3.1_

  - [ ]* 5.4 Write property test for the `GearCandidate` → `Equipment` mapping — Property 4: Matched equipment resolution round-trip
    - **Property 4: Matched equipment resolution round-trip**
    - **Validates: Requirements 3.1**

  - [x] 5.5 Derive `mapItems` by filtering `matchedEquipment` to only items where `location.lat !== 0 && location.lng !== 0`
    - _Requirements: 4.1, 4.5_

  - [ ]* 5.6 Write property test for `mapItems` filtering — Property 5: Mini map items have valid coordinates
    - **Property 5: Mini map items have valid coordinates**
    - **Validates: Requirements 4.1, 4.5**

  - [x] 5.7 Replace the "Available Gear for You" section with a "Gear Matched for You" section
    - When `matchedEquipment.length > 0`, render a `CompactEquipmentCard` grid
    - When `matchedEquipment.length === 0`, render the empty-state message "No matching gear found in our current inventory"
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 5.8 Add the mini map above the gear grid when `mapItems.length > 0`
    - Wrap `<MapComponent>` in `<div className="h-80 rounded-lg overflow-hidden mb-4">`
    - Pass `initialEquipment={mapItems}`, `activeCategory={quizData?.category ?? null}`, `interactive={true}`
    - Format each map item as `{ id, name, category, price_per_day, location: { lat, lng }, ownerId: "", ownerName: "" }`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 6. Fix all TypeScript and ESLint errors across the codebase and verify build succeeds
  - Run `tsc --noEmit` and resolve all type errors introduced or pre-existing
  - Run ESLint and resolve all errors
  - Ensure no `any` types are used for the new `availableGear` / `matchedIds` interfaces
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 7. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use `fast-check` — add as a dev dependency if not already present
- The mini map uses `interactive={true}` so users can pan/zoom; `MapComponent` enters `isEquipmentDetailMode` on `/gear-quiz` (neither `/search` nor `/explore`), showing pins without popups
- `fetchDbCandidates` is a targeted query — do not reuse `fetchEquipmentFromSupabase` which does full joins and image processing
