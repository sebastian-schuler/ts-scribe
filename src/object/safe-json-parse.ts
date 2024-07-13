/**
 * Parse a Json string safely
 * @param str - String to parse
 * @param fallback - Object to return if parsing fails
 * @param callback - (optional) function to run if parsing fails
 * @returns parsed value or fallback value
 */
export function safeJsonParse<T>(str: string, fallback: T, callback?: () => void): T {
  try {
    return JSON.parse(str);
  } catch {
    if (callback) callback();
    return fallback;
  }
}
