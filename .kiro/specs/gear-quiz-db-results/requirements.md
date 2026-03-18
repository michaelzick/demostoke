# Requirements Document

## Introduction

This feature enhances the gear quiz (`/gear-quiz`) so that AI-generated recommendations are grounded in actual equipment records from the database. Currently, the `gear-quiz-analysis` edge function generates generic gear type descriptions, and `QuizResults.tsx` independently fetches DB items filtered only by category and skill level — the two are never connected. The change makes the AI select from real DB items, displays only those matched items to the user, and adds an interactive mini map showing where those items can be found. Additionally, all type and lint errors across the codebase are resolved so the build succeeds cleanly.

## Glossary

- **Quiz_Page**: The `GearQuizPage.tsx` component at `/gear-quiz` that orchestrates the 6-step wizard and submits quiz data.
- **Edge_Function**: The Supabase edge function `gear-quiz-analysis` that calls OpenAI to produce recommendations.
- **Equipment_Record**: A row in the Supabase `equipment` table with fields: `id`, `name`, `category`, `subcategory`, `description`, `price_per_day`, `suitable_skill_level`, `location_lat`, `location_lng`, `location_address`, `size`, `weight`, `material`, `status`, `visible_on_map`.
- **Equipment**: The TypeScript `Equipment` type defined in `src/types/index.ts`, which includes a `location: { lat, lng, address }` field.
- **Quiz_Results**: The `QuizResults.tsx` component that renders the results step (step 7) of the quiz.
- **DB_Candidates**: The subset of `Equipment_Record` items fetched from the database for the selected category before being sent to the AI.
- **AI_Matched_Items**: The `Equipment_Record` items selected by the AI from `DB_Candidates` as best matches for the user's profile.
- **Mini_Map**: A compact, non-interactive Mapbox map embedded in `Quiz_Results` that displays pins for each `AI_Matched_Item`.
- **MapComponent**: The existing `src/components/MapComponent.tsx` Mapbox wrapper used in gear detail pages.
- **Skill_Level**: One of `beginner`, `intermediate`, `advanced`, or `expert`, collected in quiz step 3.

---

## Requirements

### Requirement 1: Fetch DB Candidates Before Calling the AI

**User Story:** As the system, I want to fetch available equipment from the database for the selected category before invoking the AI, so that the AI can select from real inventory rather than inventing generic gear types.

#### Acceptance Criteria

1. WHEN the user submits the quiz, THE Quiz_Page SHALL fetch all `Equipment_Record` items where `category` matches the selected category, `status` is `available`, and `visible_on_map` is `true` before invoking the Edge_Function.
2. WHEN fetching DB_Candidates, THE Quiz_Page SHALL include at minimum the following fields for each item: `id`, `name`, `description`, `suitable_skill_level`, `price_per_day`, `location_lat`, `location_lng`, `location_address`.
3. IF no Equipment_Record items exist for the selected category, THEN THE Quiz_Page SHALL invoke the Edge_Function with an empty `availableGear` array and THE Quiz_Results SHALL display a message indicating no matching gear is currently available.
4. THE Quiz_Page SHALL pass the `DB_Candidates` array to the Edge_Function as an `availableGear` field in the request body alongside the existing quiz fields.

---

### Requirement 2: AI Selects Matches from DB Candidates

**User Story:** As a user, I want the AI to recommend gear that actually exists in the rental inventory, so that I can immediately act on the recommendations.

#### Acceptance Criteria

1. WHEN the Edge_Function receives a non-empty `availableGear` array, THE Edge_Function SHALL instruct the AI to select 1–3 items from `availableGear` that best match the user's profile, rather than generating generic gear descriptions.
2. THE Edge_Function SHALL return a `matchedIds` field in its response: an array of `id` strings corresponding to the selected `Equipment_Record` items from `availableGear`.
3. WHEN the Edge_Function receives an empty `availableGear` array, THE Edge_Function SHALL return an empty `matchedIds` array and MAY still return `personalizedAdvice`, `skillDevelopment`, and `locationConsiderations` fields.
4. THE Edge_Function SHALL preserve the existing `personalizedAdvice`, `skillDevelopment`, and `locationConsiderations` fields in its response so that contextual advice is still shown to the user.
5. IF the AI returns item identifiers that do not exist in the provided `availableGear` list, THEN THE Edge_Function SHALL filter those identifiers out before returning the response.

---

### Requirement 3: Quiz Results Display Only AI-Matched DB Items

**User Story:** As a user, I want the quiz results to show me the specific rental gear the AI selected for me, so that I see a curated, relevant shortlist rather than a generic category browse.

#### Acceptance Criteria

1. WHEN `Quiz_Results` receives a non-empty `matchedIds` array, THE Quiz_Results SHALL display only the `Equipment` items whose `id` values appear in `matchedIds`, in the order returned by the AI.
2. THE Quiz_Results SHALL remove the existing "Available Gear for You" section that independently fetches and displays up to 8 items filtered by category and skill level.
3. THE Quiz_Results SHALL replace the removed section with a new "Gear Matched for You" section that renders the AI_Matched_Items using the existing `CompactEquipmentCard` component.
4. WHEN `matchedIds` is empty or the fetch of matched items returns no results, THE Quiz_Results SHALL display a message such as "No matching gear found in our current inventory" in place of the gear grid.
5. THE Quiz_Results SHALL continue to display the `personalizedAdvice`, `skillDevelopment`, and `locationConsiderations` cards unchanged.

---

### Requirement 4: Mini Map Showing AI-Matched Item Locations

**User Story:** As a user, I want to see a map of where the recommended gear is located, so that I can quickly assess pickup proximity before clicking through to a detail page.

#### Acceptance Criteria

1. WHEN `Quiz_Results` has at least one AI_Matched_Item with valid `location.lat` and `location.lng` values, THE Quiz_Results SHALL render a Mini_Map above the gear grid in the "Gear Matched for You" section.
2. THE Mini_Map SHALL display one map pin per AI_Matched_Item that has a valid location, using the existing `MapComponent` with `interactive={false}`.
3. THE Mini_Map SHALL pass all AI_Matched_Items as the `initialEquipment` prop to `MapComponent`, formatted as `{ id, name, category, price_per_day, location: { lat, lng }, ownerId, ownerName }`.
4. THE Mini_Map SHALL auto-fit its viewport to include all pins using the existing `fitMapBounds` behavior already present in `MapComponent`.
5. WHEN all AI_Matched_Items lack valid location data, THE Quiz_Results SHALL not render the Mini_Map.
6. THE Mini_Map SHALL have a fixed height of `320px` and be styled with `rounded-lg overflow-hidden` consistent with the gear detail `LocationTab` usage.

---

### Requirement 5: Codebase Type and Lint Correctness

**User Story:** As a developer, I want the TypeScript build and ESLint checks to pass without errors, so that the codebase is maintainable and CI does not fail.

#### Acceptance Criteria

1. THE System SHALL have zero TypeScript compiler errors (`tsc --noEmit`) after all changes are applied.
2. THE System SHALL have zero ESLint errors after all changes are applied.
3. WHEN new interfaces or types are introduced for the `availableGear` payload and `matchedIds` response, THE System SHALL define those types in appropriate shared type files or co-located interface declarations rather than using `any`.
4. THE Edge_Function SHALL be updated to accept the new `availableGear` field in its input type definition without breaking existing field validation.
