import { debounce } from '../debounced';

describe('debounce function', () => {
  vi.useFakeTimers();

  it('should call the function after debounce time', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce<void, void>(100, mockFn);

    debouncedFn();
    expect(mockFn).not.toBeCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toBeCalled();
  });

  it('should call the function only once within debounce time', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce<void, void>(100, mockFn);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call the function immediately when immediate is true', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce<void, void>(100, mockFn, true);

    debouncedFn();
    expect(mockFn).toBeCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
