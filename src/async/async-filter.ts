import { isDefined } from '../typeguards/is-defined.js';
import { runAsyncPool } from './utils/async-pool.js';
import type { AsyncErrorInfo } from './async-map.js';

/**
 * Return type of {@link asyncFilterSettled}.
 *
 * @category Async
 * @template T - The type of elements in the input array.
 */
export type AsyncFilterSettledResult<T> = {
	/** Elements for which the predicate returned `true`. */
	results: T[];
	/** Errors collected during processing, in the order they were discovered. */
	errors: AsyncErrorInfo[];
};

/**
 * Asynchronously filters an array based on an asynchronous predicate function.
 * Only elements for which the predicate returns `true` are included in the result.
 * Rejects on the first error.
 *
 * For collecting errors instead of failing fast, use {@link asyncFilterSettled}.
 *
 * @category Async
 * @template T - The type of elements in the input array
 *
 * @param {T[]} array - The array of elements to filter.
 * @param {(element: T, index: number, array: T[]) => Promise<boolean>} predicate - The asynchronous predicate function
 * that will be executed for each element. Should return `true` to include the element, `false` to exclude it.
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel processing.
 * @returns {Promise<T[]>} A Promise that resolves to the filtered array.
 *
 * @throws {RangeError} If concurrency is not a positive integer.
 * @throws {Error} If the input array is null or undefined.
 * @throws {AbortError} If the signal is aborted.
 * @throws The first error thrown by the predicate.
 *
 * @example
 * // Basic usage
 * const numbers = [1, 2, 3, 4, 5];
 * const evens = await asyncFilter(numbers, async (n) => n % 2 === 0);
 * // Result: [2, 4]
 *
 * @example
 * // With limited concurrency
 * const items = [...Array(100).keys()];
 * const validated = await asyncFilter(items, validateItem, { concurrency: 5 });
 *
 * @example
 * // With AbortSignal
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 5000);
 * const results = await asyncFilter(urls, checkUrl, { signal: controller.signal });
 */
export async function asyncFilter<T>(
	array: T[],
	predicate: (element: T, index: number, array: T[]) => Promise<boolean>,
	options: {
		concurrency?: number;
		signal?: AbortSignal;
	} = {},
): Promise<T[]> {
	if (!isDefined(array)) {
		throw new Error('Input array must not be null or undefined');
	}

	const { concurrency = Infinity, signal } = options;

	if (concurrency !== Infinity && (!Number.isInteger(concurrency) || concurrency <= 0)) {
		throw new RangeError("Option 'concurrency' must be a positive integer greater than 0.");
	}

	if (array.length === 0) {
		return [];
	}

	// Boolean mask — avoids per-item object allocations
	const include = Array.from({ length: array.length });

	await runAsyncPool(
		array.length,
		concurrency,
		async (index) => {
			include[index] = await predicate(array[index], index, array);
		},
		{ signal },
	);

	// Single pass to build result from the mask
	const result: T[] = [];
	for (const [i, element] of array.entries()) {
		if (include[i]) {
			result.push(element);
		}
	}

	return result;
}

/**
 * Asynchronously filters an array with an asynchronous predicate, collecting both results and errors.
 * Unlike {@link asyncFilter}, this function never throws due to predicate errors — failed items
 * are excluded from results and their errors are collected in the returned `errors` array.
 *
 * Use this when you want all items evaluated regardless of individual failures.
 *
 * @category Async
 * @template T - The type of elements in the input array
 *
 * @param {T[]} array - The array of elements to filter.
 * @param {(element: T, index: number, array: T[]) => Promise<boolean>} predicate - The asynchronous predicate function.
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel processing.
 * @returns {Promise<AsyncFilterSettledResult<T>>} Promise resolving to an object with `results` and `errors`.
 *
 * @throws {RangeError} If concurrency is not a positive integer.
 * @throws {Error} If the input array is null or undefined.
 * @throws {AbortError} If the signal is aborted.
 *
 * @example
 * const urls = ['url1', 'url2', 'url3'];
 * const { results, errors } = await asyncFilterSettled(urls, async (url) => {
 *   const response = await fetch(url);
 *   return response.ok;
 * });
 * // results: reachable URLs
 * // errors: fetch failures with their indices
 */
export async function asyncFilterSettled<T>(
	array: T[],
	predicate: (element: T, index: number, array: T[]) => Promise<boolean>,
	options: {
		concurrency?: number;
		signal?: AbortSignal;
	} = {},
): Promise<AsyncFilterSettledResult<T>> {
	if (!isDefined(array)) {
		throw new Error('Input array must not be null or undefined');
	}

	const { concurrency = Infinity, signal } = options;

	if (concurrency !== Infinity && (!Number.isInteger(concurrency) || concurrency <= 0)) {
		throw new RangeError("Option 'concurrency' must be a positive integer greater than 0.");
	}

	const include = Array.from({ length: array.length });
	const errors: AsyncErrorInfo[] = [];

	if (array.length === 0) {
		return { results: [], errors };
	}

	await runAsyncPool(
		array.length,
		concurrency,
		async (index) => {
			include[index] = await predicate(array[index], index, array);
		},
		{
			signal,
			onError(error, index) {
				include[index] = false;
				errors.push({ index, error });
			},
		},
	);

	// Build result from mask
	const result: T[] = [];
	for (const [i, element] of array.entries()) {
		if (include[i]) {
			result.push(element);
		}
	}

	return { results: result, errors };
}
