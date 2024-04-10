import { debounce } from './debounced';
import { maybe } from './maybe';
import { retry } from './retry';
import { Semaphore } from './semaphore';

/**
 * A collection of promise utilities
 */
export const PromiseUtils = {
  debounce,
  maybe,
  retry,
  Semaphore,
};
