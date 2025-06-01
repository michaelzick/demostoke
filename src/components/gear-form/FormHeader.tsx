
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormHeaderProps {
  title: string;
}

const FormHeader = ({ title }: FormHeaderProps) => {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <Button variant="ghost" asChild className="self-start p-2">
        <Link to="/list-gear" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List Your Gear
        </Link>
      </Button>
      <h1 className="text-4xl font-bold">{title}</h1>
    </div>
  );
};

export default FormHeader;
