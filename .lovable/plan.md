

## Enhance User Directory: Collapsible, Paginated, and Improved Search

### Changes to `src/components/admin/UserDirectorySection.tsx`

**1. Collapsible toggle (contracted by default)**
- Wrap the card content in a `Collapsible` (from `@radix-ui/react-collapsible`, already installed)
- Add a chevron toggle button in the `CardHeader` next to the title
- Default state: `open = false` (collapsed)

**2. Pagination (25 rows per page)**
- Add `currentPage` state (starts at 1)
- Slice the filtered results to show only rows `(page-1)*25` through `page*25`
- Show page controls (Previous / Next buttons + "Page X of Y" label) below the table
- Reset to page 1 whenever the search query changes

**3. Search across all pages**
- Already works this way -- filtering happens before pagination, so a name on "page 3" will appear when searched

**4. Clear Search button**
- Add a "Clear" button to the right of the search input
- Only visible when the search field is non-empty
- Clears the search text and resets to page 1

### Technical Details

| Element | Implementation |
|---------|---------------|
| Collapsible | `Collapsible` + `CollapsibleTrigger` + `CollapsibleContent` from existing `@/components/ui/collapsible` |
| Toggle icon | `ChevronDown` / `ChevronUp` from lucide-react |
| Pagination state | `const [currentPage, setCurrentPage] = useState(1)` reset on search change via `useEffect` |
| Page slice | `filtered.slice((currentPage - 1) * 25, currentPage * 25)` |
| Clear button | `X` icon button, calls `setSearch("")` and `setCurrentPage(1)` |

Only one file is modified: `src/components/admin/UserDirectorySection.tsx`

