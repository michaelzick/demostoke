
import { generateMockEquipment } from "./equipmentGenerator";
import { ownerPersonas } from "./ownerPersonas";

// Export the main mock data
export const mockEquipment = generateMockEquipment(30);
export { ownerPersonas };

// Re-export the equipment generator for any custom use cases
export { generateMockEquipment };
