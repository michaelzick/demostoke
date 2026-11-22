import type { NextConfig } from 'next';
import { loadNextEnvironment } from './scripts/next-env.mjs';

const { target, supabaseUrl, publishableKey } = loadNextEnvironment();
const supabaseOrigin = new URL(supabaseUrl).origin;

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.mxpnl.com https://*.mapbox.com https://www.google.com https://www.gstatic.com https://static.cloudflareinsights.com blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: http:",
      "media-src 'self' https: http:",
      `connect-src 'self' ${supabaseOrigin} https://api-js.mixpanel.com https://api.mixpanel.com https://www.google.com https://*.google-analytics.com https://google-analytics.com https://www.googletagmanager.com https://analytics.google.com https://*.mapbox.com https://cloudflareinsights.com`,
      "worker-src 'self' blob:",
      "child-src 'self' blob: https://www.google.com https://recaptcha.google.com https://www.youtube.com",
      "frame-src 'self' https://www.google.com https://recaptcha.google.com https://www.youtube.com",
      "frame-ancestors 'none'",
    ].join('; ') },
];

const privateRoutes = [
  '/auth/:path*', '/profile', '/admin', '/widget', '/my-gear', '/edit-gear/:path*',
  '/analytics', '/bookings', '/private-party/:path*', '/blog/create', '/blog/drafts',
  '/blog/edit/:path*', '/blog/preview/:path*', '/list-your-gear/add-gear-form',
  '/list-your-gear/lightspeed-pos', '/api/gear/search',
];

const config: NextConfig = {
  env: {
    NEXT_PUBLIC_DEMOSTOKE_TARGET: target,
    NEXT_PUBLIC_ENABLE_THEME_FLICKER_FIX: process.env.NEXT_PUBLIC_ENABLE_THEME_FLICKER_FIX ?? "true",
    NEXT_PUBLIC_USE_SHOP_GEAR_FEED: process.env.NEXT_PUBLIC_USE_SHOP_GEAR_FEED ?? "false",
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  },
  poweredByHeader: false,
  htmlLimitedBots: /.*/,
  async headers() {
    const noindex = { key: 'X-Robots-Tag', value: 'noindex, follow' };
    return [
      {
        source: '/:path*',
        headers: [...securityHeaders, ...(target === 'preview' ? [noindex] : [])],
      },
      ...privateRoutes.map((source) => ({
        source,
        headers: [noindex, { key: 'Cache-Control', value: 'private, no-store' }],
      })),
    ];
  },
};
export default config;
