import type { ReactNode } from 'react';
import { isReadOnlyPreview } from '@/lib/deployment';

export function PreviewGuard({ children }: { children: ReactNode }) {
  if (!isReadOnlyPreview) return children;
  return (
    <section className="container mx-auto py-12">
      <h1 className="text-2xl font-semibold">Read-only preview</h1>
      <p className="mt-3">Sign-in and editing are available in the local test environment.</p>
    </section>
  );
}
