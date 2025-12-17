// Utility to concatenate class names conditionally
export function cn(...args: any[]): string {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}
