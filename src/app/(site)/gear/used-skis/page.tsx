import Screen from '@/screens/GearCategoryPage';
import { GearLinks } from '@/app/gear-links';
import { routeMetadata } from '@/lib/seo/next-metadata';
import { loadGearLinks } from '@/lib/server/public-catalog';

export const dynamic = 'force-dynamic';
export const metadata = routeMetadata('/gear/used-skis');

export default async function Page() {
  const items = await loadGearLinks({ category: "skis" });
  return <><Screen categoryKey="used-skis" /><GearLinks items={items} /></>;
}
