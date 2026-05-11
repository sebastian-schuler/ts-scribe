import { createAbortError } from './utils/abort-error.js';

type TimeoutOptions = {
	/**
	 * An optional AbortSignal. If the signal fires before the deadline,
	 * the promise is rejected immediately with an AbortError.
	 * @type {AbortSignal}
	 */
	signal?: AbortSignal;

	/**
	 * Custom message used in the rejection error when the deadline is reached.
	 * Defaults to `'Timed out after <ms>ms'`.
	 * @type {string}
	 */
	message?: string;
};

/**
 * Wraps an existing promise with a rejection deadline.
 *
 * If the wrapped promise does not settle within `ms` milliseconds, the returned
 * promise rejects with an `AbortError`. If the promise settles before the
 * deadline, the timer is cancelled and its result is forwarded transparently.
 *
 * Optionally accepts an `AbortSignal` — if the signal fires before the
 * deadline, the returned promise rejects immediately.
 *
 * ---
 * Example:
 * ```ts
 * // Reject after 5 seconds
 * const data = await timeout(fetch('/api/data'), 5_000);
 * ```
 *
 * ---
 *
 * @category Async
 * @param {PromiseLike<T>} promise - The promise to wrap with a deadline.
 * @param {number} ms - Maximum number of milliseconds to wait before rejecting.
 * @param {TimeoutOptions} [options] - Optional configuration.
 * @returns {Promise<T>} A promise that resolves with the original value or rejects on timeout.
 *
 * @example
 * // With a custom error message
 * const result = await timeout(expensiveQuery(), 3_000, { message: 'Query timed out' });
 *
 * @example
 * // With an AbortSignal
 * const controller = new AbortController();
 * const result = await timeout(fetch(url), 5_000, { signal: controller.signal });
 */
export async function timeout<T>(promise: PromiseLike<T>, ms: number, options?: TimeoutOptions): Promise<T> {
	const { signal, message } = options ?? {};

	if (Number.isNaN(ms)) {
		throw new RangeError("Option 'ms' must not be NaN.");
	}

	if (signal?.aborted) {
		throw createAbortError(signal.reason);
	}

	return new Promise<T>((resolve, reject) => {
		// Use a ref so that onAbort (declared first) can clear the timer
		// without referencing `timer` before its const declaration.
		const timerRef: { id?: ReturnType<typeof setTimeout> } = {};

		const onAbort = () => {
			clearTimeout(timerRef.id);
			reject(createAbortError(signal!.reason));
		};

		const cleanup = () => {
			clearTimeout(timerRef.id);
			signal?.removeEventListener('abort', onAbort);
		};

		timerRef.id = setTimeout(
			() => {
				signal?.removeEventListener('abort', onAbort);
				reject(createAbortError(message ?? `Timed out after ${ms}ms`));
			},
			Math.max(ms, 0),
		);

		signal?.addEventListener('abort', onAbort, { once: true });

		Promise.resolve(promise).then(
			(value) => {
				cleanup();
				resolve(value);
			},
			(error: unknown) => {
				cleanup();
				reject(error instanceof Error ? error : new Error(String(error)));
			},
		);
	});
}

export type { TimeoutOptions };
