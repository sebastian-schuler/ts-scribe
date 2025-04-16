import { describe, expect, spyOn, test } from 'bun:test';
import { asyncMap } from '../../src/index.js';

describe('asyncMap', () => {
  test('should handle empty arrays', async () => {
    const result = await asyncMap([], async (x) => x * 2);
    expect(result).toEqual([]);
  });

  test('should map values asynchronously', async () => {
    const input = [1, 2, 3, 4, 5];
    const result = await asyncMap(input, async (x) => x * 2);
    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  test('should preserve order regardless of completion time', async () => {
    const input = [5, 1, 3, 2, 4];

    // Simulate varying completion times with setTimeout
    const callback = async (x: number) => {
      await new Promise((resolve) => setTimeout(resolve, x * 10));
      return x * 2;
    };

    const result = await asyncMap(input, callback);
    expect(result).toEqual([10, 2, 6, 4, 8]);
  });

  test('should pass index and original array to callback', async () => {
    const input = ['a', 'b', 'c'];
    const indices: number[] = [];
    const arrays: string[][] = [];

    await asyncMap(input, async (value, index, array) => {
      indices.push(index);
      arrays.push([...array]); // Clone to avoid reference issues
      return value.toUpperCase();
    });

    expect(indices).toEqual([0, 1, 2]);
    expect(arrays).toEqual([input, input, input]);
  });

  test('should throw error when callback throws and continueOnError is false', async () => {
    const input = [1, 2, 3, 4, 5];
    const callback = async (x: number) => {
      if (x === 3) throw new Error('Test error');
      return x * 2;
    };

    expect(asyncMap(input, callback)).rejects.toThrow('Test error');
  });

  test('should continue with undefined when callback throws and continueOnError is true', async () => {
    const input = [1, 2, 3, 4, 5];
    const callback = async (x: number) => {
      if (x === 3) throw new Error('Test error');
      return x * 2;
    };

    const result = await asyncMap(input, callback, { continueOnError: true });
    expect(result).toEqual([2, 4, undefined, 8, 10]);
  });

  test('should use custom errorValue when provided', async () => {
    const input = [1, 2, 3, 4, 5];
    const callback = async (x: number) => {
      if (x === 3) throw new Error('Test error');
      return x * 2;
    };

    const result = await asyncMap(input, callback, {
      continueOnError: true,
      errorValue: 'ERROR',
    });

    expect(result).toEqual([2, 4, 'ERROR', 8, 10]);
  });

  test('should respect concurrency limit', async () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const maxConcurrent = 2;
    let running = 0;
    let maxRunning = 0;

    const callback = async (x: number) => {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((resolve) => setTimeout(resolve, 10));
      running--;
      return x * 2;
    };

    const result = await asyncMap(input, callback, { concurrency: maxConcurrent });
    expect(result).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
    expect(maxRunning).toBeLessThanOrEqual(maxConcurrent);
  });

  test('should handle Promise.all fallback for high concurrency', async () => {
    const input = [1, 2, 3, 4];
    const promiseAllSpy = spyOn(Promise, 'all');

    await asyncMap(input, async (x) => x * 2, { concurrency: 10 });

    // There should be one call to Promise.all from the Promise.all(array.map(callback)) branch
    expect(promiseAllSpy).toHaveBeenCalledTimes(1);
  });

  test('should process all items even when some throw with continueOnError', async () => {
    const input = Array.from({ length: 10 }, (_, i) => i);
    const processed: number[] = [];

    const callback = async (x: number) => {
      processed.push(x);
      if (x % 3 === 0) throw new Error(`Error at ${x}`);
      return x * 2;
    };

    const result = await asyncMap(input, callback, { continueOnError: true });

    // All items should be processed
    expect(processed.length).toBe(10);
    expect(processed).toEqual(input);

    // Items at positions 0, 3, 6, 9 should be undefined (threw errors)
    const expected = input.map((x) => (x % 3 === 0 ? undefined : x * 2));
    expect(result).toEqual(expected);
  });

  test('should handle async callbacks with different return types', async () => {
    const input = [1, 2, 3, 4];
    const result = await asyncMap(input, async (x) => x.toString());
    expect(result).toEqual(['1', '2', '3', '4']);
  });

  test('should handle complex error values with type safety', async () => {
    interface ErrorInfo {
      code: number;
      message: string;
    }

    const input = [1, 2, 3];
    const errorValue: ErrorInfo = { code: 500, message: 'Processing failed' };

    const callback = async (x: number): Promise<number> => {
      if (x === 2) throw new Error('Simulated error');
      return x * 10;
    };

    const result = await asyncMap<number, number, ErrorInfo>(input, callback, { continueOnError: true, errorValue });

    expect(result).toEqual([10, errorValue, 30]);

    // Type checking (this would cause TS errors if types were wrong)
    result.forEach((item) => {
      if (typeof item === 'number') {
        const doubled = item * 2;
      } else {
        const code = item.code;
        const message = item.message;
      }
    });
  });

  test('should handle mixed success and failures with limited concurrency', async () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const failingIndices = new Set([2, 5, 7]);
    const processed: number[] = [];

    const callback = async (x: number) => {
      processed.push(x);
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (failingIndices.has(x)) throw new Error(`Error at ${x}`);
      return x * 2;
    };

    const result = await asyncMap(input, callback, {
      concurrency: 2,
      continueOnError: true,
      errorValue: 'FAILED',
    });

    // All items should be processed
    expect(processed.length).toBe(8);

    // Expected result with "FAILED" for failing indices
    const expected = input.map((x) => (failingIndices.has(x) ? 'FAILED' : x * 2));
    expect(result).toEqual(expected);
  });

  test('should propagate errors correctly with limited concurrency', async () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    let processedCount = 0;

    const callback = async (x: number) => {
      processedCount++;
      await new Promise((resolve) => setTimeout(resolve, 10));
      if (x === 3) throw new Error('Error at 5');
      return x * 2;
    };

    expect(asyncMap(input, callback, { concurrency: 2 })).rejects.toThrowError();

    // Processing should stop after the error
    expect(processedCount).toBeLessThan(input.length);
  });

  test('should handle synchronous errors in the callback', async () => {
    const input = [1, 2, 3];

    const callback = async (x: number) => {
      if (x === 2) {
        // Synchronous error, not a rejected promise
        throw new Error('Sync error');
      }
      return x * 2;
    };

    expect(asyncMap(input, callback)).rejects.toThrow('Sync error');

    const result = await asyncMap(input, callback, {
      continueOnError: true,
      errorValue: null,
    });

    expect(result).toEqual([2, null, 6]);
  });

  test('should handle nested promises correctly', async () => {
    const input = [1, 2, 3];

    const callback = async (x: number) => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(x * 2), 10);
      });
    };

    const result = await asyncMap(input, callback);
    expect(result).toEqual([2, 4, 6]);
  });

  test('should handle zero concurrency as invalid and throw an error', async () => {
    const input = [1, 2, 3];
    expect(asyncMap(input, async (x) => x * 2, { concurrency: 0 })).rejects.toThrow(RangeError);
  });

  test('should handle negative concurrency as invalid and throw an error', async () => {
    const input = [1, 2, 3];
    expect(asyncMap(input, async (x) => x * 2, { concurrency: -5 })).rejects.toThrow(RangeError);
  });

  test('should handle very large arrays efficiently', async () => {
    const size = 1000;
    const input = Array.from({ length: size }, (_, i) => i);

    const start = Date.now();
    const result = await asyncMap(input, async (x) => x * 2, { concurrency: 50 });
    const end = Date.now();

    expect(result.length).toBe(size);
    expect(result[0]).toBe(0);
    expect(result[size - 1]).toBe((size - 1) * 2);

    // Just a sanity check that it completes in a reasonable time
    // This isn't strictly necessary but helps catch performance regressions
    expect(end - start).toBeLessThan(5000);
  });
});
