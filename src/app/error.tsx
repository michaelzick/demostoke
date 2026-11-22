'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container mx-auto py-16">
      <h1 className="text-3xl font-bold">Page temporarily unavailable</h1>
      <p className="py-4">Try again in a moment.</p>
      <button type="button" className="underline" onClick={reset}>Try again</button>
    </section>
  );
}
