import { describe, expect, it, jest } from 'bun:test';
import { debounce } from '../../src/async/index.js';

describe('debounce', () => {
  it('calls the function after the wait time', async () => {
    const fn = jest.fn();
    const debounced = debounce(100, fn);
    debounced.call(null, null);

    expect(fn).not.toHaveBeenCalled();

    await new Promise((res) => setTimeout(res, 150));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the wait time if called again', async () => {
    const fn = jest.fn();
    const debounced = debounce(100, fn);

    debounced.call(null, null);
    await new Promise((res) => setTimeout(res, 50));
    debounced.call(null, null);
    await new Promise((res) => setTimeout(res, 50));
    expect(fn).not.toHaveBeenCalled();

    await new Promise((res) => setTimeout(res, 60));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls function immediately if immediate=true', async () => {
    const fn = jest.fn();
    const debounced = debounce(100, fn, true);
    debounced.call(null, null);

    expect(fn).toHaveBeenCalledTimes(1);

    // Should not call again until the debounce window expires
    await new Promise((res) => setTimeout(res, 150));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not call again if called multiple times immediately with immediate=true', async () => {
    const fn = jest.fn();
    const debounced = debounce(100, fn, true);
    debounced.call(null, null);
    debounced.call(null, null);
    debounced.call(null, null);

    expect(fn).toHaveBeenCalledTimes(1);
    await new Promise((res) => setTimeout(res, 150));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('respects the correct this context', async () => {
    const context = {
      value: 42,
      handler(this: any) {
        calledWithThis = this.value;
      },
    };

    let calledWithThis = 0;
    const debounced = debounce(100, context.handler);

    debounced.call(context, context);
    await new Promise((res) => setTimeout(res, 120));

    expect(calledWithThis).toBe(42);
  });
});
