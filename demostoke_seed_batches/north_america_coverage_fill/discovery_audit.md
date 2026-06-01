# North America Coverage Fill Discovery Audit

Status: local preparation only. These migrations have not been pushed, applied, or deployed to the linked DemoStoke Supabase project.

Created: 2026-06-01

Branch: `codex/north-america-gear-coverage`

## Scope

The user requested a Hermes `demostoke-gear-adder` run for Alaska, Mexico, remaining mainland U.S. coverage, and Canada, with no duplicate shops and all four supported categories represented across North America.

This batch adds six non-duplicate shops and 37 planned gear rows:

| Region | Shop | Category | Planned gear |
| --- | --- | --- | ---: |
| Mexico | Surf Mexico | surfboards | 8 |
| Mexico | BikeFlow Oaxaca | mountain-bikes | 5 |
| Alaska | Bike Denali | mountain-bikes | 1 |
| Canada | Dismount Bike Shop | mountain-bikes | 3 |
| Mainland U.S. | Willi's Ski and Board Seven Springs | skis | 10 |
| Mainland U.S. | Tactics Bend | snowboards | 10 |

## Duplicate Checks

Read-only linked DB checks were run before authoring migrations. The selected shops returned zero existing `public.profiles` matches by shop name, website, and key domain fragments.

Representative linked DB query:

```sql
SELECT p.name, p.website, p.address, u.email, COUNT(DISTINCT e.id) AS gear_count
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
LEFT JOIN public.equipment e ON e.user_id = p.id
WHERE lower(p.name) IN (
  'surf mexico',
  'bikeflow oaxaca',
  'bike flow oaxaca',
  'bike denali',
  'dismount bike shop',
  'willi''s ski and board seven springs',
  'tactics bend'
)
OR lower(coalesce(p.website, '')) LIKE '%surfmexico.com%'
OR lower(coalesce(p.website, '')) LIKE '%bikeflow.com.mx%'
OR lower(coalesce(p.website, '')) LIKE '%bikedenali.com%'
OR lower(coalesce(p.website, '')) LIKE '%dismount-bike-shop%'
OR lower(coalesce(p.website, '')) LIKE '%willisskiandboard.com%'
OR lower(coalesce(p.website, '')) LIKE '%tactics.com/info/bend%'
GROUP BY p.name, p.website, p.address, u.email
ORDER BY p.name;
```

Result: `rows: []`.

## Accepted Sources

### Surf Mexico

- Official rental page: `https://www.surfmexico.com/surfboards-rentals/`
- Evidence: official page lists pickup/contact details, standard surfboards at 700 MXN per day and 3000 MXN per week, and high-performance surfboards at 800 MXN per day and 3500 MXN per week.
- Accepted gear: Walden Magic, Walden Magic Blue Dark, Walden Magic Blue, NSP Protech Fish, NSP Protech Tinder-D8, Walden Mini Mega Magic Tuflite, Channel Islands Water, Robert August What I Ride.
- Location basis: official address plus official Google Maps redirect for Surf Mexico.

### BikeFlow Oaxaca

- Official rental page: `https://bikeflow.com.mx/bike-rental/`
- Evidence: official page lists Trek Marlin, Specialized Rockhopper, Scott Aspect, Cube Access WS EAZ, and Belfort Alom with a 600 MXN 24-hour starting price.
- Accepted gear: Trek Marlin, Specialized Rockhopper, Scott Aspect, Cube Access WS EAZ, Belfort Alom.
- Location basis: official address; coordinate approximated from the mapped Martires de Tacubaya street center because exact rooftop geocoding did not resolve.

### Bike Denali

- Official mountain-bike page: `https://bikedenali.com/mountain-bikes/`
- Price backup: `https://www.alaska.org/detail/bike-denali`
- Evidence: official page lists Trek Marlin 5 mountain-bike rentals and the Bike Denali address. Alaska.org publishes the single-day Trek Marlin 5 package rate at 85 USD.
- Accepted gear: Trek Marlin 5.
- Location basis: official Mile 238.5 Parks Highway address, aligned to the same milepost area using Denali Princess Wilderness Lodge mapping.

### Dismount Bike Shop

- Official Booqable rental page: `https://dismount-bike-shop.booqableshop.com/`
- Official pricing page: `https://dismount-bike-shop.booqableshop.com/pages/pricing`
- Evidence: rental page lists Norco Fluid FS A2, Norco Bigfoot 2, and Salsa Heyday Advent; pricing page lists bike daily rate at 80 CAD and shop address.
- Accepted gear: Norco Fluid FS A2, Norco Bigfoot 2, Salsa Heyday Advent.
- Location basis: official address and OpenStreetMap result for Dismount at 936 St Clair Ave W.

### Willi's Ski and Board Seven Springs

- Official demo page: `https://www.willisskiandboard.com/pages/seven-springs-demo-skis`
- Official locations page: `https://www.willisskiandboard.com/pages/locations-and-hours`
- Evidence: official demo page lists the 75 USD demo fee and a model-level demo ski fleet. Official locations page lists the Seven Springs shop address and phone.
- Accepted gear: Atomic Maverick 96 CTI, Atomic Maverick 88 CTI, Blizzard Black Pearl 84, Blizzard Anomaly 88, Elan Ripstick 96 Black Edition, Head Supershape e-Rally, Nordica Enforcer 94, Rossignol Arcade 88, Stockli Montero AR, Stockli Nela 88.
- Location basis: official address plus MapQuest coordinate result for 777 Water Wheel Dr.

### Tactics Bend

- Official rental page: `https://www.tactics.com/info/bend-snowboard-rentals-services`
- Address backup: `https://www.mapquest.com/us/oregon/tactics-bend-371161058`
- Evidence: official page lists demo snowboard rental rates, phone, email, and model-level demo fleet. MapQuest lists the Bend store address and phone.
- Accepted gear: Burton 3D Fish, Burton Family Tree Hometown Hero, CAPiTA DOA, CAPiTA Mega Mercury, CAPiTA Mercury, Jones Frontier, Korua Shapes Cafe Racer Classic, Lib Tech Cold Brew C2, Lib Tech T.Rice Orca C2X HP, Ride Warpig.
- Location basis: official Google Maps redirect and OpenStreetMap result for Tactics at 933 NW Wall St.

## Data Rules Applied

- No shop already present in the linked DemoStoke DB was re-seeded.
- Gear rows are category-homogeneous by migration.
- Each gear row has two canonical category placeholder images.
- `public.equipment.specs` is never referenced.
- `size` is left `NULL`; model lengths, volumes, and numbered board/ski sizes stay in the description prose.
- Skill levels use only the sequential approved values.
- SQL is idempotent by user email and `(user_id, category, lower(trim(name)))`.
- These files are local-only until a human explicitly approves remote execution.
