import type { Metadata } from 'next';
import type { PageMetadata } from '@/hooks/usePageMetadata';
import { PUBLIC_ROUTE_META } from './publicMetadata';

const defaultImage = '/img/demostoke-square-transparent.webp';

export function toNextMetadata(data: PageMetadata): Metadata {
  const { title, description, canonicalUrl, image = defaultImage, type, robots } = data;
  return {
    title,
    description,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    robots,
    openGraph: { title, description, url: canonicalUrl, images: [image], type: type === 'article' ? 'article' : 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export function routeMetadata(path: keyof typeof PUBLIC_ROUTE_META, robots?: string): Metadata {
  return toNextMetadata({ ...PUBLIC_ROUTE_META[path], robots });
}

export function JsonLd({ value }: { value: NonNullable<PageMetadata['schema']> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(value).replace(/</g, '\\u003c'),
  }} />;
}
