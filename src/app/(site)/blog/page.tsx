import BlogPage from '@/screens/BlogPage';
import { SsrPageDataProvider } from '@/contexts/SsrPageDataContext';
import { loadBlogIndex } from '@/lib/server/public-catalog';
import { routeMetadata } from '@/lib/seo/next-metadata';
import { InitialSearch } from '@/app/initial-search';

export const dynamic = 'force-dynamic';
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  const query = await searchParams;
  return routeMetadata('/blog', query.search || query.category || query.page ? 'noindex, follow' : undefined);
}

export default async function Page({ searchParams }: Props) {
  const [blogIndex, query] = await Promise.all([loadBlogIndex(), searchParams]);
  return (
    <SsrPageDataProvider value={{ blogIndex }}>
      <InitialSearch values={query}><BlogPage /></InitialSearch>
    </SsrPageDataProvider>
  );
}
