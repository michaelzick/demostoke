export const deduplicateImageUrls = (urls: string[]): string[] => {
  const map = new Map<string, string>();

  for (const rawUrl of urls.filter(Boolean)) {
    const isWebp = rawUrl.toLowerCase().endsWith('.webp');
    const noQuery = rawUrl.split('?')[0];
    const path = noQuery.replace(/^https?:\/\/[^/]+/, '');
    const key = path.replace(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i, '');

    const existing = map.get(key);
    if (!existing) {
      map.set(key, rawUrl);
      continue;
    }

    const existingIsWebp = existing.toLowerCase().endsWith('.webp');
    if (isWebp && !existingIsWebp) {
      map.set(key, rawUrl);
    }
  }

  return Array.from(map.values());
};
