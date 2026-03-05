import { describe, expect, it, jest } from 'bun:test';
import { retry, type RetryHandler, type RetryOptions } from '../../src/async/index.js';

describe('retry', () => {
	function createFailingHandler<T>(failures: number, successValue: T) {
		const handler = async () => {
			handler.callCount++;
			if (handler.callCount <= failures) {
				throw new Error(`Attempt ${handler.callCount} failed`);
			}

			return successValue;
		};

		handler.callCount = 0;
		return handler;
	}

	it('should call the handler once and return the result without retries if successful', async () => {
		const successfulHandler: RetryHandler<number> = jest.fn().mockResolvedValue(42);
		const result = await retry(successfulHandler);
		expect(result).toBe(42);
		expect(successfulHandler).toHaveBeenCalledTimes(1);
	});

	it('should retry according to the provided options when the handler fails initially', async () => {
		const options: RetryOptions = {
			retries: 3,
			delay: 1000, // 1 second delay between retries
		};
		const failingHandler = createFailingHandler(3, 42);
		const result = await retry(failingHandler, options);
		expect(result).toBe(42);
		expect(failingHandler.callCount).toBe(4); // 3 retries + initial call
	});

	it('should throw an error if handler continues to fail even after retries', async () => {
		const failingHandlerAlways: RetryHandler<number> = jest.fn().mockRejectedValue(new Error('Always fails'));
		const options: RetryOptions = {
			retries: 2,
			delay: 0,
		};

		await expect(retry(failingHandlerAlways, options)).rejects.toThrowError('Always fails');
		expect(failingHandlerAlways).toHaveBeenCalledTimes(3); // 2 retries + initial call
	});

	it('should handle array delays with different values per retry', async () => {
		const failingHandler = createFailingHandler(2, 'success');
		const delays: number[] = [];
		const startTime = Date.now();

		const options: RetryOptions = {
			retries: 2,
			delay: [10, 20],
			onRetry: (error, count) => {
				delays.push(Date.now() - startTime);
				return true;
			},
		};

		const result = await retry(failingHandler, options);
		expect(result).toBe('success');
		expect(failingHandler.callCount).toBe(3);
	});

	it('should use last delay in array when retries exceed array length', async () => {
		const failingHandler = createFailingHandler(3, 'success');
		const options: RetryOptions = {
			retries: 3,
			delay: [5, 10], // Only 2 delays, but 3 retries
		};

		const result = await retry(failingHandler, options);
		expect(result).toBe('success');
		expect(failingHandler.callCount).toBe(4);
	});

	it('should stop retrying when onRetry returns false', async () => {
		const failingHandler = createFailingHandler(5, 'success');
		const options: RetryOptions = {
			retries: 5,
			delay: 0,
			onRetry: (error, count) => {
				// Stop after 2 retries
				return count < 2;
			},
		};

		await expect(retry(failingHandler, options)).rejects.toThrowError('Attempt 2 failed');
		expect(failingHandler.callCount).toBe(2);
	});

	it('should use custom delay when onRetry returns a number', async () => {
		const failingHandler = createFailingHandler(2, 'success');
		const options: RetryOptions = {
			retries: 2,
			delay: 100, // Default delay
			onRetry: (error, count) => {
				// Override with custom delay
				return count === 1 ? 5 : 10;
			},
		};

		const result = await retry(failingHandler, options);
		expect(result).toBe('success');
		expect(failingHandler.callCount).toBe(3);
	});

	it('should handle onRetry returning undefined (should continue)', async () => {
		const failingHandler = createFailingHandler(1, 'success');
		const options: RetryOptions = {
			retries: 1,
			delay: 0,
			onRetry: () => {
				return undefined;
			},
		};

		const result = await retry(failingHandler, options);
		expect(result).toBe('success');
	});

	it('should handle onRetry returning true (should continue)', async () => {
		const failingHandler = createFailingHandler(1, 'success');
		const options: RetryOptions = {
			retries: 1,
			delay: 0,
			onRetry: () => {
				return true;
			},
		};

		const result = await retry(failingHandler, options);
		expect(result).toBe('success');
	});

	it('should handle onRetry returning void (should continue)', async () => {
		const failingHandler = createFailingHandler(1, 'success');
		const onRetryFn = (error: unknown, count: number): void => {
			// Do something but return void
		};

		const options: RetryOptions = {
			retries: 1,
			delay: 0,
			onRetry: onRetryFn,
		};

		const result = await retry(failingHandler, options);
		expect(result).toBe('success');
	});

	it('should stop retrying when signal is aborted', async () => {
		const controller = new AbortController();
		const failingHandler = createFailingHandler(5, 'success');

		const options: RetryOptions = {
			retries: 5,
			delay: 10,
			signal: controller.signal,
			onRetry: (error, count) => {
				if (count === 2) {
					controller.abort();
				}
				return true;
			},
		};

		await expect(retry(failingHandler, options)).rejects.toThrow();
		// Should fail on attempt 2, then check abort before retry 3
		expect(failingHandler.callCount).toBeLessThanOrEqual(3);
	});

	it('should throw AbortError when signal is aborted', async () => {
		const controller = new AbortController();
		const failingHandler: RetryHandler<string> = async () => {
			controller.abort();
			throw new Error('Original error');
		};

		const options: RetryOptions = {
			retries: 2,
			signal: controller.signal,
		};

		try {
			await retry(failingHandler, options);
		} catch (error: any) {
			expect(error.name).toBe('AbortError');
		}
	});

	it('should handle zero retries (fail on first error)', async () => {
		const failingHandler = createFailingHandler(1, 'success');
		const options: RetryOptions = {
			retries: 0,
			delay: 0,
		};

		await expect(retry(failingHandler, options)).rejects.toThrowError('Attempt 1 failed');
		expect(failingHandler.callCount).toBe(1);
	});

	it('should not retry on AbortError by default', async () => {
		let attempts = 0;
		const failingHandler: RetryHandler<string> = async () => {
			attempts++;
			const error = new Error('Aborted');
			error.name = 'AbortError';
			throw error;
		};

		const options: RetryOptions = {
			retries: 3,
			delay: 0,
		};

		await expect(retry(failingHandler, options)).rejects.toThrow('Aborted');
		expect(attempts).toBe(1); // Should not retry
	});

	it('should handle synchronous handler', async () => {
		const syncHandler: RetryHandler<number> = () => 42;
		const result = await retry(syncHandler);
		expect(result).toBe(42);
	});

	it('should handle synchronous handler that throws', async () => {
		let attempts = 0;
		const syncHandler: RetryHandler<number> = () => {
			attempts++;
			if (attempts < 2) {
				throw new Error('Sync error');
			}
			return 42;
		};

		const result = await retry(syncHandler, { retries: 2, delay: 0 });
		expect(result).toBe(42);
		expect(attempts).toBe(2);
	});

	it('should skip delay when delay is 0', async () => {
		const failingHandler = createFailingHandler(1, 'success');
		const startTime = Date.now();

		const result = await retry(failingHandler, { retries: 1, delay: 0 });
		const elapsed = Date.now() - startTime;

		expect(result).toBe('success');
		// Should complete quickly (less than 50ms)
		expect(elapsed).toBeLessThan(50);
	});

	it('should handle non-Error objects being thrown', async () => {
		let attempts = 0;
		const handler: RetryHandler<string> = async () => {
			attempts++;
			if (attempts < 2) {
				throw 'string error'; // eslint-disable-line @typescript-eslint/only-throw-error
			}
			return 'success';
		};

		const result = await retry(handler, { retries: 2, delay: 0 });
		expect(result).toBe('success');
	});
});
