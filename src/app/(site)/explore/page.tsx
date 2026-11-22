import Screen from '@/screens/ExplorePage';
import { routeMetadata } from '@/lib/seo/next-metadata';
import { InitialSearch } from '@/app/initial-search';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  return routeMetadata('/explore', Object.keys(await searchParams).length ? 'noindex, follow' : undefined);
}

export default async function Page({ searchParams }: Props) {
  return <InitialSearch values={await searchParams}><Screen /></InitialSearch>;
}
