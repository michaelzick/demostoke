# Scroll to Top Button Test Plan

## Overview
This test plan verifies the scroll to top button functionality implemented on the following pages:
- `/search` page (SearchResultsPage)
- `/explore` page (ExplorePage) 
- `/profile/{slug}` page (RealUserProfilePage)
- `/my-gear` page (MyEquipmentPage)
- HybridView component (used by search and explore pages)

## Test Scenarios

### 1. Search Results Page (`/search`)

#### Test Case 1.1: List View
1. Navigate to `/search` 
2. Enter search query and submit
3. Switch to "List" view mode
4. Scroll down the page past 300px
5. **Expected**: Scroll to top button appears in bottom-left corner
6. Click the scroll to top button
7. **Expected**: Page smoothly scrolls to the top

#### Test Case 1.2: Hybrid View - Desktop
1. Navigate to `/search` on desktop (screen width > 1024px)
2. Enter search query and submit
3. Ensure "Hybrid" view mode is selected
4. Scroll down the equipment list on the left side
5. **Expected**: Scroll to top button appears when equipment list is scrolled past 200px
6. Click the scroll to top button
7. **Expected**: Equipment list smoothly scrolls to the top (map is unaffected)

#### Test Case 1.3: Hybrid View - Mobile
1. Navigate to `/search` on mobile (screen width < 1024px)
2. Enter search query and submit
3. Ensure "Hybrid" view mode is selected
4. Scroll down the equipment list below the map
5. **Expected**: Scroll to top button appears when list is scrolled past 200px
6. Click the scroll to top button
7. **Expected**: Equipment list smoothly scrolls to the top (map is unaffected)

#### Test Case 1.4: Map View
1. Navigate to `/search`
2. Switch to "Map" view mode
3. **Expected**: No scroll to top button should appear (only map is visible)

### 2. Explore Page (`/explore`)

#### Test Case 2.1: List View
1. Navigate to `/explore`
2. Switch to "List" view mode
3. Scroll down the page past 300px
4. **Expected**: Scroll to top button appears in bottom-left corner
5. Click the scroll to top button
6. **Expected**: Page smoothly scrolls to the top

#### Test Case 2.2: Hybrid View - Desktop
1. Navigate to `/explore` on desktop
2. Ensure "Hybrid" view mode is selected
3. Scroll down the equipment list on the left side
4. **Expected**: Scroll to top button appears when equipment list is scrolled past 200px
5. Click the scroll to top button
6. **Expected**: Equipment list smoothly scrolls to the top (map is unaffected)

#### Test Case 2.3: Hybrid View - Mobile
1. Navigate to `/explore` on mobile
2. Ensure "Hybrid" view mode is selected
3. Scroll down the equipment list below the map
4. **Expected**: Scroll to top button appears when list is scrolled past 200px
5. Click the scroll to top button
6. **Expected**: Equipment list smoothly scrolls to the top (map is unaffected)

### 3. User Profile Page (`/profile/{slug}`)

#### Test Case 3.1: Profile Page Scroll
1. Navigate to any user profile page
2. Scroll down the page past 300px
3. **Expected**: Scroll to top button appears in bottom-left corner
4. Click the scroll to top button
5. **Expected**: Page smoothly scrolls to the top

#### Test Case 3.2: Own Profile Edit Mode
1. Navigate to your own profile page
2. Click "Edit Profile" button
3. Scroll down the edit form past 300px
4. **Expected**: Scroll to top button appears in bottom-left corner
5. Click the scroll to top button
6. **Expected**: Page smoothly scrolls to the top

### 4. My Equipment Page (`/my-gear`)

#### Test Case 4.1: Equipment Tab
1. Navigate to `/my-gear`
2. Ensure "Equipment" tab is selected
3. Scroll down the page past 300px
4. **Expected**: Scroll to top button appears in bottom-left corner
5. Click the scroll to top button
6. **Expected**: Page smoothly scrolls to the top

#### Test Case 4.2: Analytics Tab
1. Navigate to `/my-gear`
2. Switch to "Analytics" tab
3. Scroll down the page past 300px
4. **Expected**: Scroll to top button appears in bottom-left corner
5. Click the scroll to top button
6. **Expected**: Page smoothly scrolls to the top

## Visual Verification

### Button Appearance
- Button should be positioned at `bottom-6 left-6` (24px from bottom and left edges)
- Button should be circular with `w-12 h-12` dimensions
- Button should have a white background with primary color icon
- Button should have shadow (`shadow-lg`) and hover shadow (`hover:shadow-xl`)
- Button should use the `ArrowUp` icon from lucide-react

### Animation Behavior
- Button should fade in/out with `opacity` transition
- Button should slide up/down with `translateY` transition
- Transition duration should be `300ms`
- When hidden, button should have `pointer-events-none`

### Scroll Behavior
- Scroll should be smooth (`behavior: 'smooth'`)
- For container scrolling (hybrid views), only the specific container should scroll
- For window scrolling (list views, profile pages), the entire page should scroll

## Browser Compatibility
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility
- Button should be keyboard accessible
- Button should have appropriate ARIA labels
- Button should work with screen readers

## Performance
- Scroll event listeners should be properly cleaned up
- No memory leaks should occur when navigating between pages
- Button visibility state should update smoothly without performance issues