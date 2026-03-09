import { isDefined } from '../typeguards/is-defined.js';

/**
 * Asynchronously filters an array based on an asynchronous predicate function.
 * Only elements for which the predicate returns `true` are included in the result.
 *
 * The function allows limiting the number of concurrently executed predicates, making it useful
 * for managing concurrency in asynchronous operations (e.g., API checks, database queries).
 *
 * @category Async
 * @template T - The type of elements in the input array
 *
 * @param {T[]} array - The array of elements to filter.
 * @param {(element: T, index: number, array: T[]) => Promise<boolean>} predicate - The asynchronous predicate function
 * that will be executed for each element. Should return `true` to include the element, `false` to exclude it.
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {boolean} [options.continueOnError=false] - Whether to continue filtering when a predicate throws.
 * When true, elements that throw errors are excluded from the result.
 * @returns {Promise<T[]>} A Promise that resolves to the filtered array.
 *
 * @example
 * // Basic usage
 * const numbers = [1, 2, 3, 4, 5];
 * const evens = await asyncFilter(numbers, async (n) => n % 2 === 0);
 * // Result: [2, 4]
 *
 * @example
 * // With API validation
 * const userIds = [1, 2, 3, 4, 5];
 * const activeUsers = await asyncFilter(userIds, async (id) => {
 *   const user = await api.getUser(id);
 *   return user.status === 'active';
 * });
 *
 * @example
 * // With limited concurrency
 * const items = [...Array(100).keys()];
 * const validated = await asyncFilter(items, validateItem, { concurrency: 5 });
 * // Only 5 validation calls will run at a time
 *
 * @example
 * // With error handling
 * const urls = ['url1', 'url2', 'url3'];
 * const reachable = await asyncFilter(urls, async (url) => {
 *   const response = await fetch(url);
 *   return response.ok;
 * }, { continueOnError: true });
 * // If fetch fails for any URL, that URL is excluded from results
 */
export async function asyncFilter<T>(
	array: T[],
	predicate: (element: T, index: number, array: T[]) => Promise<boolean>,
	options: {
		concurrency?: number;
		continueOnError?: boolean;
	} = {},
): Promise<T[]> {
	if (!isDefined(array)) {
		throw new Error('Input array must not be null or undefined');
	}

	const { concurrency = Infinity, continueOnError = false } = options;

	if (concurrency !== Infinity && (!Number.isInteger(concurrency) || concurrency <= 0)) {
		throw new RangeError("Option 'concurrency' must be a positive integer greater than 0.");
	}

	if (array.length === 0) {
		return [];
	}

	if (concurrency === Infinity || concurrency >= array.length) {
		if (continueOnError) {
			// Process all items, catching errors individually
			const results = await Promise.all(
				array.map(async (element, index, array_) => {
					try {
						const shouldInclude = await predicate(element, index, array_);
						return { element, shouldInclude };
					} catch {
						// On error, exclude the element
						return { element, shouldInclude: false };
					}
				}),
			);
			return results.filter((result) => result.shouldInclude).map((result) => result.element);
		}

		const results = await Promise.all(
			array.map(async (element, index, array_) => {
				const shouldInclude = await predicate(element, index, array_);
				return { element, shouldInclude };
			}),
		);
		return results.filter((result) => result.shouldInclude).map((result) => result.element);
	}

	// For limited concurrency, use a worker-queue pattern
	const results: Array<{ element: T; shouldInclude: boolean }> = Array.from({ length: array.length });
	let currentIndex = 0;

	async function processQueue(): Promise<void> {
		const index = currentIndex++;

		// Exit if all items processed
		if (index >= array.length) {
			return;
		}

		// Process current item with error handling
		try {
			const shouldInclude = await predicate(array[index], index, array);
			results[index] = { element: array[index], shouldInclude };
		} catch (error) {
			if (continueOnError) {
				// On error, exclude the element
				results[index] = { element: array[index], shouldInclude: false };
			} else {
				// If any promise rejects and we're not continuing on error, propagate
				throw error;
			}
		}

		return processQueue();
	}

	// Create initial batch of workers based on concurrency limit
	const workers = Array.from({ length: Math.min(concurrency, array.length) }, async () => processQueue());

	await Promise.all(workers);

	return results.filter((result) => result.shouldInclude).map((result) => result.element);
}
