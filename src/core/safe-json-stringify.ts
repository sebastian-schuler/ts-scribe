type Replacer = (key: string, value: unknown) => unknown;
type VisitedSet = WeakSet<object>;

/**
 * Safely serializes a JavaScript value to a JSON string, avoiding runtime errors that commonly occur
 * with `JSON.stringify`, such as circular references, throwing getters, or faulty `toJSON()` implementations.
 *
 * This function sanitizes the input by:
 * - Replacing circular references with the string `"[Circular]"`
 * - Replacing values from throwing property access (e.g., faulty getters) with `"[Throws: <message>]"`
 * - Safely invoking and processing `toJSON()` methods, falling back to error placeholders on throw
 *
 * The resulting structure is then passed to `JSON.stringify`, preserving standard replacer and space behavior.
 *
 * @param {unknown} data - The value to serialize. Can be any JavaScript value: objects, arrays, primitives, `null`, etc.
 * @param {((key: string, value: unknown) => unknown) | (string | number)[] | null} [replacer] -
 *   Optional replacer function or array of keys to include (same as `JSON.stringify`).
 * @param {string | number} [space] -
 *   Optional indentation: a string (e.g., `"\t"`) or number of spaces (e.g., `2`) for pretty-printing.
 *
 * @returns {string} A valid JSON string. Unsafe values are replaced with descriptive placeholders:
 *   - `"[Circular]"` for circular references
 *   - `"[Throws: <message>]"` for properties that throw during access or `toJSON()` calls
 *
 * @example
 * const obj = { name: "Alice" };
 * obj.self = obj; // circular
 * Object.defineProperty(obj, "secret", {
 *   get() { throw new Error("Access denied"); }
 * });
 *
 * const result = safeStringify(obj, null, 2);
 * console.log(result);
 * // {
 * //   "name": "Alice",
 * //   "self": "[Circular]",
 * //   "secret": "[Throws: Access denied]"
 * // }
 */
export function safeJsonStringify(
  data: unknown,
  replacer?: Replacer | (string | number)[] | null,
  space?: string | number,
): string {
  const cleaned = ensureProperties(data);
  return JSON.stringify(cleaned, replacer as any, space);
}

/**
 * Formats an error thrown during property access.
 */
function formatThrowsMessage(err: unknown): string {
  let message = '?';
  if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
    message = err.message;
  } else if (typeof err === 'string') {
    message = err;
  } else {
    message = String(err);
  }
  return `[Throws: ${message}]`;
}

/**
 * Safely retrieves a property from an object, catching getter errors.
 */
function safeGet(obj: object, prop: PropertyKey): unknown {
  try {
    return (obj as any)[prop];
  } catch (err) {
    return formatThrowsMessage(err);
  }
}

/**
 * Deeply traverses an object tree, breaking circular refs and handling toJSON,
 * getters, and errors.
 */
function ensureProperties(value: unknown, visited: VisitedSet = new WeakSet()): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Handle circular reference
  if (visited.has(value)) {
    return '[Circular]';
  }

  visited.add(value);

  try {
    // Handle toJSON (per JSON.stringify spec)
    if (typeof (value as any).toJSON === 'function') {
      let jsonValue: unknown;
      try {
        // 🎯 This is the line that's currently throwing uncaught!
        jsonValue = (value as any).toJSON();
      } catch (err) {
        // 🟢 Return placeholder string — DON’T rethrow!
        return formatThrowsMessage(err);
      }
      // Recurse on the returned value
      return ensureProperties(jsonValue, visited);
    }

    // Arrays
    if (Array.isArray(value)) {
      return value.map((item) => ensureProperties(item, visited));
    }

    const obj = value as Record<string, unknown>;

    // Plain objects: iterate *own enumerable* properties (like JSON.stringify)
    const result: Record<string | symbol, unknown> = {};

    // Use for...in + hasOwn for perf + correctness (avoids 'Object.keys' allocation)
    for (const prop in obj) {
      // Skip symbols (prop is always string in for...in, but be explicit)
      if (typeof prop !== 'string') continue;

      // Prevent double-processing if shadowed (unlikely, but safe)
      if (Object.hasOwn(result, prop)) continue;

      // access 'value[prop]', not '(value as any)[prop]' on proto
      // ensures getters are called on correct 'this'
      const rawValue = safeGet(value, prop);
      result[prop] = ensureProperties(rawValue, visited);
    }

    return result;
  } finally {
    visited.delete(value);
  }
}
