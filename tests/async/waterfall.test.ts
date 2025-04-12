import { describe, expect, test } from 'bun:test';
import { waterfall } from '../../src/async/index.js';

describe('waterfall', () => {
  test('should run tasks in series and pass results to the next task', async () => {
    const task1 = () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(1), 100);
      });
    };

    const task2 = () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(2), 100);
      });
    };

    const task3 = () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(3), 100);
      });
    };

    const result = await waterfall<number>([task1, task2, task3]);
    expect(result).toBe(3);
  });

  test('should stop execution if a task encounters an error', async () => {
    const task1 = () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(1), 100);
      });
    };

    const task2 = () => {
      return new Promise<number>((_, reject) => {
        setTimeout(() => reject(new Error('Task 2 error')), 100);
      });
    };

    const task3 = () => {
      return new Promise<number>((resolve) => {
        setTimeout(() => resolve(3), 100);
      });
    };

    await expect(waterfall<number>([task1, task2, task3])).rejects.toThrow('Task 2 error');
  });

  test('should handle an empty array of tasks', async () => {
    const result = await waterfall<number>([]);
    expect(result).toBeUndefined();
  });

  test('should handle tasks with different result types', async () => {
    const task1 = () => {
      return new Promise<string>((resolve) => {
        setTimeout(() => resolve('first'), 100);
      });
    };

    const task2 = () => {
      return new Promise<string>((resolve) => {
        setTimeout(() => resolve('second'), 100);
      });
    };

    const result = await waterfall<string>([task1, task2]);
    expect(result).toBe('second');
  });
});
