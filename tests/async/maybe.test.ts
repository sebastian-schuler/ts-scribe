/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest, describe, it, expect } from 'bun:test';
import { maybe } from '../../src/async/index.js';

describe('maybe', () => {
  it('should return empty', () => {
    const test = maybe.empty();
    expect(test.ok).toBe(false);
    expect(test.empty).toBe(true);
    expect(test.error).toBe(null);
    expect(() => test.value).toThrow();
    expect(maybe(null)).toBe(test);
    expect(maybe(undefined)).toBe(test);
    expect(maybe.empty()).toBe(test);
    expect(test.catch(() => 1)).toBe(test);
    expect(test.else(() => 1).value).toBe(1);
    expect(test.map(() => 1)).toBe(test);
    expect(test.toArray()).toEqual([]);

    const callback = jest.fn((tt: any) => {
      return tt;
    });
    expect(test.filter(callback)).toBe(test);
    expect(callback).not.toBeCalled();
  });

  it('should return an error', () => {
    const error = new Error('error');
    let test = maybe.error(error);
    expect(test.ok).toBe(false);
    expect(test.empty).toBe(true);
    expect(test.error).toBe(error);
    expect(() => test.value).toThrow(error);
    expect(maybe.error(error) !== test).toBeTruthy();
    expect(test.catch(() => 1).value).toBe(1);
    expect(test.toArray()).toEqual([]);

    const callback = jest.fn((tt: any) => {
      return tt;
    });
    expect(test.else(callback)).toBe(test);
    expect(test.filter(callback)).toBe(test);
    expect(test.map(callback)).toBe(test);
    expect(callback).not.toBeCalled();

    test = maybe(() => {
      throw error;
    });
    expect(test.ok).toBe(false);
    expect(test.empty).toBe(true);
    expect(test.error).toBe(error);
    expect(() => test.value).toThrow(error);

    test = maybe.error();
    expect(test.ok).toBe(false);
    expect(test.empty).toBe(true);
    expect(test.error).toBeInstanceOf(Error);
    expect(test.error).toEqual(
      expect.objectContaining({
        message: 'unknown',
      }),
    );
    expect(() => test.value).toThrow(test.error as any);
  });

  it('should return ok', () => {
    const getAsync = () => {
      return ['sadasdasd'];
    };

    const mby = maybe(getAsync())
      .filter((ddd) => ddd.length <= 3)
      .catch(() => console.log('error'));
    expect(mby.ok).toBe(true);
    expect(mby.value.at(0)).toBe('sadasdasd');

    const test = maybe(1);
    expect(test.ok).toBe(true);
    expect(test.empty).toBe(false);
    expect(test.error).toBe(null);
    expect(test.value).toBe(1);
    expect(maybe(1)).not.toBe(test);
    expect(test.filter(() => true)).toBe(test);
    expect(test.filter(() => false)).toBe(maybe.empty());
    expect(test.map((value) => value + 2).value).toBe(3);
    expect(test.toArray()).toEqual([1]);

    const callback = jest.fn();
    expect(test.catch(callback)).toBe(test);
    expect(test.else(callback)).toBe(test);
    expect(callback).not.toBeCalled();
  });
});
