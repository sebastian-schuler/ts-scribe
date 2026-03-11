import { type GenericFunction } from '../types/common-types.js';

/**
 * Creates a debounced version of a function, which will only be invoked after a specified delay
 * has passed since the last time the debounced function was invoked. If `immediate` is true,
 * the function will be triggered at the start of the debounce delay, otherwise, it is triggered after.
 *
 * This is useful for scenarios like limiting the rate of user input handling, resizing events,
 * or scroll events.
 *
 * ---
 * Example:
 * ```ts
 * const handleSearch = debounce((searchTerm) => {
 *   console.log('Searching for:', searchTerm);
 * }, 500);
 *
 * // In this example, `handleSearch` will only be called after 500ms since the last input
 * // This prevents calling the function too frequently during rapid input changes.
 * ```
 *
 * @category Async
 * @param fn - The function to debounce.
 * @param wait - The number of milliseconds to wait before invoking the function after the last call.
 * @param immediate - If true, the function will be triggered at the beginning of the debounce period.
 * @returns A debounced version of the input function.
 *
 * @example
 * const debouncedLog = debounce((msg: string) => console.log(msg), 1000, true);
 * debouncedLog("Hello"); // Immediately logs "Hello", then waits for 1000ms for further calls
 */
export function debounce<T, R>(fn: GenericFunction<T, R>, wait: number, immediate = false): (this: T, arg: T) => void {
	let timeoutId: NodeJS.Timeout | undefined;

	return function (this: T, ...args: [arg: T]) {
		const later = () => {
			timeoutId = undefined;
			if (!immediate) {
				fn.apply(this, args);
			}
		};

		const callNow = immediate && !timeoutId;
		clearTimeout(timeoutId);
		timeoutId = setTimeout(later, wait);

		if (callNow) {
			fn.apply(this, args);
		}
	};
}
