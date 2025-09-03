import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, Target, Award } from "lucide-react";

interface SkillLevelSelectionProps {
  value: string;
  onChange: (value: string) => void;
}

const skillLevels = [
  {
    id: 'beginner',
    name: 'Beginner',
    icon: Star,
    description: 'Just starting out or have limited experience',
    details: 'Learning basics, comfortable on easy terrain'
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    icon: TrendingUp,
    description: 'Comfortable with fundamentals, exploring new terrain',
    details: 'Can handle moderate conditions, developing technique'
  },
  {
    id: 'advanced',
    name: 'Advanced',
    icon: Target,
    description: 'Experienced with strong technique and confidence',
    details: 'Comfortable in challenging conditions, refined skills'
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: Award,
    description: 'Highly skilled with extensive experience',
    details: 'Mastery of technique, comfortable in all conditions'
  }
];

const SkillLevelSelection = ({ value, onChange }: SkillLevelSelectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {skillLevels.map((level) => {
        const Icon = level.icon;
        const isSelected = value === level.id;
        
        return (
          <Card
            key={level.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              isSelected
                ? 'ring-2 ring-primary bg-primary/10 border-primary/50'
                : 'hover:border-primary/30'
            }`}
            onClick={() => onChange(level.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Icon className={`w-8 h-8 mt-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{level.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                  <p className="text-xs text-muted-foreground">{level.details}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SkillLevelSelection;