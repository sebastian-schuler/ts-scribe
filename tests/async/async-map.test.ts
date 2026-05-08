import { describe, expect, test } from 'bun:test';
import { asyncMap } from '../../src/index.js';

describe('asyncMap', () => {
	test('should handle empty arrays', async () => {
		const result = await asyncMap([], async (x) => x * 2);
		expect(result).toEqual([]);
	});

	test('should map values asynchronously', async () => {
		const input = [1, 2, 3, 4, 5];
		const result = await asyncMap(input, async (x) => x * 2);
		expect(result).toEqual([2, 4, 6, 8, 10]);
	});

	test('should preserve order regardless of completion time', async () => {
		const input = [5, 1, 3, 2, 4];
		const callback = async (x: number) => {
			await new Promise((resolve) => setTimeout(resolve, x * 10));
			return x * 2;
		};
		const result = await asyncMap(input, callback);
		expect(result).toEqual([10, 2, 6, 4, 8]);
	});

	test('should pass index and original array to callback', async () => {
		const input = ['a', 'b', 'c'];
		const indices: number[] = [];
		const arrays: string[][] = [];

		await asyncMap(input, async (value, index, array) => {
			indices.push(index);
			arrays.push([...array]);
			return value.toUpperCase();
		});

		// Sort by index since concurrent completion order is not guaranteed
		indices.sort((a, b) => a - b);
		expect(indices).toEqual([0, 1, 2]);
		// Each call received the same array reference
		expect(arrays).toHaveLength(3);
		for (const arr of arrays) {
			expect(arr).toEqual(input);
		}
	});

	test('should throw error when callback throws', async () => {
		const input = [1, 2, 3, 4, 5];
		const callback = async (x: number) => {
			if (x === 3) throw new Error('Test error');
			return x * 2;
		};
		await expect(asyncMap(input, callback)).rejects.toThrow('Test error');
	});

	test('should respect concurrency limit', async () => {
		const input = [1, 2, 3, 4, 5, 6, 7, 8];
		const maxConcurrent = 2;
		let running = 0;
		let maxRunning = 0;

		const callback = async (x: number) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x * 2;
		};

		const result = await asyncMap(input, callback, { concurrency: maxConcurrent });
		expect(result).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
		expect(maxRunning).toBeLessThanOrEqual(maxConcurrent);
	});

	test('should handle sync throws in callback', async () => {
		const input = [1, 2, 3];
		const callback = async (x: number) => {
			if (x === 2) throw new Error('Sync error');
			return x * 2;
		};
		await expect(asyncMap(input, callback)).rejects.toThrow('Sync error');
	});

	test('should reject with invalid concurrency', async () => {
		const input = [1, 2, 3];
		await expect(asyncMap(input, async (x) => x * 2, { concurrency: 0 })).rejects.toThrow(RangeError);
		await expect(asyncMap(input, async (x) => x * 2, { concurrency: -5 })).rejects.toThrow(RangeError);
		await expect(asyncMap(input, async (x) => x * 2, { concurrency: 2.5 })).rejects.toThrow(RangeError);
	});

	test('should handle a single-element array', async () => {
		const result = await asyncMap([42], async (x) => x * 2);
		expect(result).toEqual([84]);
	});

	test('should process items serially when concurrency is 1', async () => {
		const input = [1, 2, 3, 4, 5];
		let running = 0;
		let maxRunning = 0;

		const callback = async (x: number) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x * 2;
		};

		const result = await asyncMap(input, callback, { concurrency: 1 });
		expect(result).toEqual([2, 4, 6, 8, 10]);
		expect(maxRunning).toBe(1);
	});

	test('should throw error for null or undefined array', async () => {
		// @ts-expect-error - Testing invalid input
		await expect(asyncMap(null, async (x: any) => x)).rejects.toThrow('Input array must not be null or undefined');
		// @ts-expect-error - Testing invalid input
		await expect(asyncMap(undefined, async (x: any) => x)).rejects.toThrow('Input array must not be null or undefined');
	});

	test('should reject when signal is already aborted', async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(
			asyncMap([1, 2, 3], async (x) => x * 2, { signal: controller.signal }),
		).rejects.toThrow();
	});

	test('should reject when signal aborts mid-processing', async () => {
		const controller = new AbortController();
		const promise = asyncMap([1, 2, 3, 4, 5], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 20));
			if (x === 2) controller.abort();
			return x;
		}, { signal: controller.signal, concurrency: 2 });
		await expect(promise).rejects.toThrow();
	});

	test('should reject when concurrency is NaN', async () => {
		const input = [1, 2, 3];
		await expect(asyncMap(input, async (x) => x * 2, { concurrency: Number.NaN })).rejects.toThrow(RangeError);
	});

	test('should handle non-Error thrown values (string)', async () => {
		const input = [1, 2, 3];
		await expect(asyncMap(input, async (x) => {
			if (x === 2) throw 'string error';
			return x * 2;
		})).rejects.toThrow('Item processing failed');
	});

	// Edge cases — value types

	test('should handle different return types', async () => {
		const result = await asyncMap([1, 2, 3, 4], async (x) => x.toString());
		expect(result).toEqual(['1', '2', '3', '4']);
	});

	test('should handle falsy input values', async () => {
		const input = [0, false, null, undefined, ''] as const;
		const received: unknown[] = [];
		await asyncMap([...input], async (x) => {
			received.push(x);
			return x;
		});
		expect(received).toEqual([...input]);
	});

	test('should handle nested promises in callback', async () => {
		const result = await asyncMap([1, 2, 3], async (x) => {
			return new Promise<number>((resolve) => {
				setTimeout(() => resolve(x * 2), 10);
			});
		});
		expect(result).toEqual([2, 4, 6]);
	});

	// Edge cases — concurrency

	test('should handle concurrency larger than array length', async () => {
		let running = 0;
		let maxRunning = 0;
		const result = await asyncMap([1, 2, 3, 4], async (x) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x * 2;
		}, { concurrency: 10 });
		expect(result).toEqual([2, 4, 6, 8]);
		expect(maxRunning).toBe(4);
	});

	test('should handle concurrency equal to array length', async () => {
		let running = 0;
		let maxRunning = 0;
		const input = [1, 2, 3, 4];
		const result = await asyncMap(input, async (x) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x * 2;
		}, { concurrency: input.length });
		expect(result).toEqual([2, 4, 6, 8]);
		expect(maxRunning).toBe(input.length);
	});

	test('should handle large arrays efficiently', async () => {
		const input = Array.from({ length: 200 }, (_, i) => i);
		const result = await asyncMap(input, async (x) => x * 2, { concurrency: 20 });
		expect(result.length).toBe(200);
		expect(result[0]).toBe(0);
		expect(result[199]).toBe(398);
	});
});