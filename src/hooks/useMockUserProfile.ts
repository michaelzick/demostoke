
import { useMockData } from "./useMockData";
import type { UserProfile } from "@/types";

export const useMockUserProfile = (userId: string): UserProfile | null => {
  const { owners } = useMockData();

  const mockOwner = owners.find(owner => owner.id === userId);

  if (!mockOwner) {
    return null;
  }

  return {
    id: mockOwner.id,
    name: mockOwner.name,
    email: `${mockOwner.id}@mock.email`, // Provide fake/mock email
    avatar_url: mockOwner.imageUrl,
    role: "private-party",
    about: `Hi, I'm ${mockOwner.name}! ${mockOwner.personality || "I love sharing my gear with others and helping them enjoy their adventures."}`,
    member_since: "2020-01-01T00:00:00.000Z",
    created_at: "2020-01-01T00:00:00.000Z",
    hero_image_url: null,
  };
};
