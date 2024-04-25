import { GenericFunction } from '../common-utils/common-types';

/**
 * Debounce function to limit the number of times a function is called in a given time frame.
 * @param wait - Time in milliseconds to wait before calling the function.
 * @param fn - Function to be called.
 * @param immediate - If true, the function will be called immediately (default: false)
 * @returns A debounced function.
 */
export function debounce<T, R>(wait: number, fn: GenericFunction<T, R>, immediate = false) {
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
