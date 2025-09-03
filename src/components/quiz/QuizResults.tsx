import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle, MapPin, TrendingUp, Target } from "lucide-react";

interface QuizResultsProps {
  results: any;
  onRetakeQuiz: () => void;
}

const QuizResults = ({ results, onRetakeQuiz }: QuizResultsProps) => {
  if (!results) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No results available. Please retake the quiz.</p>
        <Button onClick={onRetakeQuiz} className="mt-4">
          Retake Quiz
        </Button>
      </div>
    );
  }

  const { recommendations = [], personalizedAdvice, skillDevelopment, locationConsiderations } = results;

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
            <Card key={index} className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    {rec.category && (
                      <Badge variant="secondary" className="mt-2">
                        {rec.category}
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
          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
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
          <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
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
          <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
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