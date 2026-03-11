/**
 * Task type for waterfall function.
 * @category Async
 */
export type Task<T> = () => Promise<T>;

/**
 * Executes an array of Promise-returning tasks in sequence, resolving with the result of the last task.
 * Each task runs only after the previous one resolves; if any task rejects, execution stops immediately.
 *
 * ---
 * Example:
 * ```ts
 * const task1: Task<number> = () => Promise.resolve(1);
 * const task2: Task<number> = () => Promise.resolve(2);
 * const task3: Task<number> = () => Promise.resolve(3);
 *
 * waterfall([task1, task2, task3]).then(result => {
 *   console.log(result); // 3 (final result from task3)
 * }).catch(error => {
 *   console.error(error); // If any task rejects, it will be caught here
 * });
 * ```
 *
 * ---
 *
 * @category Async
 * @param {Task<T>[]} tasks - An array of Promise-returning tasks to run in sequence.
 * @returns {Promise<T | undefined>} A Promise that resolves with the result of the last task, or `undefined` if the array is empty.
 *
 * @example
 * const task1: Task<string> = () => Promise.resolve('Hello');
 * const task2: Task<string> = () => Promise.resolve('World');
 *
 * waterfall([task1, task2]).then(result => {
 *   console.log(result); // "World"
 * }).catch(error => {
 *   console.error(error); // In case of a rejection in any task
 * });
 */
export async function waterfall<T>(tasks: Array<Task<T>>): Promise<T | undefined> {
	let result: T | undefined;

	for (const task of tasks) {
		// eslint-disable-next-line no-await-in-loop -- Tasks must execute sequentially
		result = await task();
	}

	return result;
}
