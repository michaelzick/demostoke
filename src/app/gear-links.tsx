import Link from 'next/link';

export function GearLinks({ items }: { items: { href: string; name: string }[] }) {
  if (!items.length) return null;
  return (
    <section className="container max-w-4xl px-4 pb-12 md:px-6">
      <h2 className="mb-4 text-xl font-semibold">Available gear</h2>
      <ul className="grid list-inside list-disc gap-2 sm:grid-cols-2">
        {items.map(({ href, name }) => (
          <li key={href}><Link prefetch={false} className="underline hover:text-primary" href={href}>{name}</Link></li>
        ))}
      </ul>
    </section>
  );
}
