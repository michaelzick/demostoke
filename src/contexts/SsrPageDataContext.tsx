'use client';

import { ReactNode, createContext, useContext } from "react";
import { DemoEvent } from "@/types/demo-calendar";
import type { PublicGearReview } from "@/services/public-gear-reviews";
import type { Equipment } from "@/types";
import type { PublicProfile } from "@/services/public-profile";
import type { BlogPost } from "@/lib/blog/types";

export interface SsrPageData {
  blogIndex?: BlogPost[];
  demoEvents?: DemoEvent[];
  equipment?: Equipment;
  reviews?: PublicGearReview[];
  publicProfile?: PublicProfile;
  demoEvent?: DemoEvent | null;
  demoEventResolved?: boolean;
  blog?: { slug: string; post: BlogPost | null };
}

const SsrPageDataContext = createContext<SsrPageData>({});

interface SsrPageDataProviderProps {
  children: ReactNode;
  value?: SsrPageData;
}

export const SsrPageDataProvider = ({
  children,
  value = {},
}: SsrPageDataProviderProps) => (
  <SsrPageDataContext.Provider value={value}>
    {children}
  </SsrPageDataContext.Provider>
);

export const useSsrPageData = () => useContext(SsrPageDataContext);
