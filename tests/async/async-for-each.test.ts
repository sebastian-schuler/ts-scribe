import { describe, expect, it } from 'bun:test';
import { asyncForEach } from '../../src/index.js';

describe('asyncForEach', () => {
	it('should process all elements simultaneously', async () => {
		const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		const processed: number[] = [];
		const start = Date.now();

		await asyncForEach(items, async (item) => {
			processed.push(item);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		});

		const duration = Date.now() - start;
		expect(duration).toBeLessThan(1500);
		expect(processed.length).toBe(items.length);
	});

	it('should respect concurrency limit', async () => {
		const items = [1, 2, 3, 4, 5];
		const start = Date.now();
		let processed = 0;

		await asyncForEach(items, async () => {
			processed++;
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}, { concurrency: 3 });

		const duration = Date.now() - start;
		expect(duration).toBeLessThan(2500);
		expect(processed).toBe(items.length);
	});

	it('should call the callback with correct arguments', async () => {
		const items = [1, 2, 3];
		const calls: Array<[number, number, number[]]> = [];

		await asyncForEach(items, async (item, index, array) => {
			calls.push([item, index, array]);
			await new Promise((resolve) => setTimeout(resolve, 10));
		});

		expect(calls).toHaveLength(3);
		// Sort by index since concurrent completion order is not guaranteed
		calls.sort((a, b) => a[1] - b[1]);
		for (const [position, [item, idx, arr]] of calls.entries()) {
			expect(item).toBe(items[position]);
			expect(idx).toBe(position);
			expect(arr).toBe(items);
		}
	});

	it('should handle an empty array', async () => {
		let called = false;
		await asyncForEach([], async () => {
			called = true;
		});
		expect(called).toBe(false);
	});

	it('should handle a single element array', async () => {
		let called = false;
		await asyncForEach([42], async (item, index, array) => {
			called = true;
			expect(item).toBe(42);
			expect(index).toBe(0);
			expect(array).toEqual([42]);
		});
		expect(called).toBe(true);
	});

	it('should propagate errors thrown in the callback', async () => {
		const items = [1, 2, 3];
		const error = new Error('Test error');

		const promise = asyncForEach(items, async (item: number) => {
			if (item === 2) throw error;
			await new Promise((resolve) => setTimeout(resolve, 10));
		});

		await expect(promise).rejects.toThrow(error);
	});

	it('should respect concurrency limit of 1 (sequential execution)', async () => {
		const items = [1, 2, 3, 4, 5];
		let concurrent = 0;
		let maxConcurrent = 0;

		await asyncForEach(items, async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 50));
			concurrent--;
		}, { concurrency: 1 });

		expect(maxConcurrent).toBe(1);
	});

	it('should respect concurrency limit of 2', async () => {
		const items = [1, 2, 3, 4, 5];
		let concurrent = 0;
		let maxConcurrent = 0;

		await asyncForEach(items, async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 50));
			concurrent--;
		}, { concurrency: 2 });

		expect(maxConcurrent).toBe(2);
	});

	it('should throw when concurrency is invalid', async () => {
		await expect(asyncForEach([1, 2, 3], async () => {}, { concurrency: 0 })).rejects.toThrow(RangeError);
		await expect(asyncForEach([1, 2, 3], async () => {}, { concurrency: -1 })).rejects.toThrow(RangeError);
		await expect(asyncForEach([1, 2, 3], async () => {}, { concurrency: 2.5 })).rejects.toThrow(RangeError);
	});

	it('should throw when array is null or undefined', async () => {
		// @ts-expect-error - Testing invalid input
		await expect(asyncForEach(null, async () => {})).rejects.toThrow('Input array must not be null or undefined');
		// @ts-expect-error - Testing invalid input
		await expect(asyncForEach(undefined, async () => {})).rejects.toThrow('Input array must not be null or undefined');
	});

	it('should reject when signal is already aborted', async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(
			asyncForEach([1, 2, 3], async () => {}, { signal: controller.signal }),
		).rejects.toThrow();
	});

	it('should reject when signal aborts mid-processing', async () => {
		const controller = new AbortController();
		const promise = asyncForEach([1, 2, 3, 4, 5], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 20));
			if (x === 2) controller.abort();
		}, { signal: controller.signal, concurrency: 2 });
		await expect(promise).rejects.toThrow();
	});

	it('should reject when concurrency is NaN', async () => {
		await expect(asyncForEach([1,2,3], async () => {}, { concurrency: Number.NaN })).rejects.toThrow(RangeError);
	});

	it('should handle non-Error thrown values', async () => {
		await expect(asyncForEach([1,2,3], async (x) => {
			if (x === 2) throw 'string error';
		})).rejects.toThrow('Item processing failed');
	});

	// Edge cases — value types

	it('should work with falsy values and different types', async () => {
		const items = [0, false, '', null, undefined, {}];
		const processed: any[] = [];
		await asyncForEach(items, async (item) => {
			processed.push(item);
			await new Promise((resolve) => setTimeout(resolve, 5));
		});
		expect(processed).toEqual(items);
	});

	it('should work with object arrays', async () => {
		const items = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' },
		];
		const names: string[] = [];
		await asyncForEach(items, async (item) => {
			names.push(item.name);
		});
		expect(names).toEqual(['Alice', 'Bob']);
	});

	it('should handle callback that modifies external state', async () => {
		const items = [1, 2, 3, 4, 5];
		const results: number[] = [];
		await asyncForEach(items, async (item) => {
			await new Promise((resolve) => setTimeout(resolve, 5));
			results.push(item * 2);
		}, { concurrency: 2 });
		expect(results.length).toBe(5);
		expect(results.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
	});

	// Edge cases — concurrency

	it('should handle concurrency larger than array size', async () => {
		let concurrent = 0;
		let maxConcurrent = 0;
		await asyncForEach([1, 2, 3], async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 10));
			concurrent--;
		}, { concurrency: 100 });
		expect(maxConcurrent).toBe(3);
	});

	it('should run all items concurrently with default concurrency', async () => {
		let concurrent = 0;
		let maxConcurrent = 0;
		await asyncForEach([1, 2, 3, 4, 5], async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 20));
			concurrent--;
		});
		expect(maxConcurrent).toBe(5);
	});

	it('should handle large arrays', async () => {
		const items = Array.from({ length: 200 }, (_, i) => i);
		let processed = 0;
		await asyncForEach(items, async () => {
			processed++;
		}, { concurrency: 20 });
		expect(processed).toBe(200);
	});

	it('should handle varying async completion times', async () => {
		const items = [1, 2, 3, 4];
		const delays = [30, 5, 20, 10];
		const processed: number[] = [];
		const start = Date.now();
		await asyncForEach(items, async (item, index) => {
			await new Promise((resolve) => setTimeout(resolve, delays[index]));
			processed.push(item);
		}, { concurrency: 2 });
		const duration = Date.now() - start;
		// With concurrency 2: [30, 5] in parallel → ~30ms, then [20, 10] → ~20ms = ~50ms
		expect(duration).toBeLessThan(150);
		expect(processed.length).toBe(4);
	});
});