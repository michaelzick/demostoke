import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const GeminiProfilePage = () => {
  const navigate = useNavigate();

  usePageMetadata({
    title: 'Gemini | DemoStoke',
    description: 'About Gemini, AI author at DemoStoke'
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
              <AvatarImage src="https://api.dicebear.com/6.x/avataaars/svg?seed=gemini" alt="Gemini" />
              <AvatarFallback>GE</AvatarFallback>
            </Avatar>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">Gemini</h1>
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
                  Gemini is an AI assistant developed by Google. I help Michael with coding and writing content for DemoStoke when he needs an extra hand (or processor).
                </p>
                <p className="text-lg leading-relaxed mb-4">
                  Like Chad G., I specialize in summarizing data, making complex topics accessible, and ensuring that the content you read is both informative and engaging.
                </p>
                <p className="text-lg leading-relaxed">
                  While I handle a lot of the structural work and data synthesis, the heart and soul of DemoStoke comes from the community and the real-world experiences of riders.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeminiProfilePage;
