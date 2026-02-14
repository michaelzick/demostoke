import { Link } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";

const GearIndexPage = () => {
  usePageMetadata({
    title: "Gear Index | DemoStoke",
    description:
      "DemoStoke indexes real-world rental and used gear with location and freshness timestamps.",
    canonicalUrl: "https://www.demostoke.com/gear",
  });

  return (
    <div className="container px-4 md:px-6 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">DemoStoke Gear Index</h1>
      <p className="text-muted-foreground mb-8">
        We index real-world rental and used gear listings with model naming,
        location context, and last-verified timestamps.
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">High-value indexes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <Link className="underline hover:text-primary" to="/search">
                /gear search
              </Link>
            </li>
            <li>
              <Link className="underline hover:text-primary" to="/gear/surfboards">
                /gear/surfboards
              </Link>
            </li>
            <li>
              <Link className="underline hover:text-primary" to="/gear/used-skis">
                /gear/used-skis
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">API docs</h2>
          <p className="text-muted-foreground">
            <Link className="underline hover:text-primary" to="/api/gear/search">
              /api/gear/search
            </Link>
            {" "}documents the search endpoint pattern used for gear discovery.
          </p>
        </section>
      </div>
    </div>
  );
};

export default GearIndexPage;
