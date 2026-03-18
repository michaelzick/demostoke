import { Equipment } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface EquipmentSpecsProps {
  specifications: Equipment["specifications"];
}

const EquipmentSpecs = ({ specifications }: EquipmentSpecsProps) => {
  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

      <div className="grid gap-4 rounded-lg border bg-muted/40 p-5 md:grid-cols-[minmax(0,1fr)_12rem] md:items-center">
        <div>
          <h3 className="text-base font-semibold">Not sure this gear is right for you?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Answer a few quick questions and get personalized guidance on whether this setup fits your size, skill level, and riding goals.
          </p>
        </div>
        <div className="md:w-48">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full bg-white/20 dark:bg-zinc-900/50 dark:border-white border-zinc-600 dark:hover:bg-white/30 dark:hover:bg-zinc-500/40 transition-colors"
          >
            <Link to="/gear-quiz">Take the Quiz</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentSpecs;
