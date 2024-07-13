/**
 * Converts a string to Header Case.
 * @param str - The string to convert.
 * @returns The Header Case string.
 */
export function toHeaderCase(str: string | undefined): string {
  if (!str) return '';

  return String(str)
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, ' ')
    .toLowerCase()
    .replace(/( ?)(\w+)( ?)/g, (m, a, b, c) => a + b.charAt(0).toUpperCase() + b.slice(1) + c);
}
