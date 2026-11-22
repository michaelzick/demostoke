import type { ReactNode } from 'react';
import { addQuery, type SearchValues } from '@/lib/seo/redirect-query';
import { InitialSearchProvider } from '@/lib/navigation';

export function InitialSearch({ children, values }: {
  children: ReactNode;
  values: SearchValues;
}) {
  return <InitialSearchProvider value={addQuery('', values)}>{children}</InitialSearchProvider>;
}
