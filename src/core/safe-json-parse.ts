/**
 * Safely parses a JSON string, returning a fallback value if parsing fails.
 *
 * @category Core
 * @template T - The expected return type after parsing.
 *
 * @param {string} text - The JSON string to parse.
 * @param {T} fallback - The fallback value to return if parsing fails.
 * @param {Object} [options] - Optional settings to customize parsing behavior.
 * @param {(error: unknown) => void} [options.onError] - Optional callback invoked when parsing fails. Receives the error object.
 * @param {(this: any, key: string, value: any) => any} [options.reviver] - Optional `reviver` function passed to `JSON.parse`.
 * @param {boolean} [options.logError=false] - If true, logs the error and input string to the console.
 *
 * @returns {T} The parsed object if successful, otherwise the fallback value.
 *
 * @example
 * const jsonString = '{ "age": 30 }';
 * const result = safeJsonParse(jsonString, {}, {
 *   onError: (err) => console.warn("Parse failed:", err),
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
	text: string,
	fallback: T,
	options?: {
		onError?: (error: unknown) => void;
		reviver?: (this: any, key: string, value: any) => any;
		logError?: boolean;
	},
): T {
	const { onError, reviver, logError } = options ?? {};

	try {
		return JSON.parse(text, reviver) as T;
	} catch (error) {
		if (logError) {
			console.error('Failed to parse JSON:', error, 'Input string:', text);
		}

		if (onError) {
			onError(error);
		}

		return fallback;
	}
}
