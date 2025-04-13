/**
 * Safely parses a JSON string, returning a fallback value if parsing fails.
 *
 * @template T - The expected return type after parsing.
 *
 * @param {string} str - The JSON string to parse.
 * @param {T} fallback - The fallback value to return if parsing fails.
 * @param {Object} [options] - Optional settings to customize parsing behavior.
 * @param {(error: unknown) => void} [options.callback] - Optional callback invoked when parsing fails. Receives the error object.
 * @param {(this: any, key: string, value: any) => any} [options.reviver] - Optional `reviver` function passed to `JSON.parse`.
 * @param {boolean} [options.logError=false] - If true, logs the error and input string to the console.
 *
 * @returns {T} The parsed object if successful, otherwise the fallback value.
 *
 * @example
 * const jsonString = '{ "age": 30 }';
 * const result = safeJsonParse(jsonString, {}, {
 *   callback: (err) => console.warn("Parse failed:", err),
 *   logError: true,
 * });
 * // result => { age: 30 }
 *
 * @example
 * const badJson = '{ invalid JSON }';
 * const result = safeJsonParse(badJson, { name: "Default" });
 * // result => { name: "Default" }
 */
export function safeJsonParse<T>(
  str: string,
  fallback: T,
  options?: {
    callback?: (error: unknown) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviver?: (this: any, key: string, value: any) => any;
    logError?: boolean;
  },
): T {
  const { callback, reviver, logError } = options || {};

  try {
    return JSON.parse(str, reviver);
  } catch (error) {
    if (logError) {
      console.error('Failed to parse JSON:', error, 'Input string:', str);
    }
    if (callback) {
      callback(error);
    }
    return fallback;
  }
}
