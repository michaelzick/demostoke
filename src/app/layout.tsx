import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PUBLIC_SITE_URL } from '@/lib/seo/publicMetadata';
import { isProduction } from '@/lib/deployment';
import { analyticsBootstrap, themeBootstrap } from './bootstrap';
import Providers from './providers';
import '@/index.css';

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_SITE_URL),
  applicationName: 'DemoStoke',
  authors: [{ name: 'DemoStoke' }],
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {process.env.NEXT_PUBLIC_ENABLE_THEME_FLICKER_FIX !== "false" && (
          <div hidden dangerouslySetInnerHTML={{ __html: `<script>${themeBootstrap}</script>` }} />
        )}
        {isProduction && <div hidden dangerouslySetInnerHTML={{ __html: `<script>${analyticsBootstrap}</script>` }} />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
