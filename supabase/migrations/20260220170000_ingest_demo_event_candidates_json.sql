-- Admin JSON ingest path for demo event candidates.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.ingest_demo_event_candidates_json(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'pg_temp'
AS $function$
DECLARE
  v_events jsonb;
  v_row jsonb;
  v_row_index bigint;
  v_now timestamptz := now();

  v_submitted integer := 0;
  v_inserted integer := 0;
  v_updated_pending integer := 0;
  v_skipped_approved integer := 0;
  v_skipped_rejected integer := 0;
  v_skipped_published integer := 0;
  v_invalid_rows integer := 0;

  v_errors jsonb := '[]'::jsonb;
  v_missing_fields text[];

  v_title text;
  v_company text;
  v_gear_category_raw text;
  v_gear_category text;
  v_event_date_text text;
  v_event_date date;
  v_event_time_text text;
  v_event_time time;
  v_location text;
  v_source_primary_url text;
  v_source_domain text;
  v_source_snippet text;
  v_equipment_available text;
  v_thumbnail_url text;
  v_location_lat_text text;
  v_location_lng_text text;
  v_location_lat numeric;
  v_location_lng numeric;

  v_external_event_id text;
  v_canonical_key text;
  v_normalized_company text;
  v_normalized_title text;
  v_normalized_location text;

  v_source_urls jsonb;
  v_merged_source_urls jsonb;
  v_raw_payload jsonb;

  v_existing public.demo_event_candidates%ROWTYPE;
  v_existing_demo_id uuid;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_payload IS NULL THEN
    RAISE EXCEPTION 'Payload is required';
  END IF;

  IF jsonb_typeof(p_payload) = 'array' THEN
    v_events := p_payload;
  ELSIF jsonb_typeof(p_payload) = 'object' AND jsonb_typeof(p_payload -> 'events') = 'array' THEN
    v_events := p_payload -> 'events';
  ELSE
    RAISE EXCEPTION 'Payload must be a JSON array or an object with an events array';
  END IF;

  v_submitted := jsonb_array_length(v_events);

  IF v_submitted > 200 THEN
    RAISE EXCEPTION 'Payload exceeds max rows of 200';
  END IF;

  FOR v_row, v_row_index IN
    SELECT value, ordinality
    FROM jsonb_array_elements(v_events) WITH ORDINALITY
  LOOP
    IF jsonb_typeof(v_row) <> 'object' THEN
      v_invalid_rows := v_invalid_rows + 1;
      v_errors := v_errors || jsonb_build_array(
        jsonb_build_object(
          'row_index', v_row_index,
          'message', 'Row must be a JSON object'
        )
      );
      CONTINUE;
    END IF;

    v_title := NULLIF(BTRIM(COALESCE(v_row ->> 'title', v_row ->> 'event_title', v_row ->> 'name', '')), '');
    v_company := NULLIF(BTRIM(COALESCE(v_row ->> 'company', v_row ->> 'brand', v_row ->> 'host', v_row ->> 'organizer', '')), '');
    v_gear_category_raw := LOWER(NULLIF(BTRIM(COALESCE(v_row ->> 'gear_category', v_row ->> 'category', v_row ->> 'gearType', '')), ''));
    v_event_date_text := NULLIF(BTRIM(COALESCE(v_row ->> 'event_date', v_row ->> 'date', v_row ->> 'start_date', '')), '');
    v_event_time_text := NULLIF(BTRIM(COALESCE(v_row ->> 'event_time', v_row ->> 'time', v_row ->> 'start_time', '')), '');
    v_location := NULLIF(BTRIM(COALESCE(v_row ->> 'location', v_row ->> 'venue', v_row ->> 'address', '')), '');
    v_source_primary_url := NULLIF(BTRIM(COALESCE(v_row ->> 'source_primary_url', v_row ->> 'source_url', v_row ->> 'url', '')), '');
    v_external_event_id := NULLIF(BTRIM(COALESCE(v_row ->> 'external_event_id', v_row ->> 'event_id', '')), '');

    v_equipment_available := NULLIF(BTRIM(COALESCE(v_row ->> 'equipment_available', v_row ->> 'equipment', v_row ->> 'notes', '')), '');
    v_thumbnail_url := NULLIF(BTRIM(COALESCE(v_row ->> 'thumbnail_url', '')), '');
    v_source_snippet := NULLIF(BTRIM(COALESCE(v_row ->> 'source_snippet', '')), '');

    v_location_lat_text := NULLIF(BTRIM(COALESCE(v_row ->> 'location_lat', v_row ->> 'lat', '')), '');
    v_location_lng_text := NULLIF(BTRIM(COALESCE(v_row ->> 'location_lng', v_row ->> 'lng', '')), '');

    v_gear_category := NULL;
    IF v_gear_category_raw IS NULL THEN
      v_gear_category := NULL;
    ELSIF v_gear_category_raw IN ('snowboards', 'snowboard', 'snowboarding')
      OR v_gear_category_raw LIKE '%snowboard%' THEN
      v_gear_category := 'snowboards';
    ELSIF v_gear_category_raw IN ('skis', 'ski', 'skiing')
      OR v_gear_category_raw LIKE '%ski%' THEN
      v_gear_category := 'skis';
    ELSIF v_gear_category_raw IN ('surfboards', 'surfboard', 'surfing', 'surf')
      OR v_gear_category_raw LIKE '%surf%' THEN
      v_gear_category := 'surfboards';
    ELSIF v_gear_category_raw IN ('mountain-bikes', 'mountain bike', 'mountain bikes', 'mtb')
      OR v_gear_category_raw ~ '(mountain[ -]?bike|mtb|bike park)' THEN
      v_gear_category := 'mountain-bikes';
    ELSE
      v_invalid_rows := v_invalid_rows + 1;
      v_errors := v_errors || jsonb_build_array(
        jsonb_build_object(
          'row_index', v_row_index,
          'external_event_id', v_external_event_id,
          'message', 'Invalid gear_category'
        )
      );
      CONTINUE;
    END IF;

    v_missing_fields := ARRAY[]::text[];
    IF v_title IS NULL THEN
      v_missing_fields := array_append(v_missing_fields, 'title');
    END IF;
    IF v_company IS NULL THEN
      v_missing_fields := array_append(v_missing_fields, 'company');
    END IF;
    IF v_gear_category IS NULL THEN
      v_missing_fields := array_append(v_missing_fields, 'gear_category');
    END IF;
    IF v_event_date_text IS NULL THEN
      v_missing_fields := array_append(v_missing_fields, 'event_date');
    END IF;
    IF v_location IS NULL THEN
      v_missing_fields := array_append(v_missing_fields, 'location');
    END IF;
    IF v_source_primary_url IS NULL THEN
      v_missing_fields := array_append(v_missing_fields, 'source_primary_url');
    END IF;

    IF array_length(v_missing_fields, 1) IS NOT NULL THEN
      v_invalid_rows := v_invalid_rows + 1;
      v_errors := v_errors || jsonb_build_array(
        jsonb_build_object(
          'row_index', v_row_index,
          'external_event_id', v_external_event_id,
          'message', 'Missing required fields: ' || array_to_string(v_missing_fields, ', ')
        )
      );
      CONTINUE;
    END IF;

    IF v_source_primary_url !~* '^https?://.+' THEN
      v_invalid_rows := v_invalid_rows + 1;
      v_errors := v_errors || jsonb_build_array(
        jsonb_build_object(
          'row_index', v_row_index,
          'external_event_id', v_external_event_id,
          'message', 'source_primary_url must be an absolute http(s) URL'
        )
      );
      CONTINUE;
    END IF;

    BEGIN
      v_event_date := v_event_date_text::date;
    EXCEPTION
      WHEN others THEN
        v_invalid_rows := v_invalid_rows + 1;
        v_errors := v_errors || jsonb_build_array(
          jsonb_build_object(
            'row_index', v_row_index,
            'external_event_id', v_external_event_id,
            'message', 'Invalid event_date'
          )
        );
        CONTINUE;
    END;

    IF v_event_time_text IS NULL THEN
      v_event_time := NULL;
    ELSE
      BEGIN
        v_event_time := v_event_time_text::time;
      EXCEPTION
        WHEN others THEN
          v_event_time := NULL;
      END;
    END IF;

    IF v_location_lat_text IS NULL THEN
      v_location_lat := NULL;
    ELSE
      BEGIN
        v_location_lat := v_location_lat_text::numeric;
      EXCEPTION
        WHEN others THEN
          v_location_lat := NULL;
      END;
    END IF;

    IF v_location_lng_text IS NULL THEN
      v_location_lng := NULL;
    ELSE
      BEGIN
        v_location_lng := v_location_lng_text::numeric;
      EXCEPTION
        WHEN others THEN
          v_location_lng := NULL;
      END;
    END IF;

    v_source_domain := NULLIF(BTRIM(COALESCE(v_row ->> 'source_domain', '')), '');
    IF v_source_domain IS NULL THEN
      v_source_domain := REGEXP_REPLACE(REGEXP_REPLACE(v_source_primary_url, '^https?://', '', 'i'), '/.*$', '');
    END IF;
    v_source_domain := NULLIF(REGEXP_REPLACE(COALESCE(v_source_domain, ''), '^www\.', '', 'i'), '');

    IF jsonb_typeof(v_row -> 'source_urls') = 'array' THEN
      SELECT COALESCE(jsonb_agg(to_jsonb(value)), '[]'::jsonb)
      INTO v_source_urls
      FROM (
        SELECT DISTINCT BTRIM(value) AS value
        FROM jsonb_array_elements_text(v_row -> 'source_urls') AS source_values(value)
        WHERE BTRIM(value) <> ''
      ) AS normalized_values;
    ELSE
      v_source_urls := '[]'::jsonb;
    END IF;

    IF jsonb_array_length(v_source_urls) = 0 THEN
      v_source_urls := jsonb_build_array(v_source_primary_url);
    END IF;

    IF v_external_event_id IS NULL THEN
      v_normalized_company := REGEXP_REPLACE(LOWER(v_company), '[^a-z0-9]+', ' ', 'g');
      v_normalized_title := REGEXP_REPLACE(LOWER(v_title), '[^a-z0-9]+', ' ', 'g');
      v_normalized_location := REGEXP_REPLACE(LOWER(v_location), '[^a-z0-9]+', ' ', 'g');
      v_canonical_key := CONCAT_WS(
        '|',
        v_gear_category,
        BTRIM(v_normalized_company),
        BTRIM(v_normalized_title),
        v_event_date::text,
        BTRIM(v_normalized_location)
      );
      v_external_event_id := 'demo_evt_' || ENCODE(DIGEST(v_canonical_key, 'sha256'), 'hex');
    END IF;

    v_raw_payload := jsonb_build_object(
      'source', 'manual_json_ingest',
      'original_row', v_row
    );

    SELECT *
    INTO v_existing
    FROM public.demo_event_candidates
    WHERE external_event_id = v_external_event_id
    LIMIT 1;

    IF FOUND THEN
      IF v_existing.status = 'pending' THEN
        SELECT COALESCE(jsonb_agg(to_jsonb(url_text)), '[]'::jsonb)
        INTO v_merged_source_urls
        FROM (
          SELECT DISTINCT BTRIM(url_text) AS url_text
          FROM (
            SELECT value AS url_text
            FROM jsonb_array_elements_text(COALESCE(v_existing.source_urls, '[]'::jsonb))
            UNION ALL
            SELECT value AS url_text
            FROM jsonb_array_elements_text(COALESCE(v_source_urls, '[]'::jsonb))
          ) AS all_urls
          WHERE BTRIM(url_text) <> ''
        ) AS deduped_urls;

        IF jsonb_array_length(v_merged_source_urls) = 0 THEN
          v_merged_source_urls := jsonb_build_array(v_source_primary_url);
        END IF;

        IF v_existing.admin_edited THEN
          UPDATE public.demo_event_candidates
          SET
            seen_count = COALESCE(seen_count, 1) + 1,
            last_seen_at = v_now,
            source_primary_url = v_source_primary_url,
            source_domain = v_source_domain,
            source_urls = v_merged_source_urls,
            source_snippet = v_source_snippet,
            raw_payload = v_raw_payload,
            updated_at = v_now
          WHERE id = v_existing.id;
        ELSE
          UPDATE public.demo_event_candidates
          SET
            title = v_title,
            company = v_company,
            gear_category = v_gear_category,
            event_date = v_event_date,
            event_time = v_event_time,
            location = v_location,
            location_lat = v_location_lat,
            location_lng = v_location_lng,
            equipment_available = v_equipment_available,
            thumbnail_url = v_thumbnail_url,
            seen_count = COALESCE(seen_count, 1) + 1,
            last_seen_at = v_now,
            source_primary_url = v_source_primary_url,
            source_domain = v_source_domain,
            source_urls = v_merged_source_urls,
            source_snippet = v_source_snippet,
            raw_payload = v_raw_payload,
            updated_at = v_now
          WHERE id = v_existing.id;
        END IF;

        v_updated_pending := v_updated_pending + 1;
      ELSIF v_existing.status = 'approved' THEN
        v_skipped_approved := v_skipped_approved + 1;
      ELSIF v_existing.status = 'rejected' THEN
        v_skipped_rejected := v_skipped_rejected + 1;
      END IF;

      CONTINUE;
    END IF;

    SELECT id
    INTO v_existing_demo_id
    FROM public.demo_calendar
    WHERE external_event_id = v_external_event_id
    LIMIT 1;

    IF v_existing_demo_id IS NOT NULL THEN
      v_skipped_published := v_skipped_published + 1;
      CONTINUE;
    END IF;

    INSERT INTO public.demo_event_candidates (
      external_event_id,
      title,
      company,
      gear_category,
      event_date,
      event_time,
      location,
      location_lat,
      location_lng,
      equipment_available,
      thumbnail_url,
      status,
      source_primary_url,
      source_domain,
      source_urls,
      source_snippet,
      raw_payload,
      seen_count,
      first_seen_at,
      last_seen_at,
      created_at,
      updated_at
    ) VALUES (
      v_external_event_id,
      v_title,
      v_company,
      v_gear_category,
      v_event_date,
      v_event_time,
      v_location,
      v_location_lat,
      v_location_lng,
      v_equipment_available,
      v_thumbnail_url,
      'pending',
      v_source_primary_url,
      v_source_domain,
      v_source_urls,
      v_source_snippet,
      v_raw_payload,
      1,
      v_now,
      v_now,
      v_now,
      v_now
    );

    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'stats', jsonb_build_object(
      'submitted', v_submitted,
      'inserted', v_inserted,
      'updated_pending', v_updated_pending,
      'skipped_approved', v_skipped_approved,
      'skipped_rejected', v_skipped_rejected,
      'skipped_published', v_skipped_published,
      'invalid_rows', v_invalid_rows
    ),
    'errors', v_errors
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.ingest_demo_event_candidates_json(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ingest_demo_event_candidates_json(jsonb) TO authenticated;
