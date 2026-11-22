import { notFound, permanentRedirect } from 'next/navigation';
import { resolveOldGear } from '@/lib/server/public-catalog';
import { addQuery, type SearchValues } from '@/lib/seo/redirect-query';

export const dynamic = 'force-dynamic';

export default async function Page({ params, searchParams }: {
  params: Promise<{ category: string; ownerSlug: string; slug: string }>;
  searchParams: Promise<SearchValues>;
}) {
  const { category, ownerSlug, slug } = await params;
  const path = await resolveOldGear(`/${category}/${ownerSlug}/${slug}`);
  if (!path) notFound();
  permanentRedirect(addQuery(path, await searchParams));
}
