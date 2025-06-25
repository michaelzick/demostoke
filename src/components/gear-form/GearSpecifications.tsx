
import BikeSpecifications from "./BikeSpecifications";
import DimensionSpecifications from "./DimensionSpecifications";
import SkillLevelSpecifications from "./SkillLevelSpecifications";

interface GearSpecificationsProps {
  dimensions: {
    length: string;
    width: string;
    thickness?: string;
  };
  setDimensions: (value: { length: string; width: string; thickness?: string }) => void;
  skillLevel: string;
  setSkillLevel: (value: string) => void;
  gearType: string;
  selectedSizes?: string[];
  setSelectedSizes?: (sizes: string[]) => void;
  selectedSkillLevels?: string[];
  setSelectedSkillLevels?: (skillLevels: string[]) => void;
}

const GearSpecifications = ({
  dimensions,
  setDimensions,
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
      {/* Dimensions or Size */}
      {isBikeType ? (
        <BikeSpecifications
          selectedSizes={selectedSizes}
          setSelectedSizes={setSelectedSizes!}
          setDimensions={setDimensions}
        />
      ) : (
        <DimensionSpecifications
          dimensions={dimensions}
          setDimensions={setDimensions}
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
