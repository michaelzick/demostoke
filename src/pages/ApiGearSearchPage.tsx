import usePageMetadata from "@/hooks/usePageMetadata";

const ApiGearSearchPage = () => {
  usePageMetadata({
    title: "API: Gear Search | DemoStoke",
    description:
      "Documentation for DemoStoke gear search query patterns and indexable entry points.",
    canonicalUrl: "https://www.demostoke.com/api/gear/search",
  });

  return (
    <div className="container px-4 md:px-6 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">DemoStoke Gear Search API</h1>
      <p className="text-muted-foreground mb-6">
        Endpoint pattern:
        {" "}
        <code className="bg-muted px-1 py-0.5 rounded">
          /api/gear/search?q=&lt;query&gt;
        </code>
      </p>

      <div className="space-y-4 text-sm">
        <p>
          Example queries:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <code>/api/gear/search?q=ci+neckbeard+5%2710+los+angeles</code>
          </li>
          <li>
            <code>/api/gear/search?q=used+skis+pasadena</code>
          </li>
          <li>
            <code>/api/gear/search?q=surfboard+rental+venice</code>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApiGearSearchPage;
