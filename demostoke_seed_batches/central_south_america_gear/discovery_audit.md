# Central and South America Gear Discovery Audit

Status: local pending. These migrations have not been applied to the linked DemoStoke Supabase project.

Created: 2026-06-06

Branch: `codex/central-south-america-gear-seeds`

## Scope

The user requested a `demostoke-gear-adder` run for all qualifying mountain-bike, surf, ski, and snowboard shops in Central and South America, with Hermes files updated as well.

This batch adds seven non-duplicate shops and 74 planned gear rows:

| Region | Shop | Category | Planned gear |
| --- | --- | --- | ---: |
| Guatemala | MTB Guatemala | mountain-bikes | 9 |
| Costa Rica | Bike Arenal | mountain-bikes | 3 |
| Costa Rica | Nosara MTB | mountain-bikes | 4 |
| Costa Rica | Buen Camino Bike Park | mountain-bikes | 1 |
| Panama | Line Up Surf Shop | surfboards | 22 |
| Panama | Santa Catalina Surf Shop | surfboards | 2 |
| El Salvador | Sunzal Surf Company | surfboards | 33 |
| **Total** | | | **74** |

No ski or snowboard shop passed the seed criteria during this pass. The ski/snowboard pages found were package-level, brand-only, price-only, or aggregator pages without public model-level rentable inventory.

## Duplicate Checks

Read-only linked DB checks must be run before remote execution. During authoring, the target batch was checked against the known live seed registry and existing linked seed summary; no existing Central or South America shops overlapped this batch. Existing Mexico shops (`Surf Mexico` and `BikeFlow Oaxaca`) are North America coverage rows and were not re-seeded.

Representative linked DB query:

```sql
SELECT p.name, p.website, p.address, u.email, COUNT(DISTINCT e.id) AS gear_count
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
LEFT JOIN public.equipment e ON e.user_id = p.id
WHERE lower(p.name) IN (
  'mtb guatemala',
  'bike arenal',
  'nosara mtb',
  'buen camino bike park',
  'line up surf shop',
  'santa catalina surf shop',
  'sunzal surf company'
)
OR lower(coalesce(u.email, '')) IN (
  'michaelzick+mtbguatemala@gmail.com',
  'michaelzick+bikearenal@gmail.com',
  'michaelzick+nosaramtb@gmail.com',
  'michaelzick+buencamino@gmail.com',
  'michaelzick+lineuptrade@gmail.com',
  'michaelzick+santacatalinasurfshop@gmail.com',
  'michaelzick+sunzalsurfcompany@gmail.com'
)
OR lower(coalesce(p.website, '')) LIKE '%mtbguatemala.com%'
OR lower(coalesce(p.website, '')) LIKE '%bikearenal.com%'
OR lower(coalesce(p.website, '')) LIKE '%nosaramtb.com%'
OR lower(coalesce(p.website, '')) LIKE '%buencaminocr.com%'
OR lower(coalesce(p.website, '')) LIKE '%lineuptrade.com%'
OR lower(coalesce(p.website, '')) LIKE '%santacatalinasurfshop.com%'
OR lower(coalesce(p.website, '')) LIKE '%sunzal.com%'
GROUP BY p.name, p.website, p.address, u.email
ORDER BY p.name;
```

Expected before apply: `rows: []`.

## Accepted Sources

### MTB Guatemala

- Official rental catalog: `https://www.mtbguatemala.com/product-category/mountain-bike-rentals/`
- Official Tecpan tour/contact page: `https://www.mtbguatemala.com/tours/tecpan-enduro-mtb-day-rides/`
- Evidence: official catalog lists Commencal and Giant model-level mountain-bike rentals with USD daily pricing.
- Accepted gear: Commencal T.E.M.P.O, Commencal META TR Premium, Commencal T.E.M.P.O Premium, Commencal Meta TR 29, Commencal Meta AM 29, Commencal Meta Power 29, Giant Trance E+ 2 Pro, Giant Talon 29er, Giant Trance 27.5.
- Location basis: official Tecpan text and mapped Tecpan base coordinates.

### Bike Arenal

- Official rental page: `https://www.bikearenal.com/bike-rentals/`
- Official contact page: `https://www.bikearenal.com/contact/`
- Evidence: official page lists Cannondale Rush, Depro M2 Carbon Fiber, and Scott Scale model-level mountain-bike rentals at 65 USD per day.
- Accepted gear: Cannondale Rush 27.5, Depro M2 Carbon Fiber 29, Scott Scale 980.
- Location basis: official La Fortuna address and embedded map coordinate.

### Nosara MTB

- Official rental page: `https://nosaramtb.com/rentals/`
- Evidence: official page lists Specialized and Rocky Mountain model-level mountain-bike rentals with day and week USD pricing.
- Accepted gear: Specialized Turbo Levo SL, Rocky Mountain Growler Power Play, Rocky Mountain Instinct A50, Rocky Mountain Fusion 10.
- Location basis: official Gilded Iguana Athletic Center address; coordinates are approximate to Playa Guiones north.

### Buen Camino Bike Park

- Official ride/rental page: `https://buencaminocr.com/es/ride/`
- Evidence: official page lists Specialized Turbo Levo rentals in all sizes at 130 USD and provides WhatsApp, email, operating hours, and physical location.
- Accepted gear: Specialized Turbo Levo.
- Location basis: official Finca Ecologica El Bosque map link and San Mateo address.

### Line Up Surf Shop

- Official rental page: `https://lineuptrade.com/en/pages/alquiler-de-tablas`
- Official contact page: `https://lineuptrade.com/en/pages/contact`
- Evidence: official page lists surfboards at 22 USD daily and 110 USD weekly, then publishes a model-level board inventory.
- Accepted gear: Tahe Sports Paint Easy 8'6 Soft Top, Tahe Sports Paint Easy 7'6 Soft Top, Tahe Sports Paint Soft Top 8'0, Tahe Sports Paint Soft Top 7'0, Tahe Sports Paint Soft Top 6'0, Tahe Sports Meteor 7'10 Soft Top, SIC Darkhorse Vortex Foam 8'4, SIC Darkhorse Vortex Foam 7'4, SIC Darkhorse Vortex Foam 5'8, Tahe Sports Magnum Duratec 8'4, BIC Sports Malibu Duratec 7'9, Tahe Sports Mini Longboard Duratec 7'6, Tahe Sports Egg Duratec 7'0, Tahe Sports Shortboard Duratec 6'7, BIC Gerard Dabadie Fish 5'10, Tahe Sports Comet 7'8, Tahe Sports Comet 6'6, Torq Surfboards Funboard 8'2, Torq Surfboards Funboard 6'8, Torq Surfboards Fish 6'3, Safari Surfboards Logger 9'4, Safari Surfboards Goose 9'2.
- Location basis: official Plaza Las Lajas contact address and map link.

### Santa Catalina Surf Shop

- Official home/catalog page: `https://www.santacatalinasurfshop.com/`
- Official contact page: `https://www.santacatalinasurfshop.com/en/contact/`
- Evidence: official page lists rent availability and daily USD prices for individual surfboard models.
- Accepted gear: Lost/Mayhem Scorcher Model, Xanadu X21.
- Location basis: official Estero Street, Hotel Santa Catalina address.

### Sunzal Surf Company

- Official rental page: `https://www.sunzal.com/things-to-do/surf-board-rentals/`
- Evidence: official page states rates are in USD and exposes model-level surfboard gallery entries with per-board prices.
- Accepted gear: Tomo Boss Up, Takayama In The Pink, Gerry Lopez Something Fishy, Lost Party Crasher, Lost Quiver Killer, DANC Funboard, Terry 9/3 Noserider Longboard, Torq 8'6 Longboard, Album Dark Arts, Paragon Retro Noserider, Free Movement Flying Pig, Xanadu Wave Rocket, Robert August What I Ride Mini, Lost Puddle Fish, Lost Short Round, Robert August What I Ride, Lost Sub Buggy, Lost V3 Rocket 5'8, Byrne Custom 6'6, Free Movement G-45, Doug Haut Funboard, Azteca Blue Beach, Sharpeyes Disco Inferno, Mick Fanning Sugar Glider, JS Factory Hyfi, Byrne Panda, Mick Fanning Even Flow, Sina Egg, Webber AfterBurner, Lost Weekend Warrior, Lost F1 5'10, Lost V3 Rocket 6'0, Del Ray Fish.
- Location basis: official rental-page location/map copy for Balance/Roca Sunzal in El Tunco.

## Data Rules Applied

- No shop already present in the linked DemoStoke DB or seeded registry was intentionally re-seeded.
- Only public model-level gear rows with public pricing were added.
- Generic rentals, package/tier rows, brand-only rows, and aggregator-only pages were rejected.
- Gear rows are category-homogeneous by migration.
- Each gear row has two canonical category placeholder images.
- `public.equipment.specs` is never referenced.
- `size` contains only size names when used. Board lengths and bike wheel dimensions stay in the gear name or description prose.
- `currency_code` is set on every row. All accepted source prices were published in USD.
- SQL is idempotent by user email and `(user_id, category, lower(trim(name)))`.
- These files are local-only until a human explicitly approves remote execution.
