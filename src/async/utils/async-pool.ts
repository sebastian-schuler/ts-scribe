import { createAbortError } from './abort-error.js';

/**
 * Options for {@link runAsyncPool}.
 *
 * @internal
 */
export type RunAsyncPoolOptions = {
	/**
	 * An AbortSignal to cancel in-flight processing. When the signal aborts, workers
	 * stop picking up new items and the returned promise rejects with an `AbortError`.
	 */
	signal?: AbortSignal;

	/**
	 * Called when an item's `processItem` callback throws. When provided, the pool
	 * does NOT abort sibling workers — the caller is expected to handle the error.
	 * When not provided, the first error sets a shared flag so other workers stop
	 * picking up new items, and the error is re-thrown after all workers drain.
	 *
	 * @param error - The error thrown by `processItem`.
	 * @param index - The array index of the item that failed.
	 */
	onError?: (error: unknown, index: number) => void;
};

/**
 * Shared concurrency-limited async worker pool used internally by
 * {@link asyncFilter}, {@link asyncMap}, and {@link asyncForEach}.
 *
 * Spawns up to `concurrency` workers that pull the next index from a shared
 * counter, calling `processItem(index)` for each one. Resolves when every
 * item has been processed, or rejects on the first unhandled error / abort.
 *
 * @param itemCount   - Total number of items to process.
 * @param concurrency - Maximum number of items to process concurrently.
 * @param processItem - Async callback invoked with the array index of each item.
 * @param options     - Optional configuration (signal, onError).
 *
 * @internal
 */
export async function runAsyncPool(
	itemCount: number,
	concurrency: number,
	processItem: (index: number) => Promise<void>,
	options: RunAsyncPoolOptions = {},
): Promise<void> {
	const { signal, onError } = options;

	// Already-aborted signal — reject immediately
	if (signal?.aborted) {
		throw createAbortError(signal.reason);
	}

	if (itemCount === 0) {
		return;
	}

	let nextIndex = 0;
	let aborted = false;
	let firstError: unknown;

	const workerCount = Math.min(concurrency, itemCount);

	async function worker(): Promise<void> {
		while (true) {
			// Check abort signal before picking up each new item
			if (signal?.aborted) {
				aborted = true;
				firstError = signal.reason;
				return;
			}

			if (aborted) {
				return;
			}

			const index = nextIndex++;

			if (index >= itemCount) {
				return;
			}

			try {
				// eslint-disable-next-line no-await-in-loop
				await processItem(index);
			} catch (error: unknown) {
				if (onError) {
					// Caller handles the error — don't abort sibling workers
					try {
						onError(error, index);
					} catch (onErrorError: unknown) {
						// If the onError callback itself throws, fail fast to prevent
						// silent worker death and concurrency degradation
						aborted = true;
						firstError = onErrorError;
						return;
					}
				} else {
					// Fail-fast: record the first error and stop accepting new work
					aborted = true;
					firstError = error;
					return;
				}
			}
		}
	}

	const workers = Array.from({ length: workerCount }, async () => worker());

	// Use allSettled so no rejections escape — we handle errors explicitly
	await Promise.allSettled(workers);

	if (signal?.aborted) {
		throw createAbortError(firstError ?? signal.reason);
	}

	if (firstError !== undefined) {
		throw firstError instanceof Error ? firstError : new Error('Item processing failed', { cause: firstError });
	}
}
