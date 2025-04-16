/**
 * Maps over an array with an asynchronous callback function and returns a promise that resolves
 * to an array of results.
 *
 * @template T - The type of elements in the input array
 * @template R - The type of elements in the result array
 * @template E - The type of the error value (defaults to undefined)
 *
 * @param {T[]} array - The input array to map over
 * @param {function(item: T, index: number, array: T[]): Promise<R>} callback - The async function to apply to each element
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.concurrency=Infinity] - Maximum number of concurrent operations
 * @param {boolean} [options.continueOnError=false] - Whether to continue execution when a callback throws
 * @param {E} [options.errorValue=undefined] - Value to use when an error occurs and continueOnError is true
 *
 * @returns {Promise<(R|E)[]>} Promise resolving to an array of results or error values
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
 * // With error handling
 * const ids = [1, 2, 3, 4, 5];
 * const users = await asyncMap(ids, fetchUser, {
 *   continueOnError: true,
 *   errorValue: { error: true, message: 'User not found' }
 * });
 * // If fetchUser fails for any id, that result will be the errorValue
 */
export async function asyncMap<T, R, E = undefined>(
  array: T[],
  callback: (item: T, index: number, array: T[]) => Promise<R>,
  options: {
    concurrency?: number;
    continueOnError?: boolean;
    errorValue?: E;
  } = {},
): Promise<(R | E)[]> {
  const { concurrency = Infinity, continueOnError = false, errorValue = undefined as E } = options;

  if (concurrency !== Infinity && (concurrency <= 0 || Number.isInteger(concurrency) === false)) {
    throw new RangeError(`Option 'concurrency' needs to be an integer above greater than o.`);
  }

  if (array.length === 0) {
    return [];
  }

  if (concurrency === Infinity || concurrency >= array.length) {
    if (continueOnError) {
      // Process all items, but catch errors individually
      const promises = array.map(async (item, index, arr) => {
        try {
          return await callback(item, index, arr);
        } catch (error) {
          return errorValue;
        }
      });
      return Promise.all(promises);
    } else {
      return Promise.all(array.map(callback));
    }
  }

  // For limited concurrency, process in batches
  const results: (R | E)[] = new Array(array.length);
  let currentIndex = 0;

  // Process items in batches based on concurrency limit
  async function processQueue(): Promise<void> {
    const index = currentIndex++;

    // Exit if all items processed
    if (index >= array.length) {
      return;
    }

    // Process current item with error handling
    try {
      results[index] = await callback(array[index], index, array);
    } catch (error) {
      if (continueOnError) {
        // Use the specified error value
        results[index] = errorValue;
      } else {
        // If any promise rejects and we're not continuing on error, propagate
        throw error;
      }
    }

    return processQueue();
  }

  // Create initial batch of promises based on concurrency limit
  const workers = new Array(Math.min(concurrency, array.length)).fill(null).map(() => processQueue());

  await Promise.all(workers);

  return results;
}
