
import BikeSpecifications from "./BikeSpecifications";
import SizeSpecifications from "./SizeSpecifications";
import SkillLevelSpecifications from "./SkillLevelSpecifications";

interface GearSpecificationsProps {
  size: string;
  setSize: (size: string) => void;
  skillLevel: string;
  setSkillLevel: (value: string) => void;
  gearType: string;
  selectedSizes?: string[];
  setSelectedSizes?: (sizes: string[]) => void;
  selectedSkillLevels?: string[];
  setSelectedSkillLevels?: (skillLevels: string[]) => void;
}

const GearSpecifications = ({
  size,
  setSize,
  skillLevel,
  setSkillLevel,
  gearType,
  selectedSizes = [],
  setSelectedSizes,
  selectedSkillLevels = [],
  setSelectedSkillLevels
}: GearSpecificationsProps) => {
  const isBikeType = gearType === "mountain-bike" || gearType === "e-bike";

  return (
    <>
      {/* Size or Bike Sizes */}
      {isBikeType ? (
        <BikeSpecifications
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes!}
          setDimensions={(value) => {
            // Update size for backward compatibility
            setSize(value.length);
          }}
        />
      ) : (
        <SizeSpecifications
          size={size}
          setSize={setSize}
        />
      )}

      {/* Skill Level - Now using checkboxes for all gear types */}
      <SkillLevelSpecifications
        selectedSkillLevels={selectedSkillLevels}
        setSelectedSkillLevels={setSelectedSkillLevels!}
        setSkillLevel={setSkillLevel}
        gearType={gearType}
      />
    </>
  );
};

export default GearSpecifications;
