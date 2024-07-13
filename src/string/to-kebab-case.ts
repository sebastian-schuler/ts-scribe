/**
 * Converts a string to kebab-case.
 * @param str - The string to convert.
 * @returns The kebab-case string.
 */
export function toKebabCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, '-')
    .toLowerCase();
}
