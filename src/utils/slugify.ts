export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const unslugify = (slug: string): string => {
  return slug.replace(/-/g, ' ');
};
