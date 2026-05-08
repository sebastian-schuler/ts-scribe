/**
 * Creates a debounced version of a function, which will only be invoked after a specified delay
 * has passed since the last time the debounced function was invoked. If `immediate` is true,
 * the function will be triggered at the start of the debounce delay, otherwise, it is triggered after.
 *
 * Each call returns a Promise that resolves with the function's return value when that specific
 * invocation leads to execution. Calls that are cancelled by a subsequent invocation within the
 * wait window resolve with `undefined`.
 *
 * This is useful for scenarios like limiting the rate of user input handling, resizing events,
 * or scroll events.
 *
 * ---
 * Example:
 * ```ts
 * const handleSearch = debounce((searchTerm: string) => {
 *   console.log('Searching for:', searchTerm);
 *   return searchTerm;
 * }, 500);
 *
 * handleSearch('a'); // cancelled
 * handleSearch('ab'); // cancelled
 * const result = await handleSearch('abc'); // resolves with 'abc'
 * ```
 *
 * @category Async
 * @param fn - The function to debounce.
 * @param wait - The number of milliseconds to wait before invoking the function after the last call.
 * @param immediate - If true, the function will be triggered at the beginning of the debounce period.
 * @returns A debounced version of the input function. Each call returns a Promise that resolves
 * with the function's return value, or `undefined` if the call was cancelled by a subsequent call.
 *
 * @example
 * const debouncedLog = debounce((msg: string) => console.log(msg), 1000, true);
 * debouncedLog("Hello"); // Immediately logs "Hello", then waits for 1000ms for further calls
 */
export function debounce<T extends unknown[], R>(
	fn: (...args: T) => R,
	wait: number,
	immediate = false,
): (...args: T) => Promise<R | undefined> {
	let timeoutId: NodeJS.Timeout | undefined;
	let pendingResolver: ((value: R | undefined) => void) | undefined;

	return function (this: unknown, ...args: T): Promise<R | undefined> {
		return new Promise<R | undefined>((resolve) => {
			const later = () => {
				timeoutId = undefined;
				if (!immediate && pendingResolver) {
					pendingResolver(fn.apply(this, args) as R);
					pendingResolver = undefined;
				}
			};

			// Cancel any previously pending trailing call
			if (pendingResolver) {
				pendingResolver(undefined);
				pendingResolver = undefined;
			}

			const callNow = immediate && !timeoutId;
			clearTimeout(timeoutId);
			timeoutId = setTimeout(later, wait);

			if (callNow) {
				resolve(fn.apply(this, args) as R);
			} else if (!immediate) {
				// Trailing mode: save resolver for when the timer fires
				pendingResolver = resolve;
			} else {
				// Leading mode but within cooldown: call is suppressed
				resolve(undefined);
			}
		});
	};
}
