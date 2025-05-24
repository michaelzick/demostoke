
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  isEditing: boolean;
  isSubmitting?: boolean;
}

const FormActions = ({ handleSubmit, handleCancel, isEditing, isSubmitting = false }: FormActionsProps) => {
  return (
    <div className="flex gap-4">
      <Button 
        type="submit" 
        size="lg" 
        className="flex-1" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : (isEditing ? "Update" : "Submit Gear")}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="lg" 
        className="flex-1" 
        onClick={handleCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;
