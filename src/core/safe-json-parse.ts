/**
 * Safely parses a JSON string and returns the parsed value, or a fallback value if parsing fails.
 * If an error occurs during parsing, the function returns the specified `fallback` value
 * and optionally invokes a callback function.
 *
 * @param {string} str - The JSON string to parse.
 * @param {T} fallback - The value to return if parsing fails.
 * @param {() => void} [callback] - An optional callback function to execute if parsing fails.
 * @returns {T} The parsed value, or the fallback value if an error occurs.
 *
 * @example
 * safeJsonParse('{"key": "value"}', {}); // Returns the parsed object { key: "value" }
 * safeJsonParse('invalid json', {}, () => console.log('Parsing failed')); // Logs 'Parsing failed' and returns {}
 * safeJsonParse('{"key": "value"}', { key: "default" }); // Returns { key: "value" }
 * safeJsonParse('invalid json', { key: "default" }); // Returns { key: "default" }
 */
export function safeJsonParse<T>(str: string, fallback: T, callback?: () => void): T {
  try {
    return JSON.parse(str);
  } catch {
    if (callback) callback();
    return fallback;
  }
}
