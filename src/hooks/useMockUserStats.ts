
interface MockUserStats {
  totalEquipment: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
}

export const useMockUserStats = (userId: string): MockUserStats => {
  // Generate consistent mock stats based on userId
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    totalEquipment: Math.floor(seed % 10) + 1,
    averageRating: Math.round((3.5 + (seed % 15) / 10) * 10) / 10,
    totalReviews: Math.floor(seed % 50) + 1,
    responseRate: Math.floor(seed % 30) + 70, // 70-99%
  };
};
