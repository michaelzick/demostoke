import Screen from '@/screens/GearIndexPage';
import { GearLinks } from '@/app/gear-links';
import { routeMetadata } from '@/lib/seo/next-metadata';
import { loadGearLinks } from '@/lib/server/public-catalog';

export const dynamic = 'force-dynamic';
export const metadata = routeMetadata('/gear');

export default async function Page() {
  const items = await loadGearLinks({});
  return <><Screen /><GearLinks items={items} /></>;
}
