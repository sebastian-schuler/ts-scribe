/**
 * Task type for waterfall function.
 * @category Async
 */
export type Task<T> = (callback: (error: Error | undefined, result?: T) => void) => void;

/**
 * Executes an array of asynchronous tasks in sequence. Each task is a function that takes a callback with an error or result,
 * and the next task is executed only after the current one completes successfully.
 *
 * It returns a Promise that resolves with the final result once all tasks are completed in order.
 *
 * ---
 * Example:
 * ```ts
 * const task1: Task<number> = (callback) => setTimeout(() => callback(null, 1), 1000);
 * const task2: Task<number> = (callback) => setTimeout(() => callback(null, 2), 1000);
 * const task3: Task<number> = (callback) => setTimeout(() => callback(null, 3), 1000);
 *
 * waterfall([task1, task2, task3]).then(result => {
 *   console.log(result); // 3 (final result from task3)
 * }).catch(error => {
 *   console.error(error); // If any task fails, it will be caught here
 * });
 * ```
 *
 * ---
 *
 * @category Async
 * @param {Task<T>[]} tasks - An array of asynchronous tasks to run in sequence.
 * Each task should follow the `Task` signature, which is a function that takes a callback.
 * @returns {Promise<T>} A Promise that resolves with the result of the last task in the sequence.
 *
 * @example
 * const task1: Task<string> = (callback) => setTimeout(() => callback(null, "Hello"), 1000);
 * const task2: Task<string> = (callback) => setTimeout(() => callback(null, "World"), 1000);
 *
 * waterfall([task1, task2]).then(result => {
 *   console.log(result); // "World"
 * }).catch(error => {
 *   console.error(error); // In case of an error in any task
 * });
 */
export async function waterfall<T>(tasks: Array<Task<T>>): Promise<T> {
	let result: T | undefined;

	for (const task of tasks) {
		// eslint-disable-next-line no-await-in-loop -- Tasks must execute sequentially
		result = await new Promise<T>((resolve, reject) => {
			task((error, taskResult) => {
				if (error) {
					reject(error);
				} else {
					resolve(taskResult as T);
				}
			});
		});
	}

	return result as T;
}
