import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, Target } from "lucide-react";
import { Equipment } from "@/types";
import { GearCandidate, QuizAnalysisResult, QuizRecommendation } from "@/types/quiz";
import CompactEquipmentCard from "@/components/CompactEquipmentCard";
import MapComponent from "@/components/MapComponent";
import { sanitizeQuizResults } from "@/utils/contentSanitization";

interface QuizResultsProps {
  results: QuizAnalysisResult | null;
  onRetakeQuiz: () => void;
  quizData?: {
    category: string;
    skillLevel: string;
  };
  dbCandidates: GearCandidate[];
}

const QuizResults = ({ results, onRetakeQuiz, quizData, dbCandidates }: QuizResultsProps) => {
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

  // Sanitize results for safe display
  const sanitizedResults = sanitizeQuizResults(results);

  // Derive matchedEquipment from matchedIds + dbCandidates
  const matchedEquipment: Equipment[] = (results?.matchedIds ?? [])
    .map(id => dbCandidates.find(c => c.id === id))
    .filter((c): c is GearCandidate => c !== undefined)
    .map(c => ({
      id: c.id,
      name: c.name,
      category: quizData?.category ?? "",
      description: c.description,
      price_per_day: c.price_per_day,
      location: {
        lat: c.location_lat ?? 0,
        lng: c.location_lng ?? 0,
        address: c.location_address ?? "",
      },
      image_url: "",
      rating: 0,
      review_count: 0,
      distance: 0,
      owner: { id: "", name: "", imageUrl: "", rating: 0, reviewCount: 0, responseRate: 0 },
      specifications: { size: "", weight: "", material: "", suitable: c.suitable_skill_level ?? "" },
      availability: { available: true },
      pricing_options: [],
    }));

  // Derive mapItems — only items with valid coordinates
  const mapItems = matchedEquipment.filter(
    item => item.location.lat !== 0 && item.location.lng !== 0
  );

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

  const { recommendations = [] } = sanitizedResults;

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
          {recommendations.map((rec: QuizRecommendation, index: number) => (
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

      {/* Gear Matched for You */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Gear Matched for You
        </h3>

        {/* Mini map — only when there are items with valid coordinates */}
        {mapItems.length > 0 && (
          <div className="h-80 rounded-lg overflow-hidden mb-4">
            <MapComponent
              initialEquipment={mapItems.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price_per_day: item.price_per_day,
                location: { lat: item.location.lat, lng: item.location.lng },
                ownerId: "",
                ownerName: "",
              }))}
              activeCategory={quizData?.category ?? null}
              interactive={true}
            />
          </div>
        )}

        {matchedEquipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matchedEquipment.map((equipment) => (
              <CompactEquipmentCard
                key={equipment.id}
                equipment={equipment}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No matching gear found in our current inventory
          </p>
        )}
      </div>

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
