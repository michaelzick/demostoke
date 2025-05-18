
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  isEditing: boolean;
}

const FormActions = ({ handleSubmit, handleCancel, isEditing }: FormActionsProps) => {
  return (
    <div className="flex gap-4">
      <Button type="submit" size="lg" className="flex-1" onClick={handleSubmit}>
        {isEditing ? "Update Equipment" : "Submit Gear"}
      </Button>
      <Button type="button" variant="outline" size="lg" className="flex-1" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  );
};

export default FormActions;
