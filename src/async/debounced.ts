import { GenericFunction } from '../types/common-types.js';

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
 * const handleSearch = debounce(500, (searchTerm) => {
 *   console.log('Searching for:', searchTerm);
 * });
 *
 * // In this example, `handleSearch` will only be called after 500ms since the last input
 * // This prevents calling the function too frequently during rapid input changes.
 * ```
 *
 * @param {number} wait - The number of milliseconds to wait before invoking the function after the last call.
 * @param {GenericFunction<T, R>} fn - The function to debounce.
 * @param {boolean} [immediate=false] - If true, the function will be triggered at the beginning of the debounce period.
 * @returns {GenericFunction<T, R>} A debounced version of the input function.
 *
 * @example
 * const debouncedLog = debounce(1000, (msg: string) => console.log(msg), true);
 * debouncedLog("Hello"); // Immediately logs "Hello", then waits for 1000ms for further calls
 */
export function debounce<T, R>(
  wait: number,
  fn: GenericFunction<T, R>,
  immediate: boolean = false,
): (this: T, arg: T) => void {
  let timeoutId: NodeJS.Timeout | null;

  return function (this: T, ...args: [arg: T]) {
    const context = this as T;

    const later = function () {
      timeoutId = null;
      if (!immediate) {
        fn.apply(context, args);
      }
    };

    const callNow = immediate && !timeoutId;
    clearTimeout(timeoutId as NodeJS.Timeout);
    timeoutId = setTimeout(later, wait);

    if (callNow) {
      fn.apply(context, args);
    }
  };
}
