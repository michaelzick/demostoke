
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Specifications {
  size: string;
  weight: string;
  material: string;
  suitable: string;
}

interface EquipmentSpecsProps {
  specifications: Specifications;
}

const EquipmentSpecs = ({ specifications }: EquipmentSpecsProps) => {
  // Parse comma-separated sizes into individual badges
  const parseSize = (sizeString: string) => {
    if (!sizeString) return [];
    // Split by comma and clean up each size
    return sizeString.split(',').map(size => size.trim()).filter(Boolean);
  };

  const sizes = parseSize(specifications.size);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sizes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Available Sizes</h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size, index) => (
                <Badge key={index} variant="outline">
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {specifications.weight && (
          <div>
            <h4 className="font-medium mb-1">Weight</h4>
            <p className="text-muted-foreground">{specifications.weight}</p>
          </div>
        )}
        
        {specifications.material && (
          <div>
            <h4 className="font-medium mb-1">Material</h4>
            <p className="text-muted-foreground">{specifications.material}</p>
          </div>
        )}
        
        {specifications.suitable && (
          <div>
            <h4 className="font-medium mb-1">Suitable For</h4>
            <p className="text-muted-foreground">{specifications.suitable}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentSpecs;
