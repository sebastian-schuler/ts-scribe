import { runAsyncPool } from './utils/async-pool.js';
import { validateAsyncArgs } from './utils/validate-args.js';
import type { AsyncErrorInfo } from './async-map.js';

/**
 * Return type of {@link asyncForEachSettled}.
 *
 * @category Async
 */
export type AsyncForEachSettledResult = {
	/** Errors collected during processing, in the order they were discovered. */
	errors: AsyncErrorInfo[];
};

/**
 * Asynchronously iterates over an array, executing a provided `callback` function for each element.
 * Rejects on the first error.
 *
 * For collecting errors instead of failing fast, use {@link asyncForEachSettled}.
 *
 * @category Async
 * @template T - The type of elements in the input array
 *
 * @param {T[]} array - The array of elements to iterate over.
 * @param {(element: T, index: number, array: T[]) => Promise<void>} callback - The asynchronous callback function
 * that will be executed for each element.
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel processing.
 * @returns {Promise<void>} A Promise that resolves when all elements have been processed.
 *
 * @throws {RangeError} If concurrency is not a positive integer.
 * @throws {Error} If the input array is null or undefined.
 * @throws {AbortError} If the signal is aborted.
 * @throws The first error thrown by the callback.
 *
 * @example
 * // Basic usage
 * await asyncForEach([1, 2, 3, 4], async (number) => {
 *   await delay(500);
 *   console.log(number);
 * });
 *
 * @example
 * // With limited concurrency
 * const urls = ['url1', 'url2', 'url3', 'url4', 'url5'];
 * await asyncForEach(urls, fetchAndSave, { concurrency: 2 });
 *
 * @example
 * // With AbortSignal
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 5000);
 * await asyncForEach(items, processItem, { signal: controller.signal });
 */
export async function asyncForEach<T>(
	array: T[],
	callback: (element: T, index: number, array: T[]) => Promise<void>,
	options: {
		concurrency?: number;
		signal?: AbortSignal;
	} = {},
): Promise<void> {
	const { concurrency = Infinity, signal } = options;
	validateAsyncArgs(array, concurrency);

	if (array.length === 0) {
		return;
	}

	await runAsyncPool(
		array.length,
		concurrency,
		async (index) => {
			await callback(array[index], index, array);
		},
		{ signal },
	);
}

/**
 * Asynchronously iterates over an array, collecting errors without throwing.
 * Unlike {@link asyncForEach}, this function never throws due to callback errors —
 * all items are processed and errors are collected in the returned `errors` array.
 *
 * Use this when you want all items processed regardless of individual failures.
 *
 * @category Async
 * @template T - The type of elements in the input array
 *
 * @param {T[]} array - The array of elements to iterate over.
 * @param {(element: T, index: number, array: T[]) => Promise<void>} callback - The asynchronous callback function.
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {AbortSignal} [options.signal] - AbortSignal to cancel processing.
 * @returns {Promise<AsyncForEachSettledResult>} Promise resolving to an object with collected `errors`.
 *
 * @throws {RangeError} If concurrency is not a positive integer.
 * @throws {Error} If the input array is null or undefined.
 * @throws {AbortError} If the signal is aborted.
 *
 * @example
 * const { errors } = await asyncForEachSettled(items, processItem);
 * if (errors.length > 0) {
 *   console.error('Some items failed:', errors);
 * }
 */
export async function asyncForEachSettled<T>(
	array: T[],
	callback: (element: T, index: number, array: T[]) => Promise<void>,
	options: {
		concurrency?: number;
		signal?: AbortSignal;
	} = {},
): Promise<AsyncForEachSettledResult> {
	const { concurrency = Infinity, signal } = options;
	validateAsyncArgs(array, concurrency);

	const errors: AsyncErrorInfo[] = [];

	if (array.length === 0) {
		return { errors };
	}

	await runAsyncPool(
		array.length,
		concurrency,
		async (index) => {
			await callback(array[index], index, array);
		},
		{
			signal,
			onError(error, index) {
				errors.push({ index, error });
			},
		},
	);

	return { errors };
}
