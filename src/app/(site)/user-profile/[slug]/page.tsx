import { notFound } from 'next/navigation';
import ProfilePage from '@/screens/RealUserProfilePage';
import { SsrPageDataProvider } from '@/contexts/SsrPageDataContext';
import { loadProfile } from '@/lib/server/public-profile';
import { loadGearLinks } from '@/lib/server/public-catalog';
import { GearLinks } from '@/app/gear-links';
import { toNextMetadata } from '@/lib/seo/next-metadata';
import { PUBLIC_SITE_URL, buildUserProfileDescription, buildUserProfileTitle } from '@/lib/seo/publicMetadata';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = await loadProfile(slug);
  if (!profile) notFound();
  return toNextMetadata({
    title: buildUserProfileTitle(profile.name),
    description: buildUserProfileDescription(profile.name, profile.about || profile.address || profile.website || ''),
    canonicalUrl: `${PUBLIC_SITE_URL}/user-profile/${slug}`,
    image: profile.hero_image_url || profile.avatar_url || undefined,
  });
}

export default async function Page({ params }: Props) {
  const profile = await loadProfile((await params).slug);
  if (!profile) notFound();
  const items = await loadGearLinks({ ownerId: profile.id });
  return (
    <SsrPageDataProvider value={{ publicProfile: profile }}>
      <ProfilePage />
      <GearLinks items={items} />
    </SsrPageDataProvider>
  );
}
