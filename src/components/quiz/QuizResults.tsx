import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, MapPin, TrendingUp, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Equipment } from "@/types";
import { fetchEquipmentFromSupabase } from "@/services/equipment/equipmentDataService";
import CompactEquipmentCard from "@/components/CompactEquipmentCard";
import { sanitizeQuizResults } from "@/utils/contentSanitization";

interface QuizResultsProps {
  results: any;
  onRetakeQuiz: () => void;
  quizData?: {
    category: string;
    skillLevel: string;
  };
}

const QuizResults = ({ results, onRetakeQuiz, quizData }: QuizResultsProps) => {
  const [recommendedGear, setRecommendedGear] = useState<Equipment[]>([]);
  const [loadingGear, setLoadingGear] = useState(true);

  // Skill level badge colors
  const getSkillBadgeVariant = (skillLevel: string) => {
    switch (skillLevel?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  useEffect(() => {
    const fetchRecommendedGear = async () => {
      if (!quizData?.category || !quizData?.skillLevel) return;

      try {
        setLoadingGear(true);
        const allEquipment = await fetchEquipmentFromSupabase();

        // Progressive filtering strategy to ensure at least 3 recommendations
        const getFilteredGear = (equipment: Equipment[], category: string, skillLevel: string) => {
          // Helper function to check if equipment matches skill level
          const matchesSkillLevel = (suitable: string | undefined, targetLevel: string, exact = false) => {
            if (!suitable) return false;
            const suitableItems = suitable.toLowerCase().split(',').map(s => s.trim());
            const target = targetLevel.toLowerCase();

            if (exact) {
              return suitableItems.includes(target);
            }

            // Check if any suitable level matches or includes the target
            return suitableItems.some(item =>
              item === target ||
              item.includes(target) ||
              target.includes(item)
            );
          };

          // Get adjacent skill levels for fallback
          const getAdjacentSkillLevels = (level: string) => {
            const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
            const currentIndex = levels.indexOf(level.toLowerCase());
            const adjacent = [];

            if (currentIndex > 0) adjacent.push(levels[currentIndex - 1]);
            if (currentIndex < levels.length - 1) adjacent.push(levels[currentIndex + 1]);

            return adjacent;
          };

          // Step 1: Try exact skill level match
          let filtered = equipment.filter(item =>
            item.category === category &&
            matchesSkillLevel(item.specifications?.suitable, skillLevel, true)
          );

          // Step 2: If less than 3, include adjacent skill levels
          if (filtered.length < 3) {
            const adjacentLevels = getAdjacentSkillLevels(skillLevel);
            const additionalGear = equipment.filter(item =>
              item.category === category &&
              !filtered.find(f => f.id === item.id) && // Don't duplicate
              (matchesSkillLevel(item.specifications?.suitable, skillLevel) ||
               adjacentLevels.some(level => matchesSkillLevel(item.specifications?.suitable, level)))
            );
            filtered = [...filtered, ...additionalGear];
          }

          // Step 3: If still less than 3, show all in category
          if (filtered.length < 3) {
            const remainingGear = equipment.filter(item =>
              item.category === category &&
              !filtered.find(f => f.id === item.id) // Don't duplicate
            );
            filtered = [...filtered, ...remainingGear];
          }

          // Return up to 8 items, prioritizing exact matches
          return filtered.slice(0, 8);
        };

        const filteredGear = getFilteredGear(allEquipment, quizData.category, quizData.skillLevel);
        setRecommendedGear(filteredGear);
      } catch (error) {
        console.error('Error fetching recommended gear:', error);
      } finally {
        setLoadingGear(false);
      }
    };

    fetchRecommendedGear();
  }, [quizData?.category, quizData?.skillLevel]);
  // Sanitize results for safe display
  const sanitizedResults = sanitizeQuizResults(results);

  if (!sanitizedResults) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No results available. Please retake the quiz.</p>
        <Button onClick={onRetakeQuiz} className="mt-4">
          Retake Quiz
        </Button>
      </div>
    );
  }

  const { recommendations = [], personalizedAdvice, skillDevelopment, locationConsiderations } = sanitizedResults;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <h2 className="text-2xl font-bold">Your Personal Gear Analysis</h2>
        </div>
        <p className="text-muted-foreground">
          Based on your profile, here are our expert recommendations
        </p>
      </div>

      {/* Gear Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Recommended Gear
          </h3>
          {recommendations.map((rec: any, index: number) => (
            <Card key={index} className="bg-card rounded-lg shadow-sm border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                     {quizData?.skillLevel && (
                      <Badge className={`mt-2 ${getSkillBadgeVariant(quizData.skillLevel)}`}>
                        {quizData.skillLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{rec.description}</p>

                {rec.keyFeatures && rec.keyFeatures.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Key Features:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {rec.keyFeatures.map((feature: string, idx: number) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.suitableFor && (
                  <div>
                    <h4 className="font-medium mb-2">Perfect For:</h4>
                    <p className="text-sm text-muted-foreground">{rec.suitableFor}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      {/* Additional Advice Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalizedAdvice && (
          <Card className="bg-card rounded-lg shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                Personalized Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{personalizedAdvice}</p>
            </CardContent>
          </Card>
        )}

        {skillDevelopment && (
          <Card className="bg-card rounded-lg shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Skill Development
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{skillDevelopment}</p>
            </CardContent>
          </Card>
        )}

        {locationConsiderations && (
          <Card className="bg-card rounded-lg shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Location Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{locationConsiderations}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Recommended Gear from Database */}
      {recommendedGear.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Available Gear for You
          </h3>
          {loadingGear ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedGear.map((equipment) => (
                <CompactEquipmentCard
                  key={equipment.id}
                  equipment={equipment}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button onClick={onRetakeQuiz} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retake Quiz
        </Button>
        <Button asChild>
          <a href="/explore">Browse Our Gear</a>
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="bg-muted/30 p-4 rounded-lg mt-8">
        <p className="text-xs text-muted-foreground text-center">
          <span className="font-medium">Note:</span> These recommendations are AI-generated based on your profile.
          Always consult with gear experts and try equipment when possible before making purchase decisions.
        </p>
      </div>
    </div>
  );
};

export default QuizResults;
