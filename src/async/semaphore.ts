/**
 * Thank you to the author of the original code.
 * Github: https://github.com/Shakeskeyboarde
 */

/**
 * A lock returned by {@link Semaphore.acquire}. Call {@link SemaphoreLock.release} to free the slot
 * and allow the next waiting operation to proceed.
 */
export class SemaphoreLock {
	#released = false;
	readonly #onRelease: () => void;

	/**
	 * Creates a new lock instance.
	 * @param onRelease A callback invoked once when the lock is released.
	 */
	constructor(onRelease: () => void) {
		this.#onRelease = onRelease;
		this.release = this.release.bind(this);
	}

	/**
	 * Releases the lock and allows the next waiting operation to proceed.
	 * Subsequent calls are no-ops; the lock can only be released once.
	 */
	release(): void {
		if (this.#released) return;

		this.#released = true;
		this.#onRelease();
	}
}

/**
 * A concurrency control mechanism that limits the number of asynchronous tasks accessing
 * a shared resource simultaneously.
 *
 * Use {@link Semaphore.acquire} to obtain a {@link SemaphoreLock} before starting a task, then call
 * `lock.release()` when the task finishes to free the slot for the next waiting operation.
 *
 * The {@link Semaphore.available} and {@link Semaphore.waiting} getters expose the current
 * state, and {@link Semaphore.size} returns the configured concurrency limit.
 *
 * @category Async
 */
export class Semaphore {
	readonly #size: number;
	#available: number;
	readonly #waiting: Array<() => void> = [];

	/**
	 * Creates a new semaphore with the given concurrency limit.
	 * @param size The maximum number of operations that may run concurrently. Values less than 1 are treated as 1.
	 *
	 * @example
	 * ```ts
	 * const semaphore = new Semaphore(3);
	 * const promises: Promise<void>[] = [];
	 * for (let i = 0; i < 10; ++i) {
	 *    const lock = await semaphore.acquire();
	 *    const promise = doAsyncTask().finally(lock.release);
	 *
	 *    promises.push(promise);
	 * }
	 *
	 * await Promise.all(promises);
	 * ```
	 * The loop runs 10 asynchronous tasks, but only 3 will ever run simultaneously.
	 */
	constructor(size: number) {
		this.#size = Math.max(1, Math.trunc(size));
		this.#available = this.#size;
		this.acquire = this.acquire.bind(this);
	}

	/**
	 * Acquires a lock, blocking until one becomes available.
	 * The caller **must** release the returned lock after the operation completes.
	 * @returns A promise that resolves to a `SemaphoreLock` once a slot is available.
	 */
	async acquire(): Promise<SemaphoreLock> {
		return new Promise((resolve) => {
			this.#waiting.push(() => {
				this.#available -= 1;

				resolve(
					new SemaphoreLock(() => {
						this.#available += 1;
						this.#next();
					}),
				);
			});

			this.#next();
		});
	}

	/**
	 * Advances the queue by granting a lock to the next waiting operation, if a slot is available.
	 */
	#next(): void {
		if (this.#available <= 0) return;

		this.#waiting.shift()?.();
	}

	/**
	 * The configured concurrency limit — the maximum number of locks that can be held simultaneously.
	 */
	get size(): number {
		return this.#size;
	}

	/**
	 * The number of slots currently available; operations acquired without blocking.
	 */
	get available(): number {
		return this.#available;
	}

	/**
	 * The number of operations currently waiting for a slot to become available.
	 */
	get waiting(): number {
		return this.#waiting.length;
	}
}
