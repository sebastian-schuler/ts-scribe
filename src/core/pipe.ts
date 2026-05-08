/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Composes functions from left to right, threading the return value of each
 * function as the argument to the next. Returns a new function that, when
 * called, passes the initial value through the entire pipeline.
 *
 * For composing async functions (or mixing sync and async), see
 * {@link asyncPipe}.
 *
 * @category Core
 * @param fns - One or more functions to compose left-to-right.
 * @returns A function that passes its argument through every function in order.
 *
 * @example
 * // Basic usage
 * const add1 = (n: number) => n + 1;
 * const double = (n: number) => n * 2;
 * const add1ThenDouble = pipe(add1, double);
 *
 * add1ThenDouble(3); // (3 + 1) * 2 = 8
 *
 * @example
 * // With zero arguments — returns identity
 * const id = pipe();
 * id(42); // 42
 *
 * @example
 * // With ts-scribe utilities
 * import { slugify, toCamelCase } from 'ts-scribe';
 *
 * const normalize = pipe(
 *   (s: string) => s.trim(),
 *   toCamelCase,
 *   slugify,
 * );
 *
 * normalize('  Hello World  '); // 'helloWorld'
 */

// 0 functions — returns identity
export function pipe(): <T>(x: T) => T;
// 1 function
export function pipe<A, B>(f1: (x: A) => B): (x: A) => B;
// 2 functions
export function pipe<A, B, C>(f1: (x: A) => B, f2: (x: B) => C): (x: A) => C;
// 3 functions
export function pipe<A, B, C, D>(f1: (x: A) => B, f2: (x: B) => C, f3: (x: C) => D): (x: A) => D;
// 4 functions
export function pipe<A, B, C, D, E>(f1: (x: A) => B, f2: (x: B) => C, f3: (x: C) => D, f4: (x: D) => E): (x: A) => E;
// 5 functions
// eslint-disable-next-line max-params
export function pipe<A, B, C, D, E, F>(
	f1: (x: A) => B,
	f2: (x: B) => C,
	f3: (x: C) => D,
	f4: (x: D) => E,
	f5: (x: E) => F,
): (x: A) => F;
// 6 functions
// eslint-disable-next-line max-params
export function pipe<A, B, C, D, E, F, G>(
	f1: (x: A) => B,
	f2: (x: B) => C,
	f3: (x: C) => D,
	f4: (x: D) => E,
	f5: (x: E) => F,
	f6: (x: F) => G,
): (x: A) => G;

// Fallback — any number of functions
export function pipe(...fns: Array<(x: any) => any>): (x: any) => any;

export function pipe(...fns: Array<(x: any) => any>): (x: any) => any {
	if (fns.length === 0) {
		return (x) => x;
	}

	if (fns.length === 1) {
		return fns[0];
	}

	return (x) => {
		let result = x;
		for (const fn of fns) {
			result = fn(result);
		}

		return result;
	};
}
