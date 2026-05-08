import { describe, expect, it } from 'bun:test';
import { asyncForEachSettled } from '../../src/index.js';

describe('asyncForEachSettled', () => {
	it('should process all elements', async () => {
		const processed: number[] = [];
		const { errors } = await asyncForEachSettled([1, 2, 3, 4, 5], async (item) => {
			processed.push(item);
		});
		expect(processed).toEqual([1, 2, 3, 4, 5]);
		expect(errors).toEqual([]);
	});

	it('should continue past errors', async () => {
		const processed: number[] = [];
		const { errors } = await asyncForEachSettled([1, 2, 3, 4, 5], async (x) => {
			processed.push(x);
			if (x % 2 === 0) throw new Error(`Error at ${x}`);
		});
		expect(processed.length).toBe(5);
		expect(errors).toHaveLength(2); // 2 and 4
	});

	it('should continue when all items throw', async () => {
		const processed: number[] = [];
		const { errors } = await asyncForEachSettled([1, 2, 3], async (x) => {
			processed.push(x);
			throw new Error(`Fail ${x}`);
		});
		expect(processed).toEqual([1, 2, 3]);
		expect(errors).toHaveLength(3);
	});

	it('should handle an empty array', async () => {
		const { errors } = await asyncForEachSettled([], async () => {});
		expect(errors).toEqual([]);
	});

	it('should respect concurrency limit', async () => {
		let concurrent = 0;
		let maxConcurrent = 0;

		await asyncForEachSettled([1, 2, 3, 4, 5], async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 20));
			concurrent--;
		}, { concurrency: 2 });

		expect(maxConcurrent).toBe(2);
	});

	it('should collect errors with correct indices', async () => {
		const { errors } = await asyncForEachSettled([10, 20, 30], async (x, index) => {
			if (index === 1) throw new Error('fail');
		});
		expect(errors).toHaveLength(1);
		expect(errors[0].index).toBe(1);
	});

	it('should process serially when concurrency is 1', async () => {
		const processed: number[] = [];
		const { errors } = await asyncForEachSettled([1, 2, 3], async (x) => {
			processed.push(x);
			if (x === 2) throw new Error('fail');
		}, { concurrency: 1 });
		expect(processed).toEqual([1, 2, 3]);
		expect(errors).toHaveLength(1);
	});

	it('should reject when signal is already aborted', async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(
			asyncForEachSettled([1, 2, 3], async () => {}, { signal: controller.signal }),
		).rejects.toThrow();
	});

	it('should reject when signal aborts mid-processing', async () => {
		const controller = new AbortController();
		const promise = asyncForEachSettled([1, 2, 3, 4, 5], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 20));
			if (x === 2) controller.abort();
		}, { signal: controller.signal, concurrency: 2 });
		await expect(promise).rejects.toThrow();
	});

	it('should throw when array is null or undefined', async () => {
		// @ts-expect-error - Testing invalid input
		await expect(asyncForEachSettled(null, async () => {})).rejects.toThrow('Input array must not be null or undefined');
		// @ts-expect-error - Testing invalid input
		await expect(asyncForEachSettled(undefined, async () => {})).rejects.toThrow('Input array must not be null or undefined');
	});

	it('should throw when concurrency is invalid', async () => {
		await expect(asyncForEachSettled([1, 2, 3], async () => {}, { concurrency: 0 })).rejects.toThrow(RangeError);
		await expect(asyncForEachSettled([1, 2, 3], async () => {}, { concurrency: -1 })).rejects.toThrow(RangeError);
		await expect(asyncForEachSettled([1, 2, 3], async () => {}, { concurrency: 2.5 })).rejects.toThrow(RangeError);
	});

	it('should reject when concurrency is NaN', async () => {
		await expect(asyncForEachSettled([1,2,3], async () => {}, { concurrency: Number.NaN })).rejects.toThrow(RangeError);
	});

	it('should handle non-Error thrown values', async () => {
		const { errors } = await asyncForEachSettled([1, 2, 3], async (x) => {
			if (x === 2) throw 'string error';
		});
		expect(errors).toHaveLength(1);
		expect(errors[0].index).toBe(1);
		expect(errors[0].error).toBe('string error');
	});

	it('should handle thrown null and number', async () => {
		const { errors } = await asyncForEachSettled([1, 2, 3], async (x) => {
			if (x === 1) throw null;
			if (x === 3) throw 42;
		});
		expect(errors).toHaveLength(2);
		expect(errors[0].error).toBeNull();
		expect(errors[1].error).toBe(42);
	});

	// Edge cases — value types

	it('should work with falsy values', async () => {
		const items = [0, false, '', null, undefined];
		const processed: any[] = [];
		const { errors } = await asyncForEachSettled(items, async (item) => {
			processed.push(item);
		});
		expect(processed).toEqual(items);
		expect(errors).toEqual([]);
	});

	it('should work with different data types', async () => {
		const items = [{ id: 1 }, { id: 2 }];
		const ids: number[] = [];
		await asyncForEachSettled(items, async (item) => {
			ids.push(item.id);
		});
		expect(ids).toEqual([1, 2]);
	});

	it('should handle callback modifying external state', async () => {
		const results: number[] = [];
		const { errors } = await asyncForEachSettled([1, 2, 3], async (x) => {
			results.push(x * 2);
		});
		expect(results).toEqual([2, 4, 6]);
		expect(errors).toEqual([]);
	});

	// Edge cases — concurrency

	it('should handle concurrency larger than array size', async () => {
		let concurrent = 0;
		let maxConcurrent = 0;
		await asyncForEachSettled([1, 2, 3], async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 10));
			concurrent--;
		}, { concurrency: 100 });
		expect(maxConcurrent).toBe(3);
	});

	it('should handle large arrays', async () => {
		const items = Array.from({ length: 100 }, (_, i) => i);
		let processed = 0;
		const { errors } = await asyncForEachSettled(items, async () => {
			processed++;
		}, { concurrency: 20 });
		expect(processed).toBe(100);
		expect(errors).toEqual([]);
	});

	it('should handle varying async completion times', async () => {
		const items = [1, 2, 3, 4];
		const processed: number[] = [];
		const start = Date.now();
		const { errors } = await asyncForEachSettled(items, async (item) => {
			await new Promise((resolve) => setTimeout(resolve, item * 10));
			processed.push(item);
		}, { concurrency: 2 });
		expect(processed.length).toBe(4);
		expect(errors).toEqual([]);
	});
});