
/**
 * Utility functions for parsing and handling comma-separated sizes
 */

export const parseSizes = (sizeString: string): string[] => {
  if (!sizeString) return [];
  return sizeString.split(',').map(size => size.trim()).filter(Boolean);
};

export const getDisplaySize = (sizeString: string): string => {
  const sizes = parseSizes(sizeString);
  if (sizes.length === 0) return '';
  if (sizes.length === 1) return sizes[0];
  return `${sizes[0]} (+${sizes.length - 1} more)`;
};

export const getSizeOptions = (sizeString: string): Array<{ value: string; label: string }> => {
  const sizes = parseSizes(sizeString);
  return sizes.map(size => ({
    value: size,
    label: size
  }));
};
