import { RetryHandler, RetryOptions, retry } from '../retry';

describe('retry', () => {
  // Mocking a successful handler function
  const successfulHandler: RetryHandler<number> = vi.fn().mockResolvedValueOnce(42);

  // Mocking a failing handler function that eventually succeeds
  const failingHandler: RetryHandler<number> = vi
    .fn()
    .mockRejectedValueOnce(new Error('Attempt 1 failed'))
    .mockRejectedValueOnce(new Error('Attempt 2 failed'))
    .mockRejectedValueOnce(new Error('Attempt 3 failed'))
    .mockResolvedValueOnce(42);

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

    const result = await retry(failingHandler, options);
    expect(result).toBe(42);
    expect(failingHandler).toHaveBeenCalledTimes(4); // 3 retries + initial call
  });

  it('should throw an error if handler continues to fail even after retries', async () => {
    const failingHandlerAlways: RetryHandler<number> = vi.fn().mockRejectedValue(new Error('Always fails'));
    const options: RetryOptions = {
      retries: 2,
      delay: 500, // 0.5 second delay between retries
    };

    await expect(retry(failingHandlerAlways, options)).rejects.toThrowError('Always fails');
    expect(failingHandlerAlways).toHaveBeenCalledTimes(3); // 2 retries + initial call
  });
});
