export const buildEquipmentTrackingFrom = (equipment: { owner: { name: string; }; name: string; }) =>
  `${equipment.owner.name} - ${equipment.name}`;
