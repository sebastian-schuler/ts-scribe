import { jest, describe, it, expect } from 'bun:test';
import { asyncForEach } from '../../src/async/index.js';

describe('asyncForEach', () => {
	it('should process all elements simultaneously', async () => {
		const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		const start = Date.now();
		const mockCallback = jest.fn(async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
		});

		await asyncForEach(items, mockCallback);

		const duration = Date.now() - start;
		expect(duration).toBeLessThan(1500); // Should take slightly more than 1000ms
		expect(mockCallback).toHaveBeenCalledTimes(items.length);
	});

	it('should process correct amount of elements simultaneously with a limit', async () => {
		const items = [1, 2, 3, 4, 5];
		const start = Date.now();
		const mockCallback = jest.fn(async () => {
			await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
		});

		await asyncForEach(items, mockCallback, 3);

		const duration = Date.now() - start;
		expect(duration).toBeLessThan(2500); // Should take slightly more than 2000ms
		expect(mockCallback).toHaveBeenCalledTimes(items.length);
	});

	it('should call the callback with correct arguments', async () => {
		const items = [1, 2, 3];
		const mockCallback = jest.fn(async () => {
			// Simulate async operation
			await new Promise((resolve) => setTimeout(resolve, 10));
		});

		await asyncForEach(items, mockCallback);

		for (const [index, item] of items.entries()) {
			expect(mockCallback).toHaveBeenCalledWith(item, index, items);
		}
	});

	it('should handle an empty array', async () => {
		const items: number[] = [];
		const mockCallback = jest.fn(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
		});

		await asyncForEach(items, mockCallback);

		expect(mockCallback).not.toHaveBeenCalled();
	});

	it('should handle a single element array', async () => {
		const items = [42];
		const mockCallback = jest.fn(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
		});

		await asyncForEach(items, mockCallback);

		expect(mockCallback).toHaveBeenCalledTimes(1);
		expect(mockCallback).toHaveBeenCalledWith(42, 0, items);
	});

	it('should propagate errors thrown in the callback', async () => {
		const items = [1, 2, 3];
		const error = new Error('Test error');
		const mockCallback = jest.fn(async (item: number) => {
			if (item === 2) {
				throw error;
			}

			await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
		});

		expect(asyncForEach(items, mockCallback)).rejects.toThrow(error);
	});

	it('should respect concurrency limit of 1 (sequential execution)', async () => {
		const items = [1, 2, 3, 4, 5];
		let concurrent = 0;
		let maxConcurrent = 0;
		const mockCallback = jest.fn(async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 50));
			concurrent--;
		});

		await asyncForEach(items, mockCallback, 1);

		expect(mockCallback).toHaveBeenCalledTimes(items.length);
		expect(maxConcurrent).toBe(1);
	});

	it('should respect concurrency limit of 2', async () => {
		const items = [1, 2, 3, 4, 5];
		let concurrent = 0;
		let maxConcurrent = 0;
		const mockCallback = jest.fn(async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 50));
			concurrent--;
		});

		await asyncForEach(items, mockCallback, 2);

		expect(mockCallback).toHaveBeenCalledTimes(items.length);
		expect(maxConcurrent).toBe(2);
	});

	it('should process all items even with a concurrency limit larger than array size', async () => {
		const items = [1, 2, 3];
		const mockCallback = jest.fn(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10));
		});

		await asyncForEach(items, mockCallback, 100);

		expect(mockCallback).toHaveBeenCalledTimes(items.length);
	});

	it('should handle errors in sequential mode (limit=1)', async () => {
		const items = [1, 2, 3];
		const error = new Error('Sequential error');
		const mockCallback = jest.fn(async (item: number) => {
			if (item === 2) {
				throw error;
			}
		});

		await expect(asyncForEach(items, mockCallback, 1)).rejects.toThrow(error);
		expect(mockCallback).toHaveBeenCalledTimes(2); // Called for 1 and 2
	});

	it('should handle errors with limit concurrency', async () => {
		const items = [1, 2, 3, 4, 5];
		const error = new Error('Concurrent error');
		let callCount = 0;
		const mockCallback = jest.fn(async (item: number) => {
			callCount++;
			await new Promise((resolve) => setTimeout(resolve, 20));
			if (item === 3) {
				throw error;
			}
		});

		await expect(asyncForEach(items, mockCallback, 2)).rejects.toThrow(error);
		// With concurrency limit, items 1, 2, 3 start immediately or soon after
		// Most items should be called before error throws
		expect(callCount).toBeGreaterThanOrEqual(3);
	});

	it('should throw when array is null or undefined', async () => {
		const mockCallback = jest.fn();

		// @ts-expect-error - Testing invalid input
		await expect(asyncForEach(null, mockCallback)).rejects.toThrow('Input array must not be null or undefined');

		// @ts-expect-error - Testing invalid input
		await expect(asyncForEach(undefined, mockCallback)).rejects.toThrow('Input array must not be null or undefined');
	});

	it('should work with different data types', async () => {
		const items = [
			{ id: 1, name: 'Alice' },
			{ id: 2, name: 'Bob' },
			{ id: 3, name: 'Charlie' },
		];
		const mockCallback = jest.fn(async (item: any) => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			expect(item.id).toBeDefined();
			expect(item.name).toBeDefined();
		});

		await asyncForEach(items, mockCallback);

		expect(mockCallback).toHaveBeenCalledTimes(items.length);
	});

	it('should preserve array order in callbacks', async () => {
		const items = [10, 20, 30, 40, 50];
		const callOrder: number[] = [];
		const mockCallback = jest.fn(async (item: number) => {
			callOrder.push(item);
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));
		});

		await asyncForEach(items, mockCallback, 2);

		// Items should be processed in order they appear in the array
		expect(mockCallback.mock.calls.map(call => call[0])).toEqual(items);
	});

	it('should handle array with varying async completion times', async () => {
		const items = [1, 2, 3, 4];
		const delays = [100, 10, 50, 30];
		const mockCallback = jest.fn(async (item: number, index: number) => {
			await new Promise((resolve) => setTimeout(resolve, delays[index]));
		});

		const start = Date.now();
		await asyncForEach(items, mockCallback, 2);
		const duration = Date.now() - start;

		// With limit 2: [100, 10] in parallel (100ms), then [50, 30] in parallel (50ms) = ~150ms
		expect(duration).toBeLessThan(250);
		expect(mockCallback).toHaveBeenCalledTimes(items.length);
	});

	it('should handle large arrays', async () => {
		const items = Array.from({ length: 1000 }, (_, i) => i);
		let processCount = 0;
		const mockCallback = jest.fn(async () => {
			processCount++;
			await new Promise((resolve) => setTimeout(resolve, 1));
		});

		await asyncForEach(items, mockCallback, 10);

		expect(mockCallback).toHaveBeenCalledTimes(1000);
		expect(processCount).toBe(1000);
	});

	it('should use array length as default limit when limit is not provided', async () => {
		const items = [1, 2, 3, 4, 5];
		let concurrent = 0;
		let maxConcurrent = 0;
		const mockCallback = jest.fn(async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise((resolve) => setTimeout(resolve, 50));
			concurrent--;
		});

		await asyncForEach(items, mockCallback);

		// Without limit, all should run concurrently
		expect(maxConcurrent).toBe(5);
	});

	it('should work with zero values and falsy elements', async () => {
		const items = [0, false, '', null, undefined, {}];
		const mockCallback = jest.fn(async (item: any) => {
			await new Promise((resolve) => setTimeout(resolve, 5));
		});

		await asyncForEach(items, mockCallback);

		expect(mockCallback).toHaveBeenCalledTimes(6);
		expect(mockCallback).toHaveBeenCalledWith(0, 0, items);
		expect(mockCallback).toHaveBeenCalledWith(false, 1, items);
		expect(mockCallback).toHaveBeenCalledWith('', 2, items);
		expect(mockCallback).toHaveBeenCalledWith(null, 3, items);
		expect(mockCallback).toHaveBeenCalledWith(undefined, 4, items);
	});

	it('should handle callback that modifies external state', async () => {
		const items = [1, 2, 3, 4, 5];
		const results: number[] = [];
		const mockCallback = jest.fn(async (item: number) => {
			await new Promise((resolve) => setTimeout(resolve, 10));
			results.push(item * 2);
		});

		await asyncForEach(items, mockCallback, 2);

		expect(results).toContain(2);
		expect(results).toContain(4);
		expect(results).toContain(6);
		expect(results).toContain(8);
		expect(results).toContain(10);
		expect(results.length).toBe(5);
	});

	it('should process items sequentially with limit=1 before first error', async () => {
		const items = [1, 2, 3, 4, 5];
		const processedItems: number[] = [];
		const error = new Error('Stop at 3');
		const mockCallback = jest.fn(async (item: number) => {
			processedItems.push(item);
			if (item === 3) {
				throw error;
			}
			await new Promise((resolve) => setTimeout(resolve, 10));
		});

		await expect(asyncForEach(items, mockCallback, 1)).rejects.toThrow(error);

		// With limit=1, items 1, 2, 3 are processed sequentially, error on 3
		expect(processedItems.slice(0, 3)).toEqual([1, 2, 3]);
	});
});
