import { describe, expect, it, jest } from 'bun:test';
import { retry, RetryHandler, RetryOptions } from '../../src/async/index.js';

describe('retry', () => {
  // Mocking a successful handler function
  const successfulHandler: RetryHandler<number> = jest.fn().mockResolvedValueOnce(42);

  // Mocking a failing handler function that eventually succeeds
  // const failingHandler: RetryHandler<number> = jest
  //   .fn()
  //   .mockRejectedValueOnce(new Error('Attempt 1 failed'))
  //   .mockRejectedValueOnce(new Error('Attempt 2 failed'))
  //   .mockRejectedValueOnce(new Error('Attempt 3 failed'))
  //   .mockResolvedValueOnce(42);

  type RetryHandler<T> = () => Promise<T>;
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
      delay: 500, // 0.5 second delay between retries
    };

    await expect(retry(failingHandlerAlways, options)).rejects.toThrowError('Always fails');
    expect(failingHandlerAlways).toHaveBeenCalledTimes(3); // 2 retries + initial call
  });
});
