import { describe, expect, test } from 'bun:test';
import { asyncFilter } from '../../src/index.js';

describe('asyncFilter', () => {
	test('should handle empty arrays', async () => {
		const result = await asyncFilter([], async (x) => x > 0);
		expect(result).toEqual([]);
	});

	test('should filter values asynchronously', async () => {
		const input = [1, 2, 3, 4, 5];
		const result = await asyncFilter(input, async (x) => x % 2 === 0);
		expect(result).toEqual([2, 4]);
	});

	test('should preserve order of filtered elements', async () => {
		const input = [5, 1, 3, 2, 4];
		const predicate = async (x: number) => {
			await new Promise((resolve) => setTimeout(resolve, x * 10));
			return x % 2 === 0;
		};
		const result = await asyncFilter(input, predicate);
		expect(result).toEqual([2, 4]);
	});

	test('should pass index and original array to predicate', async () => {
		const input = ['a', 'b', 'c', 'd'];
		const indices: number[] = [];
		const arrays: string[][] = [];

		const result = await asyncFilter(input, async (value, index, array) => {
			indices.push(index);
			arrays.push([...array]);
			return index % 2 === 0;
		});

		expect(result).toEqual(['a', 'c']);
		// Sort by index since concurrent completion order is not guaranteed
		indices.sort((a, b) => a - b);
		expect(indices).toEqual([0, 1, 2, 3]);
		// Each call received the same array reference
		expect(arrays).toHaveLength(4);
		for (const arr of arrays) {
			expect(arr).toEqual(input);
		}
	});

	test('should throw error when predicate throws', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async (x: number) => {
			if (x === 3) throw new Error('Test error');
			return x % 2 === 0;
		};
		await expect(asyncFilter(input, predicate)).rejects.toThrow('Test error');
	});

	test('should respect concurrency limit', async () => {
		const input = [1, 2, 3, 4, 5, 6, 7, 8];
		const maxConcurrent = 2;
		let running = 0;
		let maxRunning = 0;

		const predicate = async (x: number) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x % 2 === 0;
		};

		const result = await asyncFilter(input, predicate, { concurrency: maxConcurrent });
		expect(result).toEqual([2, 4, 6, 8]);
		expect(maxRunning).toBeLessThanOrEqual(maxConcurrent);
	});

	test('should throw RangeError for invalid concurrency', async () => {
		const input = [1, 2, 3];
		const predicate = async (x: number) => x > 0;
		await expect(asyncFilter(input, predicate, { concurrency: 0 })).rejects.toThrow(RangeError);
		await expect(asyncFilter(input, predicate, { concurrency: -1 })).rejects.toThrow(RangeError);
		await expect(asyncFilter(input, predicate, { concurrency: 1.5 })).rejects.toThrow(RangeError);
	});

	test('should throw error for null or undefined array', async () => {
		const predicate = async (x: number) => x > 0;
		// @ts-expect-error - Testing invalid input
		await expect(asyncFilter(null, predicate)).rejects.toThrow('Input array must not be null or undefined');
		// @ts-expect-error - Testing invalid input
		await expect(asyncFilter(undefined, predicate)).rejects.toThrow('Input array must not be null or undefined');
	});

	test('should work with object arrays', async () => {
		const input = [
			{ id: 1, active: true },
			{ id: 2, active: false },
			{ id: 3, active: true },
		];
		const result = await asyncFilter(input, async (item) => item.active);
		expect(result).toEqual([{ id: 1, active: true }, { id: 3, active: true }]);
	});

	test('should handle all false predicates', async () => {
		const result = await asyncFilter([1, 2, 3], async () => false);
		expect(result).toEqual([]);
	});

	test('should handle all true predicates', async () => {
		const input = [1, 2, 3];
		const result = await asyncFilter(input, async () => true);
		expect(result).toEqual([1, 2, 3]);
	});

	test('should maintain element references (not clone)', async () => {
		const obj1 = { id: 1 };
		const obj2 = { id: 2 };
		const obj3 = { id: 3 };
		const input = [obj1, obj2, obj3];
		const result = await asyncFilter(input, async (obj) => obj.id !== 2);
		expect(result).toEqual([obj1, obj3]);
		expect(result[0]).toBe(obj1);
		expect(result[1]).toBe(obj3);
	});

	test('should handle single element array', async () => {
		const result = await asyncFilter([42], async (x) => x > 0);
		expect(result).toEqual([42]);
		const empty = await asyncFilter([42], async (x) => x < 0);
		expect(empty).toEqual([]);
	});

	test('should handle predicate returning truthy/falsy values', async () => {
		const input = [1, 2, 3, 4, 5];
		const result = await asyncFilter(input, async (x) => x % 2 as any);
		expect(result).toEqual([1, 3, 5]);
	});

	test('should handle sequential execution with concurrency 1', async () => {
		const input = [1, 2, 3, 4, 5];
		let running = 0;
		let maxRunning = 0;

		const predicate = async (x: number) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x % 2 === 0;
		};

		const result = await asyncFilter(input, predicate, { concurrency: 1 });
		expect(result).toEqual([2, 4]);
		expect(maxRunning).toBe(1);
	});

	test('should reject when signal is already aborted', async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(
			asyncFilter([1, 2, 3], async (x) => x > 0, { signal: controller.signal }),
		).rejects.toThrow();
	});

	test('should reject when signal aborts mid-processing', async () => {
		const controller = new AbortController();
		const promise = asyncFilter([1, 2, 3, 4, 5], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 20));
			if (x === 2) controller.abort();
			return true;
		}, { signal: controller.signal, concurrency: 2 });
		await expect(promise).rejects.toThrow();
	});

	test('should throw predicate error when signal aborts at the same time', async () => {
		// Regression: when a predicate throws AND the signal is aborted concurrently,
		// the predicate error must not be masked by an AbortError.
		const controller = new AbortController();
		const predicateError = new Error('predicate failed');

		const promise = asyncFilter([1, 2], async (x) => {
			if (x === 1) {
				// Abort the signal and immediately throw in the same microtask.
				controller.abort('external abort');
				throw predicateError;
			}

			await new Promise((resolve) => setTimeout(resolve, 20));
			return true;
		}, { signal: controller.signal, concurrency: 2 });

		const err = await promise.catch((e: unknown) => e);
		expect(err).toBe(predicateError);
		expect((err as Error).name).not.toBe('AbortError');
	});

	test('should reject when concurrency is NaN', async () => {
		await expect(asyncFilter([1,2,3], async (x) => x > 0, { concurrency: Number.NaN })).rejects.toThrow(RangeError);
	});

	test('should handle non-Error thrown values', async () => {
		await expect(asyncFilter([1,2,3], async (x) => {
			if (x === 2) throw 42;
			return true;
		})).rejects.toThrow('Item processing failed');
	});

	// Edge cases — value types

	test('should handle arrays with falsy values', async () => {
		const input = [0, 1, false, true, '', 'hello', null, undefined, NaN];
		const result = await asyncFilter(input, async (x) => x !== null && x !== undefined);
		expect(result).toEqual([0, 1, false, true, '', 'hello', NaN]);
	});

	test('should handle arrays with duplicate values', async () => {
		const input = [1, 2, 2, 3, 3, 3, 4];
		const result = await asyncFilter(input, async (x) => x > 2);
		expect(result).toEqual([3, 3, 3, 4]);
	});

	test('should handle arrays with symbols', async () => {
		const sym1 = Symbol('a');
		const sym2 = Symbol('b');
		const sym3 = Symbol('c');
		const result = await asyncFilter([sym1, sym2, sym3], async (s) => s !== sym2);
		expect(result).toEqual([sym1, sym3]);
	});

	test('should handle arrays with functions', async () => {
		const fn1 = () => 1;
		const fn2 = () => 2;
		const fn3 = () => 3;
		const result = await asyncFilter([fn1, fn2, fn3], async (fn) => fn() > 1);
		expect(result).toEqual([fn2, fn3]);
	});

	test('should handle arrays with Date objects', async () => {
		const d1 = new Date('2020-01-01');
		const d2 = new Date('2021-01-01');
		const d3 = new Date('2022-01-01');
		const result = await asyncFilter([d1, d2, d3], async (d) => d.getFullYear() > 2020);
		expect(result).toEqual([d2, d3]);
	});

	test('should handle arrays with RegExp objects', async () => {
		const r1 = /test1/;
		const r2 = /test2/i;
		const r3 = /test3/g;
		const result = await asyncFilter([r1, r2, r3], async (r) => r.flags.includes('i'));
		expect(result).toEqual([r2]);
	});

	test('should handle arrays with mixed types', async () => {
		const input: any[] = [1, 'string', true, null, undefined, { key: 'value' }, [1, 2, 3]];
		const result = await asyncFilter(input, async (x) => typeof x === 'string' || typeof x === 'number');
		expect(result).toEqual([1, 'string']);
	});

	test('should handle NaN values', async () => {
		const result = await asyncFilter([1, NaN, 3, NaN, 5], async (x) => !Number.isNaN(x));
		expect(result).toEqual([1, 3, 5]);
	});

	test('should handle Infinity and -Infinity', async () => {
		const result = await asyncFilter([1, Infinity, 3, -Infinity, 5], async (x) => Number.isFinite(x));
		expect(result).toEqual([1, 3, 5]);
	});

	test('should handle BigInt values', async () => {
		const result = await asyncFilter([1n, 2n, 3n, 4n, 5n], async (x) => x % 2n === 0n);
		expect(result).toEqual([2n, 4n]);
	});

	test('should handle nested objects in arrays', async () => {
		const input = [
			{ user: { id: 1, active: true } },
			{ user: { id: 2, active: false } },
			{ user: { id: 3, active: true } },
		];
		const result = await asyncFilter(input, async (item) => item.user.active);
		expect(result).toEqual([{ user: { id: 1, active: true } }, { user: { id: 3, active: true } }]);
	});

	// Edge cases — predicate behavior

	test('should handle predicate that returns a resolved promise', async () => {
		const result = await asyncFilter([1, 2, 3, 4, 5], (x) => Promise.resolve(x > 2));
		expect(result).toEqual([3, 4, 5]);
	});

	test('should handle predicate that returns a rejected promise', async () => {
		await expect(
			asyncFilter([1, 2, 3], (x) => {
				if (x === 2) return Promise.reject(new Error('Rejected'));
				return Promise.resolve(true);
			}),
		).rejects.toThrow('Rejected');
	});

	test('should handle predicate that has side effects on elements', async () => {
		const input = [{ id: 1, touched: false }, { id: 2, touched: false }, { id: 3, touched: false }];
		await asyncFilter(input, async (item) => {
			item.touched = true;
			return item.id > 1;
		});
		expect(input.every((item) => item.touched)).toBe(true);
	});

	test('should handle predicate that awaits multiple promises', async () => {
		const result = await asyncFilter([1, 2, 3, 4], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 5));
			await new Promise((resolve) => setTimeout(resolve, 5));
			return x % 2 === 0;
		});
		expect(result).toEqual([2, 4]);
	});

	// Edge cases — concurrency

	test('should handle concurrency larger than array length', async () => {
		let running = 0;
		let maxRunning = 0;
		const result = await asyncFilter([1, 2, 3, 4], async (x) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x % 2 === 0;
		}, { concurrency: 10 });
		expect(result).toEqual([2, 4]);
		expect(maxRunning).toBe(4);
	});

	test('should handle large arrays efficiently', async () => {
		const input = Array.from({ length: 200 }, (_, i) => i);
		const result = await asyncFilter(input, async (x) => x % 20 === 0, { concurrency: 10 });
		expect(result).toHaveLength(10);
		expect(result).toEqual([0, 20, 40, 60, 80, 100, 120, 140, 160, 180]);
	});

	test('should handle zero-timeout promises', async () => {
		const result = await asyncFilter([1, 2, 3, 4, 5], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 0));
			return x > 2;
		});
		expect(result).toEqual([3, 4, 5]);
	});
});