import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategorySelection from "@/components/quiz/CategorySelection";
import PhysicalStats from "@/components/quiz/PhysicalStats";
import SkillLevelSelection from "@/components/quiz/SkillLevelSelection";
import LocationInput from "@/components/quiz/LocationInput";
import CurrentGearInput from "@/components/quiz/CurrentGearInput";
import AdditionalNotes from "@/components/quiz/AdditionalNotes";
import QuizResults from "@/components/quiz/QuizResults";
import QuizProgress from "@/components/quiz/QuizProgress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateQuizData, sanitizeQuizData } from "@/utils/quizValidation";

interface QuizData {
  category: string;
  height: string;
  weight: string;
  age: string;
  sex: string;
  skillLevel: string;
  locations: string;
  currentGear: string;
  additionalNotes: string;
}

const GearQuizPage = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const totalSteps = 6;

  const [quizData, setQuizData] = useState<QuizData>({
    category: '',
    height: '',
    weight: '',
    age: '',
    sex: '',
    skillLevel: '',
    locations: '',
    currentGear: '',
    additionalNotes: ''
  });

  const updateQuizData = (field: keyof QuizData, value: string) => {
    setQuizData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return quizData.category !== '';
      case 2:
        return quizData.height !== '' && quizData.weight !== '' && quizData.age !== '' && quizData.sex !== '';
      case 3:
        return quizData.skillLevel !== '';
      case 4:
        return quizData.locations.trim() !== '';
      case 5:
        return quizData.currentGear.trim() !== '';
      case 6:
        return true; // Additional notes are optional
      default:
        return true;
    }
  };

  const submitQuiz = async () => {
    setIsLoading(true);
    try {
      // Validate and sanitize data before submission
      const validation = validateQuizData(quizData);
      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: validation.error || "Please check your input and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const sanitizedData = sanitizeQuizData(quizData);

      const { data, error } = await supabase.functions.invoke('gear-quiz-analysis', {
        body: sanitizedData
      });

      if (error) throw error;

      setResults(data);
      setCurrentStep(7); // Move to results step
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(1);
    setResults(null);
    setQuizData({
      category: '',
      height: '',
      weight: '',
      age: '',
      sex: '',
      skillLevel: '',
      locations: '',
      currentGear: '',
      additionalNotes: ''
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <CategorySelection value={quizData.category} onChange={(value) => updateQuizData('category', value)} />;
      case 2:
        return <PhysicalStats
          height={quizData.height}
          weight={quizData.weight}
          age={quizData.age}
          sex={quizData.sex}
          onChange={updateQuizData}
        />;
      case 3:
        return <SkillLevelSelection value={quizData.skillLevel} onChange={(value) => updateQuizData('skillLevel', value)} />;
      case 4:
        return <LocationInput value={quizData.locations} onChange={(value) => updateQuizData('locations', value)} />;
      case 5:
        return <CurrentGearInput
          value={quizData.currentGear}
          onChange={(value) => updateQuizData('currentGear', value)}
          category={quizData.category}
        />;
      case 6:
        return <AdditionalNotes value={quizData.additionalNotes} onChange={(value) => updateQuizData('additionalNotes', value)} />;
      case 7:
        return <QuizResults results={results} onRetakeQuiz={resetQuiz} quizData={quizData} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Choose Your Gear Category";
      case 2:
        return "Tell Us About Yourself";
      case 3:
        return "What's Your Skill Level?";
      case 4:
        return "Where Do You Ride?";
      case 5:
        return "Current Gear Preferences";
      case 6:
        return "Additional Notes";
      case 7:
        return "Your Personalized Recommendations";
      default:
        return "Gear Quiz";
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Gear Quiz</h1>
          <p className="text-muted-foreground text-lg">
            Get personalized gear recommendations based on your unique profile
          </p>
        </div>

        {currentStep <= totalSteps && (
          <QuizProgress currentStep={currentStep} totalSteps={totalSteps} />
        )}

        <Card className="bg-card rounded-lg shadow-sm border">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {getStepTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderCurrentStep()}

            {currentStep <= totalSteps && (
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    disabled={!isStepValid()}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={submitQuiz}
                    disabled={!isStepValid() || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? "Analyzing..." : "Get My Recommendations"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GearQuizPage;
