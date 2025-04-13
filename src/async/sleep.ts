/**
 * Pauses the execution for a specified number of milliseconds.
 * This is useful when you want to introduce delays in asynchronous code, without blocking the event loop.
 *
 * ---
 * Example:
 * ```ts
 * console.log("Start");
 * await sleep(1000); // Pauses for 1 second
 * console.log("End"); // Logs after 1 second
 * ```
 *
 * ---
 *
 * @param {number} ms - The number of milliseconds to pause execution.
 * @returns {Promise<void>} A Promise that resolves after the specified time has passed.
 *
 * @example
 * sleep(2000).then(() => console.log("2 seconds have passed")); // Logs after 2 seconds
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
