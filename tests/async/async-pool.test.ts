import { describe, expect, it } from 'bun:test';
import { runAsyncPool } from '../../src/async/async-pool.js';

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('runAsyncPool', () => {
	it('processes every index exactly once', async () => {
		const seen: number[] = [];

		await runAsyncPool(10, 3, async (index) => {
			seen.push(index);
		});

		expect(seen.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	});

	it('never exceeds the concurrency limit', async () => {
		let active = 0;
		let maxActive = 0;

		await runAsyncPool(20, 4, async () => {
			active++;
			maxActive = Math.max(maxActive, active);
			await delay(5);
			active--;
		});

		expect(maxActive).toBeLessThanOrEqual(4);
	});

	it('processes sequentially when concurrency is 1', async () => {
		const order: number[] = [];

		await runAsyncPool(5, 1, async (index) => {
			order.push(index);
		});

		expect(order).toEqual([0, 1, 2, 3, 4]);
	});

	it('handles zero items without calling processItem', async () => {
		let called = false;

		await runAsyncPool(0, 3, async () => {
			called = true;
		});

		expect(called).toBe(false);
	});

	it('propagates errors from processItem', async () => {
		let reached = false;

		const promise = runAsyncPool(5, 2, async (index) => {
			if (index === 3) throw new Error('fail');
			await delay(5);
			reached = true;
		});

		await expect(promise).rejects.toThrow('fail');
	});

	it('handles concurrency larger than item count', async () => {
		let maxActive = 0;
		let active = 0;

		await runAsyncPool(3, 100, async () => {
			active++;
			maxActive = Math.max(maxActive, active);
			await delay(5);
			active--;
		});

		expect(maxActive).toBe(3);
	});
});
