import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface AdditionalNotesProps {
  value: string;
  onChange: (value: string) => void;
}

const AdditionalNotes = ({ value, onChange }: AdditionalNotesProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Anything else we should know?</h3>
          <p className="text-muted-foreground">Share any specific needs, goals, or preferences (optional)</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          placeholder="e.g., recovering from injury, prefer eco-friendly brands, budget considerations, specific goals like learning tricks, planning a big trip, looking for rental gear, want something family-friendly..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px] resize-none"
        />
        <p className="text-sm text-muted-foreground">
          This is completely optional, but any additional context helps us provide more personalized recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-muted/20 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Consider mentioning:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Budget range or constraints</li>
            <li>• Injury history or physical limitations</li>
            <li>• Specific riding goals or aspirations</li>
            <li>• Brand preferences or dislikes</li>
          </ul>
        </div>
        <div className="bg-muted/20 p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Also helpful:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Planning any specific trips</li>
            <li>• Need for rental vs. purchase</li>
            <li>• Beginner friend/family considerations</li>
            <li>• Storage or transport limitations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdditionalNotes;