import { useMockData } from './useMockData';
import { slugify } from '@/utils/slugify';
import type { UserProfile } from '@/types';

export const useMockUserProfileBySlug = (slug: string): UserProfile | null => {
  const { owners } = useMockData();

  const mockOwner = owners.find(owner => slugify(owner.name) === slug);

  if (!mockOwner) {
    return null;
  }

  return {
    id: mockOwner.id,
    name: mockOwner.name,
    email: `${mockOwner.id}@mock.email`,
    avatar_url: mockOwner.imageUrl,
    about: `Hi, I'm ${mockOwner.name}! ${mockOwner.personality || 'I love sharing my gear with others and helping them enjoy their adventures.'}`,
    member_since: '2020-01-01T00:00:00.000Z',
    created_at: '2020-01-01T00:00:00.000Z',
    hero_image_url: null,
    displayRole: 'private-party',
  };
};
