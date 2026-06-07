-- Seed migration: Central and South America surfboard gear
-- Batch: central_south_america_gear
-- Created: 2026-06-06
-- Depends on: 20260606120000_seed_central_south_america_gear_shops.sql
-- Remote status: local only; apply to linked Supabase only after explicit human approval.
-- Image URLs (surfboards): https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg and https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg

DO $seed_migration$
DECLARE
  missing_email text;
  v_equipment_inserted int := 0;
  v_primary_images_added int := 0;
  v_secondary_images_added int := 0;
BEGIN
  SELECT seed_email INTO missing_email
  FROM (
    VALUES
      (E'michaelzick+lineuptrade@gmail.com'),
      (E'michaelzick+santacatalinasurfshop@gmail.com'),
      (E'michaelzick+sunzalsurfcompany@gmail.com')
  ) AS planned(seed_email)
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = planned.seed_email)
  LIMIT 1;

  IF missing_email IS NOT NULL THEN
    RAISE EXCEPTION 'User not found for email: %', missing_email;
  END IF;

  WITH shop_locations (seed_email, location_lat, location_lng, location_address) AS (
    VALUES
      (
        E'michaelzick+lineuptrade@gmail.com',
        8.5468434,
        -79.9119799,
        E'Plaza Las Lajas, first floor, local PA4, Coronado, Panama'
      ),
      (
        E'michaelzick+santacatalinasurfshop@gmail.com',
        7.6289928,
        -81.2528320,
        E'Estero Street, Hotel Santa Catalina, Santa Catalina, Panama'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        13.4933551,
        -89.3849212,
        E'Hotel Roca Sunzal, El Tunco, La Libertad, El Salvador'
      )
  ),
  seed_equipment (seed_email, name, description, price_per_day, price_per_week, suitable_skill_level, subcategory) AS (
    VALUES
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Paint Easy 8''6 Soft Top',
        E'A stable Tahe Sports Paint Easy soft top from Line Up Surf Shop''s Coronado rental catalog. The shop publishes surfboard rentals at 22 USD per day and 110 USD per week.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'soft top'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Paint Easy 7''6 Soft Top',
        E'A Tahe Sports Paint Easy soft top for beginner and progressing surfers at Coronado. Line Up Surf Shop lists this board in its 22 USD daily and 110 USD weekly surfboard rental catalog.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'soft top'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Paint Soft Top 8''0',
        E'An 8-foot Tahe Sports Paint soft top for small-wave lessons and easy paddling. The official Line Up Surf Shop rental page lists surfboards at 22 USD daily and 110 USD weekly.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'soft top'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Paint Soft Top 7''0',
        E'A 7-foot Tahe Sports Paint soft top for approachable beach-break sessions. Line Up Surf Shop publishes this model in its 22 USD daily and 110 USD weekly board rental list.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'soft top'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Paint Soft Top 6''0',
        E'A shorter Tahe Sports Paint soft top for smaller surfers and controlled progression. The Coronado rental catalog lists this board under the 22 USD daily surfboard rate.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'soft top'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Meteor 7''10 Soft Top',
        E'A Tahe Sports Meteor soft top with enough float for easy wave catching. Line Up Surf Shop lists this model in its public surfboard rental inventory.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'soft top'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'SIC Darkhorse Vortex Foam 8''4',
        E'An SIC Darkhorse Vortex Foam board for stable, forgiving Panama sessions. The Line Up Surf Shop catalog lists this surfboard at the shared 22 USD daily rental rate.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'foam surfboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'SIC Darkhorse Vortex Foam 7''4',
        E'A mid-length SIC Darkhorse Vortex Foam board for progressing riders. Line Up Surf Shop lists the model in its Coronado surfboard rental catalog.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'foam surfboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'SIC Darkhorse Vortex Foam 5''8',
        E'A compact SIC Darkhorse Vortex Foam board for smaller riders or controlled surf-school use. The shop publishes this model as part of its priced surfboard rental fleet.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'foam surfboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Magnum Duratec 8''4',
        E'A durable Tahe Sports Magnum Duratec board for high-float cruising and first green waves. Line Up Surf Shop lists this model in its priced board rental catalog.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'malibu'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'BIC Sports Malibu Duratec 7''9',
        E'A BIC Sports Malibu Duratec rental board for forgiving turns and easy paddling. The Coronado shop lists surfboards at 22 USD daily and 110 USD weekly.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'malibu'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Mini Longboard Duratec 7''6',
        E'A Tahe Sports Mini Longboard Duratec for cruisy turns with manageable length. Line Up Surf Shop includes the model in its official surfboard rental list.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'mini longboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Egg Duratec 7''0',
        E'A durable Tahe Sports Egg Duratec for mellow beach-break surf and improving turns. The shop publishes the model under its shared surfboard rental rate.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'egg'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Shortboard Duratec 6''7',
        E'A Tahe Sports Shortboard Duratec for intermediate surfers who want a durable shorter board. Line Up Surf Shop lists this board in its priced rental catalog.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate, Advanced',
        E'shortboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'BIC Gerard Dabadie Fish 5''10',
        E'A BIC Gerard Dabadie Fish for smaller waves and fast trimming. The Line Up Surf Shop board-rental page lists this model at 22 USD per day and 110 USD per week.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate, Advanced',
        E'fish'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Comet 7''8',
        E'A Tahe Sports Comet mid-length for easy wave entry and smooth turns. Line Up Surf Shop lists this model in its surfboard rental catalog.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'mid-length'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Tahe Sports Comet 6''6',
        E'A shorter Tahe Sports Comet rental board for intermediate beach-break sessions. The Coronado shop lists this board under its 22 USD daily surfboard rental rate.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate, Advanced',
        E'mid-length'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Torq Surfboards Funboard 8''2',
        E'An 8-foot 2-inch Torq Surfboards Funboard for stable, forgiving waves around Coronado. Line Up Surf Shop lists this model in its public rental inventory.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'funboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Torq Surfboards Funboard 6''8',
        E'A compact Torq Surfboards Funboard for progressing surfers who want a shorter outline. The shop publishes this board in its priced surfboard rental list.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate, Advanced',
        E'funboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Torq Surfboards Fish 6''3',
        E'A Torq Surfboards Fish for punchy Panama beach-break conditions and quick down-the-line speed. Line Up Surf Shop lists this model in the board rental catalog.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate, Advanced',
        E'fish'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Safari Surfboards Logger 9''4',
        E'A Safari Surfboards Logger for classic trim, nose-riding, and easy paddling. Line Up Surf Shop includes this longboard in its rental board inventory.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'longboard'
      ),
      (
        E'michaelzick+lineuptrade@gmail.com',
        E'Safari Surfboards Goose 9''2',
        E'A Safari Surfboards Goose longboard for relaxed glide and beginner-friendly wave count. The Coronado shop lists this model at its shared surfboard rental rate.',
        22.00::numeric, 110.00::numeric,
        E'Beginner, Intermediate',
        E'longboard'
      ),
      (
        E'michaelzick+santacatalinasurfshop@gmail.com',
        E'Lost/Mayhem Scorcher Model',
        E'A Lost/Mayhem Scorcher shortboard available for rent from Santa Catalina Surf Shop. The official listing marks it rentable at 35 USD per day.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+santacatalinasurfshop@gmail.com',
        E'Xanadu X21',
        E'A Xanadu X21 performance shortboard available for rent from Santa Catalina Surf Shop. The shop lists this board as rentable at 25 USD per day.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Tomo Boss Up',
        E'A Tomo Boss Up surfboard from Sunzal Surf Company''s official El Tunco rental gallery. The page lists all rates in USD and prices this board at 35 USD.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Takayama In The Pink',
        E'A Takayama In The Pink longboard for smooth trim and classic point-break surfing at El Sunzal. Sunzal Surf Company lists this board at 40 USD.',
        40.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'longboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Gerry Lopez Something Fishy',
        E'A Gerry Lopez Something Fishy board for fast small-wave lines. Sunzal Surf Company lists this model in its USD-priced surfboard rental options at 35 USD.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'fish'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost Party Crasher',
        E'A Lost Party Crasher rental board for playful El Salvador surf. Sunzal Surf Company lists the model at 35 USD in its official rental gallery.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost Quiver Killer',
        E'A Lost Quiver Killer shortboard for versatile point-break and beach-break conditions. Sunzal Surf Company lists this model at 35 USD.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'DANC Funboard',
        E'A DANC Funboard for approachable wave catching and smooth turns at El Tunco. Sunzal Surf Company lists this board at 35 USD.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate',
        E'funboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Terry 9/3 Noserider Longboard',
        E'A Terry Noserider longboard for classic trim and point-break glide. Sunzal Surf Company lists the board at 35 USD in its rental options.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'longboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Torq 8''6 Longboard',
        E'An 8-foot 6-inch Torq longboard for easy paddling and forgiving wave entry. Sunzal Surf Company publishes this rental at 35 USD.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate',
        E'longboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Album Dark Arts',
        E'An Album Dark Arts performance board for experienced surfers in quality El Salvador waves. Sunzal Surf Company lists this model at 35 USD.',
        35.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Paragon Retro Noserider',
        E'A Paragon Retro Noserider for traditional longboard trim and cruisy point-break sessions. Sunzal Surf Company lists this board at 30 USD.',
        30.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'longboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Free Movement Flying Pig',
        E'A Free Movement Flying Pig board for playful down-the-line surfing. Sunzal Surf Company lists this model at 30 USD in its official rental gallery.',
        30.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'fish'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Xanadu Wave Rocket',
        E'A Xanadu Wave Rocket shortboard for speed and tighter turns. Sunzal Surf Company lists this rentable board at 30 USD.',
        30.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Robert August What I Ride Mini',
        E'A Robert August What I Ride Mini for classic styling in a smaller longboard package. Sunzal Surf Company lists this board at 30 USD.',
        30.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'mini longboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost Puddle Fish',
        E'A Lost Puddle Fish for small-wave speed and extra planing surface. Sunzal Surf Company lists this model at 30 USD.',
        30.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'fish'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost Short Round',
        E'A Lost Short Round board for responsive performance in average surf. Sunzal Surf Company publishes this rental at 30 USD.',
        30.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Robert August What I Ride',
        E'A Robert August What I Ride longboard for smooth point-break surfing and easy trim. Sunzal Surf Company lists this board at 30 USD.',
        30.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'longboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost Sub Buggy',
        E'A Lost Sub Buggy for performance surfing in smaller, punchier waves. Sunzal Surf Company lists this board at 25 USD.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost V3 Rocket 5''8',
        E'A Lost V3 Rocket 5-foot 8-inch shortboard for drive and speed in quality waves. Sunzal Surf Company lists this model at 25 USD.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Byrne Custom 6''6',
        E'A Byrne Custom 6-foot 6-inch surfboard for experienced surfers who want extra rail line. Sunzal Surf Company lists this board at 25 USD.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Free Movement G-45',
        E'A Free Movement G-45 shortboard for responsive turns and clean El Salvador walls. Sunzal Surf Company lists this rental at 25 USD.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Doug Haut Funboard',
        E'A Doug Haut Funboard for forgiving paddling and smooth turns. Sunzal Surf Company lists this model at 25 USD.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate',
        E'funboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Azteca Blue Beach',
        E'An Azteca Blue Beach board for easygoing rental sessions at El Tunco and nearby breaks. Sunzal Surf Company lists this board at 25 USD.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate',
        E'funboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Sharpeyes Disco Inferno',
        E'A Sharpeyes Disco Inferno shortboard for advanced surfers in punchier waves. Sunzal Surf Company publishes this rental at 25 USD.',
        25.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Mick Fanning Sugar Glider',
        E'A Mick Fanning Sugar Glider softboard-style rental for forgiving, high-fun sessions. Sunzal Surf Company lists this model at 20 USD.',
        20.00::numeric, NULL::numeric,
        E'Beginner, Intermediate',
        E'funboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'JS Factory Hyfi',
        E'A JS Factory Hyfi performance board for surfers who want a lively epoxy-feel shortboard. Sunzal Surf Company lists this rental at 20 USD.',
        20.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Byrne Panda',
        E'A Byrne Panda surfboard for intermediate and advanced riders looking for a responsive rental. Sunzal Surf Company lists this board at 20 USD.',
        20.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Mick Fanning Even Flow',
        E'A Mick Fanning Even Flow for user-friendly glide and stable turns. Sunzal Surf Company lists this model at 20 USD.',
        20.00::numeric, NULL::numeric,
        E'Beginner, Intermediate',
        E'funboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Sina Egg',
        E'A Sina Egg board for glide, paddle ease, and flowing turns in mid-sized surf. Sunzal Surf Company lists this rental at 20 USD.',
        20.00::numeric, NULL::numeric,
        E'Beginner, Intermediate',
        E'egg'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Webber AfterBurner',
        E'A Webber AfterBurner shortboard for fast, responsive turns. Sunzal Surf Company lists this model at 15 USD.',
        15.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost Weekend Warrior',
        E'A Lost Weekend Warrior rental board for approachable performance and easy wave count. Sunzal Surf Company lists this model at 15 USD.',
        15.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost F1 5''10',
        E'A Lost F1 5-foot 10-inch shortboard for experienced surfers and clean point-break conditions. Sunzal Surf Company lists this board at 15 USD.',
        15.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Lost V3 Rocket 6''0',
        E'A Lost V3 Rocket 6-foot shortboard for fast rail-to-rail surfing. Sunzal Surf Company lists this rental at 15 USD.',
        15.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced, Expert',
        E'shortboard'
      ),
      (
        E'michaelzick+sunzalsurfcompany@gmail.com',
        E'Del Ray Fish',
        E'A Del Ray Fish for small-wave speed and forgiving trim. Sunzal Surf Company lists this board at 10 USD.',
        10.00::numeric, NULL::numeric,
        E'Beginner, Intermediate, Advanced',
        E'fish'
      )
  ),
  inserted AS (
    INSERT INTO public.equipment (
      id, user_id, name, category, description,
      price_per_day, price_per_hour, price_per_week, currency_code,
      size, weight, material, suitable_skill_level, status,
      location_lat, location_lng, location_address, subcategory,
      damage_deposit, visible_on_map
    )
    SELECT
      gen_random_uuid(),
      au.id,
      s.name,
      'surfboards',
      s.description,
      s.price_per_day,
      NULL::numeric,
      s.price_per_week,
      'USD',
      NULL::text,
      NULL::text,
      NULL::text,
      s.suitable_skill_level,
      'available',
      sl.location_lat,
      sl.location_lng,
      sl.location_address,
      s.subcategory,
      NULL::numeric,
      true
    FROM seed_equipment s
    JOIN shop_locations sl ON sl.seed_email = s.seed_email
    JOIN auth.users au ON au.email = s.seed_email
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.equipment e
      WHERE e.user_id = au.id
        AND e.category = 'surfboards'
        AND lower(btrim(e.name)) = lower(btrim(s.name))
    )
    RETURNING id
  ),
  ins1 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/2370006/pexels-photo-2370006.jpeg', 0, true
    FROM inserted
    RETURNING equipment_id
  ),
  ins2 AS (
    INSERT INTO public.equipment_images (equipment_id, image_url, display_order, is_primary)
    SELECT id, 'https://images.pexels.com/photos/8907535/pexels-photo-8907535.jpeg', 1, false
    FROM inserted
    RETURNING equipment_id
  )
  SELECT (SELECT count(*) FROM inserted), (SELECT count(*) FROM ins1), (SELECT count(*) FROM ins2)
  INTO v_equipment_inserted, v_primary_images_added, v_secondary_images_added;

  RAISE NOTICE 'Central/South America surfboard gear inserted=%, primary_images_added=%, secondary_images_added=%',
    v_equipment_inserted, v_primary_images_added, v_secondary_images_added;
END $seed_migration$;
