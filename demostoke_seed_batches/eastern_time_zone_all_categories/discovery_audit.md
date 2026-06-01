# Discovery Audit - Eastern Time Zone All Categories

Batch slug: `eastern_time_zone_all_categories`
Created: 2026-05-30
Status: local files only, not applied to linked Supabase

## Scope

- Region/market: United States Eastern Time Zone states, across official-source candidates found during this pass.
- Categories: `surfboards`, `skis`, `snowboards`, `mountain-bikes`.
- Minimum qualification level: public official rental/demo evidence with model-level brand and model names plus public prices.
- Duplicate guard: candidate shop names, websites, and seed emails were checked against the linked DB before file creation. No accepted candidate was already present by candidate name or website.

## Accepted Shops

### Belleayre Mountain - Highmount, NY

- Categories: `skis`, `snowboards`
- Source: https://www.belleayre.com/tickets/high-performance-demos/
- Address source: https://www.belleayre.com/plan-your-visit/directions/
- Evidence: official high-performance demos page lists Rossignol ski models, Burton snowboard models, demo prices, and available sizes.
- Coordinates: OpenStreetMap/Nominatim place match for Belleayre Mountain Ski Center at 181 Galli Curci Road.
- Seed email: `michaelzick+belleayremountainhighmount@gmail.com`
- Gear count: 5 skis, 2 snowboards

### Highland Mountain Bike Park - Northfield, NH

- Category: `mountain-bikes`
- Source: https://highlandmountain.com/explore-highland/rentals-demos/rentals/
- Evidence: official rental page lists Santa Cruz, Specialized, Giant, and Norco model-level rental bikes with full-day and half-day rates.
- Coordinates: US Census Geocoder street-address/range match for 75 Ski Hill Drive.
- Seed email: `michaelzick+highlandmountainbikeparknorthfield@gmail.com`
- Gear count: 8 mountain bikes

### Thunder Mountain Bike Park - Charlemont, MA

- Category: `mountain-bikes`
- Source: https://berkshireeast.com/summer/thunder-mountain-bike-park/bike-rentals?id=37
- Evidence: official Berkshire East / Thunder Mountain page lists Scott, Santa Cruz, Transition, Yeti, and Rocky Mountain model-level bikes with full-day and half-day rates.
- Coordinates: US Census Geocoder street-address/range match for 66 Thunder Mountain Road.
- Seed email: `michaelzick+thundermountainbikeparkcharlemont@gmail.com`
- Gear count: 8 mountain bikes

### Ride Kanuga - Hendersonville, NC

- Category: `mountain-bikes`
- Source: https://ridekanuga.com/rentals/
- Evidence: official rental page lists Specialized Turbo Levo e-bike models, prices, and available sizes.
- Coordinates: US Census Geocoder street-address/range match for 1249 Kanuga Lake Road.
- Seed email: `michaelzick+ridekanugahendersonville@gmail.com`
- Gear count: 3 mountain bikes

### REAL Watersports - Waves, NC

- Category: `surfboards`
- Sources:
  - https://www.realwatersports.com/blogs/news/firewire-fleets-at-real
  - https://www.firewiresurfboards.com/pages/prestige-firewire-fleets
- Evidence: official REAL and Firewire Fleets pages list Firewire model names, size/volume ranges, day and week rates, address, and phone.
- Coordinates: OpenStreetMap/Nominatim place match for REAL Watersports in Waves.
- Seed email: `michaelzick+realwatersportswaves@gmail.com`
- Gear count: 5 surfboards

### Warm Winds Surf Shop - Narragansett, RI

- Category: `surfboards`
- Source: https://www.warmwinds.com/surfboard-rentals
- Evidence: official rental page lists Firewire Fleets current stock and day/multi-day rates.
- Coordinates: US Census Geocoder street-address/range match for 26 Kingstown Road.
- Seed email: `michaelzick+warmwindssurfshopnarragansett@gmail.com`
- Gear count: 3 surfboards

### Cinnamon Rainbows Surf Co. - North Hampton, NH

- Category: `surfboards`
- Sources:
  - https://www.cinnamonrainbows.com/demos
  - https://www.firewiresurfboards.com/pages/prestige-firewire-fleets
- Evidence: official demo page lists model-level demo boards and $50 day demo price; Firewire Fleets locator confirms address and phone.
- Coordinates: US Census Geocoder street-address/range match for 62 Lafayette Road.
- Seed email: `michaelzick+cinnamonrainbowsnorthhampton@gmail.com`
- Gear count: 6 surfboards

## Migration Files

- `supabase/migrations/20260530120000_seed_eastern_time_zone_all_categories_shops.sql`
- `supabase/migrations/20260530120100_seed_eastern_time_zone_surfboards_gear.sql`
- `supabase/migrations/20260530120200_seed_eastern_time_zone_skis_gear.sql`
- `supabase/migrations/20260530120300_seed_eastern_time_zone_snowboards_gear.sql`
- `supabase/migrations/20260530120400_seed_eastern_time_zone_mountain_bikes_gear.sql`

## Expected Insert Counts

- Shops/users: 7
- Surfboards: 14
- Skis: 5
- Snowboards: 2
- Mountain bikes: 19
- Equipment images: 80 total if all gear rows are new

## Notes

- The linked DB already contains Eastern Time Zone shops in Vermont, Florida, New York, and New Jersey. Existing names and websites were treated as exclusions.
- Some model names were normalized to ASCII-safe SQL text while preserving the public model identity, for example `Rossignol Forza 70 V-Ti`.
- Surfboard lengths and volumes were kept in descriptions or source evidence, not in the `size` column, to preserve the current seed-data size rule.
