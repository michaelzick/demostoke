
import { Equipment } from "@/types";

interface EquipmentSpecsProps {
  specifications: Equipment["specifications"];
}

const EquipmentSpecs = ({ specifications }: EquipmentSpecsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">Size</div>
        <div className="font-medium">{specifications.size}</div>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">Weight</div>
        <div className="font-medium">{specifications.weight}</div>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">Material</div>
        <div className="font-medium">{specifications.material}</div>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">Suitable For</div>
        <div className="font-medium">{specifications.suitable}</div>
      </div>
    </div>
  );
};

export default EquipmentSpecs;
