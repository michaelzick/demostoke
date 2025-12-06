import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, Play, ChevronDown, ChevronUp } from "lucide-react";
import { useTricksGeneration, Trick } from "@/hooks/useTricksGeneration";
import { YouTubeTutorialModal } from "./YouTubeTutorialModal";
import { getCategoryDisplayName } from "@/helpers";

interface TricksSectionProps {
  category: string;
  subcategory?: string;
  equipmentName: string;
  specifications?: Record<string, string>;
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
};

export function TricksSection({ category, subcategory, equipmentName, specifications }: TricksSectionProps) {
  const { tricks, isLoading, error, generateTricks } = useTricksGeneration();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTrick, setSelectedTrick] = useState<Trick | null>(null);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  const handleGenerateTricks = async () => {
    setIsExpanded(true);
    await generateTricks({
      category,
      subcategory,
      name: equipmentName,
      specifications,
    });
  };

  const handleTrickClick = (trick: Trick) => {
    setSelectedTrick(trick);
    setShowTutorialModal(true);
  };

  const categoryDisplay = getCategoryDisplayName(category);

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Learn {categoryDisplay} Tricks</h3>
          </div>
          {tricks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {tricks.length === 0 && !isLoading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Discover tricks and techniques you can learn with this {categoryDisplay.toLowerCase()}.
            </p>
            <Button onClick={handleGenerateTricks} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Tricks
                </>
              )}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">AI is generating tricks...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-destructive mb-2">Failed to generate tricks</p>
            <Button variant="outline" onClick={handleGenerateTricks}>
              Try Again
            </Button>
          </div>
        )}

        {tricks.length > 0 && isExpanded && (
          <div className="grid gap-3">
            {tricks.map((trick, index) => (
              <button
                key={index}
                onClick={() => handleTrickClick(trick)}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left w-full group"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Play className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{trick.name}</span>
                    <Badge variant="outline" className={difficultyColors[trick.difficulty]}>
                      {trick.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {trick.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {tricks.length > 0 && !isExpanded && (
          <Button
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="w-full"
          >
            Show {tricks.length} tricks
          </Button>
        )}
      </Card>

      <YouTubeTutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        trick={selectedTrick}
      />
    </>
  );
}
