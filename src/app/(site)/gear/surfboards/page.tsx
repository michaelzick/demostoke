import Screen from '@/screens/GearCategoryPage';
import { GearLinks } from '@/app/gear-links';
import { routeMetadata } from '@/lib/seo/next-metadata';
import { loadGearLinks } from '@/lib/server/public-catalog';

export const dynamic = 'force-dynamic';
export const metadata = routeMetadata('/gear/surfboards');

export default async function Page() {
  const items = await loadGearLinks({ category: "surfboards" });
  return <><Screen categoryKey="surfboards" /><GearLinks items={items} /></>;
}
