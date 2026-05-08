import { describe, expect, it } from 'bun:test';
import { asyncPipe } from '../../src/async/index.js';

describe('asyncPipe', () => {
	// --- Basic functionality ---

	it('returns async identity when called with zero arguments', async () => {
		const id = asyncPipe();

		await expect(id(42)).resolves.toBe(42);
		await expect(id('hello')).resolves.toBe('hello');
	});

	it('wraps a single sync function in a Promise', async () => {
		const double = (n: number) => n * 2;
		const pipeline = asyncPipe(double);

		const result = pipeline(5);
		expect(result).toBeInstanceOf(Promise);
		await expect(result).resolves.toBe(10);
	});

	it('composes two sync functions and returns a Promise', async () => {
		const add1 = (n: number) => n + 1;
		const double = (n: number) => n * 2;
		const pipeline = asyncPipe(add1, double);

		await expect(pipeline(3)).resolves.toBe(8); // (3+1)*2
	});

	it('composes three sync functions and returns a Promise', async () => {
		const add1 = (n: number) => n + 1;
		const double = (n: number) => n * 2;
		const toString = (n: number) => String(n);
		const pipeline = asyncPipe(add1, double, toString);

		await expect(pipeline(3)).resolves.toBe('8');
	});

	// --- Async functions ---

	it('composes async functions', async () => {
		const fetchUser = async (id: number) => ({ id, name: 'Alice' });
		const getName = async (user: { name: string }) => user.name;
		const pipeline = asyncPipe(fetchUser, getName);

		await expect(pipeline(1)).resolves.toBe('Alice');
	});

	it('composes a chain of three async functions', async () => {
		const step1 = async (n: number) => n + 1;
		const step2 = async (n: number) => n * 2;
		const step3 = async (n: number) => n - 1;
		const pipeline = asyncPipe(step1, step2, step3);

		await expect(pipeline(5)).resolves.toBe(11); // ((5+1)*2)-1
	});

	// --- Mixed sync and async ---

	it('handles sync → async', async () => {
		const trim = (s: string) => s.trim();
		const fetchByQuery = async (q: string) => ({ results: [q] });
		const pipeline = asyncPipe(trim, fetchByQuery);

		await expect(pipeline('  hello  ')).resolves.toEqual({ results: ['hello'] });
	});

	it('handles async → sync', async () => {
		const fetch = async (id: number) => ({ id, name: 'Bob' });
		const extractName = (user: { name: string }) => user.name;
		const pipeline = asyncPipe(fetch, extractName);

		await expect(pipeline(2)).resolves.toBe('Bob');
	});

	it('handles sync → async → sync', async () => {
		const add1 = (n: number) => n + 1;
		const asyncDouble = async (n: number) => n * 2;
		const toString = (n: number) => String(n);
		const pipeline = asyncPipe(add1, asyncDouble, toString);

		await expect(pipeline(3)).resolves.toBe('8'); // (3+1)*2
	});

	// --- Order verification ---

	it('executes functions in left-to-right order', async () => {
		const calls: string[] = [];
		const a = async (x: string) => {
			calls.push('a');
			return x + 'a';
		};

		const b = async (x: string) => {
			calls.push('b');
			return x + 'b';
		};

		const c = async (x: string) => {
			calls.push('c');
			return x + 'c';
		};

		const result = await asyncPipe(a, b, c)('');
		expect(calls).toEqual(['a', 'b', 'c']);
		expect(result).toBe('abc');
	});

	// --- Error propagation ---

	it('rejects when a sync function throws', async () => {
		const add1 = (n: number) => n + 1;
		const explode = (_n: number): number => {
			throw new Error('boom');
		};

		const pipeline = asyncPipe(add1, explode);

		await expect(pipeline(1)).rejects.toThrow('boom');
	});

	it('rejects when an async function rejects', async () => {
		const add1 = async (n: number) => n + 1;
		const explode = async (_n: number) => {
			throw new Error('async boom');
		};

		const pipeline = asyncPipe(add1, explode);

		await expect(pipeline(1)).rejects.toThrow('async boom');
	});

	it('stops execution after the first rejection', async () => {
		const calls: string[] = [];
		const a = async (x: number) => {
			calls.push('a');
			return x + 1;
		};

		const b = async (_x: number): Promise<number> => {
			calls.push('b');
			throw new Error('fail');
		};

		const c = async (x: number) => {
			calls.push('c');
			return x + 1;
		};

		const pipeline = asyncPipe(a, b, c);
		await expect(pipeline(0)).rejects.toThrow('fail');
		expect(calls).toEqual(['a', 'b']); // c never called
	});

	// --- Type transformations ---

	it('handles type transformations across the pipeline', async () => {
		const numToStr = (n: number) => String(n);
		const strToLen = (s: string) => s.length;
		const lenToBool = async (n: number) => n > 0;
		const pipeline = asyncPipe(numToStr, strToLen, lenToBool);

		await expect(pipeline(123)).resolves.toBe(true);
		await expect(pipeline(0)).resolves.toBe(true); // '0'.length = 1 > 0
	});

	// --- Integration ---

	it('works with existing async patterns', async () => {
		const trim = (s: string) => s.trim();
		const toQuery = (s: string) => ({ q: s });
		const fakeFetch = async (params: { q: string }) => ({ results: [params.q] });
		const pipeline = asyncPipe(trim, toQuery, fakeFetch);

		await expect(pipeline('  test  ')).resolves.toEqual({ results: ['test'] });
	});

	// --- Edge cases ---

	it('passes undefined through the pipeline', async () => {
		const id = async (x: any) => x;
		const pipeline = asyncPipe(id, id);

		await expect(pipeline(undefined)).resolves.toBeUndefined();
	});

	it('passes null through the pipeline', async () => {
		const id = async (x: any) => x;
		const pipeline = asyncPipe(id, id);

		await expect(pipeline(null)).resolves.toBeNull();
	});

	// --- Coverage: chain lengths ---

	it('composes four functions (mixed sync + async)', async () => {
		const trim = (s: string) => s.trim();
		const toUpper = (s: string) => s.toUpperCase();
		const asyncAppend = async (s: string) => s + '!';
		const getLength = (s: string) => s.length;
		const pipeline = asyncPipe(trim, toUpper, asyncAppend, getLength);

		await expect(pipeline('  hi  ')).resolves.toBe(3); // 'HI!'.length
	});

	it('composes five functions (mixed sync + async)', async () => {
		const add1 = (n: number) => n + 1;
		const asyncDouble = async (n: number) => n * 2;
		const add3 = (n: number) => n + 3;
		const asyncSquare = async (n: number) => n * n;
		const toString = (n: number) => String(n);
		const pipeline = asyncPipe(add1, asyncDouble, add3, asyncSquare, toString);

		// ((1+1)*2+3)^2 = 49
		await expect(pipeline(1)).resolves.toBe('49');
	});

	it('composes seven functions via the fallback path', async () => {
		const pipeline = asyncPipe(
			(n: number) => n + 1,
			async (n: number) => n * 2,
			(n: number) => n - 1,
			async (n: number) => n * 3,
			(n: number) => n + 5,
			async (n: number) => n - 2,
			(n: number) => String(n),
		);

		// ((1+1)*2-1)*3+5-2 = 12
		await expect(pipeline(1)).resolves.toBe('12');
	});

	// --- Coverage: single async function (1-arg fast-path) ---

	it('wraps a single async function and returns the same resolved value', async () => {
		const fetchUser = async (id: number) => ({ id, name: 'Eve' });
		const pipeline = asyncPipe(fetchUser);

		await expect(pipeline(3)).resolves.toEqual({ id: 3, name: 'Eve' });
	});

	// --- Coverage: special values ---

	it('passes NaN through the pipeline', async () => {
		const id = async (x: any) => x;
		const pipeline = asyncPipe(id, id);

		const result = await pipeline(NaN);
		expect(Number.isNaN(result)).toBe(true);
	});

	it('passes Infinity through the pipeline', async () => {
		const add1 = (n: number) => n + 1;
		const pipeline = asyncPipe(add1);

		await expect(pipeline(Infinity)).resolves.toBe(Infinity);
	});

	// --- Coverage: non-Promise thenable (instanceof Promise contract) ---

	it('passes non-Promise thenables through as-is (not awaited)', async () => {
		const makeThenable = (value: number) => {
			let captured: any;
			const passthrough = (next: (x: any) => any) => {
				captured = next;
				return passthrough;
			};

			return (next: (x: any) => any) => {
				const thenable = { then: (resolve: any) => resolve(value) };
				const result = next(thenable);

				return result;
			};
		};

		// Function returns a thenable (not a real Promise)
		const f = (x: number) => ({ then: (resolve: any) => resolve(x * 2) });
		const g = (x: any) => {
			// The thenable arrives as-is (not resolved)
			expect(x).toHaveProperty('then');
			expect(x instanceof Promise).toBe(false);

			return 42;
		};

		const pipeline = asyncPipe(f, g);
		await expect(pipeline(5)).resolves.toBe(42);
	});

	it('works with six functions', async () => {
		const fns = [
			async (n: number) => n + 1,
			(n: number) => n * 2,
			async (n: number) => n - 1,
			(n: number) => n * 3,
			async (n: number) => n + 5,
			(n: number) => String(n),
		];
		const pipeline = asyncPipe(fns[0], fns[1], fns[2], fns[3], fns[4], fns[5]);

		// ((1+1)*2-1)*3+5 = 14
		await expect(pipeline(1)).resolves.toBe('14');
	});
});
