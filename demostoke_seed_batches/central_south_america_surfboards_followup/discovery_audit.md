# Central and South America Surfboards Follow-Up Discovery Audit

Status: applied to the linked DemoStoke Supabase project on 2026-06-07 after a rollback dry run succeeded.

Created: 2026-06-07

Branch: `codex/central-south-america-gear-seeds`

## Scope

The user pointed to Sunzal Surf Company's itemized surfboard rental page and asked to add that shop/gear and look for other similar parseable pages.

Sunzal Surf Company was already seeded and applied in the Central and South America batch with 33 surfboards, including the user's examples `Tomo Boss Up` and `Takayama In The Pink`. This follow-up adds three additional defensible Sunzal board rows from the same official page and one newly discovered qualifying Costa Rica surf shop:

| Region | Shop | Category | Planned new gear |
| --- | --- | --- | ---: |
| El Salvador | Sunzal Surf Company | surfboards | 3 |
| Costa Rica | Nosara Surfboards | surfboards | 9 |
| **Total** | | | **12** |

## Duplicate Checks

Read-only linked DB checks before authoring found:

- Sunzal Surf Company exists with 33 current surfboard rows.
- `Tomo Boss Up` and `Takayama In The Pink` already exist for Sunzal.
- `Hypto Krypto`, `Barahona 9'0`, and `Sci-Fi Volume LFT` do not exist for Sunzal.
- Nosara Surfboards does not exist by profile name, seed email, or target website in the linked DB.

Representative linked DB query:

```sql
SELECT au.email, pr.name, pr.address, COUNT(e.id)::int AS gear_count
FROM auth.users au
LEFT JOIN public.profiles pr ON pr.id = au.id
LEFT JOIN public.equipment e ON e.user_id = au.id
WHERE lower(coalesce(pr.name, '')) IN (lower('Nosara Surfboards'), lower('Sunzal Surf Company'))
   OR au.email IN ('michaelzick+nosarasurfboards@gmail.com', 'michaelzick+sunzalsurfcompany@gmail.com')
GROUP BY au.email, pr.name, pr.address
ORDER BY pr.name;
```

Expected before apply: one Sunzal row and no Nosara Surfboards row.

## Accepted Sources

### Sunzal Surf Company

- Official rental page: `https://www.sunzal.com/things-to-do/surf-board-rentals/`
- Evidence: the official page states all rates are in USD and exposes individual gallery blocks with a board name, supporting board/detail images, and a per-board price.
- Already applied examples from this page: Tomo Boss Up, Takayama In The Pink.
- Follow-up accepted gear: Hypto Krypto, Barahona 9'0, Sci-Fi Volume LFT.
- Location basis: existing applied Sunzal profile at Hotel Roca Sunzal, El Tunco, La Libertad, El Salvador.

### Nosara Surfboards

- Home / featured fleet: `https://nosarasurfboards.com/`
- Surfboard collection: `https://nosarasurfboards.com/collections/all`
- Rentals page: `https://nosarasurfboards.com/pages/rentals`
- Contact page: `https://nosarasurfboards.com/pages/contact`
- Contact policy: `https://nosarasurfboards.com/policies/contact-information`
- Evidence: the official Shopify storefront describes premium surfboard rentals, says rentals are for a minimum of one day, lists product-level surfboard pages with USD prices, and publishes physical pickup/contact details for Become Nosara near Guiones Beach.
- Accepted gear: Sharpeye FT Inferno Carbon 5'10, Sharpeye Inferno 72 Carbon 5'10, Firewire Slater Designs S Boss Volcano I-Bolic 6'0, Pyzel Ghost XL 6'2, Firewire Slater Designs S Boss Turquoise I-Bolic 6'2, Sharpeye Mid Length 6'6, Chilli Mid Strength 7'0, Lost Glydra 7'0, Channel Islands CI 2 Pro 5'10.
- Location basis: official contact page and contact policy place the shop at Become Nosara, B34, 50206 Nosara, Guanacaste, Costa Rica. Coordinates are approximate to the Become Nosara / Playa Guiones area.

## Data Rules Applied

- The already-applied Sunzal shop profile is reused; it is not re-seeded.
- Nosara Surfboards uses a new guarded seed email: `michaelzick+nosarasurfboards@gmail.com`.
- Only public itemized surfboard rows with public USD pricing were added.
- Generic rentals, package/tier rows, brand-only rows, sales-only pages, and outside-region pages were rejected.
- Each gear row has two canonical surfboard placeholder images from `AGENTS.md`.
- `public.equipment.specs` is never referenced.
- `size` is left null; board dimensions stay in description prose.
- `currency_code` is set to `USD` on every row because the accepted source prices are published in USD.
- SQL is idempotent by user email and `(user_id, category, lower(trim(name)))`.
- Remote execution completed on 2026-06-07 with rollback dry run, commit transaction, read-only validation, idempotency rollback, and migration-history repair.
