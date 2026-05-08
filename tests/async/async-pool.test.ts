import { describe, expect, it } from 'bun:test';
import { runAsyncPool } from '../../src/async/utils/async-pool.js';

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

	it('stops picking up new items after first error', async () => {
		let processed = 0;

		await expect(
			runAsyncPool(10, 2, async (index) => {
				processed++;
				if (index === 2) throw new Error('fail');
				await delay(5);
			}),
		).rejects.toThrow('fail');

		expect(processed).toBeLessThan(10);
	});

	it('continues past errors when onError is provided', async () => {
		const errors: Array<{ index: number; error: unknown }> = [];
		let processed = 0;

		await runAsyncPool(5, 2, async (index) => {
			processed++;
			if (index % 2 === 0) throw new Error(`fail at ${index}`);
		}, {
			onError: (error, index) => {
				errors.push({ index, error });
			},
		});

		expect(processed).toBe(5);
		expect(errors).toHaveLength(3);
	});

	it('rejects immediately with already-aborted signal', async () => {
		const controller = new AbortController();
		controller.abort();

		await expect(
			runAsyncPool(5, 2, async () => {}, { signal: controller.signal }),
		).rejects.toThrow();
	});

	it('rejects when signal aborts mid-processing', async () => {
		const controller = new AbortController();
		let processed = 0;

		const promise = runAsyncPool(10, 2, async (index) => {
			processed++;
			if (index === 3) {
				controller.abort();
			}
			await delay(20);
		}, { signal: controller.signal });

		await expect(promise).rejects.toThrow();
		expect(processed).toBeLessThan(10);
	});

	it('stops signal-aborted workers from picking up new items', async () => {
		const controller = new AbortController();
		let started = 0;
		let finished = 0;

		const promise = runAsyncPool(20, 2, async () => {
			started++;
			await delay(10);
			finished++;
			if (started === 4) {
				controller.abort();
			}
		}, { signal: controller.signal });

		await expect(promise).rejects.toThrow();
		expect(started).toBeLessThan(20);
		expect(finished).toBeLessThanOrEqual(started);
	});

	it('should handle non-Error thrown values', async () => {
		let error: unknown;
		try {
			await runAsyncPool(3, 2, async (index) => {
				if (index === 1) throw 'string error';
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toBe('Item processing failed');
		expect((error as any).cause).toBe('string error');
	});

	it('should handle onError callback that throws', async () => {
		let onErrorCallCount = 0;
		let processedCount = 0;

		await expect(
			runAsyncPool(5, 2, async (index) => {
				processedCount++;
				if (index === 1) throw new Error('item error');
				await delay(5);
			}, {
				onError: () => {
					onErrorCallCount++;
					throw new Error('onError crash');
				},
			}),
		).rejects.toThrow('onError crash');

		// onError should have been called at least once before crashing
		expect(onErrorCallCount).toBeGreaterThanOrEqual(1);
	});

	it('should handle NaN concurrency by creating zero workers', async () => {
		// The pool itself doesn't validate concurrency (callers do).
		// NaN concurrency results in 0 workers, so no items are processed.
		let called = false;
		await runAsyncPool(5, Number.NaN, async () => {
			called = true;
		});
		expect(called).toBe(false);
	});

	it('should handle signal abort with reason string', async () => {
		const controller = new AbortController();
		controller.abort('timeout');

		let error: unknown;
		try {
			await runAsyncPool(5, 2, async () => {}, { signal: controller.signal });
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).name).toBe('AbortError');
	});

	it('should handle signal abort with reason as Error', async () => {
		const controller = new AbortController();
		controller.abort(new Error('custom abort'));

		let error: unknown;
		try {
			await runAsyncPool(5, 2, async () => {}, { signal: controller.signal });
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).name).toBe('AbortError');
	});

	it('should handle DOMException from abort() without args', async () => {
		// Bun creates a DOMException (read-only .name/.code) for abort() with no args
		const controller = new AbortController();
		controller.abort();

		let error: unknown;
		try {
			await runAsyncPool(5, 2, async () => {
				await delay(5);
			}, { signal: controller.signal });
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(Error);
		expect((error as Error).name).toBe('AbortError');
		expect((error as any).code).toBe(20);
	});

	it('should preserve signal.reason when items also error with onError', async () => {
		const controller = new AbortController();
		const errors: Array<{ index: number; error: unknown }> = [];
		let processed = 0;

		const promise = runAsyncPool(10, 2, async (index) => {
			processed++;
			if (index === 1) {
				controller.abort('aborted!');
			}
			await delay(10);
			if (index === 3) throw new Error('item error');
		}, {
			signal: controller.signal,
			onError: (error, idx) => {
				errors.push({ index: idx, error });
			},
		});

		await expect(promise).rejects.toThrow();
	});
});