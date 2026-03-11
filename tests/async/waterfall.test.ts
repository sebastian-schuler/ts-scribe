import { describe, expect, test } from 'bun:test';
import type { Task } from '../../src/async/waterfall.js';
import { waterfall } from '../../src/async/index.js';

const delay = <T>(value: T, ms: number): Promise<T> =>
	new Promise((resolve) => { setTimeout(() => { resolve(value); }, ms); });

describe('waterfall', () => {
	// ── Basic behaviour ───────────────────────────────────────────────────────

	test('should run tasks in series and return the last result', async () => {
		const task1: Task<number> = () => delay(1, 10);
		const task2: Task<number> = () => delay(2, 10);
		const task3: Task<number> = () => delay(3, 10);

		const result = await waterfall<number>([task1, task2, task3]);
		expect(result).toBe(3);
	});

	test('should throw when given an empty array of tasks', async () => {
		await expect(waterfall<number>([])).rejects.toThrow('waterfall requires at least one task');
	});

	test('should handle a single task', async () => {
		const result = await waterfall<string>([() => delay('single', 10)]);
		expect(result).toBe('single');
	});

	test('should handle synchronous (immediately resolving) tasks', async () => {
		const task1: Task<number> = () => Promise.resolve(42);
		const task2: Task<number> = () => Promise.resolve(100);

		const result = await waterfall<number>([task1, task2]);
		expect(result).toBe(100);
	});

	// ── Result types ──────────────────────────────────────────────────────────

	test('should handle tasks with string results', async () => {
		const task1: Task<string> = () => delay('first', 10);
		const task2: Task<string> = () => delay('second', 10);

		expect(await waterfall<string>([task1, task2])).toBe('second');
	});

	test('should handle task resolving with undefined', async () => {
		const result = await waterfall<undefined>([() => Promise.resolve(undefined)]);
		expect(result).toBeUndefined();
	});

	test('should handle task resolving with null', async () => {
		const result = await waterfall<null>([() => Promise.resolve(null)]);
		expect(result).toBeNull();
	});

	test('should handle task resolving with 0 (falsy number)', async () => {
		const task1: Task<number> = () => Promise.resolve(99);
		const task2: Task<number> = () => Promise.resolve(0);

		expect(await waterfall<number>([task1, task2])).toBe(0);
	});

	test('should handle task resolving with false (falsy boolean)', async () => {
		const task1: Task<boolean> = () => Promise.resolve(true);
		const task2: Task<boolean> = () => Promise.resolve(false);

		expect(await waterfall<boolean>([task1, task2])).toBe(false);
	});

	test('should handle task resolving with empty string (falsy string)', async () => {
		const task1: Task<string> = () => Promise.resolve('hello');
		const task2: Task<string> = () => Promise.resolve('');

		expect(await waterfall<string>([task1, task2])).toBe('');
	});

	test('should handle task resolving with an object', async () => {
		const expected = { a: 1, b: [2, 3] };
		const result = await waterfall<typeof expected>([() => Promise.resolve(expected)]);
		expect(result).toEqual(expected);
	});

	// ── Ordering & sequentiality ──────────────────────────────────────────────

	test('should execute tasks in correct order regardless of delay', async () => {
		const order: number[] = [];

		const task1: Task<number> = async () => { await delay(1, 30); order.push(1); return 1; };
		const task2: Task<number> = async () => { await delay(2, 10); order.push(2); return 2; };
		const task3: Task<number> = async () => { await delay(3, 20); order.push(3); return 3; };

		await waterfall<number>([task1, task2, task3]);
		expect(order).toEqual([1, 2, 3]);
	});

	test('tasks should not overlap — task N+1 starts only after task N finishes', async () => {
		const active: number[] = [];
		let maxConcurrent = 0;

		const makeTask = (id: number, ms: number): Task<number> => async () => {
			active.push(id);
			maxConcurrent = Math.max(maxConcurrent, active.length);
			await delay(id, ms);
			active.splice(active.indexOf(id), 1);
			return id;
		};

		await waterfall<number>([makeTask(1, 30), makeTask(2, 10), makeTask(3, 20)]);
		expect(maxConcurrent).toBe(1);
	});

	test('should handle a large number of tasks sequentially', async () => {
		const taskCount = 200;
		const tasks: Array<Task<number>> = Array.from({ length: taskCount }, (_, i) => () => Promise.resolve(i));

		const result = await waterfall<number>(tasks);
		expect(result).toBe(taskCount - 1);
	});

	// ── Error handling ────────────────────────────────────────────────────────

	test('should reject when the first task rejects and not run subsequent tasks', async () => {
		let subsequentRan = false;

		const task1: Task<number> = () => Promise.reject(new Error('First error'));
		const task2: Task<number> = () => { subsequentRan = true; return Promise.resolve(2); };

		await expect(waterfall<number>([task1, task2])).rejects.toThrow('First error');
		expect(subsequentRan).toBe(false);
	});

	test('should reject when a middle task rejects and not run subsequent tasks', async () => {
		let task3Executed = false;

		const task1: Task<number> = () => Promise.resolve(1);
		const task2: Task<number> = () => Promise.reject(new Error('Middle error'));
		const task3: Task<number> = () => { task3Executed = true; return Promise.resolve(3); };

		await expect(waterfall<number>([task1, task2, task3])).rejects.toThrow('Middle error');
		expect(task3Executed).toBe(false);
	});

	test('should reject when the last task rejects', async () => {
		const task1: Task<number> = () => Promise.resolve(1);
		const task2: Task<number> = () => Promise.reject(new Error('Last error'));

		await expect(waterfall<number>([task1, task2])).rejects.toThrow('Last error');
	});

	test('should propagate a synchronous throw from a task', async () => {
		const task1: Task<number> = () => Promise.resolve(1);
		const task2: Task<number> = async () => { throw new Error('Sync throw'); };

		await expect(waterfall<number>([task1, task2])).rejects.toThrow('Sync throw');
	});

	test('should propagate rejection with a non-Error value', async () => {
		// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
		const task: Task<number> = () => Promise.reject('string rejection');

		await expect(waterfall<number>([task])).rejects.toBe('string rejection');
	});
});