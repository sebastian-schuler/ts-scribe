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

		// Simulate varying completion times with setTimeout
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
			arrays.push([...array]); // Clone to avoid reference issues
			return index % 2 === 0;
		});

		expect(result).toEqual(['a', 'c']);
		expect(indices).toEqual([0, 1, 2, 3]);
		expect(arrays).toEqual([input, input, input, input]);
	});

	test('should throw error when predicate throws and continueOnError is false', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async (x: number) => {
			if (x === 3) throw new Error('Test error');
			return x % 2 === 0;
		};

		await expect(asyncFilter(input, predicate)).rejects.toThrow('Test error');
	});

	test('should exclude element when predicate throws and continueOnError is true', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async (x: number) => {
			if (x === 3) throw new Error('Test error');
			return x % 2 === 0;
		};

		const result = await asyncFilter(input, predicate, { continueOnError: true });
		expect(result).toEqual([2, 4]); // 3 is excluded due to error
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

	test('should process all items at once when concurrency exceeds array length', async () => {
		const input = [1, 2, 3, 4];
		let running = 0;
		let maxRunning = 0;

		const predicate = async (x: number) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x % 2 === 0;
		};

		const result = await asyncFilter(input, predicate, { concurrency: 10 });
		expect(result).toEqual([2, 4]);
		expect(maxRunning).toBe(4); // All items processed concurrently
	});

	test('should process all items at once when concurrency is Infinity', async () => {
		const input = [1, 2, 3, 4, 5, 6];
		let running = 0;
		let maxRunning = 0;

		const predicate = async (x: number) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x > 3;
		};

		const result = await asyncFilter(input, predicate);
		expect(result).toEqual([4, 5, 6]);
		expect(maxRunning).toBe(6); // Default unlimited concurrency
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
			{ id: 4, active: false },
		];

		const result = await asyncFilter(input, async (item) => item.active);
		expect(result).toEqual([
			{ id: 1, active: true },
			{ id: 3, active: true },
		]);
	});

	test('should work with async API validation use case', async () => {
		const userIds = [1, 2, 3, 4, 5];

		// Simulate API call that validates user status
		const isActiveUser = async (id: number) => {
			await new Promise((resolve) => setTimeout(resolve, 5));
			// Simulate: odd IDs are active
			return id % 2 === 1;
		};

		const activeUserIds = await asyncFilter(userIds, isActiveUser, { concurrency: 2 });
		expect(activeUserIds).toEqual([1, 3, 5]);
	});

	test('should handle all false predicates', async () => {
		const input = [1, 2, 3, 4, 5];
		const result = await asyncFilter(input, async () => false);
		expect(result).toEqual([]);
	});

	test('should handle all true predicates', async () => {
		const input = [1, 2, 3, 4, 5];
		const result = await asyncFilter(input, async () => true);
		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	test('should maintain element references (not clone)', async () => {
		const obj1 = { id: 1 };
		const obj2 = { id: 2 };
		const obj3 = { id: 3 };
		const input = [obj1, obj2, obj3];

		const result = await asyncFilter(input, async (obj) => obj.id !== 2);

		expect(result).toEqual([obj1, obj3]);
		expect(result[0]).toBe(obj1); // Same reference
		expect(result[1]).toBe(obj3); // Same reference
	});

	// Edge Cases

	test('should handle single element array', async () => {
		const result = await asyncFilter([42], async (x) => x > 0);
		expect(result).toEqual([42]);

		const resultEmpty = await asyncFilter([42], async (x) => x < 0);
		expect(resultEmpty).toEqual([]);
	});

	test('should handle predicate returning truthy/falsy values (not strict boolean)', async () => {
		const input = [1, 2, 3, 4, 5];
		// Predicate returns numbers (truthy/falsy)
		const result = await asyncFilter(input, async (x) => x % 2 as any);
		// Odd numbers return 1 (truthy), even numbers return 0 (falsy)
		expect(result).toEqual([1, 3, 5]);
	});

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

	test('should handle very large arrays', async () => {
		const input = Array.from({ length: 1000 }, (_, i) => i);
		const result = await asyncFilter(input, async (x) => x % 100 === 0, { concurrency: 10 });
		expect(result).toHaveLength(10);
		expect(result).toEqual([0, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
	});

	test('should handle sequential execution with concurrency 1', async () => {
		const input = [1, 2, 3, 4, 5];
		const executionOrder: number[] = [];
		let running = 0;
		let maxRunning = 0;

		const predicate = async (x: number) => {
			running++;
			maxRunning = Math.max(maxRunning, running);
			executionOrder.push(x);
			await new Promise((resolve) => setTimeout(resolve, 10));
			running--;
			return x % 2 === 0;
		};

		const result = await asyncFilter(input, predicate, { concurrency: 1 });
		expect(result).toEqual([2, 4]);
		expect(executionOrder).toEqual([1, 2, 3, 4, 5]); // Sequential order
		expect(maxRunning).toBe(1); // Never more than 1 running
	});

	test('should handle multiple errors when continueOnError is true', async () => {
		const input = [1, 2, 3, 4, 5, 6];
		const predicate = async (x: number) => {
			if (x === 2 || x === 4 || x === 6) throw new Error('Test error');
			return x % 2 === 1;
		};

		const result = await asyncFilter(input, predicate, { continueOnError: true });
		expect(result).toEqual([1, 3, 5]); // 2, 4, 6 excluded due to errors
	});

	test('should handle all items throwing errors with continueOnError true', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async () => {
			throw new Error('Always fails');
		};

		const result = await asyncFilter(input, predicate, { continueOnError: true });
		expect(result).toEqual([]); // All excluded due to errors
	});

	test('should handle all items throwing errors with continueOnError true and concurrency limit', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async () => {
			await new Promise((resolve) => setTimeout(resolve, 5));
			throw new Error('Always fails');
		};

		const result = await asyncFilter(input, predicate, { continueOnError: true, concurrency: 2 });
		expect(result).toEqual([]); // All excluded due to errors
	});

	test('should handle predicate with varying async behavior', async () => {
		const input = [1, 2, 3, 4, 5];
		let callCount = 0;

		const predicate = async (x: number) => {
			callCount++;
			// Some calls are immediate, some are delayed
			if (callCount % 2 === 0) {
				await new Promise((resolve) => setTimeout(resolve, 20));
			}
			return x > 2;
		};

		const result = await asyncFilter(input, predicate);
		expect(result).toEqual([3, 4, 5]);
	});

	test('should handle predicate that returns immediately (no await)', async () => {
		const input = [1, 2, 3, 4, 5];
		// This predicate returns a Promise that resolves immediately
		const result = await asyncFilter(input, async (x) => x % 2 === 0);
		expect(result).toEqual([2, 4]);
	});

	test('should not be affected by predicate modifying external state', async () => {
		const input = [1, 2, 3, 4, 5];
		const results: number[] = [];

		const predicate = async (x: number) => {
			results.push(x * 2);
			return x > 2;
		};

		const filtered = await asyncFilter(input, predicate);
		expect(filtered).toEqual([3, 4, 5]);
		expect(results.sort((a, b) => a - b)).toEqual([2, 4, 6, 8, 10]);
	});

	test('should handle arrays with symbols', async () => {
		const sym1 = Symbol('test1');
		const sym2 = Symbol('test2');
		const sym3 = Symbol('test3');
		const input = [sym1, sym2, sym3];

		const result = await asyncFilter(input, async (s) => s !== sym2);
		expect(result).toEqual([sym1, sym3]);
	});

	test('should handle arrays with functions', async () => {
		const fn1 = () => 1;
		const fn2 = () => 2;
		const fn3 = () => 3;
		const input = [fn1, fn2, fn3];

		const result = await asyncFilter(input, async (fn) => fn() > 1);
		expect(result).toEqual([fn2, fn3]);
	});

	test('should handle arrays with mixed types', async () => {
		const input: any[] = [1, 'string', true, null, undefined, { key: 'value' }, [1, 2, 3]];
		const result = await asyncFilter(input, async (x) => typeof x === 'string' || typeof x === 'number');
		expect(result).toEqual([1, 'string']);
	});

	test('should handle predicate that throws non-Error objects', async () => {
		const input = [1, 2, 3];
		const predicate = async (x: number) => {
			if (x === 2) throw 'String error';
			return true;
		};

		await expect(asyncFilter(input, predicate)).rejects.toBe('String error');
	});

	test('should handle predicate that throws non-Error objects with continueOnError', async () => {
		const input = [1, 2, 3];
		const predicate = async (x: number) => {
			if (x === 2) throw 'String error';
			return true;
		};

		const result = await asyncFilter(input, predicate, { continueOnError: true });
		expect(result).toEqual([1, 3]);
	});

	test('should handle arrays with Date objects', async () => {
		const date1 = new Date('2020-01-01');
		const date2 = new Date('2021-01-01');
		const date3 = new Date('2022-01-01');
		const input = [date1, date2, date3];

		const result = await asyncFilter(input, async (d) => d.getFullYear() > 2020);
		expect(result).toEqual([date2, date3]);
	});

	test('should handle arrays with RegExp objects', async () => {
		const regex1 = /test1/;
		const regex2 = /test2/i;
		const regex3 = /test3/g;
		const input = [regex1, regex2, regex3];

		const result = await asyncFilter(input, async (r) => r.flags.includes('i'));
		expect(result).toEqual([regex2]);
	});

	test('should handle nested objects in arrays', async () => {
		const input = [
			{ user: { id: 1, active: true } },
			{ user: { id: 2, active: false } },
			{ user: { id: 3, active: true } },
		];

		const result = await asyncFilter(input, async (item) => item.user.active);
		expect(result).toEqual([
			{ user: { id: 1, active: true } },
			{ user: { id: 3, active: true } },
		]);
	});

	test('should handle predicate that has side effects on the element', async () => {
		// This tests that the array elements aren't cloned - mutations should persist
		const input = [{ id: 1, touched: false }, { id: 2, touched: false }, { id: 3, touched: false }];

		await asyncFilter(input, async (item) => {
			item.touched = true;
			return item.id > 1;
		});

		// All elements should be touched even though some were filtered out
		expect(input.every((item) => item.touched)).toBe(true);
	});

	test('should handle concurrent operations without race conditions', async () => {
		const input = Array.from({ length: 100 }, (_, i) => i);
		const processedIndices: number[] = [];

		const predicate = async (x: number) => {
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 5));
			processedIndices.push(x);
			return x % 2 === 0;
		};

		const result = await asyncFilter(input, predicate, { concurrency: 10 });
		expect(result).toHaveLength(50);
		expect(processedIndices).toHaveLength(100); // All items processed
		// Result should be in order despite concurrent processing
		expect(result).toEqual(Array.from({ length: 50 }, (_, i) => i * 2));
	});

	test('should handle arrays with undefined and null explicitly', async () => {
		const input = [undefined, null, undefined, null, 1, 2];
		const result = await asyncFilter(input, async (x) => x !== undefined);
		expect(result).toEqual([null, null, 1, 2]);
	});

	test('should handle predicate that returns a resolved promise', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = (x: number) => Promise.resolve(x > 2);

		const result = await asyncFilter(input, predicate);
		expect(result).toEqual([3, 4, 5]);
	});

	test('should handle predicate that returns a rejected promise', async () => {
		const input = [1, 2, 3];
		const predicate = (x: number) => {
			if (x === 2) return Promise.reject(new Error('Rejected'));
			return Promise.resolve(true);
		};

		await expect(asyncFilter(input, predicate)).rejects.toThrow('Rejected');
	});

	test('should handle empty array with concurrency limit', async () => {
		const result = await asyncFilter([], async (x) => x > 0, { concurrency: 5 });
		expect(result).toEqual([]);
	});

	test('should handle single element with concurrency limit', async () => {
		const result = await asyncFilter([42], async (x) => x > 0, { concurrency: 5 });
		expect(result).toEqual([42]);
	});

	test('should handle NaN values', async () => {
		const input = [1, NaN, 3, NaN, 5];
		const result = await asyncFilter(input, async (x) => !Number.isNaN(x));
		expect(result).toEqual([1, 3, 5]);
	});

	test('should handle Infinity and -Infinity', async () => {
		const input = [1, Infinity, 3, -Infinity, 5];
		const result = await asyncFilter(input, async (x) => Number.isFinite(x));
		expect(result).toEqual([1, 3, 5]);
	});

	test('should handle BigInt values', async () => {
		const input = [1n, 2n, 3n, 4n, 5n];
		const result = await asyncFilter(input, async (x) => x % 2n === 0n);
		expect(result).toEqual([2n, 4n]);
	});

	test('should handle arrays after mutation during filtering', async () => {
		const input = [1, 2, 3, 4, 5];
		const originalInput = [...input];

		await asyncFilter(input, async (x, index, arr) => {
			// Verify array reference is the original array
			expect(arr).toBe(input);
			return x > 2;
		});

		// Original array should not be mutated
		expect(input).toEqual(originalInput);
	});

	test('should handle predicate that awaits multiple promises', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async (x: number) => {
			await new Promise((resolve) => setTimeout(resolve, 5));
			await new Promise((resolve) => setTimeout(resolve, 5));
			return x % 2 === 0;
		};

		const result = await asyncFilter(input, predicate);
		expect(result).toEqual([2, 4]);
	});

	test('should handle zero-timeout promises', async () => {
		const input = [1, 2, 3, 4, 5];
		const predicate = async (x: number) => {
			await new Promise((resolve) => setTimeout(resolve, 0));
			return x > 2;
		};

		const result = await asyncFilter(input, predicate);
		expect(result).toEqual([3, 4, 5]);
	});
});
