/**
 * Creates an AbortError from the given error or value.
 * Follows the convention: `error.name === 'AbortError'` with `code: 20`.
 *
 * @param reason - The error or value that caused the abort.
 * @returns An Error with `name: 'AbortError'` and `code: 20`.
 *
 * @category Async
 *
 * @example
 * // From an Error
 * const err = createAbortError(new Error('timeout'));
 * console.log(err.name); // 'AbortError'
 * console.log(err.code); // 20
 *
 * @example
 * // From a string
 * const err = createAbortError('cancelled');
 *
 * @example
 * // From an AbortSignal's reason
 * const controller = new AbortController();
 * controller.abort('timeout');
 * const err = createAbortError(controller.signal.reason);
 */
export function createAbortError(reason: unknown): Error {
	const base = reason instanceof Error ? reason : new Error(String(reason));

	// DOMException and some Error subclasses have read-only .name / .code
	// getters, so Object.assign would throw a TypeError on those.
	try {
		return Object.assign(base, { code: 20, name: 'AbortError' });
	} catch {
		const error = new Error(base.message);
		error.name = 'AbortError';
		Object.defineProperty(error, 'code', { value: 20, writable: true, enumerable: true, configurable: true });
		error.cause = base;
		if (base.stack) error.stack = base.stack;
		return error;
	}
}
