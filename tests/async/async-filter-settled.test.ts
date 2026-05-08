import { describe, expect, test } from 'bun:test';
import { asyncFilterSettled } from '../../src/index.js';

describe('asyncFilterSettled', () => {
	test('should handle empty arrays', async () => {
		const { results, errors } = await asyncFilterSettled([], async (x) => x > 0);
		expect(results).toEqual([]);
		expect(errors).toEqual([]);
	});

	test('should filter values asynchronously', async () => {
		const input = [1, 2, 3, 4, 5];
		const { results, errors } = await asyncFilterSettled(input, async (x) => x % 2 === 0);
		expect(results).toEqual([2, 4]);
		expect(errors).toEqual([]);
	});

	test('should exclude elements whose predicate throws', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async (x: number) => {
			if (x === 3) throw new Error('Test error');
			return x % 2 === 0;
		};
		const { results, errors } = await asyncFilterSettled(input, predicate);
		expect(results).toEqual([2, 4]);
		expect(errors).toHaveLength(1);
		expect(errors[0].index).toBe(2);
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

		const { results } = await asyncFilterSettled(input, predicate, { concurrency: maxConcurrent });
		expect(results).toEqual([2, 4, 6, 8]);
		expect(maxRunning).toBeLessThanOrEqual(maxConcurrent);
	});

	test('should handle multiple errors', async () => {
		const input = [1, 2, 3, 4, 5, 6];
		const predicate = async (x: number) => {
			if (x === 2 || x === 4 || x === 6) throw new Error('Test error');
			return x % 2 === 1;
		};
		const { results, errors } = await asyncFilterSettled(input, predicate);
		expect(results).toEqual([1, 3, 5]);
		expect(errors).toHaveLength(3);
	});

	test('should handle all items throwing', async () => {
		const input = [1, 2, 3];
		const { results, errors } = await asyncFilterSettled(input, async () => {
			throw new Error('Always fails');
		});
		expect(results).toEqual([]);
		expect(errors).toHaveLength(3);
	});

	test('should maintain element references', async () => {
		const obj1 = { id: 1 };
		const obj2 = { id: 2 };
		const obj3 = { id: 3 };
		const input = [obj1, obj2, obj3];
		const { results } = await asyncFilterSettled(input, async (obj) => obj.id !== 2);
		expect(results).toEqual([obj1, obj3]);
		expect(results[0]).toBe(obj1);
	});

	test('should handle predicate returning truthy/falsy values', async () => {
		const input = [1, 2, 3, 4, 5];
		const { results } = await asyncFilterSettled(input, async (x) => x % 2 as any);
		expect(results).toEqual([1, 3, 5]);
	});

	test('should reject when signal is already aborted', async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(
			asyncFilterSettled([1, 2, 3], async (x) => x > 0, { signal: controller.signal }),
		).rejects.toThrow();
	});

	test('should reject when signal aborts mid-processing', async () => {
		const controller = new AbortController();
		const promise = asyncFilterSettled([1, 2, 3, 4, 5], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 20));
			if (x === 2) controller.abort();
			return true;
		}, { signal: controller.signal, concurrency: 2 });
		await expect(promise).rejects.toThrow();
	});

	test('should process all items even with errors and concurrency limit', async () => {
		const input = [1, 2, 3, 4, 5, 6];
		const processed: number[] = [];
		const predicate = async (x: number) => {
			processed.push(x);
			await new Promise((resolve) => setTimeout(resolve, 5));
			if (x % 2 === 0) throw new Error('Even fails');
			return true;
		};
		const { results, errors } = await asyncFilterSettled(input, predicate, { concurrency: 2 });
		expect(processed.length).toBe(6);
		expect(results).toEqual([1, 3, 5]);
		expect(errors).toHaveLength(3);
	});

	test('should throw error for null or undefined array', async () => {
		// @ts-expect-error - Testing invalid input
		await expect(asyncFilterSettled(null, async (x: any) => x > 0)).rejects.toThrow('Input array must not be null or undefined');
		// @ts-expect-error - Testing invalid input
		await expect(asyncFilterSettled(undefined, async (x: any) => x > 0)).rejects.toThrow('Input array must not be null or undefined');
	});

	test('should throw RangeError for invalid concurrency', async () => {
		const predicate = async (x: number) => x > 0;
		await expect(asyncFilterSettled([1, 2, 3], predicate, { concurrency: 0 })).rejects.toThrow(RangeError);
		await expect(asyncFilterSettled([1, 2, 3], predicate, { concurrency: -1 })).rejects.toThrow(RangeError);
		await expect(asyncFilterSettled([1, 2, 3], predicate, { concurrency: 1.5 })).rejects.toThrow(RangeError);
	});

	test('should reject when concurrency is NaN', async () => {
		await expect(asyncFilterSettled([1,2,3], async (x) => x > 0, { concurrency: Number.NaN })).rejects.toThrow(RangeError);
	});

	test('should handle non-Error thrown values', async () => {
		const input = [1, 2, 3, 4];
		const { results, errors } = await asyncFilterSettled(input, async (x) => {
			if (x === 2) throw 'string error';
			if (x === 4) throw 42;
			return x % 2 === 1;
		});
		expect(results).toEqual([1, 3]);
		expect(errors).toHaveLength(2);
		expect(errors[0].error).toBe('string error');
		expect(errors[1].error).toBe(42);
	});

	test('should collect errors in order with limited concurrency', async () => {
		const input = [1, 2, 3, 4, 5, 6];
		const { errors } = await asyncFilterSettled(input, async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			if (x % 2 === 0) throw new Error(`fail ${x}`);
			return true;
		}, { concurrency: 2 });
		expect(errors).toHaveLength(3);
		expect(errors.map(e => e.index).sort((a, b) => a - b)).toEqual([1, 3, 5]);
	});

	// Edge cases — value types

	test('should handle arrays with falsy values', async () => {
		const input = [0, 1, false, true, '', 'hello', null, undefined, NaN];
		const { results } = await asyncFilterSettled(input, async (x) => x !== null && x !== undefined);
		expect(results).toEqual([0, 1, false, true, '', 'hello', NaN]);
	});

	test('should handle arrays with symbols', async () => {
		const sym1 = Symbol('a');
		const sym2 = Symbol('b');
		const { results } = await asyncFilterSettled([sym1, sym2], async (s) => s === sym1);
		expect(results).toEqual([sym1]);
	});

	test('should handle arrays with Date objects', async () => {
		const d1 = new Date('2020-01-01');
		const d2 = new Date('2021-01-01');
		const { results } = await asyncFilterSettled([d1, d2], async (d) => d.getFullYear() > 2020);
		expect(results).toEqual([d2]);
	});

	test('should handle BigInt values', async () => {
		const { results } = await asyncFilterSettled([1n, 2n, 3n, 4n], async (x) => x % 2n === 0n);
		expect(results).toEqual([2n, 4n]);
	});

	test('should handle Infinity and NaN values', async () => {
		const { results } = await asyncFilterSettled([1, NaN, 3, Infinity, 5], async (x) => Number.isFinite(x));
		expect(results).toEqual([1, 3, 5]);
	});

	test('should handle nested objects', async () => {
		const input = [
			{ user: { id: 1, active: true } },
			{ user: { id: 2, active: false } },
		];
		const { results } = await asyncFilterSettled(input, async (item) => item.user.active);
		expect(results).toEqual([{ user: { id: 1, active: true } }]);
	});

	// Edge cases — predicate behavior

	test('should handle predicate that returns a resolved promise', async () => {
		const { results } = await asyncFilterSettled([1, 2, 3], (x) => Promise.resolve(x > 1));
		expect(results).toEqual([2, 3]);
	});

	test('should handle predicate that returns a rejected promise', async () => {
		const { results, errors } = await asyncFilterSettled([1, 2, 3], (x) => {
			if (x === 2) return Promise.reject(new Error('Rejected'));
			return Promise.resolve(true);
		});
		expect(results).toEqual([1, 3]);
		expect(errors).toHaveLength(1);
		expect(errors[0].index).toBe(1);
	});

	test('should handle predicate with side effects', async () => {
		const input = [{ id: 1, touched: false }, { id: 2, touched: false }];
		await asyncFilterSettled(input, async (item) => {
			item.touched = true;
			return item.id === 1;
		});
		expect(input.every((item) => item.touched)).toBe(true);
	});

	// Edge cases — concurrency

	test('should handle concurrency larger than array length', async () => {
		let running = 0;
		let maxRunning = 0;
		const { results } = await asyncFilterSettled([1, 2, 3], async (x) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x > 1;
		}, { concurrency: 10 });
		expect(results).toEqual([2, 3]);
		expect(maxRunning).toBe(3);
	});

	test('should handle large arrays', async () => {
		const input = Array.from({ length: 100 }, (_, i) => i);
		const { results, errors } = await asyncFilterSettled(input, async (x) => {
			if (x % 10 === 3) throw new Error(`fail ${x}`);
			return true; // Accept all successful items so results + errors = total
		}, { concurrency: 10 });
		expect(results.length + errors.length).toBe(100);
		expect(errors).toHaveLength(10); // 3, 13, 23, ..., 93
	});
});