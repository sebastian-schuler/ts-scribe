import { describe, expect, test } from 'bun:test';
import { asyncMapSettled } from '../../src/index.js';

describe('asyncMapSettled', () => {
	test('should handle empty arrays', async () => {
		const { results, errors } = await asyncMapSettled([], async (x) => x * 2);
		expect(results).toEqual([]);
		expect(errors).toEqual([]);
	});

	test('should map values asynchronously', async () => {
		const input = [1, 2, 3, 4, 5];
		const { results, errors } = await asyncMapSettled(input, async (x) => x * 2);
		expect(results).toEqual([2, 4, 6, 8, 10]);
		expect(errors).toEqual([]);
	});

	test('should preserve order regardless of completion time', async () => {
		const input = [5, 1, 3, 2, 4];
		const callback = async (x: number) => {
			await new Promise((resolve) => setTimeout(resolve, x * 10));
			return x * 2;
		};
		const { results } = await asyncMapSettled(input, callback);
		expect(results).toEqual([10, 2, 6, 4, 8]);
	});

	test('should use undefined for failed items by default', async () => {
		const input = [1, 2, 3, 4, 5];
		const callback = async (x: number) => {
			if (x === 3) throw new Error('Test error');
			return x * 2;
		};
		const { results, errors } = await asyncMapSettled(input, callback);
		expect(results).toEqual([2, 4, undefined, 8, 10]);
		expect(errors).toHaveLength(1);
		expect(errors[0].index).toBe(2);
		expect(errors[0].error).toBeInstanceOf(Error);
	});

	test('should use custom errorValue for failed items', async () => {
		const input = [1, 2, 3, 4, 5];
		const callback = async (x: number) => {
			if (x === 3) throw new Error('Test error');
			return x * 2;
		};
		const { results, errors } = await asyncMapSettled(input, callback, {
			errorValue: 'ERROR',
		});
		expect(results).toEqual([2, 4, 'ERROR', 8, 10]);
		expect(errors).toHaveLength(1);
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

		const { results } = await asyncMapSettled(input, callback, { concurrency: maxConcurrent });
		expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
		expect(maxRunning).toBeLessThanOrEqual(maxConcurrent);
	});

	test('should process all items even when some throw', async () => {
		const input = Array.from({ length: 10 }, (_, i) => i);
		const processed: number[] = [];

		const callback = async (x: number) => {
			processed.push(x);
			if (x % 3 === 0) throw new Error(`Error at ${x}`);
			return x * 2;
		};

		const { results, errors } = await asyncMapSettled(input, callback);
		expect(processed.length).toBe(10);
		expect(errors).toHaveLength(4); // indices 0, 3, 6, 9
	});

	test('should handle all items throwing', async () => {
		const input = [1, 2, 3];
		const { results, errors } = await asyncMapSettled(input, async () => {
			throw new Error('Always fails');
		});
		expect(results).toEqual([undefined, undefined, undefined]);
		expect(errors).toHaveLength(3);
	});

	test('should handle sync throws in callback', async () => {
		const input = [1, 2, 3];
		const callback = async (x: number) => {
			if (x === 2) throw new Error('Sync error');
			return x * 2;
		};
		const { results, errors } = await asyncMapSettled(input, callback, { errorValue: null });
		expect(results).toEqual([2, null, 6]);
		expect(errors).toHaveLength(1);
	});

	test('should reject when signal is already aborted', async () => {
		const controller = new AbortController();
		controller.abort();
		await expect(
			asyncMapSettled([1, 2, 3], async (x) => x * 2, { signal: controller.signal }),
		).rejects.toThrow();
	});

	test('should reject when signal aborts mid-processing', async () => {
		const controller = new AbortController();
		const promise = asyncMapSettled([1, 2, 3, 4, 5], async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 20));
			if (x === 2) controller.abort();
			return x;
		}, { signal: controller.signal, concurrency: 2 });
		await expect(promise).rejects.toThrow();
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

		const { results } = await asyncMapSettled(input, callback, { concurrency: 1 });
		expect(results).toEqual([2, 4, 6, 8, 10]);
		expect(maxRunning).toBe(1);
	});

	test('should return errors in order discovered', async () => {
		const input = [1, 2, 3, 4, 5];
		const { results, errors } = await asyncMapSettled(input, async (x) => {
			if (x % 2 === 1) throw new Error(`Odd: ${x}`);
			return x * 2;
		});
		expect(results[0]).toBeUndefined();
		expect(results[1]).toBe(4);
		expect(errors[0].index).toBe(0);
		expect(errors[1].index).toBe(2);
		expect(errors[2].index).toBe(4);
	});

	test('should throw error for null or undefined array', async () => {
		// @ts-expect-error - Testing invalid input
		await expect(asyncMapSettled(null, async (x: any) => x)).rejects.toThrow('Input array must not be null or undefined');
		// @ts-expect-error - Testing invalid input
		await expect(asyncMapSettled(undefined, async (x: any) => x)).rejects.toThrow('Input array must not be null or undefined');
	});

	test('should throw RangeError for invalid concurrency', async () => {
		const input = [1, 2, 3];
		await expect(asyncMapSettled(input, async (x) => x * 2, { concurrency: 0 })).rejects.toThrow(RangeError);
		await expect(asyncMapSettled(input, async (x) => x * 2, { concurrency: -5 })).rejects.toThrow(RangeError);
		await expect(asyncMapSettled(input, async (x) => x * 2, { concurrency: 2.5 })).rejects.toThrow(RangeError);
	});

	test('should reject when concurrency is NaN', async () => {
		const input = [1, 2, 3];
		await expect(asyncMapSettled(input, async (x) => x * 2, { concurrency: Number.NaN })).rejects.toThrow(RangeError);
	});

	test('should handle non-Error thrown values', async () => {
		const input = [1, 2, 3];
		const { results, errors } = await asyncMapSettled(input, async (x) => {
			if (x === 2) throw 'string error';
			return x * 2;
		}, { errorValue: null });
		expect(results).toEqual([2, null, 6]);
		expect(errors).toHaveLength(1);
		expect(errors[0].index).toBe(1);
		expect(errors[0].error).toBe('string error');
	});

	test('should handle thrown null and undefined', async () => {
		const input = [1, 2, 3, 4];
		const { results, errors } = await asyncMapSettled(input, async (x) => {
			if (x === 1) throw null;
			if (x === 3) throw undefined;
			return x * 2;
		});
		expect(results[0]).toBeUndefined();
		expect(results[2]).toBeUndefined();
		expect(errors).toHaveLength(2);
		expect(errors[0].error).toBeNull();
		expect(errors[1].error).toBeUndefined();
	});

	test('should collect errors in order with limited concurrency', async () => {
		const input = [1, 2, 3, 4, 5, 6];
		const { errors } = await asyncMapSettled(input, async (x) => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			if (x % 2 === 0) throw new Error(`fail ${x}`);
			return x;
		}, { concurrency: 2 });
		expect(errors).toHaveLength(3);
		expect(errors.map(e => e.index).sort((a, b) => a - b)).toEqual([1, 3, 5]);
	});

	// Edge cases — value types

	test('should handle different return types', async () => {
		const { results } = await asyncMapSettled([1, 2, 3], async (x) => x.toString());
		expect(results).toEqual(['1', '2', '3']);
	});

	test('should handle falsy input values', async () => {
		const input = [0, false, null, undefined, ''] as const;
		const received: unknown[] = [];
		const { results } = await asyncMapSettled([...input], async (x) => {
			received.push(x);
			return x;
		});
		expect(received).toEqual([...input]);
		expect(results).toEqual([...input]);
	});

	test('should handle nested promises', async () => {
		const { results } = await asyncMapSettled([1, 2, 3], async (x) => {
			return new Promise<number>((resolve) => {
				setTimeout(() => resolve(x * 2), 10);
			});
		});
		expect(results).toEqual([2, 4, 6]);
	});

	test('should handle complex typed error values', async () => {
		type ErrorInfo = { code: number; message: string };
		const errorValue: ErrorInfo = { code: 500, message: 'Failed' };
		const { results, errors } = await asyncMapSettled<number, number, ErrorInfo>(
			[1, 2, 3],
			async (x) => {
				if (x === 2) throw new Error('Simulated error');
				return x * 10;
			},
			{ errorValue },
		);
		expect(results).toEqual([10, errorValue, 30]);
		expect(errors).toHaveLength(1);
		expect(errors[0].index).toBe(1);
	});

	// Edge cases — concurrency

	test('should handle concurrency larger than array length', async () => {
		let running = 0;
		let maxRunning = 0;
		const { results } = await asyncMapSettled([1, 2, 3], async (x) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x * 2;
		}, { concurrency: 10 });
		expect(results).toEqual([2, 4, 6]);
		expect(maxRunning).toBe(3);
	});

	test('should handle concurrency equal to array length', async () => {
		let running = 0;
		let maxRunning = 0;
		const input = [1, 2, 3, 4];
		const { results } = await asyncMapSettled(input, async (x) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x * 2;
		}, { concurrency: input.length });
		expect(results).toEqual([2, 4, 6, 8]);
		expect(maxRunning).toBe(input.length);
	});

	test('should handle large arrays', async () => {
		const input = Array.from({ length: 100 }, (_, i) => i);
		const { results, errors } = await asyncMapSettled(input, async (x) => {
			if (x % 10 === 3) throw new Error(`fail ${x}`);
			return x * 2;
		}, { concurrency: 10, errorValue: -1 });
		expect(results.length).toBe(100);
		expect(errors).toHaveLength(10); // 3, 13, 23, ..., 93
		expect(results.filter(r => r === -1).length).toBe(10);
	});

	test('should handle mixed successes and failures with limited concurrency', async () => {
		const input = [1, 2, 3, 4, 5, 6, 7, 8];
		const failingIndices = new Set([2, 5, 7]);
		const processed: number[] = [];
		const { results, errors } = await asyncMapSettled(input, async (x) => {
			processed.push(x);
			await new Promise((resolve) => setTimeout(resolve, 10));
			if (failingIndices.has(x)) throw new Error(`Error at ${x}`);
			return x * 2;
		}, { concurrency: 2, errorValue: 'FAILED' });
		expect(processed.length).toBe(8);
		expect(errors).toHaveLength(3);
		const expected = input.map((x) => (failingIndices.has(x) ? 'FAILED' : x * 2));
		expect(results).toEqual(expected);
	});
});