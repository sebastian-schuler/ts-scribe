import { runAsyncPool } from './utils/async-pool.js';
import { validateAsyncArgs } from './utils/validate-args.js';

/**
 * Info about a single item error collected by the `*Settled` variants.
 *
 * @category Async
 */
export type AsyncErrorInfo = {
	/** The array index of the item whose callback threw. */
	index: number;
	/** The error thrown by the callback. */
	error: unknown;
};

/**
 * Return type of {@link asyncMapSettled}.
 *
 * @category Async
 * @template R - The success type of the mapped results.
 * @template E - The type of the error value (defaults to `undefined`).
 */
export type AsyncMapSettledResult<R, E = undefined> = {
	/** Mapped results. Failed positions contain `errorValue` (default `undefined`). */
	results: Array<R | E>;
	/** Errors collected during processing, in the order they were discovered. */
	errors: AsyncErrorInfo[];
};

/**
 * Maps over an array with an asynchronous callback function and returns a promise that resolves
 * to an array of results. Rejects on the first error.
 *
 * For collecting errors instead of failing fast, use {@link asyncMapSettled}.
 *
 * @category Async
 * @template T - The type of elements in the input array
 * @template R - The type of elements in the result array
 *
 * @param {T[]} array - The input array to map over
 * @param {function(item: T, index: number, array: T[]): Promise<R>} callback - The async function to apply to each element
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel processing. When aborted, the promise rejects with an `AbortError`.
 *
 * @returns {Promise<R[]>} Promise resolving to an array of mapped results.
 *
 * @throws {RangeError} If concurrency is not a positive integer.
 * @throws {Error} If the input array is null or undefined.
 * @throws {AbortError} If the signal is aborted.
 * @throws The first error thrown by the callback.
 *
 * @example
 * // Basic usage
 * const numbers = [1, 2, 3, 4];
 * const doubled = await asyncMap(numbers, async (n) => n * 2);
 * // Result: [2, 4, 6, 8]
 *
 * @example
 * // With limited concurrency
 * const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];
 * const results = await asyncMap(urls, fetchData, { concurrency: 2 });
 * // Only 2 requests will run at a time
 *
 * @example
 * // With AbortSignal
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 5000);
 * const results = await asyncMap(urls, fetchData, { signal: controller.signal });
 */
export async function asyncMap<T, R>(
	array: T[],
	callback: (item: T, index: number, array: T[]) => Promise<R>,
	options: {
		concurrency?: number;
		signal?: AbortSignal;
	} = {},
): Promise<R[]> {
	const { concurrency = Infinity, signal } = options;
	validateAsyncArgs(array, concurrency);

	if (array.length === 0) {
		return [];
	}

	const results: R[] = Array.from({ length: array.length });

	await runAsyncPool(
		array.length,
		concurrency,
		async (index) => {
			results[index] = await callback(array[index], index, array);
		},
		{ signal },
	);

	return results;
}

/**
 * Maps over an array with an asynchronous callback function, collecting both results and errors.
 * Unlike {@link asyncMap}, this function never throws due to callback errors — failed items
 * are replaced with `errorValue` (default `undefined`) in the results array and their errors
 * are collected in the returned `errors` array.
 *
 * Use this when you want all items processed regardless of individual failures.
 *
 * @category Async
 * @template T - The type of elements in the input array
 * @template R - The type of successfully mapped elements
 * @template E - The type of the error value (defaults to `undefined`)
 *
 * @param {T[]} array - The input array to map over
 * @param {function(item: T, index: number, array: T[]): Promise<R>} callback - The async function to apply to each element
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {E} [options.errorValue=undefined] - Value to use in the results array when a callback throws
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel processing. When aborted, the promise rejects with an `AbortError`.
 *
 * @returns {Promise<AsyncMapSettledResult<R, E>>} Promise resolving to an object with `results` and `errors`.
 *
 * @throws {RangeError} If concurrency is not a positive integer.
 * @throws {Error} If the input array is null or undefined.
 * @throws {AbortError} If the signal is aborted.
 *
 * @example
 * // Basic usage
 * const { results, errors } = await asyncMapSettled(urls, fetchPage);
 * console.log('Succeeded:', results.filter(r => r !== undefined));
 * console.log('Failed:', errors);
 *
 * @example
 * // With custom error value
 * const { results, errors } = await asyncMapSettled(ids, fetchUser, {
 *   errorValue: { error: true, message: 'Not found' }
 * });
 */
export async function asyncMapSettled<T, R, E = undefined>(
	array: T[],
	callback: (item: T, index: number, array: T[]) => Promise<R>,
	options: {
		concurrency?: number;
		errorValue?: E;
		signal?: AbortSignal;
	} = {},
): Promise<AsyncMapSettledResult<R, E>> {
	const { concurrency = Infinity, errorValue, signal } = options;
	validateAsyncArgs(array, concurrency);

	const results: Array<R | E> = Array.from({ length: array.length });
	const errors: AsyncErrorInfo[] = [];

	if (array.length === 0) {
		return { results, errors };
	}

	await runAsyncPool(
		array.length,
		concurrency,
		async (index) => {
			results[index] = await callback(array[index], index, array);
		},
		{
			signal,
			onError(error, index) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
				results[index] = errorValue as E;
				errors.push({ index, error });
			},
		},
	);

	return { results, errors };
}
