# DemoStoke’s October 29–30, 2026 Google Search drop

Investigated November 12, 2026. Dates use Pacific time.

**The evidence points to a loss of Google rankings and visibility. The exact trigger remains unconfirmed.** Impressions fell 98.5%, led by individual blog articles. The three most affected articles still had their expected Google-selected canonicals, Google continued crawling during the drop, and U.S. search interest held up for the highest-impression term.

## Search Console comparison

The [Search Console performance report](https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Ademostoke.com&start_date=20261030&end_date=20261110&compare_start_date=20261017&compare_end_date=20261028) uses the `demostoke.com` domain property and Web (text) search. The comparison uses two complete 12-day windows and omits October 29, when impressions first dropped.

| Metric | Oct 17–28 | Oct 30–Nov 10 |
| --- | ---: | ---: |
| Impressions | 3,545 | 53 |
| Clicks | 44 | 0 |
| Average position | 16.4 | 32.1 |

The `/blog/*` article rows went from 2,975 impressions to 26. The home page went from 5 to 4. Counts in the Pages tab can differ from property totals because Search Console aggregates them at different levels.

| Article | Before | After | Average position, before → after | Last crawl shown in URL Inspection |
| --- | ---: | ---: | --- | --- |
| [Mountain bike suspension guide](https://www.demostoke.com/blog/mountain-bike-suspension-guide-systems-setup-and-top-brands) | 695 | 9 | 19.9 → 40.2 | Oct 25 |
| [Colorado ski-resort guide](https://www.demostoke.com/blog/guide-to-colorado-s-top-ski-resorts-pros-cons) | 503 | 0 | 30.1 → — | Oct 1 |
| [Atomic Maverick 88 CTI review](https://www.demostoke.com/blog/atomic-maverick-88-cti-skis-review-a-precise-everyday-frontside-ski-with-real-all-mountain-range) | 377 | 2 | 9.1 → 28.5 | Nov 8 |

All three returned “URL is on Google” and a matching Google-selected canonical in URL Inspection. A zero-impression period has no observed position. The reported last crawls for the first two articles predate the cliff. The November 12 live inspection separately returned HTTP 200 for the suspension guide and showed its article heading and excerpt in Google’s mobile render.

## Same queries across countries and devices

In the unfiltered Queries tab, sort by October 17–28 impressions and select the top five visible queries. Apply this anchored regex to the same date comparison, then open Countries and Devices with the query filter still active.

```text
^(mountain bike suspension|atomic maverick 88 cti|how to choose the right fins for your surfboard|skiing in colorado|mtb suspension)$
```

| Exact query | Impressions, before → after | Average position, before → after |
| --- | --- | --- |
| `mountain bike suspension` | 131 → 1 | 24.4 → 20 |
| `atomic maverick 88 cti` | 84 → 0 | 9.7 → — |
| `how to choose the right fins for your surfboard` | 62 → 0 | 10.1 → — |
| `skiing in colorado` | 48 → 0 | 31.1 → — |
| `mtb suspension` | 46 → 1 | 27.7 → 62 |
| **Five-query total** | **371 → 2** | **20 → 41** |

| Dimension | Segment | Impressions, before → after |
| --- | --- | --- |
| Country | United States | 101 → 0 |
| Country | Portugal | 63 → 0 |
| Country | United Kingdom | 60 → 0 |
| Country | Canada | 23 → 0 |
| Country | Mexico | 2 → 1 |
| Country | New Zealand | 0 → 1 |
| Device | Desktop | 254 → 2 |
| Device | Mobile | 116 → 0 |
| Device | Tablet | 1 → 0 |

The country rows show selected markets. The device rows cover the full five-query total. The drop spans markets and device types. The post-drop cohort average is based on two impressions from different countries, so the individual page losses and continued indexing carry more weight than that average. Search Console omits anonymized queries, so the cohort covers visible search terms only.

## Search demand

The [Google Trends comparison](https://trends.google.com/trends/explore?date=2026-10-17%202026-11-10&geo=US&q=mountain%20bike%20suspension,skiing%20in%20colorado,atomic%20maverick%2088%20cti,how%20to%20choose%20the%20right%20fins%20for%20your%20surfboard,mtb%20suspension) uses the same five terms, U.S. Web Search, and a single October 17–November 10 series. The table averages daily values from that series in the same 12-day windows, omitting October 29.

| Search term | Oct 17–28 mean | Oct 30–Nov 10 mean |
| --- | ---: | ---: |
| `mountain bike suspension` | 66.8 | 65.4 |
| `skiing in colorado` | 9.4 | 42.1 |
| `mtb suspension` | 11.3 | 32.0 |
| `atomic maverick 88 cti` | 0.0 | 0.2 |
| `how to choose the right fins for your surfboard` | 0.0 | 0.0 |

U.S. interest in `mountain bike suspension` was steady across the two windows and over the transition itself. `skiing in colorado` and `mtb suspension` had more measurable interest afterward. This weighs against falling U.S. demand as the main explanation for DemoStoke’s loss on those terms. The Atomic and surfboard-fin terms were too sparse to interpret. Trends uses a normalized sample, and a zero can reflect insufficient volume. [Google Trends data FAQ](https://support.google.com/trends/answer/4365533)

## Crawl and deployment timeline

- **September 28** — DemoStoke moved to Cloudflare Workers. The repository records the cutover and TLS recovery. The migration preceded the cliff by about a month. [Hosting notes](cloudflare-hosting.md)
- **October 24 and 26** — The October 24 merge updated Vite. The October 26 merge added image URL buttons to the blog editor and was the active production build when inspected. Cloudflare deployment history showed no production build on October 29–30, and the zone audit filter returned no entries for October 26–31. The audit filter covers zone-scoped records. [Vite merge](https://github.com/michaelzick/demostoke/pull/184) · [Blog editor merge](https://github.com/michaelzick/demostoke/pull/185)
- **October 29–30** — Web impressions fell sharply while Googlebot continued requesting pages from `www.demostoke.com` and the indexed count stayed roughly flat. The canonical host’s 90-day crawl report showed no host problem and 98% HTTP 200 responses. [Crawl stats](https://search.google.com/search-console/settings/crawl-stats?resource_id=sc-domain%3Ademostoke.com) · [Page indexing](https://search.google.com/search-console/index?resource_id=sc-domain%3Ademostoke.com)
- **November 8–12** — Google last read the submitted sitemap successfully on November 8 and reported 1,035 discovered pages. Manual Actions and Security Issues showed no issues, and Temporary Removals showed no requests in the prior six months. The published November core update began November 10. Google’s reporting-anomaly log showed no matching Web Search incident. [Sitemaps](https://search.google.com/search-console/sitemaps?resource_id=sc-domain%3Ademostoke.com) · [Google Search Status Dashboard](https://status.search.google.com/summary) · [Search Console data anomalies](https://support.google.com/webmasters/answer/6211453)

## Reproducing the HTML finding

The production robots file allowed Googlebot, and the sitemap returned valid XML. Sampled public URLs returned HTTP 200 and the expected canonical. For all three articles above, the initial HTML included the page title, canonical, and `BlogPosting` metadata, but contained a loading spinner and no article `<h1>`. The browser loads the published-post collection and then finds the requested slug. The article-loading path predates the incident. Google’s live render shows this path can succeed, and historical rendering during the drop is unverified. [Server metadata lookup](../server/app.js#L366) · [Client article load](../src/pages/BlogPostPage.tsx#L59) · [Google’s JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)

Run this on any of the three article URLs to inspect the initial HTML. In Search Console, inspect the same URL to compare Google’s selected canonical and last crawl, then use **Test live URL → View tested page → Screenshot** to check the rendered version.

```sh
url='https://www.demostoke.com/blog/mountain-bike-suspension-guide-systems-setup-and-top-brands'
curl -fsS --compressed "$url" |
  rg -oi '<title>[^<]+</title>|<link rel="canonical"[^>]*>|<h1\b[^>]*>|Loading\.\.\.'
```
