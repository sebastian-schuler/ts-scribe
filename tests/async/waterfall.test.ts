import { describe, expect, test } from 'bun:test';
import type { Task } from '../../src/async/waterfall.js';
import { waterfall } from '../../src/async/index.js';

describe('waterfall', () => {
	test('should run tasks in series and return the last result', async () => {
		const task1: Task<number> = (callback) => {
			setTimeout(() => {
				callback(undefined, 1);
			}, 10);
		};

		const task2: Task<number> = (callback) => {
			setTimeout(() => {
				callback(undefined, 2);
			}, 10);
		};

		const task3: Task<number> = (callback) => {
			setTimeout(() => {
				callback(undefined, 3);
			}, 10);
		};

		const result = await waterfall<number>([task1, task2, task3]);
		expect(result).toBe(3);
	});

	test('should stop execution if a task encounters an error', async () => {
		const task1: Task<number> = (callback) => {
			setTimeout(() => {
				callback(undefined, 1);
			}, 10);
		};

		const task2: Task<number> = (callback) => {
			setTimeout(() => {
				callback(new Error('Task 2 error'));
			}, 10);
		};

		const task3: Task<number> = (callback) => {
			setTimeout(() => {
				callback(undefined, 3);
			}, 10);
		};

		await expect(waterfall<number>([task1, task2, task3])).rejects.toThrow('Task 2 error');
	});

	test('should handle an empty array of tasks', async () => {
		const result = await waterfall<number>([]);
		expect(result).toBeUndefined();
	});

	test('should handle tasks with different result types', async () => {
		const task1: Task<string> = (callback) => {
			setTimeout(() => {
				callback(undefined, 'first');
			}, 10);
		};

		const task2: Task<string> = (callback) => {
			setTimeout(() => {
				callback(undefined, 'second');
			}, 10);
		};

		const result = await waterfall<string>([task1, task2]);
		expect(result).toBe('second');
	});

	test('should handle synchronous callback execution', async () => {
		const task1: Task<number> = (callback) => {
			callback(undefined, 42);
		};

		const task2: Task<number> = (callback) => {
			callback(undefined, 100);
		};

		const result = await waterfall<number>([task1, task2]);
		expect(result).toBe(100);
	});

	test('should handle a single task', async () => {
		const task: Task<string> = (callback) => {
			setTimeout(() => {
				callback(undefined, 'single');
			}, 10);
		};

		const result = await waterfall<string>([task]);
		expect(result).toBe('single');
	});

	test('should execute tasks in correct order', async () => {
		const order: number[] = [];
		
		const task1: Task<number> = (callback) => {
			setTimeout(() => {
				order.push(1);
				callback(undefined, 1);
			}, 30);
		};

		const task2: Task<number> = (callback) => {
			setTimeout(() => {
				order.push(2);
				callback(undefined, 2);
			}, 10);
		};

		const task3: Task<number> = (callback) => {
			setTimeout(() => {
				order.push(3);
				callback(undefined, 3);
			}, 20);
		};

		await waterfall<number>([task1, task2, task3]);
		expect(order).toEqual([1, 2, 3]);
	});

	test('should handle task with undefined result', async () => {
		const task: Task<undefined> = (callback) => {
			callback(undefined, undefined);
		};

		const result = await waterfall<undefined>([task]);
		expect(result).toBeUndefined();
	});

	test('should reject on first error and not execute subsequent tasks', async () => {
		let task3Executed = false;

		const task1: Task<number> = (callback) => {
			callback(undefined, 1);
		};

		const task2: Task<number> = (callback) => {
			callback(new Error('Early error'));
		};

		const task3: Task<number> = (callback) => {
			task3Executed = true;
			callback(undefined, 3);
		};

		await expect(waterfall<number>([task1, task2, task3])).rejects.toThrow('Early error');
		expect(task3Executed).toBe(false);
	});
});