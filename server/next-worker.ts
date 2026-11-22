// @ts-expect-error OpenNext generates this module at build time.
import openNext from '../.open-next/worker.js';
import { PUBLIC_SITE_URL } from '../src/lib/seo/publicMetadata.js';

export default {
  async fetch(request: Request, env: object, context: ExecutionContext) {
    const url = new URL(request.url);
    if (url.hostname === 'demostoke.com') {
      const canonical = new URL(PUBLIC_SITE_URL);
      canonical.pathname = url.pathname;
      canonical.search = url.search;
      return Response.redirect(canonical, 301);
    }

    let dependencyFailed = false;
    const response: Response = await openNext.fetch(request, {
      ...env,
      reportCatalogFailure() { dependencyFailed = true; },
    }, context);

    if (dependencyFailed && response.status >= 500) {
      const headers = new Headers(response.headers);
      headers.set('Retry-After', '60');
      headers.set('Cache-Control', 'no-store');
      return new Response(response.body, { status: 503, headers });
    }

    if (response.ok && url.pathname.startsWith('/_next/static/')) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(response.body, { status: response.status, headers });
    }

    return response;
  },
};
