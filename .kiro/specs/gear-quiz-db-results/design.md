# Design Document: gear-quiz-db-results

## Overview

This feature grounds the gear quiz AI recommendations in real database inventory. Currently, `QuizResults.tsx` independently fetches all equipment and filters by category/skill level — the AI and the DB results are completely disconnected. After this change:

1. `GearQuizPage.tsx` fetches a lightweight set of DB candidates for the selected category before calling the edge function.
2. The `gear-quiz-analysis` edge function receives those candidates and instructs the AI to pick from them, returning `matchedIds`.
3. `QuizResults.tsx` receives the DB candidates and `matchedIds` from the page, resolves them to `Equipment` objects, and renders a curated "Gear Matched for You" section with a mini map.

No new routes, no new pages, no new global state — this is a targeted data-flow change across three files plus the edge function.

---

## Architecture

```mermaid
sequenceDiagram
    participant User
    participant GearQuizPage
    participant Supabase DB
    participant EdgeFunction as gear-quiz-analysis (Deno)
    participant OpenAI
    participant QuizResults

    User->>GearQuizPage: Submits quiz (step 6)
    GearQuizPage->>Supabase DB: SELECT id,name,description,suitable_skill_level,<br/>price_per_day,location_lat,location_lng,location_address<br/>WHERE category=? AND status='available' AND visible_on_map=true
    Supabase DB-->>GearQuizPage: dbCandidates[]
    GearQuizPage->>EdgeFunction: { ...quizData, availableGear: dbCandidates[] }
    EdgeFunction->>OpenAI: Prompt includes availableGear list; asks for matchedIds
    OpenAI-->>EdgeFunction: JSON with matchedIds[], recommendations[], advice fields
    EdgeFunction-->>GearQuizPage: { matchedIds, recommendations, personalizedAdvice, ... }
    GearQuizPage->>QuizResults: results={matchedIds,...}, dbCandidates=dbCandidates[]
    QuizResults->>QuizResults: Resolve matchedIds → Equipment objects from dbCandidates
    QuizResults->>User: Render gear cards + mini map
```

The page owns the DB candidates and passes them down as a prop — no second fetch in `QuizResults`.

---

## Components and Interfaces

### New shared types (`src/types/quiz.ts`)

```ts
/** Lightweight DB row sent to the edge function */
export interface GearCandidate {
  id: string;
  name: string;
  description: string;
  suitable_skill_level: string | null;
  price_per_day: number;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
}

/** Shape of the edge function response */
export interface QuizAnalysisResult {
  matchedIds: string[];
  recommendations: QuizRecommendation[];
  personalizedAdvice?: string;
  skillDevelopment?: string;
  locationConsiderations?: string;
}

export interface QuizRecommendation {
  category: string;
  title: string;
  description: string;
  keyFeatures: string[];
  suitableFor: string;
}
```

### `GearQuizPage.tsx` changes

- Add `fetchDbCandidates(category: string): Promise<GearCandidate[]>` — a targeted Supabase query (not `fetchEquipmentFromSupabase`).
- In `submitQuiz()`: call `fetchDbCandidates` first, then pass `availableGear` in the edge function body.
- Store `dbCandidates` in local state (`useState<GearCandidate[]>`).
- Pass `dbCandidates` to `<QuizResults>` as a new prop.

### `QuizResults.tsx` changes

- Accept new props: `dbCandidates: GearCandidate[]` and typed `results: QuizAnalysisResult | null`.
- Remove the `useEffect` that calls `fetchEquipmentFromSupabase` and all related state (`recommendedGear`, `loadingGear`).
- Derive `matchedEquipment: Equipment[]` by mapping `results.matchedIds` → look up in `dbCandidates` → convert to `Equipment` shape.
- Render "Gear Matched for You" section with `CompactEquipmentCard` grid.
- Render `MiniMap` above the grid when at least one matched item has valid coordinates.

### `MiniMap` (inline in `QuizResults.tsx`)

Not a separate file — just a `<div>` wrapper around `<MapComponent>`:

```tsx
<div className="h-80 rounded-lg overflow-hidden mb-4">
  <MapComponent
    initialEquipment={mapItems}
    activeCategory={quizData?.category ?? null}
    interactive={true}
  />
</div>
```

`interactive={true}` so users can pan/zoom. `MapComponent` will enter `isEquipmentDetailMode` on `/gear-quiz` (since `useMatch("/search")` and `useMatch("/explore")` both return null), showing pins without popups — exactly the desired behavior.

### `gear-quiz-analysis` edge function changes

- Extend `QuizData` interface to include `availableGear?: GearCandidate[]`.
- When `availableGear` is non-empty, replace the generic recommendations prompt with a selection prompt that lists the candidates and asks the AI to return `matchedIds`.
- Filter `matchedIds` in the edge function to only include IDs that exist in the provided `availableGear` list before returning.
- When `availableGear` is empty or absent, return `matchedIds: []` and fall back to the existing generic recommendations behavior.

---

## Data Models

### Supabase query in `GearQuizPage`

```ts
const { data, error } = await supabase
  .from("equipment")
  .select("id, name, description, suitable_skill_level, price_per_day, location_lat, location_lng, location_address")
  .eq("category", category)
  .eq("status", "available")
  .eq("visible_on_map", true);
```

This is a targeted query — not `fetchEquipmentFromSupabase` which fetches all equipment with full joins and image processing.

### Edge function request body

```ts
{
  // existing fields
  category: string;
  height: string;
  weight: string;
  age: string;
  sex: string;
  skillLevel: string;
  locations: string;
  currentGear: string;
  additionalNotes: string;
  // new field
  availableGear: GearCandidate[];  // may be empty array
}
```

### Edge function response

```ts
{
  matchedIds: string[];           // IDs from availableGear, filtered to valid only
  recommendations: QuizRecommendation[];
  personalizedAdvice?: string;
  skillDevelopment?: string;
  locationConsiderations?: string;
}
```

### Converting `GearCandidate` → `Equipment` in `QuizResults`

`GearCandidate` is a raw DB row. To pass items to `CompactEquipmentCard` and `MapComponent`, we need `Equipment` shape. The conversion is done inline in `QuizResults` using the matched candidates:

```ts
const matchedEquipment: Equipment[] = (results?.matchedIds ?? [])
  .map(id => dbCandidates.find(c => c.id === id))
  .filter((c): c is GearCandidate => c !== undefined)
  .map(c => ({
    id: c.id,
    name: c.name,
    category: quizData?.category ?? "",
    description: c.description,
    price_per_day: c.price_per_day,
    location: {
      lat: c.location_lat ?? 0,
      lng: c.location_lng ?? 0,
      address: c.location_address ?? "",
    },
    // safe defaults for required Equipment fields not in GearCandidate
    image_url: "",
    rating: 0,
    review_count: 0,
    distance: 0,
    owner: { id: "", name: "", imageUrl: "", rating: 0, reviewCount: 0, responseRate: 0 },
    specifications: { size: "", weight: "", material: "", suitable: c.suitable_skill_level ?? "" },
    availability: { available: true },
  }));
```

The `MapComponent` `initialEquipment` prop only needs `{ id, name, category, price_per_day, location: { lat, lng }, ownerId, ownerName }`, so the safe defaults are sufficient.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: DB candidates are category-scoped

*For any* quiz submission with a selected category, every item in the `dbCandidates` array returned by `fetchDbCandidates` must have a `category` field equal to the selected category.

**Validates: Requirements 1.1**

---

### Property 2: matchedIds are a subset of availableGear IDs

*For any* edge function response, every ID in `matchedIds` must appear in the `availableGear` array that was sent in the request. No hallucinated IDs may appear in the output.

**Validates: Requirements 2.2, 2.5**

---

### Property 3: Empty availableGear yields empty matchedIds

*For any* quiz submission where `availableGear` is an empty array, the edge function response must contain an empty `matchedIds` array.

**Validates: Requirements 2.3, 1.3**

---

### Property 4: Matched equipment resolution round-trip

*For any* non-empty `matchedIds` array and corresponding `dbCandidates`, resolving each ID to a `GearCandidate` and then reading back the `id` field must return the original ID — no items are lost or reordered beyond what was in `matchedIds`.

**Validates: Requirements 3.1**

---

### Property 5: Mini map items have valid coordinates

*For any* set of `matchedEquipment` passed to `MapComponent`, only items where both `location.lat !== 0` and `location.lng !== 0` (i.e., the original `location_lat` and `location_lng` were non-null) should be included in the `initialEquipment` prop.

**Validates: Requirements 4.1, 4.5**

---

### Property 6: Advice fields are preserved

*For any* edge function response, the fields `personalizedAdvice`, `skillDevelopment`, and `locationConsiderations` must be present in the response regardless of whether `availableGear` is empty or non-empty.

**Validates: Requirements 2.4, 3.5**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Supabase query for DB candidates fails | `fetchDbCandidates` throws; `submitQuiz` catches, shows toast "Failed to analyze your quiz. Please try again.", does not call edge function |
| DB candidates query returns empty array | Pass `availableGear: []` to edge function; `QuizResults` shows "No matching gear found in our current inventory" |
| Edge function returns `matchedIds` with IDs not in `dbCandidates` | Edge function filters them out before returning; client-side resolution also silently drops unknown IDs |
| Edge function returns empty `matchedIds` | `QuizResults` shows empty-state message, still shows advice cards |
| All matched items have null coordinates | Mini map is not rendered; gear cards still shown |
| OpenAI API error | Existing fallback in edge function applies; `matchedIds: []` returned |

---

## Testing Strategy

### Unit tests

Focus on the pure conversion and filtering logic:

- `fetchDbCandidates` returns only items matching the given category (mock Supabase client).
- `matchedIds` filtering in the edge function removes IDs not present in `availableGear`.
- The `GearCandidate` → `Equipment` mapping produces correct `location` fields from `location_lat`/`location_lng`.
- `QuizResults` renders the empty-state message when `matchedIds` is empty.
- `QuizResults` does not render `MapComponent` when all matched items have null coordinates.

### Property-based tests

Use [fast-check](https://github.com/dubzzz/fast-check) (already available in the JS ecosystem; add as dev dependency if not present).

Each property test runs a minimum of 100 iterations.

**Property 1 — DB candidates are category-scoped**
```
// Feature: gear-quiz-db-results, Property 1: DB candidates are category-scoped
fc.assert(fc.asyncProperty(
  fc.string(), // random category
  async (category) => {
    const candidates = await fetchDbCandidates(category); // mock returns mixed categories
    return candidates.every(c => c.category === category);
  }
), { numRuns: 100 });
```

**Property 2 — matchedIds are a subset of availableGear IDs**
```
// Feature: gear-quiz-db-results, Property 2: matchedIds are a subset of availableGear IDs
fc.assert(fc.property(
  fc.array(fc.record({ id: fc.uuid(), name: fc.string() })),
  fc.array(fc.uuid()),
  (availableGear, rawMatchedIds) => {
    const validIds = new Set(availableGear.map(g => g.id));
    const filtered = filterMatchedIds(rawMatchedIds, validIds);
    return filtered.every(id => validIds.has(id));
  }
), { numRuns: 100 });
```

**Property 3 — Empty availableGear yields empty matchedIds**
```
// Feature: gear-quiz-db-results, Property 3: Empty availableGear yields empty matchedIds
fc.assert(fc.property(
  fc.array(fc.uuid()), // any raw AI output
  (rawMatchedIds) => {
    const filtered = filterMatchedIds(rawMatchedIds, new Set());
    return filtered.length === 0;
  }
), { numRuns: 100 });
```

**Property 4 — Matched equipment resolution round-trip**
```
// Feature: gear-quiz-db-results, Property 4: Matched equipment resolution round-trip
fc.assert(fc.property(
  fc.array(fc.record({ id: fc.uuid(), name: fc.string() /* ...other fields */ })),
  (candidates) => {
    const ids = candidates.map(c => c.id);
    const resolved = ids
      .map(id => candidates.find(c => c.id === id))
      .filter(Boolean);
    return resolved.map(c => c!.id).join(',') === ids.join(',');
  }
), { numRuns: 100 });
```

**Property 5 — Mini map items have valid coordinates**
```
// Feature: gear-quiz-db-results, Property 5: Mini map items have valid coordinates
fc.assert(fc.property(
  fc.array(fc.record({
    id: fc.uuid(),
    location_lat: fc.option(fc.float()),
    location_lng: fc.option(fc.float()),
  })),
  (candidates) => {
    const mapItems = toMapItems(candidates); // function under test
    return mapItems.every(item => item.location.lat !== 0 && item.location.lng !== 0);
  }
), { numRuns: 100 });
```

**Property 6 — Advice fields are preserved**
```
// Feature: gear-quiz-db-results, Property 6: Advice fields are preserved
fc.assert(fc.property(
  fc.array(fc.record({ id: fc.uuid() })), // any availableGear
  (availableGear) => {
    const result = buildEdgeFunctionResponse(availableGear, mockAiOutput);
    return 'personalizedAdvice' in result
      && 'skillDevelopment' in result
      && 'locationConsiderations' in result;
  }
), { numRuns: 100 });
```
