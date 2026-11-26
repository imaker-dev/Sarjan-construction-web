/**
 * Normalizes API list payloads that may arrive as a raw array, `{ data: [...] }`,
 * `{ items: [...] }`, or `{ [altKey]: [...] }`.
 */
export const extractList = (raw, altKey) => {
  const p = raw?.data ?? raw;
  if (Array.isArray(p)) return p;
  if (altKey && Array.isArray(p?.[altKey])) return p[altKey];
  if (Array.isArray(p?.data)) return p.data;
  if (Array.isArray(p?.items)) return p.items;
  return [];
};
const { a, b } = data || {}