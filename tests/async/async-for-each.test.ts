import { asyncForEach } from '../../src/async';

describe('asyncForEach', () => {
  it('should process all elements simultaneously', async () => {
    const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const start = Date.now();
    const mockCallback = vi.fn(async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
    });

    await asyncForEach(items, mockCallback);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1500); // Should take slightly more than 1000ms
    expect(mockCallback).toHaveBeenCalledTimes(items.length);
  });

  it('should process correct amount of elements simultaneously with a limit', async () => {
    const items = [1, 2, 3, 4, 5];
    const start = Date.now();
    const mockCallback = vi.fn(async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
    });

    await asyncForEach(items, mockCallback, 3);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2500); // Should take slightly more than 2000ms
    expect(mockCallback).toHaveBeenCalledTimes(items.length);
  });

  it('should call the callback with correct arguments', async () => {
    const items = [1, 2, 3];
    const mockCallback = vi.fn(async (item: number, index: number, array: number[]) => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await asyncForEach(items, mockCallback);

    items.forEach((item, index) => {
      expect(mockCallback).toHaveBeenCalledWith(item, index, items);
    });
  });

  it('should handle an empty array', async () => {
    const items: number[] = [];
    const mockCallback = vi.fn(async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
    });

    await asyncForEach(items, mockCallback);

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should handle a single element array', async () => {
    const items = [42];
    const mockCallback = vi.fn(async (item: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
    });

    await asyncForEach(items, mockCallback);

    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenCalledWith(42, 0, items);
  });

  it('should propagate errors thrown in the callback', async () => {
    const items = [1, 2, 3];
    const error = new Error('Test error');
    const mockCallback = vi.fn(async (item: number) => {
      if (item === 2) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 10)); // Simulate async operation
    });

    await expect(asyncForEach(items, mockCallback)).rejects.toThrow(error);
  });
});
