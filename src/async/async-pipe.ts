/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * Composes functions from left to right, threading the resolved return value
 * of each function as the argument to the next. Each function may be sync or
 * async — the result is always a Promise.
 *
 * For sync-only composition, see {@link pipe}.
 *
 * @category Async
 * @param fns - One or more functions to compose left-to-right. Each may return
 *              a plain value or a Promise.
 * @returns An async function that passes its argument through every function in
 *          order, awaiting each step.
 *
 * @example
 * // All sync functions — result is still a Promise
 * const add1 = (n: number) => n + 1;
 * const double = (n: number) => n * 2;
 * const pipeline = asyncPipe(add1, double);
 *
 * await pipeline(3); // (3 + 1) * 2 = 8
 *
 * @example
 * // All async functions
 * const fetchUser = async (id: number) => ({ id, name: 'Alice' });
 * const getName = async (user: { name: string }) => user.name;
 * const pipeline = asyncPipe(fetchUser, getName);
 *
 * await pipeline(1); // 'Alice'
 *
 * @example
 * // Mixed sync and async
 * const trim = (s: string) => s.trim();
 * const fetchByQuery = async (q: string) => ({ results: [q] });
 *
 * const search = asyncPipe(trim, fetchByQuery);
 * await search('  hello  '); // { results: ['hello'] }
 */

// 0 functions — returns async identity
export function asyncPipe(): <T>(x: T) => Promise<T>;
// 1 function
export function asyncPipe<A, B>(f1: (x: A) => B | Promise<B>): (x: A) => Promise<B>;
// 2 functions
export function asyncPipe<A, B, C>(f1: (x: A) => B | Promise<B>, f2: (x: B) => C | Promise<C>): (x: A) => Promise<C>;
// 3 functions
export function asyncPipe<A, B, C, D>(
	f1: (x: A) => B | Promise<B>,
	f2: (x: B) => C | Promise<C>,
	f3: (x: C) => D | Promise<D>,
): (x: A) => Promise<D>;
// 4 functions
export function asyncPipe<A, B, C, D, E>(
	f1: (x: A) => B | Promise<B>,
	f2: (x: B) => C | Promise<C>,
	f3: (x: C) => D | Promise<D>,
	f4: (x: D) => E | Promise<E>,
): (x: A) => Promise<E>;
// 5 functions
// eslint-disable-next-line max-params
export function asyncPipe<A, B, C, D, E, F>(
	f1: (x: A) => B | Promise<B>,
	f2: (x: B) => C | Promise<C>,
	f3: (x: C) => D | Promise<D>,
	f4: (x: D) => E | Promise<E>,
	f5: (x: E) => F | Promise<F>,
): (x: A) => Promise<F>;
// 6 functions
// eslint-disable-next-line max-params
export function asyncPipe<A, B, C, D, E, F, G>(
	f1: (x: A) => B | Promise<B>,
	f2: (x: B) => C | Promise<C>,
	f3: (x: C) => D | Promise<D>,
	f4: (x: D) => E | Promise<E>,
	f5: (x: E) => F | Promise<F>,
	f6: (x: F) => G | Promise<G>,
): (x: A) => Promise<G>;

// Fallback — any number of functions
export function asyncPipe(...fns: Array<(x: any) => any>): (x: any) => Promise<any>;

export function asyncPipe(...fns: Array<(x: any) => any>): (x: any) => Promise<any> {
	if (fns.length === 0) {
		return async (x) => x;
	}

	if (fns.length === 1) {
		const fn = fns[0];
		return async (x) => fn(x);
	}

	return async (x) => {
		let result = x;
		for (const fn of fns) {
			// Promise.resolve() assimilates thenables and cross-realm Promises
			// (which fail instanceof Promise), unlike a raw instanceof check.
			// eslint-disable-next-line no-await-in-loop -- Sequential execution is the point
			result = await Promise.resolve(fn(result));
		}

		return result;
	};
}
