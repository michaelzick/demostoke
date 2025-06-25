
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DimensionSpecificationsProps {
  dimensions: {
    length: string;
    width: string;
    thickness?: string;
  };
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
}

const DimensionSpecifications = ({
  dimensions,
  setDimensions
}: DimensionSpecificationsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <Label htmlFor="length" className="block text-lg font-medium mb-2">
          Length
        </Label>
        <Input
          id="length"
          type="text"
          placeholder="e.g. 5'4&quot; or 162cm"
          value={dimensions.length}
          onChange={(e) =>
            setDimensions({ ...dimensions, length: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="width" className="block text-lg font-medium mb-2">
          Width
        </Label>
        <Input
          id="width"
          type="text"
          placeholder="e.g. 20&quot; or 51cm"
          value={dimensions.width}
          onChange={(e) =>
            setDimensions({ ...dimensions, width: e.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="thickness" className="block text-lg font-medium mb-2">
          Thickness
        </Label>
        <Input
          id="thickness"
          type="text"
          placeholder="e.g. 3&quot; or 7.6cm"
          value={dimensions.thickness || ""}
          onChange={(e) =>
            setDimensions({ ...dimensions, thickness: e.target.value })
          }
        />
      </div>
    </div>
  );
};

export default DimensionSpecifications;
