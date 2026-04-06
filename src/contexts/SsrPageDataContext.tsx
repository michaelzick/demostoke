import { ReactNode, createContext, useContext } from "react";
import { DemoEvent } from "@/types/demo-calendar";

export interface SsrPageData {
  demoEvent?: DemoEvent | null;
  demoEventResolved?: boolean;
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

declare global {
  interface Window {
    __SSR_PAGE_DATA__?: SsrPageData;
  }
}
