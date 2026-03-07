import { isDefined } from '../typeguards/is-defined.js';

/**
 * Asynchronously iterates over an array, executing a provided `callback` function for each element.
 * The function allows limiting the number of concurrently executed tasks, making it useful for managing
 * concurrency in asynchronous operations (e.g., network requests, file operations).
 *
 * The function waits for all asynchronous operations to complete before resolving.
 *
 * @category Async
 * @template T - The type of elements in the input array
 *
 * @param {T[]} array - The array of elements to iterate over.
 * @param {(element: T, index: number, array: T[]) => Promise<void>} callback - The asynchronous callback function
 * that will be executed for each element.
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {boolean} [options.continueOnError=false] - Whether to continue iterating when a callback throws
 * @returns {Promise<void>} A Promise that resolves when all elements have been processed.
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
 * // Only 2 requests will run at a time
 *
 * @example
 * // With error handling
 * await asyncForEach(ids, processItem, {
 *   continueOnError: true,
 * });
 * // If processItem throws for any id, iteration continues for the remaining items
 */
export async function asyncForEach<T>(
	array: T[],
	callback: (element: T, index: number, array: T[]) => Promise<void>,
	options: {
		concurrency?: number;
		continueOnError?: boolean;
	} = {},
): Promise<void> {
	if (!isDefined(array)) {
		throw new Error('Input array must not be null or undefined');
	}

	const { concurrency = Infinity, continueOnError = false } = options;

	if (concurrency !== Infinity && (!Number.isInteger(concurrency) || concurrency <= 0)) {
		throw new RangeError("Option 'concurrency' must be a positive integer greater than 0.");
	}

	if (array.length === 0) {
		return;
	}

	if (concurrency === Infinity || concurrency >= array.length) {
		if (continueOnError) {
			await Promise.all(
				array.map(async (element, index, array_) => {
					try {
						await callback(element, index, array_);
					} catch {
						// Continue on error
					}
				}),
			);
		} else {
			await Promise.all(array.map(async (element, index, array_) => callback(element, index, array_)));
		}

		return;
	}

	// For limited concurrency, use a worker-queue so slots are filled as soon as one finishes
	let currentIndex = 0;

	async function processQueue(): Promise<void> {
		const index = currentIndex++;

		if (index >= array.length) {
			return;
		}

		try {
			await callback(array[index], index, array);
		} catch (error) {
			if (!continueOnError) {
				throw error;
			}
		}

		return processQueue();
	}

	const workers = Array.from({ length: Math.min(concurrency, array.length) }, async () => processQueue());
	await Promise.all(workers);
}
