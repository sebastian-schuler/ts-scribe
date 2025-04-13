/**
 * Thank you to the author of the original code.
 * Github: https://github.com/Shakeskeyboarde
 */

/**
 * A lock that can be released. This is used with a semaphore to limit the number of concurrent operations.
 */
class Lock {
  #released = false;
  #onRelease: () => void;

  /**
   * Creates a new lock instance.
   * @param onRelease - A callback to be executed when the lock is released.
   */
  constructor(onRelease: () => void) {
    this.#onRelease = onRelease;
    this.release = this.release.bind(this);
  }

  /**
   * Release the lock. This should only be called once.
   * Once released, the lock cannot be released again.
   */
  release(): void {
    if (this.#released) return;

    this.#released = true;
    this.#onRelease();
  }
}

/**
 * A semaphore is a concurrency control mechanism that limits the number of asynchronous tasks accessing a shared resource simultaneously.
 *
 * The `acquire()` and `release()` methods manage the state, while `available`, `waiting`, and `size` return the state information.
 */
export class Semaphore {
  readonly #size: number;
  #available: number;
  #waiting: (() => void)[] = [];

  /**
   * Call the next waiting operation if there is an available lock.
   * This will shift the first waiting task and grant it a lock if one is available.
   */
  #next(): void {
    if (this.#available <= 0) return;

    this.#waiting.shift()?.();
  }

  /**
   * The maximum number of concurrent operations that can be acquired by the semaphore.
   * @returns {number} The maximum number of concurrent operations.
   */
  get size(): number {
    return this.#size;
  }

  /**
   * The number of available operations that can be acquired without blocking.
   * @returns {number} The number of available operations.
   */
  get available(): number {
    return this.#available;
  }

  /**
   * The number of operations currently waiting for a lock.
   * @returns {number} The number of operations in the waiting queue.
   */
  get waiting(): number {
    return this.#waiting.length;
  }

  /**
   * A semaphore that limits the number of concurrent operations.
   * @param size The maximum number of concurrent operations.
   *
   * Example:
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
   * The loop runs 10 asynchronous tasks, but only the first 3 will run immediately, and only 3 will ever be running simultaneously.
   */
  constructor(size: number) {
    this.#size = Math.max(1, Math.trunc(size));
    this.#available = this.#size;
    this.acquire = this.acquire.bind(this);
  }

  /**
   * Acquire a lock. This will block until a lock is available.
   * When a lock is acquired, the caller must release it after completing the operation.
   * @returns {Promise<Lock>} A promise that resolves to a `Lock` object.
   */
  acquire(): Promise<Lock> {
    return new Promise((resolve) => {
      this.#waiting.push(() => {
        this.#available -= 1;

        resolve(
          new Lock(() => {
            this.#available += 1;
            this.#next();
          }),
        );
      });

      this.#next();
    });
  }
}
