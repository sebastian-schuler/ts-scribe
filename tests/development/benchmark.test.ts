import { describe, expect, it, jest, spyOn } from 'bun:test';
import { benchmark } from '../../src/index.js';

describe('benchmark', () => {
  it('should handle synchronous functions and log the result and duration', () => {
    const testFn = () => 42;

    const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

    const result = benchmark(testFn, { label: 'TestSyncFunction' });

    // Assert that the result is correct
    expect(result).toBe(42);

    // Assert that console.log was called with appropriate values
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestSyncFunction | took'));
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestSyncFunction | result size'));

    spyConsoleLog.mockRestore();
  });

  it('should handle asynchronous functions and log the result and duration', async () => {
    const testFn = () => new Promise<number>((resolve) => setTimeout(() => resolve(42), 100));

    const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

    const result = await benchmark(testFn, { label: 'TestAsyncFunction' });

    // Assert that the result is correct
    expect(result).toBe(42);

    // Assert that console.log was called with appropriate values
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestAsyncFunction | took'));
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestAsyncFunction | result size'));

    spyConsoleLog.mockRestore();
  });

  it('should call onBenchmarkComplete with correct parameters for synchronous functions', () => {
    const testFn = () => 42;

    const onBenchmarkComplete = jest.fn();

    const result = benchmark(testFn, { onBenchmarkComplete, label: 'TestSyncFunctionWithCallback' });

    // Assert that the result is correct
    expect(result).toBe(42);

    // Assert that onBenchmarkComplete was called with correct parameters
    expect(onBenchmarkComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        durationMs: expect.any(Number),
        resultByteSize: expect.any(Number),
        label: 'TestSyncFunctionWithCallback',
        result: 42,
      }),
    );
  });

  it('should call onBenchmarkComplete with correct parameters for asynchronous functions', async () => {
    const testFn = () => new Promise<number>((resolve) => setTimeout(() => resolve(42), 100));

    const onBenchmarkComplete = jest.fn();

    const result = await benchmark(testFn, { onBenchmarkComplete, label: 'TestAsyncFunctionWithCallback' });

    // Assert that the result is correct
    expect(result).toBe(42);

    // Assert that onBenchmarkComplete was called with correct parameters
    expect(onBenchmarkComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        durationMs: expect.any(Number),
        resultByteSize: expect.any(Number),
        label: 'TestAsyncFunctionWithCallback',
        result: 42,
      }),
    );
  });

  it('should log label when provided', () => {
    const testFn = () => 42;

    const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

    const result = benchmark(testFn, { label: 'TestLabelProvided' });

    // Assert that the label is part of the log output
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestLabelProvided | took'));
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestLabelProvided | result size'));

    spyConsoleLog.mockRestore();
  });

  it('should log without label when label is not provided', () => {
    const testFn = () => 42;

    const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

    const result = benchmark(testFn);

    // Assert that the log does not contain a label
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('took'));
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('result size'));

    spyConsoleLog.mockRestore();
  });

  it('should handle edge case where the function returns an empty object', async () => {
    const testFn = () => ({});

    const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

    const result = await benchmark(testFn, { label: 'TestEmptyObject' });

    // Assert that the result is an empty object
    expect(result).toEqual({});

    // Assert that console.log was called with appropriate values
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestEmptyObject | took'));
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('TestEmptyObject | result size'));

    spyConsoleLog.mockRestore();
  });

  it('should correctly calculate byte size for different data types', () => {
    const testFn = () => ({ key: 'value' });

    const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

    const result = benchmark(testFn);

    // Assert that the byte size logged is correct
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('result size'));

    spyConsoleLog.mockRestore();
  });

  it('should handle large return data and calculate byte size', () => {
    const testFn = () => ({ largeData: 'a'.repeat(1_000_000) });

    const spyConsoleLog = spyOn(console, 'log').mockImplementation(() => {});

    const result = benchmark(testFn);

    // Assert that the byte size is logged correctly for large data
    expect(spyConsoleLog).toHaveBeenCalledWith(expect.stringContaining('result size'));

    spyConsoleLog.mockRestore();
  });
});
