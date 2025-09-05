import { Card, CardContent } from "@/components/ui/card";
import { Snowflake, Mountain, Waves, Bike } from "lucide-react";

interface CategorySelectionProps {
  value: string;
  onChange: (value: string) => void;
}

const categories = [
  {
    id: 'snowboards',
    name: 'Snowboards',
    icon: Snowflake,
    description: 'All-mountain, freestyle, freeride, and alpine snowboards'
  },
  {
    id: 'skis',
    name: 'Skis',
    icon: Mountain,
    description: 'All-mountain, freestyle, touring, and racing skis'
  },
  {
    id: 'surfboards',
    name: 'Surfboards',
    icon: Waves,
    description: 'Shortboards, longboards, fish, and specialty surfboards'
  },
  {
    id: 'mountain-bikes',
    name: 'Mountain Bikes',
    icon: Bike,
    description: 'Cross-country, trail, enduro, and downhill bikes'
  }
];

const CategorySelection = ({ value, onChange }: CategorySelectionProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Your Gear Category</h3>
        <p className="text-muted-foreground">
          Select the type of equipment you're looking for to get personalized recommendations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = value === category.id;
        
        return (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              isSelected
                ? 'ring-2 ring-primary bg-primary/10 border-primary/50'
                : 'hover:border-primary/30'
            }`}
            onClick={() => onChange(category.id)}
          >
            <CardContent className="p-6 text-center">
              <Icon className={`w-12 h-12 mx-auto mb-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </CardContent>
          </Card>
        );
      })}
      </div>
    </div>
  );
};

export default CategorySelection;