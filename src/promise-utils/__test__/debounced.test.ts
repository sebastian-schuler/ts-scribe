import { describe, expect, it, jest } from '@jest/globals';
import { debounce } from '../debounced';

describe('debounce function', () => {
  jest.useFakeTimers();

  it('should call the function after debounce time', () => {
    const mockFn = jest.fn<() => void>();
    const debouncedFn = debounce<void, void>(100, mockFn);

    debouncedFn();
    expect(mockFn).not.toBeCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toBeCalled();
  });

  it('should call the function only once within debounce time', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce<void, void>(100, mockFn);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call the function immediately when immediate is true', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce<void, void>(100, mockFn, true);

    debouncedFn();
    expect(mockFn).toBeCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
