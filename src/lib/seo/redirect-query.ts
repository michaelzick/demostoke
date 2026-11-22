export type SearchValues = Record<string, string | string[] | undefined>;

export function addQuery(path: string, values: SearchValues) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string') query.append(key, value);
    else value?.forEach((entry) => query.append(key, entry));
  }
  return query.size ? path + '?' + query.toString() : path;
}
