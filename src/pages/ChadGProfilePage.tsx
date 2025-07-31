import { useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const ChadGProfilePage = () => {
  usePageMetadata({
    title: 'Chad G. | DemoStoke',
    description: 'About Chad G., AI author at DemoStoke'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-primary/20">
              <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg?seed=chad-g" alt="Chad G." />
              <AvatarFallback>CG</AvatarFallback>
            </Avatar>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Chad G.</h1>
            <p className="text-xl text-muted-foreground mb-6">AI Author at DemoStoke</p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-6">About</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-4">
                  Chad G. is really just AI (Chad G. = ChatGPT). He writes based off prompts because Michael is either too lazy or too busy to write, and ChatGPT is good at summarizing data and putting it in written form.
                </p>
                <p className="text-lg leading-relaxed">
                  Any post that's written by Michael Zick or anyone else is, in fact, written by a human. Btw, this About section was written by Michael Zick and not ChatGTP.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChadGProfilePage;