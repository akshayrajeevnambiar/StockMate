// Generates a short, unique ID from a UUID or string
export function shortId(id: string): string {
  // Use the first 2 and last 2 characters, separated by '-'
  if (id.length > 4) {
    return id.slice(0, 2) + '-' + id.slice(-2);
  }
  return id;
}
