
import { useMockData } from "./useMockData";

interface MockUserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  about: string | null;
  member_since: string;
  created_at: string;
}

export const useMockUserProfile = (userId: string): MockUserProfile | null => {
  const { owners } = useMockData();

  const mockOwner = owners.find(owner => owner.id === userId);
  
  if (!mockOwner) {
    return null;
  }

  return {
    id: mockOwner.id,
    name: mockOwner.name,
    avatar_url: mockOwner.imageUrl,
    role: 'private-party',
    about: `Hi, I'm ${mockOwner.name}! ${mockOwner.personality || 'I love sharing my gear with others and helping them enjoy their adventures.'}`,
    member_since: '2020-01-01T00:00:00.000Z',
    created_at: '2020-01-01T00:00:00.000Z'
  };
};
