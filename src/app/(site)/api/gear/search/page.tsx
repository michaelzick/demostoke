import Screen from '@/screens/ApiGearSearchPage';
import { toNextMetadata } from '@/lib/seo/next-metadata';
import { UTILITY_ROUTE_META } from '@/lib/seo/policy';

export const metadata = toNextMetadata({ ...UTILITY_ROUTE_META['/api/gear/search'], robots: 'noindex, follow' });

export default Screen;
