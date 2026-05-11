import { isDefined } from '../../typeguards/is-defined.js';

/**
 * Validates the common arguments shared by all async iteration helpers
 * ({@link asyncMap}, {@link asyncMapSettled}, {@link asyncFilter},
 * {@link asyncFilterSettled}, {@link asyncForEach}, {@link asyncForEachSettled}).
 *
 * Throws synchronously so callers surface errors before any async work begins.
 *
 * @param array       - The input array (checked for null/undefined).
 * @param concurrency - The resolved concurrency value (after applying the
 *                      `Infinity` default). Must be `Infinity` or a positive
 *                      integer; anything else throws a `RangeError`.
 *
 * @internal
 */
export function validateAsyncArgs(array: unknown, concurrency: number): void {
	if (!isDefined(array)) {
		throw new Error('Input array must not be null or undefined');
	}

	if (concurrency !== Infinity && (!Number.isInteger(concurrency) || concurrency <= 0)) {
		throw new RangeError("Option 'concurrency' must be a positive integer greater than 0.");
	}
}
