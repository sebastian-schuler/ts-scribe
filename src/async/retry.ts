type RetryOptions = {
	/**
	 * Delay in milliseconds. May be an array to provide different delays for
	 * each retry. If the number of retries exceeds the number of items in the
	 * array, then the last delay is used.
	 * @type {number | readonly number[]}
	 */
	delay?: number | readonly number[];

	/**
	 * Determine if a retry is useful and/or what the delay should be. Returning
	 * false prevents retrying. Returning true/void/undefined will retry with
	 * the default delay. Returning a number will retry with a custom delay.
	 * @param error - The error that occurred during the handler execution.
	 * @param count - The current retry attempt count.
	 * @returns {boolean | number | undefined | void}
	 * - `false` prevents retrying.
	 * - `true`, `undefined`, or `void` will retry with the default delay.
	 * - A `number` will retry with a custom delay.
	 */
	onRetry?: (error: unknown, count: number) => boolean | number | undefined | void;

	/**
	 * Maximum number of retries, not including the initial handler call.
	 * @type {number}
	 */
	retries?: number;

	/**
	 * If the signal is aborted, retrying is canceled and the next error will
	 * be thrown.
	 * @type {AbortSignal}
	 */
	signal?: AbortSignal;
};

type RetryHandler<TypedValue = unknown> = () => PromiseLike<TypedValue> | TypedValue;

const onRetryDefault = (error: unknown): boolean => {
	return !(error instanceof Error) || error.name !== 'AbortError';
};

/**
 * Calculate the delay before the next retry attempt
 */
function calculateDelay(
	next: boolean | number | undefined,
	defaultDelay: number | readonly number[],
	errorCount: number,
): number {
	if (typeof next === 'number') {
		return next;
	}

	if (typeof defaultDelay === 'number') {
		return defaultDelay;
	}

	return defaultDelay[errorCount - 1] ?? defaultDelay.at(-1) ?? 0;
}

/**
 * Create an AbortError from the given error
 */
function createAbortError(lastError: unknown): Error {
	const errorToThrow = lastError instanceof Error ? lastError : new Error('ABORT_ERR');
	return Object.assign(errorToThrow, { code: 20, name: 'AbortError' });
}

/**
 * Handle final error throwing
 */
function throwRetryError(lastError: unknown, signal?: AbortSignal): never {
	if (signal?.aborted) {
		throw createAbortError(lastError);
	}

	if (lastError !== undefined) {
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		throw lastError instanceof Error ? lastError : new Error(String(lastError));
	}

	throw new Error('Retry failed with no error');
}

/**
 * Sleep for the specified delay
 */
async function sleep(delay: number): Promise<void> {
	if (delay > 0) {
		await new Promise((resolve) => {
			setTimeout(resolve, delay);
		});
	}
}

/**
 * Retry `handler` while it throws.
 * Retries are based on the provided `options` which can define how many retries,
 * delays between retries, and whether retries should continue based on the error.
 *
 * @category Async
 * @param handler - The function to retry. It should return a value or a promise that resolves to a value.
 * @param options - The configuration options for retrying.
 * @returns {Promise<TypedValue>} The result of the `handler` after it successfully completes.
 * @throws {Error} Throws the last error encountered if retries are exhausted or if aborted.
 */
const retry = async <TypedValue>(
	handler: RetryHandler<TypedValue>,
	options: RetryOptions = {},
): Promise<TypedValue> => {
	const { signal, delay: defaultDelay = 0, retries = 2, onRetry = onRetryDefault } = options;
	let lastError: unknown;
	let errorCount = 0;

	while (!signal?.aborted) {
		try {
			// eslint-disable-next-line no-await-in-loop
			return await handler();
		} catch (error) {
			lastError = error;

			if (errorCount >= retries || signal?.aborted) {
				break;
			}

			const next = onRetry(error, (errorCount += 1)) ?? true;

			if (next === false) {
				break;
			}

			const delay = calculateDelay(next, defaultDelay, errorCount);

			// eslint-disable-next-line no-await-in-loop
			await sleep(delay);
		}
	}

	throwRetryError(lastError, signal);
};

export { onRetryDefault, retry };
export type { RetryHandler, RetryOptions };
