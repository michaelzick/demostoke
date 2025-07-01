import { useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";

const FOUNDER_ID = "98f914a6-2a72-455d-aa4b-41b081f4014d";

const AboutPage = () => {
  usePageMetadata({
    title: 'About DemoStoke',
    description: 'Learn how DemoStoke connects riders with local gear owners.'
  });
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: founderProfile } = useUserProfile(FOUNDER_ID);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800 dark:text-white">
      <h1 className="text-4xl font-bold mb-6">About DemoStoke</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">The Future of Trying Before You Buy</h2>
        <p className="mb-4">
          DemoStoke is a platform built for riders, by riders—created from a simple idea: what if you could demo gear the way you actually ride, not how the shop wants you to?
        </p>
        <p>
          We connect snow, surf, SUP, and skate enthusiasts with local gear owners, makers, and shops to offer a better way to try, rent, and share rideable equipment. No lines. No outdated rentals. Just gear that fits your style and the terrain you're on.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">For Every Kind of Rider</h2>
        <p className="mb-2">
          Whether you’re a weekend warrior, a traveling thrill-seeker, or just someone with a garage full of gear, DemoStoke makes it easy to find or share boards that match the moment.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Borrowers:</strong> Find and reserve quality gear near you</li>
          <li><strong>Lenders:</strong> Make cash from your quiver—set your terms, availability, and price</li>
          <li><strong>Shops & Shapers:</strong> Reach new customers, sponsor listings, and get feedback that informs R&D</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Community-Powered, Value-Driven</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Verified users, optional insurance, and safety-first design</li>
          <li>Deposits that protect both sides of the transaction</li>
          <li>Local-first, peer-to-peer ethos that supports real riders and small brands</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">The Data Layer Behind the Lifestyle</h2>
        <p className="mb-4">
          As DemoStoke grows, so does the insight it provides. Our platform quietly collects data on what riders demo, love, rent, and recommend—surfacing powerful trends for brands, retailers, and gear makers.
        </p>
        <p>
          We’re not just here to disrupt rentals. We’re building a new way to interact with the gear economy—smarter, more sustainable, and rooted in rider experience.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Built From Stoke</h2>
        <p>
          DemoStoke was born from a shared frustration—and a lot of passion. We believe in gear that fits the ride, and that the best way to grow the industry is to empower the community that rides it.
        </p>
      </section>

      <br /><br />
      <h1 className="text-4xl font-bold mb-6">Meet the Founder</h1>
      {founderProfile?.avatar_url && (
        <Avatar className="w-[175px] h-[175px] mx-auto mb-6">
          <AvatarImage src={founderProfile.avatar_url} alt="Michael Zick" />
          <AvatarFallback>MZ</AvatarFallback>
        </Avatar>
      )}

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Michael Zick</h2>
        <p className="mb-4">
          Michael is an avid outdoor enthusiast with a background in product management and software development. He has a deep love for snowboarding, surfing, and skateboarding, which inspired him to create DemoStoke.
        </p>
        <p>
          With years of experience in the tech industry, Michael recognized the need for a platform that connects riders with local gear owners, store managers, and surfboard shapers, and significantly reduces the friction in the demo market.
          His vision is to create a community-driven platform that empowers riders and promotes sustainable practices in the outdoor gear industry.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
