/**
 * Asynchronously iterates over an array, executing a provided `callback` function for each element.
 * The function allows limiting the number of concurrently executed tasks, making it useful for managing
 * concurrency in asynchronous operations (e.g., network requests, file operations).
 *
 * The function waits for all asynchronous operations to complete before resolving.
 *
 * ---
 * Example:
 * ```ts
 * const numbers = [1, 2, 3, 4, 5];
 * const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
 *
 * await asyncForEach(numbers, async (number, index) => {
 *   await delay(1000);
 *   console.log(`Processed ${number} at index ${index}`);
 * }, 2); // Limits to 2 concurrent operations at a time
 * ```
 *
 * ---
 *
 * @param {T[]} array - The array of elements to iterate over.
 * @param {(element: T, index: number, array: T[]) => Promise<void>} callback - The asynchronous callback function
 * that will be executed for each element. It should return a Promise.
 * @param {number} [limit] - The maximum number of concurrently executing tasks. If not specified, all tasks
 * will be executed concurrently.
 * @returns {Promise<void>} A Promise that resolves when all elements have been processed.
 *
 * @example
 * await asyncForEach([1, 2, 3, 4], async (number) => {
 *   await delay(500);
 *   console.log(number);
 * }, 2); // Logs 1, 2, 3, 4 with a maximum of 2 concurrent tasks
 */
export async function asyncForEach<T>(
  array: T[],
  callback: (element: T, index: number, array: T[]) => Promise<void>,
  limit?: number,
): Promise<void> {
  if (!limit) limit = array.length;
  const promises: Promise<void>[] = [];
  const executing: Promise<void>[] = [];

  for (let index = 0; index < array.length; index++) {
    const p = callback(array[index], index, array);
    promises.push(p);

    if (limit <= array.length) {
      const e = p.then(() => {
        const idx = executing.indexOf(e);
        if (idx !== -1) {
          executing.splice(idx, 1);
        }
      });
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }

  await Promise.all(promises);
}
