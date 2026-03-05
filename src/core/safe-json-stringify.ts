/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */

type Replacer = (key: string, value: unknown) => unknown;
type VisitedSet = WeakSet<Record<string, unknown>>;

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
	replacer?: Replacer | Array<string | number>,
	space?: string | number,
): string {
	const cleaned = ensureProperties(data);
	try {
		return JSON.stringify(cleaned, replacer as any, space);
	} catch (error) {
		// Fallback for edge cases (e.g., replacer throwing, unexpected serialization errors)
		return JSON.stringify(formatThrowsMessage(error));
	}
}

/**
 * Formats an error thrown during property access.
 */
function formatThrowsMessage(error: unknown): string {
	let message = '?';
	if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
		message = error.message;
	} else if (typeof error === 'string') {
		message = error;
	} else {
		message = String(error);
	}

	return `[Throws: ${message}]`;
}

/**
 * Safely retrieves a property from an object, catching getter errors.
 */
function safeGet(object: Record<string, unknown>, prop: PropertyKey): unknown {
	try {
		return (object as any)[prop];
	} catch (error) {
		return formatThrowsMessage(error);
	}
}

/**
 * Deeply traverses an object tree, breaking circular refs and handling toJSON,
 * getters, and errors.
 */
function ensureProperties(value: unknown, visited: VisitedSet = new WeakSet()): unknown {
	// Handle BigInt (JSON.stringify cannot serialize BigInt)
	if (typeof value === 'bigint') {
		return `[BigInt: ${value.toString()}]`;
	}

	if (value === null || typeof value !== 'object') {
		return value;
	}

	// Handle circular reference
	if (visited.has(value as Record<string, unknown>)) {
		return '[Circular]';
	}

	visited.add(value as Record<string, unknown>);

	try {
		// Handle toJSON (per JSON.stringify spec)
		if (typeof (value as any).toJSON === 'function') {
			let jsonValue: unknown;
			try {
				jsonValue = (value as any).toJSON();
			} catch (error) {
				return formatThrowsMessage(error);
			}

			// Recurse on the returned value
			return ensureProperties(jsonValue, visited);
		}

		// Arrays
		if (Array.isArray(value)) {
			return value.map((item) => ensureProperties(item, visited));
		}

		const object = value as Record<string, unknown>;

		// Plain objects: iterate *own enumerable* properties (like JSON.stringify)
		const result: Record<string | symbol, unknown> = {};

		// Use for...in + hasOwn for perf + correctness (avoids 'Object.keys' allocation)
		for (const prop in object) {
			// Skip symbols (prop is always string in for...in, but be explicit)
			if (typeof prop !== 'string') continue;

			// Prevent double-processing if shadowed (unlikely, but safe)
			if (Object.hasOwn(result, prop)) continue;

			// Access 'value[prop]', not '(value as any)[prop]' on proto
			// ensures getters are called on correct 'this'
			const rawValue = safeGet(object, prop);
			result[prop] = ensureProperties(rawValue, visited);
		}

		return result;
	} finally {
		visited.delete(value as Record<string, unknown>);
	}
}
