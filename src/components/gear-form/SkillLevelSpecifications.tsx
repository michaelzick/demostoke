
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useRef } from "react";

interface SkillLevelSpecificationsProps {
  selectedSkillLevels: string[];
  setSelectedSkillLevels: (skillLevels: string[]) => void;
  setSkillLevel: (value: string) => void;
  gearType: string;
}

const SkillLevelSpecifications = ({
  selectedSkillLevels,
  setSelectedSkillLevels,
  setSkillLevel,
  gearType
}: SkillLevelSpecificationsProps) => {
  const universalSkillLevels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const selectAllRef = useRef<HTMLButtonElement>(null);

  const handleSkillLevelToggle = (level: string) => {
    const newSkillLevels = selectedSkillLevels.includes(level)
      ? selectedSkillLevels.filter(l => l !== level)
      : [...selectedSkillLevels, level];
    
    setSelectedSkillLevels(newSkillLevels);
    // Update skillLevel for backward compatibility
    setSkillLevel(newSkillLevels.join(", "));
  };

  const handleSelectAll = () => {
    const allSelected = selectedSkillLevels.length === universalSkillLevels.length;
    const newSkillLevels = allSelected ? [] : [...universalSkillLevels];
    setSelectedSkillLevels(newSkillLevels);
    // Update skillLevel for backward compatibility
    setSkillLevel(newSkillLevels.join(", "));
  };

  const allSelected = selectedSkillLevels.length === universalSkillLevels.length;
  const someSelected = selectedSkillLevels.length > 0 && selectedSkillLevels.length < universalSkillLevels.length;

  // Set indeterminate state using useEffect
  useEffect(() => {
    if (selectAllRef.current) {
      const checkbox = selectAllRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) {
        checkbox.indeterminate = someSelected;
      }
    }
  }, [someSelected]);

  return (
    <div>
      <Label className="block text-lg font-medium mb-2">
        Suitable Skill Levels <span className="text-red-500">*</span>
      </Label>
      
      {/* Select All checkbox */}
      {gearType && (
        <div className="flex items-center space-x-2 mb-3 pb-2 border-b">
          <Checkbox
            ref={selectAllRef}
            id="select-all-skill-levels"
            checked={allSelected}
            onCheckedChange={handleSelectAll}
          />
          <Label
            htmlFor="select-all-skill-levels"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select All
          </Label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {universalSkillLevels.map((level) => (
          <div key={level} className="flex items-center space-x-2">
            <Checkbox
              id={`skill-${level}`}
              checked={selectedSkillLevels.includes(level)}
              onCheckedChange={() => handleSkillLevelToggle(level)}
              disabled={!gearType}
            />
            <Label
              htmlFor={`skill-${level}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {level}
            </Label>
          </div>
        ))}
      </div>
      {selectedSkillLevels.length === 0 && gearType && (
        <p className="text-sm text-red-500 mt-1">Please select at least one skill level</p>
      )}
      {!gearType && (
        <p className="text-sm text-gray-500 mt-1">Select gear type first</p>
      )}
    </div>
  );
};

export default SkillLevelSpecifications;
