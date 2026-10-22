/**
 * Safely serializes server-side data (Prisma Decimals, Dates, and nested objects)
 * into plain JSON-serializable primitives for React Server Component -> Client Component boundaries.
 *
 * Converts Prisma.Decimal instances into standard string/numeric values and Dates into ISO strings,
 * completely eliminating "Only plain objects can be passed to Client Components from Server Components.
 * Decimal objects are not supported" serialization errors.
 */
export function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  return JSON.parse(JSON.stringify(data));
}
